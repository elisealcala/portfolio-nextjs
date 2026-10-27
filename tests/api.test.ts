import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleRequest, verifyTurnstile, type Env } from "../worker/index";
import {
  MONTHLY_BUDGET_MICROS,
  RUN_RESERVATION_MICROS,
  usageCostMicros,
  type ExplorerEvent,
} from "../src/lib/explorer-contract";
import { readEventStream } from "../src/lib/event-stream";
import { SQLiteD1 } from "./helpers/sqlite-d1";
import { abstention, answerResponse, note } from "./helpers/fixtures";

describe("Worker API", () => {
  let database: SQLiteD1;
  let env: Env;
  let tasks: Promise<unknown>[];
  const origin = "https://portfolio.example";
  const evalToken = "evaluation-token-that-is-longer-than-32-characters";
  const context = {
    waitUntil: (task: Promise<unknown>) => {
      tasks.push(task);
    },
  };

  beforeEach(() => {
    database = new SQLiteD1();
    tasks = [];
    env = {
      DB: database.asD1(),
      ASSETS: {
        fetch: vi.fn().mockImplementation(async () => new Response("static portfolio")),
      },
      ALLOWED_ORIGIN: origin,
      OPENAI_API_KEY: "provider-test-key",
      TURNSTILE_SECRET_KEY: "turnstile-test-key",
      RATE_LIMIT_SALT: "rate-limit-test-salt",
      EVAL_TOKEN: evalToken,
    };
  });
  afterEach(async () => {
    await Promise.all(tasks);
    database.close();
    vi.unstubAllGlobals();
  });

  function request(
    body: unknown = {
      question: "How do I preserve an edit?",
      challengeToken: "challenge",
    },
    headers: Record<string, string> = {}
  ) {
    return new Request(`${origin}/api/explore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "CF-Connecting-IP": "192.0.2.1",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  async function events(response: Response) {
    const values: ExplorerEvent[] = [];
    await readEventStream(response.body!, (event) => values.push(event));
    await Promise.all(tasks);
    return values;
  }

  it("serves static pages without requiring AI or database availability", async () => {
    delete env.OPENAI_API_KEY;
    const response = await handleRequest(
      new Request(`${origin}/notes/optimistic-concurrency`),
      env,
      context
    );
    expect(await response.text()).toBe("static portfolio");
    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
  });

  it("exposes readiness without leaking credentials", async () => {
    const response = await handleRequest(
      new Request(`${origin}/api/status`),
      env,
      context
    );
    expect(await response.json()).toEqual({ live: true, model: "gpt-6-luna" });
    delete env.OPENAI_API_KEY;
    const disabled = await handleRequest(
      new Request(`${origin}/api/status`),
      env,
      context
    );
    expect(await disabled.json()).toMatchObject({ live: false });
  });

  it.each([
    ["invalid JSON", "{", {}, 400],
    ["too-short question", { question: "hi" }, {}, 400],
    ["too-long question", { question: "x".repeat(1001) }, {}, 400],
    ["oversized body", JSON.stringify({ question: "x".repeat(9000) }), {}, 413],
    [
      "wrong origin",
      { question: "How to save?" },
      { Origin: "https://attacker.example" },
      403,
    ],
    [
      "wrong content type",
      { question: "How to save?" },
      { "Content-Type": "text/plain" },
      415,
    ],
  ])("rejects %s before contacting a provider", async (_label, body, headers, status) => {
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);
    const response = await handleRequest(request(body, headers), env, context);
    expect(response.status).toBe(status);
    expect(provider).not.toHaveBeenCalled();
    expect(
      database.sqlite.prepare("SELECT count(*) AS count FROM reservations").get()?.count
    ).toBe(0);
  });

  it("does not trust an ordinary browser to supply an evaluation bypass", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => Response.json({ success: false }))
    );
    const response = await handleRequest(
      request(undefined, { Authorization: "Bearer wrong-token" }),
      env,
      context
    );
    expect(response.status).toBe(403);
    expect(
      database.sqlite.prepare("SELECT count(*) AS count FROM reservations").get()?.count
    ).toBe(0);
  });

  it("requires the edge-provided visitor address outside evaluation mode", async () => {
    const incoming = request();
    incoming.headers.delete("CF-Connecting-IP");
    const response = await handleRequest(incoming, env, context);
    expect(response.status).toBe(403);
  });

  it("returns a usable error when provider credentials are missing", async () => {
    delete env.OPENAI_API_KEY;
    const response = await handleRequest(request(), env, context);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("guided examples"),
    });
  });

  it("streams a verified abstention and settles measured usage through the shared gate", async () => {
    const provider = vi
      .fn()
      .mockImplementation(async () => Response.json(answerResponse(abstention)));
    vi.stubGlobal("fetch", provider);
    const incoming = request(undefined, { Authorization: `Bearer ${evalToken}` });
    incoming.headers.delete("Origin");
    incoming.headers.delete("CF-Connecting-IP");
    const response = await handleRequest(incoming, env, context);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect((await events(response)).map((event) => event.type)).toEqual([
      "start",
      "answer",
      "usage",
      "done",
    ]);
    expect(provider).toHaveBeenCalledTimes(1);
    expect(
      database.sqlite
        .prepare("SELECT reserved_micros,spent_micros FROM budget_months")
        .get()
    ).toMatchObject({ reserved_micros: 0, spent_micros: usageCostMicros(100, 20) });
  });

  it("verifies a browser challenge before starting a billable model request", async () => {
    const provider = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ success: true, hostname: "portfolio.example", action: "explore" })
      )
      .mockResolvedValueOnce(Response.json(answerResponse(abstention)));
    vi.stubGlobal("fetch", provider);
    const response = await handleRequest(request(), env, context);
    expect((await events(response)).map((event) => event.type)).toEqual([
      "start",
      "answer",
      "usage",
      "done",
    ]);
    expect(provider.mock.calls[0][0]).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    );
    expect(provider.mock.calls[1][0]).toBe("https://api.openai.com/v1/responses");
  });

  it("rate-limits repeated requests before provider verification or generation", async () => {
    const provider = vi
      .fn()
      .mockImplementation(async () => Response.json({ success: false }));
    vi.stubGlobal("fetch", provider);
    for (let index = 0; index < 3; index++)
      expect((await handleRequest(request(), env, context)).status).toBe(403);
    expect((await handleRequest(request(), env, context)).status).toBe(429);
    expect(provider).toHaveBeenCalledTimes(3);
    expect(
      database.sqlite.prepare("SELECT count(*) AS count FROM reservations").get()?.count
    ).toBe(0);
  });

  it("blocks evaluations as well as visitors when the shared allowance is exhausted", async () => {
    const month = new Date().toISOString().slice(0, 7);
    database.sqlite
      .prepare("INSERT INTO budget_months (month,spent_micros) VALUES (?,?)")
      .run(month, MONTHLY_BUDGET_MICROS);
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);
    const response = await handleRequest(
      request(undefined, { Authorization: `Bearer ${evalToken}` }),
      env,
      context
    );
    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("allowance"),
    });
    expect(provider).not.toHaveBeenCalled();
  });

  it("retains a full charge when a provider response fails after submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () => new Response("provider error", { status: 500 }))
    );
    const response = await handleRequest(
      request(undefined, { Authorization: `Bearer ${evalToken}` }),
      env,
      context
    );
    const values = await events(response);
    expect(values.map((event) => event.type)).toEqual(["start", "error", "done"]);
    expect(
      database.sqlite
        .prepare("SELECT reserved_micros,spent_micros FROM budget_months")
        .get()
    ).toMatchObject({ reserved_micros: 0, spent_micros: RUN_RESERVATION_MICROS });
    expect(JSON.stringify(values)).not.toContain("provider-test-key");
  });

  it("fails closed on storage failure without exposing the internal error", async () => {
    vi.spyOn(database, "prepare").mockImplementation(() => {
      throw new Error("private database hostname");
    });
    const response = await handleRequest(
      new Request(`${origin}/api/search?q=concurrency`),
      env,
      context
    );
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).toContain("Public notes");
    expect(text).not.toContain("private database");
  });

  it("searches without requiring AI credentials and validates query length", async () => {
    delete env.OPENAI_API_KEY;
    database.sqlite
      .prepare(
        "INSERT INTO notes (id,title,description,topic,url,content) VALUES (?,?,?,?,?,?)"
      )
      .run(note.id, note.title, note.description, note.topic, note.url, note.content);
    database.sqlite
      .prepare("INSERT INTO notes_fts (id,title,description,content) VALUES (?,?,?,?)")
      .run(note.id, note.title, note.description, note.content);
    const response = await handleRequest(
      new Request(`${origin}/api/search?q=edits`),
      env,
      context
    );
    expect(await response.json()).toMatchObject({ sources: [{ id: note.id }] });
    expect(
      (await handleRequest(new Request(`${origin}/api/search?q=`), env, context)).status
    ).toBe(400);
    expect(
      (
        await handleRequest(
          new Request(`${origin}/api/search?q=${"x".repeat(201)}`),
          env,
          context
        )
      ).status
    ).toBe(400);
  });

  it("returns explicit route and method errors", async () => {
    expect(
      (await handleRequest(new Request(`${origin}/api/missing`), env, context)).status
    ).toBe(404);
    expect(
      (await handleRequest(new Request(`${origin}/api/explore`), env, context)).status
    ).toBe(405);
  });

  it.each([
    [
      "successful challenge",
      { success: true, hostname: "portfolio.example", action: "explore" },
      true,
    ],
    [
      "failed challenge",
      { success: false, hostname: "portfolio.example", action: "explore" },
      false,
    ],
    [
      "wrong hostname",
      { success: true, hostname: "attacker.example", action: "explore" },
      false,
    ],
    [
      "wrong action",
      { success: true, hostname: "portfolio.example", action: "login" },
      false,
    ],
  ])("validates Turnstile: %s", async (_label, result, allowed) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => Response.json(result))
    );
    expect(await verifyTurnstile("challenge", "192.0.2.1", env)).toBe(allowed);
  });

  it("does not verify an absent challenge and handles a Turnstile outage", async () => {
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);
    expect(await verifyTurnstile(undefined, "192.0.2.1", env)).toBe(false);
    expect(provider).not.toHaveBeenCalled();
    provider.mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    expect(await verifyTurnstile("challenge", "192.0.2.1", env)).toBe(false);
  });
});
