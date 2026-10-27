---
title: "Attaching a document does not mean the agent can use it"
description:
  "Follow a document into the model’s context before choosing a retrieval strategy."
slug: "retrieval-tradeoffs"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "AI context"
kind: "idea"
---

While tracing how attached resources reach an agent, I found a more useful starting
question than “Do we need embeddings?”: where does the document’s actual content enter the
model request?

An attachment record, a selected version, and usable model context are different things. A
successful attachment alone does not establish that the agent can read the intended
content.

## The idea I’m exploring

Follow one document end to end: attachment, version selection, content resolution, and the
prompt or tool result the model receives. Make the intended version explicit. A request
for a pinned revision should not silently become a read of whatever is newest.

Only then choose retrieval. Full context is simple when a document is small, but repeating
it can be expensive. Keyword search is an inexpensive, inspectable baseline for a small
technical corpus and exact identifiers. Its weakness is vocabulary mismatch: “lost edits”
and “optimistic concurrency” may describe the same problem.

Semantic retrieval uses embeddings to find related wording, at the cost of chunking,
embedding generation, index updates, and permission filtering. Similarity still does not
prove a passage answers the question.

Agentic retrieval lets the model choose a search and inspect results before continuing. It
can use keyword search and document reads; a vector database is not required. The extra
model requests need limits on time, tool calls, context, and spending.

## What I’d check next

Ask a question whose answer differs between two document versions. Inspect which content
reached the model, then check whether the answer cites that version. Repeat with a
paraphrase and with a question the document cannot answer.

My open question is how to keep repeated context small without losing version intent or
freshness. Retrieval supplies evidence for the current question; memory retains
information across interactions. I do not want to mix those responsibilities accidentally.
