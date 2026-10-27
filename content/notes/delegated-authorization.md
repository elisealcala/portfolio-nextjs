---
title: "A read-only screen still needs an authorization story"
description:
  "Removing editing controls does not explain who is allowed to read the document."
slug: "delegated-authorization"
publishedAt: "2026-10-22"
updatedAt: "2026-10-27"
status: "published"
topic: "Authorization"
kind: "idea"
---

Planning a read-only document view raised a question that the screen itself cannot answer:
which part of the system knows whether this person may see this document?

The useful idea is broader than a viewer. A small implementation scope still needs an
explicit authorization contract with the services around it.

## The idea I’m exploring

Trace the grant before tracing the fetch. In a simplified workspace example, one service
knows membership and which documents are attached; another serves document content. The
domain owner should check both the person’s membership and the document’s attachment to
that same workspace.

The content service must authenticate the calling service and enforce its resource
constraints. A valid service token identifies a caller; it does not, by itself, authorize
the person behind the request.

Without those checks, forwarding an arbitrary document ID with a powerful service
credential creates a confused-deputy problem. Hiding an edit button changes the available
interaction, not the permission to read.

I want the delegated contract to state who makes the permission decision, what the
downstream service trusts, and which checks must happen before content is fetched. A
narrowly scoped implementation should identify that dependency instead of making the whole
flow appear complete.

The same distinction applies to AI tools: hiding a tool from discovery is useful, but
execution still needs authorization. A model-supplied user ID is not an identity grant.

## What I’d check next

Test a permitted member with an attached document, a non-member, a member requesting an
unattached document, and an invalid service caller. Rejected requests should never reach
the protected read.

This remains a design question, not a claim that a secure deployment is complete: how can
the interface between teams make an unmet authorization dependency visible and
enforceable?
