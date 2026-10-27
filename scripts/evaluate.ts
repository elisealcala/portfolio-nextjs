import fs from "node:fs";
import questions from "../evals/questions.json";
import {
  MODEL,
  type Answer,
  type ExplorerEvent,
  type Usage,
} from "../src/lib/explorer-contract";
import { readEventStream } from "../src/lib/event-stream";

async function main() {
  const origin = process.env.EVAL_ORIGIN;
  const secret = process.env.EVAL_TOKEN;
  if (!origin || !secret || secret.length < 32)
    throw new Error(
      "Set EVAL_ORIGIN and EVAL_TOKEN (32+ characters). Never call the model directly: evaluations use the deployed budget gate."
    );
  const target = new URL("/api/explore", origin);
  if (
    target.protocol !== "https:" &&
    target.hostname !== "localhost" &&
    target.hostname !== "127.0.0.1"
  )
    throw new Error("Use HTTPS for remote evaluation.");
  const results = [];
  for (const item of questions) {
    let answer: Answer | null = null;
    let usage: Usage | null = null;
    let error: string | null = null;
    const events: ExplorerEvent[] = [];
    try {
      const response = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ question: item.question }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!response.ok || !response.body)
        throw new Error(
          `Evaluation stopped at HTTP ${response.status}; check the service and remaining allowance.`
        );
      await readEventStream(response.body, (event) => {
        events.push(event);
        if (event.type === "answer") answer = event.result;
        if (event.type === "usage") usage = event.usage;
        if (event.type === "error") error = event.message;
      });
    } catch (failure) {
      error = failure instanceof Error ? failure.message : "Evaluation failed";
    }
    // JSON round-trip avoids storing runtime objects; all inputs are fixed public fixtures.
    results.push({
      ...item,
      answer,
      usage,
      error,
      events,
      humanSupported: null,
      reviewNotes: "",
    });
    fs.writeFileSync(
      "evals/results.local.json",
      JSON.stringify({ model: MODEL, date: new Date().toISOString(), results }, null, 2)
    );
    console.log(`${item.id}: ${error ? "failed" : "recorded — needs review"}`);
    if (error) {
      process.exitCode = 1;
      break;
    }
  }
  console.log(
    "Review each answer and its sources using the supplied rubric. Set humanSupported true/false in results.local.json, then run npm run eval:publish. Unreviewed runs never become quality scores."
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Evaluation failed");
  process.exitCode = 1;
});
