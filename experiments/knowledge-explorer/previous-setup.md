# Elizabeth Alcalá · Engineering Lab

A static Next.js portfolio with six public engineering ideas, the nine original 2020
articles, and a bounded, inspectable knowledge agent. Markdown in this repository is the
publishing source. The Obsidian vault is never read by a build or deployed service.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS; static HTML export.
- Cloudflare Worker for `/api/*`; direct static assets for everything else.
- D1 / SQLite FTS5 for public note retrieval, rate counters, and spending reservations.
- OpenAI Responses API with `gpt-6-luna`, standard processing, reasoning disabled.
- Vitest, a real SQLite-backed D1 test adapter, and a 30-question live evaluation set.

## Local preview

Use Node 22.13 or newer (tests use `node:sqlite`).

```sh
npm ci
npm run dev
```

Open the URL printed by Next.js. The guided example and local note search need no secrets
or database. The example is written illustration, never a fabricated model recording or
benchmark. The live tab becomes available only when both the public Turnstile key and
server configuration are ready.

To exercise the production static export and Worker locally:

```sh
npm run build
npm run db:local
npm run preview
```

The preview normally serves `http://localhost:8787`. A placeholder D1 ID is intentionally
present in `wrangler.jsonc`; remote publication requires replacing it with your own
database ID. Local D1 uses the configured database name.

## Publishing content

- Existing posts stay in `outstatic/content/posts/`; their `/blog/[slug]` routes are
  unchanged.
- Curated working ideas live in `content/notes/`; they connect to real engineering
  questions without claiming a shipped outcome.
- Required frontmatter: `title`, `description`, `slug`, `publishedAt`, `status` (`draft`
  or `published`). Notes also set `topic` and `kind: idea`.
- Preserve `publishedAt` when revising a note. Set optional `updatedAt` to the actual
  public revision date (never earlier than publication). Cards show the latest date;
  articles show both dates, and notes sort by the latest revision. Private source dates
  are not publication dates.
- The filename must match the slug. Drafts are excluded from pages, search JSON, and the
  D1 seed.
- Write public versions with generic names and original examples. Never copy employer
  source, internal links, private paths, or claims about achievements without supporting
  evidence. Summarize context, a working idea, and the next question to investigate. Sync
  by reviewing and rewriting selected source material; never auto-publish the vault.
- `npm run content` validates both collections and generates `public/knowledge.json` plus
  `.generated/seed.sql`. Only the six published public notes are indexed. Legacy content
  is preserved but not treated as current AI source material.

## Deploy to your own Cloudflare Free account

This project deliberately targets your own Cloudflare account and its Free plan. It does
not provision a paid plan or route requests through another hosting subscription.

1. Authenticate Wrangler (`npx wrangler login`) or supply scoped Cloudflare credentials
   through the environment. Do not put credentials in Git.
2. Create a D1 database: `npx wrangler d1 create knowledge`. Copy the returned ID into
   `wrangler.jsonc`.
3. Create a Turnstile widget for the deployment hostname with action `explore`. For local
   testing, use the documented Cloudflare test keys and a localhost hostname; never use
   test keys in production.
4. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS
   origin and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the widget's public key. These are baked
   into the static build.
5. Set `ALLOWED_ORIGIN` in `wrangler.jsonc` to that same origin. For local Worker secrets,
   copy `.dev.vars.example` to `.dev.vars`; this file is ignored.
6. Provision Worker secrets through Wrangler's secure interactive input:

```sh
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RATE_LIMIT_SALT
npx wrangler secret put EVAL_TOKEN
```

Use a dedicated OpenAI project/key exclusively for this gateway. Generate independent
random values for `RATE_LIMIT_SALT` and `EVAL_TOKEN`; the evaluation token must contain at
least 32 characters. Never expose either as a `NEXT_PUBLIC_` variable. Keep automatic
credit replenishment disabled if using prepaid credits. Provider budget notifications are
not this application's spending control.

7. Run the complete verification phase. The CI workflow performs the non-live checks;
   under this repository's agent workflow, delegate those checks to the verifier after all
   edits are finished.
8. Prepare and publish:

```sh
npm run build
npm run db:remote
npm run deploy
```

For later content changes, rebuild, refresh the public D1 seed, and deploy the matching
assets. The seed replaces only note/index data, never budget or rate-limit tables. Test on
a separate preview deployment before changing production. A preview that enables live
calls must use the same budget database/key, or receive its own explicitly allocated
budget; never duplicate the full $10 allowance across deployments.

Cloudflare credentials, an OpenAI key, Turnstile configuration, remote CPU measurements,
and live evaluations are **not included or fabricated**. The application is functional
locally with the guided example and search before these are supplied.

## Budget and operational limits

