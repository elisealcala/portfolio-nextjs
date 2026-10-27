---
title: "What should happen when an AI edit meets an unsaved draft?"
description:
  "Preserve the draft first. Then decide how the editor should reconcile competing
  changes."
slug: "optimistic-concurrency"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "Collaborative editing"
kind: "idea"
---

While investigating autosave, I keep coming back to the same moment: an AI edit arrives
while the person is still typing. Rejecting a stale save protects the stored document, but
it does not tell the editor what to show next.

## The idea I’m exploring

Treat preserving work and reconciling it as separate decisions. Durability means each
writer’s content survives; convergence means the writers eventually agree on a current
version. A conflict handler can achieve one without achieving the other.

The client sends the version it last observed alongside its proposed content. The server
accepts the write only if that version still matches. Replacing a stale client token with
the newest server version would accept assumptions the client never saw.

For a delayed AI edit, I want the same optimistic concurrency rule: the proposal carries
the version it was generated against. If it conflicts, keep the local draft recoverable
before offering a comparison or an explicit merge. A checkpoint preserves options; it does
not decide which edit should win.

There is another edge to this: adopting a remote change should not trigger autosave as
though the user typed it. That can create echo loops. And if adoption waits for an
in-flight save, it needs another chance to run when that save finishes.

## What I’d check next

Start with two clients reading one version. Let one save and the other keep typing, then
deliver an AI proposal based on the old version. Verify that neither draft disappears,
remote updates do not echo back as new edits, and a deferred update is eventually handled.

The open design question is when to offer a comparison, when to create a checkpoint, and
when accepting remote content is safe. I want that policy to be explicit in the interface,
rather than hidden in save timing.
