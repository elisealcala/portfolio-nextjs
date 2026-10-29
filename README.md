# Elizabeth Alcalá · Portfolio

A personal portfolio for selected engineering projects, professional experience, working
ideas, and archived articles. It is built with Next.js, React, TypeScript, and Tailwind
CSS, and exported as a static site for Cloudflare Workers.

## Explore the site

- **Projects** features [OCC Sandbox](https://occ-sandbox.ezth.workers.dev/), an
  interactive demonstration of optimistic concurrency control. The sandbox is a separate
  application; the portfolio links to it in a new tab.
- **Experience** presents selected roles and earlier work.
- **Notes** contains engineering ideas, and **Archive** preserves the original articles.
- **About** introduces Elizabeth and her work.

The site supports light and dark themes and uses locally hosted fonts. See
[the design system](docs/design-system.md) for its visual and accessibility patterns.

## Local development

Use Node.js 22.13 or newer and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js (normally http://localhost:3000). To build the
static export and preview it through the configured Worker:

```sh
npm run build
npm run preview
```

The Worker preview normally runs at http://localhost:8787. It serves the files in `out/`
and returns 404 for `/api` routes; it needs no database or AI credentials.

If Turbopack cannot start its local build helper because the environment blocks local
ports, use `npm run build -- --webpack` for the same static export.

## Content and structure

- `src/app/(general)/` contains the public pages, including `/projects` and `/experience`.
  The homepage and Projects page share `src/components/project-showcase.tsx`.
- `src/lib/experience.ts` contains a manually reviewed experience snapshot; it is not a
  live LinkedIn integration. Consulting employers and clients are identified separately.
- `content/notes/` contains public working ideas. Preserve `publishedAt` when editing and
  set `updatedAt` to the public revision date. Cards show the latest date, article headers
  distinguish publication and revision, and notes sort by their latest date.
- `outstatic/content/posts/` contains the archived articles and preserves their original
  URLs and dates. Outstatic is no longer used as a CMS.
- Content frontmatter is validated in `src/lib/content.ts`; draft articles stay off public
  pages, and filenames must match their slugs. Builds do not read the Obsidian vault. Use
  generic public examples and avoid private information or unverified outcomes.
- `src/app/globals.css` defines the shared visual system; fonts are in `public/fonts/`.

The former Knowledge Explorer is parked for a possible separate application and is not
part of the public portfolio. See [its README](experiments/knowledge-explorer/README.md)
for the retained source and its status.

## Checks

Run these before deployment:

```sh
npm run build
npm run typecheck
npm run lint
npm test
npx wrangler deploy --dry-run --outdir .generated/worker
```

Also check the homepage and Projects page, the external sandbox link, desktop and mobile
layouts, keyboard navigation, both themes, a note, an archived article, and an unknown
route. The tests for the parked Explorer remain as regression coverage and do not enable
it on the portfolio.

## Deploy to Cloudflare

`next.config.js` exports the site to `out/`. `wrangler.jsonc` configures the
`my-portfolio` Worker, using `worker/portfolio.ts` to serve static assets and reject API
requests. The configured workers.dev address is
[my-portfolio.ezth.workers.dev](https://my-portfolio.ezth.workers.dev).

1. Authenticate with `npx wrangler login` and confirm the account with
   `npx wrangler whoami`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the public HTTPS
   origin without a trailing slash. The value is embedded in canonical URLs, `robots.txt`,
   and the sitemap at build time. Keep `.env.local` out of Git.
3. Run the checks above, then deploy the built export:

   ```sh
   npm run deploy
   ```

4. Check the URL printed by Wrangler, including `/projects`, `/sitemap.xml`, an unknown
   route, and `/api/status` (which should return 404). If the public hostname differs
   from `NEXT_PUBLIC_SITE_URL`, update the value, rebuild, and deploy again.
