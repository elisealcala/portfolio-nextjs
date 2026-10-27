---
title: "A tool-call failure should be useful to the person waiting"
description: "Validation and recovery belong to the same user-facing contract."
slug: "validating-ai-tool-calls"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "AI tools"
kind: "idea"
---

Working through tool-call validation raised a question beyond the schema itself: what
happens for the person waiting when the model sends arguments the application cannot use?

A syntactically valid JSON object can still contain an unknown resource, an oversized
value, or an operation the caller is not allowed to perform. Those failures need both a
boundary and a useful next step.

## The idea I’m exploring

Make the contract explicit from model output to execution. Parse the arguments, validate
their shape at runtime, then check resource existence and authorization before the
protected operation. A JSON schema cannot grant permission, and structured output does not
replace application checks.

During a migration, diagnostic validation can help reveal mismatches. Logging an invalid
call and executing it anyway is observation, not enforcement. A mutation boundary must
reject invalid arguments before a side effect happens.

For a read-only tool, a safe error can help the model try a valid query or ID. That
recovery still needs a budget: count failed attempts and stop at the tool or time limit.
An invalid argument should not turn into an endless correction loop.

I want errors that distinguish an unusable request from an unavailable service. “Unknown
public document” can guide a retry. Credentials, stack traces, and internal hostnames
cannot. If recovery fails, the person should get a clear stopping point and a way to
inspect the available sources.

## What I’d check next

Try a valid ID, a missing ID, an extra field, an oversized input, and a traversal-shaped
value. Check that rejected calls never reach the protected operation; for writes, inspect
stored state after failure.

My open question is which checks can be diagnostic while a contract is changing and which
must block immediately. I want that choice documented per boundary, rather than inherited
from whatever makes a demo continue.
