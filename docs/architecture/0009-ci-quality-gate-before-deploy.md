# 0009. One workflow: quality is a precondition for deployment

## Status

Accepted. In effect.

## Context

Deployment happens automatically from `main` (ADR 0003) and there are no reviewers — this
is a personal project. That makes CI the only place where a bad commit can be stopped.
Splitting "checks" and "deploy" into two workflows would mean the site could publish
before the tests failed.

## Decision

A single workflow, `.github/workflows/deploy.yml`, triggered by pushes to `main` and by
`workflow_dispatch`. The `build` job runs these steps in strict order; if any of them
fails, nothing is deployed:

1. `npm ci` (Node 20, npm cache)
2. `npm run format:check` — Prettier
3. `npm run lint` — ESLint (`angular-eslint`, including `templateAccessibility`)
4. `npm run test:unit` — Vitest
5. `npx playwright install --with-deps chromium`
6. `npm run test:e2e` — Playwright (the report is uploaded as an artifact only on failure,
   retained for 7 days)
7. `npm run build:gh`
8. copy `index.html` → `404.html` (SPA fallback, ADR 0003)
9. `upload-pages-artifact`

The `deploy` job depends on `build` and publishes the artifact via
`actions/deploy-pages`. Permissions are minimal (`contents: read`, `pages: write`,
`id-token: write`), and `concurrency: pages` with `cancel-in-progress` prevents
overlapping deployments.

Formatting and linting are pushed into config files (`.prettierrc.json`: double quotes,
`printWidth: 100`, `trailingComma: all`, the `angular` parser for component templates;
`eslint.config.js`: flat config with selector-prefix rules).

## Consequences

- Code that is unformatted, fails linting or breaks tests never reaches production.
- Step order follows cost: cheap checks before expensive ones, and the browser is
  installed only once the code has already passed linting and unit tests.
- A full run includes installing the Playwright browser, so deployment is not fast; for a
  one-character typo fix that is noticeable.
- The same set of commands is reproducible locally — there is no special "CI mode".
- Branches other than `main` are not checked at all: the workflow runs neither on pull
  requests nor on pushes to other branches. A mistake only becomes visible after merging
  into `main`.
- `public/` and `src/images` are excluded from Prettier (`.prettierignore`) — they hold
  binaries.
