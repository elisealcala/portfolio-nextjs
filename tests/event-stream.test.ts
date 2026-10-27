import { describe, expect, it } from "vitest";
import { readEventStream } from "../src/lib/event-stream";
import type { ExplorerEvent } from "../src/lib/explorer-contract";

function stream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}
const encode = (text: string) => new TextEncoder().encode(text);

describe("event stream reader", () => {
  it("reassembles split frames and split UTF-8 characters", async () => {
    const event: ExplorerEvent = {
      type: "tool",
      tool: "search_notes",
      detail: "autorización Perú",
    };
    const bytes = encode(`data: ${JSON.stringify(event)}\n\ndata: {"type":"done"}\n\n`);
    const events: ExplorerEvent[] = [];
    await readEventStream(
      stream([...bytes].map((byte) => Uint8Array.of(byte))),
      (value) => events.push(value)
    );
    expect(events).toEqual([event, { type: "done" }]);
  });

  it("accepts multiple events in one network chunk and ignores comments", async () => {
    const values: ExplorerEvent[] = [];
    await readEventStream(
      stream([
        encode(
          ': keepalive\n\ndata: {"type":"start","model":"gpt-6-luna"}\n\ndata: {"type":"done"}\n\n'
        ),
      ]),
      (event) => values.push(event)
    );
    expect(values.map((event) => event.type)).toEqual(["start", "done"]);
  });

  it("rejects a truncated stream rather than reporting a successful run", async () => {
    await expect(
      readEventStream(
        stream([encode('data: {"type":"start","model":"gpt-6-luna"}\n\n')]),
        () => {}
      )
    ).rejects.toThrow("before the run completed");
  });

  it("rejects malformed and oversized events", async () => {
    await expect(
      readEventStream(stream([encode("data: not-json\n\n")]), () => {})
    ).rejects.toThrow();
    await expect(
      readEventStream(stream([encode("x".repeat(100_001))]), () => {})
    ).rejects.toThrow("display limit");
  });
});
