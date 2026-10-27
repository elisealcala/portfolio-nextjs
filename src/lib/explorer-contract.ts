import { z } from "zod";

export const MODEL = "gpt-6-luna";
export const MAX_MODEL_CALLS = 4;
export const MAX_TOOL_CALLS = 3;
export const MAX_OUTPUT_TOKENS = 1000;
export const MAX_CONTEXT_BYTES = 32_768;
export const MONTHLY_BUDGET_MICROS = 10_000_000;
export const RUN_RESERVATION_MICROS = 50_000;
export const RUN_TIMEOUT_MS = 30_000;
export const PRICE = { input: 0.1, output: 0.5 };

export const questionSchema = z.object({
  question: z.string().trim().min(3).max(1000),
  challengeToken: z.string().max(4096).optional(),
});
export const searchSchema = z
  .object({ query: z.string().trim().min(1).max(200) })
  .strict();
export const readSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(100),
  })
  .strict();
export const answerSchema = z
  .object({
    supported: z.boolean(),
    answer: z.string().min(1).max(6000),
    citations: z
      .array(z.object({ id: z.string(), excerpt: z.string().min(20).max(500) }).strict())
      .max(5),
  })
  .strict();
export type Answer = z.infer<typeof answerSchema>;
export type NoteSource = {
  id: string;
  title: string;
  description: string;
  topic: string;
  url: string;
  content: string;
};
export type SearchResult = Omit<NoteSource, "content"> & { excerpt: string };
export type Usage = {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  modelCalls: number;
};
export type ExplorerEvent =
  | { type: "start"; model: string }
  | { type: "tool"; tool: "search_notes" | "read_note"; detail: string }
  | { type: "sources"; sources: SearchResult[] }
  | { type: "answer"; result: Answer; sources: SearchResult[] }
  | { type: "usage"; usage: Usage }
  | { type: "error"; message: string }
  | { type: "done" };

export function usageCostMicros(inputTokens: number, outputTokens: number) {
  // A microdollar is one millionth of a dollar; prices are dollars per million tokens.
  return Math.ceil(inputTokens * PRICE.input + outputTokens * PRICE.output);
}

export function localSearch(notes: NoteSource[], query: string): SearchResult[] {
  const terms = query.toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  if (!terms.length) return [];
  return notes
    .map((note) => ({
      note,
      score: terms.reduce(
        (score, term) =>
          score +
          (note.title.toLowerCase().includes(term) ? 5 : 0) +
          (note.description.toLowerCase().includes(term) ? 3 : 0) +
          (note.content.toLowerCase().includes(term) ? 1 : 0),
        0
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ note: { content, ...note } }) => ({
      ...note,
      excerpt: content.slice(0, 240),
    }));
}
