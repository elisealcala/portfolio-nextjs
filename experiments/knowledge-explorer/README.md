# Parked Knowledge Explorer

The portfolio no longer serves the lab, its project case study, or an AI API. These page
sources are kept here as reference for a future separate application; this directory is
not yet a runnable app.

The existing `src/components/explorer.tsx`, `src/components/turnstile.tsx`, agent/store
modules in `worker/`, `migrations/`, `evals/`, and evaluation/content scripts are also
retained but are not imported by the portfolio Worker entry point. They must be extracted
and configured in their own project before another deployment. No separate deployment has
been created.

`previous-setup.md` and `wrangler.previous.jsonc` are historical snapshots, not the active
portfolio configuration. Their paths and commands need adjustment during extraction. The
active `wrangler.jsonc` runs `worker/portfolio.ts`, has no D1 binding, and rejects all
`/api` requests without contacting a model or database.
