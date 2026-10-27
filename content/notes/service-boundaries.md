---
title: "One action, two entry points"
description:
  "Let the browser and the agent share a rule before deciding how much architecture
  surrounds it."
slug: "service-boundaries"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "Architecture"
kind: "idea"
---

Researching how internal agents and external tool clients reach the same operations
brought up a familiar problem: the browser and the agent can perform one action through
different paths. Where should the shared rule live?

There is a second question underneath it. Should an internal agent use the external
protocol too, or call the same application function directly?

## The idea I’m exploring

Share the operation first. A plain function can receive ordinary inputs, check the domain
rule, and return a result. The web and AI adapters validate their inputs and translate
that result into their own responses. HTTP status codes and tool formatting stay outside
the shared rule.

Using one protocol path may expose integration problems earlier and reduce divergence.
Calling a shared function directly may avoid network overhead and keep internal calls
simpler. I want to choose based on what can drift, not on the assumption that one path is
always cleaner.

A service layer can provide that separation without a complete ports-and-adapters
architecture. Narrow interfaces become useful when a provider varies, replacement is
likely, or a difficult dependency needs isolation. They also add mappings and test doubles
whose behavior must remain credible.

Transaction ownership should remain visible. If an operation needs two writes to succeed
together, several independently saving repositories can hide the actual requirement.
Passing the transaction through the use case may be the clearer choice.

## What I’d check next

Run the same permitted action and the same rejected action through both entry points.
Compare stored outcomes and permission decisions, not just response shapes. Include a
failing second write to test the transaction boundary.

The open question is how to detect drift without forcing every internal call over a
network. I would add an abstraction when it removes a concrete duplicate rule or failure
mode, rather than to complete an architectural diagram.
