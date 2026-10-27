import type { ExplorerEvent } from "./explorer-contract";

export async function readEventStream(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: ExplorerEvent) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (buffer.length > 100_000) throw new Error("Response exceeded the display limit");
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data: "))
          .map((line) => line.slice(6))
          .join("\n");
        if (!data) continue;
        const event = JSON.parse(data) as ExplorerEvent;
        if (event.type === "done") completed = true;
        onEvent(event);
      }
      if (done) break;
    }
    if (!completed) throw new Error("The connection ended before the run completed.");
  } finally {
    reader.releaseLock();
  }
}
