---
title: "The autosave test I actually want to trust"
description:
  "A successful save call says little if the latest text cannot survive a failure and
  reload."
slug: "persistence-testing"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "Testing"
kind: "idea"
---

An autosave review made me question what a passing persistence test actually proves. If
the fake store cannot reproduce the way the real store overwrites data, the test can be
green while the important failure remains impossible to simulate.

## The idea I’m exploring

Start from the promise to the person writing: their latest text should remain recoverable.
“Save was called twice” or “the indicator turned green” is weaker evidence. Both can
happen with the wrong payload.

I want a test that types a distinctive draft, interrupts or rejects a save, exercises
recovery, and inspects the content that survives. A reload should read what was persisted,
not just reuse the editor’s in-memory state. If a rejected save leaves a local recovery
copy, check that copy explicitly too.

The fake needs the relevant storage semantics. A store that replaces a document cannot be
represented by a fake that always merges fields. Version checks, replacement versus
patching, transaction boundaries, and failed writes matter when they are part of the
scenario. Reproducing every database feature does not.

Delayed hydration and stale acknowledgements deserve their own cases: an old response
should not silently replace newer typing or mark an unsaved draft as safe. These are
reasons to inspect content, not only the number or order of calls.

## What I’d check next

Use a small set of adversarial save sequences: edit during a pending save, reject a stale
version, fail a write, then reload and recover. Assert both visible text and recoverable
stored content.

The question I’m still exploring is how small the fake can stay while retaining those
failure modes. A focused adapter test against real storage can check the assumptions that
the fake cannot establish on its own. I would also verify that the runner actually
collects these tests.