| Control             | Default                                                           |
| ------------------- | ----------------------------------------------------------------- |
| Infrastructure      | Cloudflare Workers Free and D1 Free; do not upgrade automatically |
| Shared AI allowance | $10 per UTC calendar month, inclusive of evaluations              |
| Reservation         | $0.05 per run, reserved atomically before any model request       |
| Model requests      | At most 4, no automatic provider retries                          |
| Tool calls          | At most 3, one per model response                                 |
| Model input         | Entire serialized request ≤ 32,768 UTF-8 bytes                    |
| Output              | At most 1,000 tokens per model request                            |
| Deadline            | 30 seconds after admission                                        |
| Visitor rate        | 3 runs/minute, 20/day; 200 public runs/day globally               |
| Evaluation rate     | 60 runs/day, authenticated; still uses the same budget            |

Configured prices are $0.10/M input tokens and $0.50/M output tokens. The conservative
reservation exceeds four maximum-sized calls at these prices, including framing headroom.
Revisit the reservation and limits before changing models, pricing, or adding billed
tools. All model calls must go through this Worker; unrelated usage of the API key cannot
be bounded by its ledger.

Known usage settles in integer microdollars. Unknown usage consumes the full reservation.
Settlement is idempotent, and a failed settlement retains the reservation. Abandoned
reservations are intentionally not automatically refunded. There are no scheduled jobs,
paid vector stores, hosted file-search fees, or model web-search calls.

D1 or budget failures stop generation before spending. If free quotas are exhausted,
static pages and browser-local search remain usable. `$20/month` is a ceiling: $10 AI plus
$10 headroom, excluding an existing coding subscription and domain renewal. Actual payment
is usage-based, not a fixed $20 subscription.

Before a public launch, measure real Worker CPU time in Cloudflare's deployment metrics
with representative agent runs, including four-call paths. The Free limit is 10 ms CPU per
invocation; network waiting is distinct from CPU. Local wall-clock timing does **not**
establish compliance. Keep generation unavailable if it does not fit; optimize before
considering any explicit budget change. Do not claim remote CPU verification from a local
test.

## API and trust boundaries

- `GET /api/status` — whether the server is configured for live calls.
- `GET /api/search?q=...` — top five full-text matches from published notes.
- `POST /api/explore` — `{ "question": "...", "challengeToken": "..." }`, streamed `data:`
  JSON frames: `start`, `tool`, `sources`, `answer`, `usage`, `error`, `done`.
- An evaluation client supplies `Authorization: Bearer <EVAL_TOKEN>` instead of Turnstile.
  That bypasses only visitor verification and its rate bucket, never spending or execution
  limits.

The agent has `search_notes(query)` and `read_note(id)`. Reads are limited to IDs
discovered by its search. Runtime validation requires citations to reference actually read
sources, verbatim excerpts present in those sources, and corresponding inline IDs. This
establishes provenance, not semantic correctness. Source results and user questions never
become tool definitions or instructions. Generated answers are displayed as plain React
text, not executable HTML.

Raw questions, answers, tokens, and IP addresses are not stored by the application. Rate
keys are salted digests. API requests use `store:false`; OpenAI's own data-retention
policies still apply. Avoid private information in live demo questions. The evaluation CLI
writes only the fixed public fixtures and their results to an ignored local file.

## Live evaluation

`evals/questions.json` contains 20 answerable, five unsupported, and five adversarial
cases, each with a human-review rubric. Start with a deployed, seeded Worker; set
`EVAL_ORIGIN` and `EVAL_TOKEN` securely in the evaluation environment.

```sh
npm run eval:live
```

The CLI goes through `/api/explore`, never directly to OpenAI, and stops on a failed run.
It writes `evals/results.local.json` after each case so interrupted results survive.
Review each answer against the source and rubric; set `humanSupported` to `true` or
`false` and add review notes. For unsupported/adversarial cases, `true` means the
abstention/refusal is correct.

```sh
npm run eval:publish
```

Publication requires all 30 unique fixtures, completed calls with usage, valid read-source
citations, explicit human reviews, at least 90% supported answers among the 20 answerable
cases, and all 10 abstention cases passing. It writes the aggregate `evals/report.json`,
shown on the project page after rebuilding. The initial report honestly says “not run
yet.” Automated assertions and mocked model responses must never be published as a live
model-quality score.

## Verification workflow

Finish all implementation and test edits first. Ask the `test-writer` to add meaningful
tests, then ask the `verifier` to run the complete batch:

```sh
npm run build
npm run typecheck
npm run lint
npm test
npx wrangler deploy --dry-run --outdir .generated/worker
```

Browser checks cover desktop/mobile, keyboard navigation, themes, all nine archive links,
unknown URLs, the guided example, local search, and graceful unconfigured-live behavior.
Seed local D1 and check the real `/api/search` route too. Live model behavior and
Cloudflare CPU limits require configured remote services. Batch any fixes and rerun
verification; do not interleave checks with implementation edits.

### Dependency audit notes

On October 22, 2026, the production dependency audit reported zero vulnerabilities, and
the full audit reported zero criticals. Nine development-only advisory paths remain in
Tailwind 3 / Next ESLint glob handling and CSS-parser dependencies. These tools process
the repository's build inputs; they are not shipped in the Worker or browser runtime. Do
not pass untrusted glob patterns to the build tooling. The audit's proposed downgrade of
the Next ESLint configuration is not an appropriate remediation; track compatible upstream
fixes instead.
