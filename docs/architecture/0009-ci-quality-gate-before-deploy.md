# 0009. One workflow: quality is a precondition for deployment

## Status

Accepted. In effect.

## Context

Deployment happens automatically from `main` (ADR 0003) and there are no reviewers — this
is a personal project. That makes CI the only place where a bad commit can be stopped.
Splitting "checks" and "deploy" into two workflows would mean the site could publish
before the tests failed.

## Decision

A single workflow, `.github/workflows/deploy.yml`, triggered by a push to **any** branch
and by `workflow_dispatch`. The `build` job runs these steps in strict order; if any of
them fails, nothing is deployed:

1. `npm ci` (Node 24, npm cache)
2. `npm audit --omit=dev --audit-level=moderate` — production dependencies only: a
   dev-tool advisory must not block a deploy of code that never ships it
3. `npm run format:check` — Prettier
4. `npm run lint` — ESLint (`angular-eslint`, including `templateAccessibility`)
5. `npm run test:unit` — Vitest
6. `npx playwright install --with-deps chromium`
7. `npm run test:e2e` — Playwright (the report is uploaded as an artifact only on failure,
   retained for 7 days)
8. `npm run build:gh`
9. copy `index.html` → `404.html` (SPA fallback, ADR 0003)
10. `upload-pages-artifact`

Steps 1-9 run for every branch. Step 10 and the whole `deploy` job are conditional on
`github.ref == 'refs/heads/main'`: a feature branch gets the verdict, never the
deployment. The workflow does not also listen to `pull_request` — a PR branch here lives
in the same repository, so its push already triggers a run, and a second trigger would
only duplicate it.

The `deploy` job depends on `build` and publishes the artifact via
`actions/deploy-pages`. Permissions are minimal and scoped per job: the workflow grants
`contents: read`, and only `deploy` adds `pages: write` and `id-token: write`. Concurrency
is per ref (`${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress`) so branches
do not cancel each other, while the `deploy` job keeps its own `pages` group — GitHub
Pages accepts one deployment at a time.

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
- A branch is checked before it is merged, so a mistake no longer surfaces first in
  production. The price is one full run — Playwright browser included — per push to any
  branch.
- A push from a fork would not be gated, since the workflow keys off branch pushes in this
  repository. Not a concern for a personal project with no outside contributors.
- `public/` and `src/images` are excluded from Prettier (`.prettierignore`) — they hold
  binaries.
- Actions are pinned by commit SHA with the version in a trailing comment, so a moved tag
  cannot change what runs. Dependabot (`.github/dependabot.yml`) moves both those pins and
  the npm dependencies; without it the audit step would eventually start failing on its
  own, which is how the Angular patch level drifted in the first place.
