# Elizabeth Alcalá · Portfolio

A static Next.js portfolio with selected professional experience, six dated engineering
ideas, and the nine original 2020 articles. The interface uses React, TypeScript, Tailwind
CSS, and locally hosted fonts.

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

## Deployment

The existing Cloudflare Worker identity is retained in `wrangler.jsonc` to avoid creating
an unrelated deployment. Static assets use Cloudflare Free; no D1 or OpenAI configuration
is required for this portfolio.

Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the public HTTPS origin before building so
canonical links and the sitemap use the correct hostname. Authenticate with your own
Cloudflare account, then build and deploy:

```sh
npm run build
npm run deploy
```

The Knowledge Explorer has been removed from the public navigation, routes, sitemap, and
active Worker. Its source is retained for a future separate app; see
`experiments/knowledge-explorer/README.md`. Old lab URLs resolve to 404.

## Verification

Complete implementation and test-writing first, then delegate all checks to the verifier:

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
