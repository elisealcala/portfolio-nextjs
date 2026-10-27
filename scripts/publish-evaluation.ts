import fs from "node:fs";
import { z } from "zod";
import questions from "../evals/questions.json";
import { answerSchema, MODEL } from "../src/lib/explorer-contract";
import { getArticles } from "../src/lib/content";
import { validateAnswer } from "../worker/agent";

const schema = z.object({
  model: z.literal(MODEL),
  date: z.string().datetime(),
  results: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        kind: z.enum(["answerable", "unsupported", "adversarial"]),
        answer: answerSchema,
        error: z.null(),
        humanSupported: z.boolean(),
        events: z.array(
          z
            .object({
              type: z.string(),
              tool: z.string().optional(),
              detail: z.string().optional(),
            })
            .passthrough()
        ),
        usage: z.object({
          inputTokens: z.number().nonnegative(),
          outputTokens: z.number().nonnegative(),
          estimatedCostUsd: z.number().nonnegative(),
          latencyMs: z.number().nonnegative(),
          modelCalls: z.number().int().min(1).max(4),
        }),
      })
    )
    .length(30),
});
const run = schema.parse(JSON.parse(fs.readFileSync("evals/results.local.json", "utf8")));
if (new Set(run.results.map((result) => result.id)).size !== questions.length)
  throw new Error("Duplicate or missing evaluation cases");
const notes = getArticles("notes");
for (const result of run.results) {
  const fixture = questions.find((item) => item.id === result.id);
  if (!fixture || fixture.question !== result.question || fixture.kind !== result.kind)
    throw new Error("Evaluation fixture mismatch");
  const readIds = new Set(
    result.events
      .filter((e) => e.type === "tool" && e.tool === "read_note")
      .map((e) => e.detail)
  );
  const read = new Map(
    notes
      .filter((n) => readIds.has(n.slug))
      .map((n) => [
        n.slug,
        {
          id: n.slug,
          title: n.title,
          description: n.description,
          topic: n.topic,
          url: `/notes/${n.slug}`,
          content: n.content.trim().slice(0, 6000),
        },
      ])
  );
  validateAnswer(result.answer, read);
}
const answerable = run.results.filter((item) => item.kind === "answerable");
const supportedAnswerRate =
  answerable.filter((item) => item.answer.supported && item.humanSupported).length /
  answerable.length;
const otherCasesPass = run.results
  .filter((item) => item.kind !== "answerable")
  .every((item) => !item.answer.supported && item.humanSupported);
if (supportedAnswerRate < 0.9 || !otherCasesPass)
  throw new Error(
    "Release target not met. Keep the run for investigation; do not publish a passing report."
  );
const latencies = run.results.map((item) => item.usage.latencyMs).sort((a, b) => a - b);
fs.writeFileSync(
  "evals/report.json",
  JSON.stringify(
    {
      status: "reviewed",
      model: run.model,
      date: run.date,
      configuration: {
        reasoning: "none",
        serviceTier: "default",
        maxModelRequests: 4,
        maxToolCalls: 3,
        maxOutputTokens: 1000,
      },
      cases: 30,
      answerableCases: 20,
      unsupportedCases: 5,
      adversarialCases: 5,
      citationValidity: 1,
      supportedAnswerRate,
      humanReviewed: true,
      estimatedCostUsd: run.results.reduce(
        (total, item) => total + item.usage.estimatedCostUsd,
        0
      ),
      medianLatencyMs: latencies[15],
      note: `Human-reviewed run: ${Math.round(supportedAnswerRate * 100)}% of answerable cases were supported; all 10 unsupported/adversarial cases passed and all returned citations validated. Token costs are estimates excluding taxes.`,
    },
    null,
    2
  ) + "\n"
);
console.log("Published the reviewed report. Rebuild the static site to display it.");
