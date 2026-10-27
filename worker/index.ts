import type { D1Database, ExecutionContext } from "@cloudflare/workers-types";
import {
  MODEL,
  RUN_TIMEOUT_MS,
  questionSchema,
  usageCostMicros,
  type ExplorerEvent,
} from "../src/lib/explorer-contract";
import { runAgent, openAIModel, type RunAccounting } from "./agent";
import { KnowledgeStore } from "./store";

export interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  OPENAI_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_SALT?: string;
  EVAL_TOKEN?: string;
  ALLOWED_ORIGIN: string;
}
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((n) => n.toString(16).padStart(2, "0")).join("");
}
async function evaluationRequest(request: Request, secret?: string) {
  const supplied = request.headers.get("Authorization");
  if (!secret || secret.length < 32 || !supplied) return false;
  return (await digest(supplied)) === (await digest(`Bearer ${secret}`));
}
export async function verifyTurnstile(token: string | undefined, ip: string, env: Env) {
  if (!token || !env.TURNSTILE_SECRET_KEY) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  form.set("remoteip", ip);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(5000),
    }
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  return (
    result.success === true &&
    result.hostname === new URL(env.ALLOWED_ORIGIN).hostname &&
    result.action === "explore"
  );
}

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: Pick<ExecutionContext, "waitUntil">
): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
  try {
    if (url.pathname === "/api/status" && request.method === "GET") {
      return json({
        live: Boolean(
          env.OPENAI_API_KEY && env.TURNSTILE_SECRET_KEY && env.RATE_LIMIT_SALT
        ),
        model: MODEL,
      });
    }
    const store = new KnowledgeStore(env.DB);
    if (url.pathname === "/api/search" && request.method === "GET") {
      const query = (url.searchParams.get("q") ?? "").trim();
      if (!query || query.length > 200)
        return json({ error: "Enter a search of 1–200 characters." }, 400);
      return json({ sources: await store.search(query) });
    }
    if (url.pathname !== "/api/explore") return json({ error: "Not found" }, 404);
    if (request.method !== "POST") return json({ error: "Use POST" }, 405);
    if (!env.OPENAI_API_KEY || !env.RATE_LIMIT_SALT)
      return json(
        {
          error:
            "Live answers are not configured. Search and guided examples are available.",
        },
        503
      );
    const evaluation = await evaluationRequest(request, env.EVAL_TOKEN);
    if (!evaluation && request.headers.get("Origin") !== env.ALLOWED_ORIGIN)
      return json({ error: "Origin not allowed" }, 403);
    if (!request.headers.get("Content-Type")?.startsWith("application/json"))
      return json({ error: "Expected JSON" }, 415);
    // Read incrementally so a missing/false Content-Length cannot bypass the body limit.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Missing question" }, 400);
    let length = 0;
    const decoder = new TextDecoder();
    let body = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) {
        await reader.cancel();
        return json({ error: "Question too large" }, 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    let parsed;
    try {
      parsed = questionSchema.safeParse(JSON.parse(body));
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (!parsed.success)
      return json({ error: "Enter a question of 3–1,000 characters." }, 400);
    const ip = request.headers.get("CF-Connecting-IP");
    if (!evaluation && !ip)
      return json({ error: "Visitor verification is unavailable." }, 403);
    const key = await digest(`${env.RATE_LIMIT_SALT}:${ip ?? "evaluation"}`);
    if (!(await store.allowRate(key, Math.floor(Date.now() / 1000), evaluation)))
      return json(
        { error: "Demo limit reached. Please try later or browse the notes." },
        429
      );
    if (!evaluation && !(await verifyTurnstile(parsed.data.challengeToken, ip!, env)))
      return json({ error: "Please complete the visitor check and try again." }, 403);
    const id = crypto.randomUUID();
    if (!(await store.reserve(id, new Date().toISOString().slice(0, 7))))
      return json(
        {
          error:
            "This month's AI allowance is used. Search and guided examples are still available.",
        },
        429
      );

    const accounting: RunAccounting = {
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      uncertain: false,
    };
    const encoder = new TextEncoder();
    const abort = new AbortController();
    const signal = AbortSignal.any([
      abort.signal,
      request.signal,
      AbortSignal.timeout(RUN_TIMEOUT_MS),
    ]);
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const emit = (event: ExplorerEvent) => {
          if (!closed) {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } catch {
              closed = true;
              abort.abort();
            }
          }
        };
        const task = (async () => {
          try {
            await runAgent(
              parsed.data.question,
              {
                search: (q) => store.search(q),
                read: (key) => store.read(key),
                model: openAIModel(env.OPENAI_API_KEY!),
                emit,
              },
              signal,
              accounting
            );
          } catch {
            emit({
              type: "error",
              message: signal.aborted
                ? "The run stopped before completion. Your sources remain available."
                : "I couldn't produce a verified answer. Please browse the sources or try a narrower question.",
            });
          } finally {
            try {
              await store.settle(
                id,
                accounting.uncertain
                  ? null
                  : usageCostMicros(accounting.inputTokens, accounting.outputTokens)
              );
            } catch {
              // Failed settlement intentionally leaves the full reservation in place.
              console.error("Budget settlement retained a reservation");
            }
            emit({ type: "done" });
            if (!closed) {
              closed = true;
              controller.close();
            }
          }
        })();
        ctx.waitUntil(task);
      },
      cancel() {
        closed = true;
        abort.abort();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return json(
      {
        error:
          "The live service is unavailable. Public notes and guided examples still work.",
      },
      503
    );
  }
}

const worker = { fetch: handleRequest };
export default worker;
