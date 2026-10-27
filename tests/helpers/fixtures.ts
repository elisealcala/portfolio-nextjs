import type { Answer, NoteSource, SearchResult } from "../../src/lib/explorer-contract";

export const note: NoteSource = {
  id: "optimistic-concurrency",
  title: "Preventing lost edits",
  description: "Version preconditions protect a draft from stale writes.",
  topic: "Systems design",
  url: "/notes/optimistic-concurrency",
  content:
    "The client sends the version it last observed alongside its proposed content. A stale write must preserve the local draft.",
};

export const searchResult: SearchResult = {
  id: note.id,
  title: note.title,
  description: note.description,
  topic: note.topic,
  url: note.url,
  excerpt: note.content,
};

export const supportedAnswer: Answer = {
  supported: true,
  answer:
    "Send the client's last observed version with the proposed content. [optimistic-concurrency]",
  citations: [
    {
      id: note.id,
      excerpt:
        "The client sends the version it last observed alongside its proposed content.",
    },
  ],
};

export const abstention: Answer = {
  supported: false,
  answer: "The published notes cannot answer that question.",
  citations: [],
};

export function toolResponse(name: string, args: unknown, id = "call-1") {
  return {
    status: "completed",
    output: [
      {
        type: "function_call",
        name,
        arguments: typeof args === "string" ? args : JSON.stringify(args),
        call_id: id,
      },
    ],
    usage: { input_tokens: 100, output_tokens: 20 },
  };
}

export function answerResponse(answer: Answer = supportedAnswer) {
  return {
    status: "completed",
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(answer) }],
      },
    ],
    usage: { input_tokens: 100, output_tokens: 20 },
  };
}
