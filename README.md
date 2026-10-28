# Elizabeth Alcalá · Portfolio

A static Next.js portfolio with selected professional experience, six dated engineering
ideas, and the nine original 2020 articles. The interface uses React, TypeScript, Tailwind
CSS, and locally hosted fonts. The proposed direction is **“Full-stack engineer building
reliable AI applications”**, with an interactive systems lab and an Engineering Knowledge
Explorer as the flagship project. That design and live explorer are not yet on this site.

## Local preview

Use Node 22.13 or newer.

```sh
npm ci
npm run dev
```

To preview the production export:

```sh
npm run build
npm run preview
```

The production preview normally serves http://localhost:8787. It needs no AI credentials
or database. The Worker only serves assets and returns 404 for `/api` requests.

## Content

- `src/lib/experience.ts` contains selected experience curated from the supplied résumé
  and public LinkedIn profile. Consulting employers and clients are identified separately.
  This is a manual, reviewed snapshot, not a continuous LinkedIn integration.
- `content/notes/` contains public working ideas. Preserve `publishedAt` on edits and set
  `updatedAt` to the public revision date. Cards show the latest date; article headers
  distinguish publication and revision. Notes are sorted by the latest date.
- Existing articles remain in `outstatic/content/posts/`, preserving their original URLs
  and 2020 dates. Outstatic is no longer used as a CMS.
- Notes require title, description, slug, publishedAt, status, topic, and kind. Drafts
  stay out of public pages. The filename must match the slug.
- Builds never read the Obsidian vault. Use generic public examples and avoid internal
  source code, links, private identifiers, or unverified outcomes.

## Deployment plan

### Phase 1: publish the current portfolio

The current portfolio is already live on [Vercel](https://portfolio-nextjs-vert-xi.vercel.app)
and Cloudflare at
[my-portfolio.ezth.workers.dev](https://my-portfolio.ezth.workers.dev).
`next.config.js` exports the pages to `out/`; `wrangler.jsonc` uploads those files to the
existing Cloudflare Worker named `my-portfolio`. The active `worker/portfolio.ts`
only serves assets and returns 404 for `/api` requests. No database, Turnstile widget, or
OpenAI key is needed for this release.

1. Use the Cloudflare account that owns the existing Worker. Log in with
   `npx wrangler login` and confirm the selected account with `npx wrangler whoami`.
2. Use `https://my-portfolio.ezth.workers.dev` as the public HTTPS
   origin. A custom domain is optional and requires a domain you control in Cloudflare;
   domain registration costs are outside this plan.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to that exact origin,
   with no trailing slash. It is embedded in canonical URLs, `robots.txt`, and the
   sitemap at build time. The `.env.local` file stays out of Git.
4. Build, check, and deploy from this directory:

   ```sh
   npm ci
   npm run build
   npm run typecheck
   npm run lint
   npm test
   npx wrangler deploy --dry-run --outdir .generated/worker
   npm run deploy
   ```

5. Open the URL printed by Wrangler and check the homepage, a note, an archived article,
   `/sitemap.xml`, and an unknown URL. An `/api/status` request should return 404 in this
   phase. If the final hostname differs from `NEXT_PUBLIC_SITE_URL`, update `.env.local`,
   rebuild, and deploy again.

If Turbopack cannot start its local build helper because the environment blocks local
ports, use `npm run build -- --webpack` for the same static export. This fallback has been
verified with this repository.

For later content changes, run the build and deploy commands again. Cloudflare can also
connect the Worker to a [custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
once the domain is in the account. The existing configuration leaves the `workers.dev`
address enabled.

### Phase 2: build and deploy the Engineering Knowledge Explorer

This is a **planned second release**, not part of the current deployment. The former
Explorer source is parked in this repository; it has no public route, D1 binding, or
runnable separate app. See `experiments/knowledge-explorer/README.md` for its status.

1. Finish the interactive systems-lab design and a case study that distinguishes shipped
   work from engineering studies. Publish only reviewed notes from this repository; the
   private Obsidian vault must not be used by the build or deployed service.
2. Extract and finish the Explorer as a separate deployable app or Worker, then link it
   from the portfolio. Keep the portfolio's static export for its public pages and run
   the search/agent API in the Worker.
3. Create a D1 database and apply `migrations/0001_knowledge.sql`. Seed only published
   notes, then test FTS5 retrieval and source links against the deployed database.
4. Configure a Turnstile widget for the Explorer hostname. Store `OPENAI_API_KEY`,
   `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_SALT`, and any evaluation token as Worker secrets;
   put only the public Turnstile site key in the browser build. Set the allowed origin to
   the exact production origin.
5. Run the API, citation, abuse-limit, and live evaluation checks before enabling public
   AI answers. Check actual Worker CPU use on Cloudflare Free. The historical Explorer
   code and configuration need review and adaptation before they can be deployed.

The intended model is `gpt-6-luna` through the OpenAI Responses API. Its current standard
short-context price is $0.10 per million input tokens and $0.50 per million output tokens.
Pricing may change, so recheck it when Phase 2 is built. The app should enforce a shared
$10 monthly AI allowance, including evaluations, with rate limits and a per-request
reservation. Provider usage outside that gateway or a delayed/uncertain usage report is
not guaranteed to fit the application's ledger; use a dedicated API project and monitor
its billing separately.

### Budget check (verified October 27, 2026)

| Layer | Planned service | Expected monthly spend at free-tier usage |
| --- | --- | ---: |
| Portfolio | Next.js static export on Cloudflare Workers Static Assets | $0 |
| Explorer API and search, once built | Cloudflare Workers Free + D1 Free with SQLite FTS5 | $0 |
| AI, once enabled | OpenAI Responses API with `gpt-6-luna` | Up to $10 application target |
| Contingency | Reserved for taxes, usage changes, or other costs | Up to $10 headroom |

The $20 figure is a **planning ceiling**, not a subscription or a guaranteed bill cap.
Static asset requests are free and unlimited, while Worker script requests on Free are
limited to 100,000 per day and 10 ms CPU per request. D1 Free currently includes 5 million
rows read per day, 100,000 rows written per day, and 5 GB total storage; exceeding daily
read/write quotas causes queries to fail until they reset. The Explorer's live use must
fit these limits. A paid plan, optional domain renewal, and unrelated OpenAI usage are
outside this budget.

Sources: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports),
[Cloudflare static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/),
[Workers Free limits](https://developers.cloudflare.com/workers/platform/limits/),
[D1 pricing and quotas](https://developers.cloudflare.com/d1/platform/pricing/),
[D1 FTS5 support](https://developers.cloudflare.com/d1/sql-api/sql-statements/),
[OpenAI GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), and
[OpenAI API pricing](https://developers.openai.com/api/docs/pricing).

## Verification

Run these checks before each deployment:

```sh
npm run build
npm run typecheck
npm run lint
npm test
npx wrangler deploy --dry-run --outdir .generated/worker
```

Check desktop/mobile, keyboard navigation, themes, experience content, article dates, all
nine legacy routes, and the absence of the retired lab/API. Existing agent tests are
retained as regression coverage for the parked source; they do not activate it.

## Dependency audit notes

On October 22, 2026, the production dependency audit reported zero vulnerabilities and
zero criticals in the full audit. Nine development-only advisory paths remained in the
Tailwind/ESLint/CSS tooling. This records that audit date, not a new audit result.
