# 0021. Lighthouse budgets in CI

## Status

Accepted. In effect. Extends [0009](0009-ci-quality-gate-before-deploy.md). Amended: the
test server gzips like GitHub Pages, and the performance budget went from 80 to 90.

## Context

The site claims to be fast and accessible, and the colophon page says so in public. Nothing
checked it: a heavy dependency, an unlabelled button or a console error would reach
production unnoticed, and the Angular bundle budgets only catch the first.

The usual tool, `@lhci/cli`, pins an old Lighthouse and puppeteer and brings a dozen
high-severity advisories into `npm audit` — on a repository whose audit was clean. It also
serves the build from `/`, while this build only works under `/dimacodehub/`.

## Decision

- **`scripts/lighthouse.ts` on `lighthouse` itself.** It serves the built site under its
  `<base href>` the way GitHub Pages does (a directory answers with its `index.html`,
  anything else with `404.html`; text gzipped, as Pages sends it), starts Playwright's Chromium — CI already installs it for
  the e2e tests — and audits one page of each kind: home, blog, a post, the colophon. Mobile
  settings, simulated throttling, one run per page.
- **Budgets per category, in the script.** Accessibility, best practices and SEO must be
  100 on every page: those audits are deterministic, so anything less is a defect, not
  noise. Performance must be at least 90; it measures 95–100 locally, and a CI runner is
  slower.
- **The log says why.** Every audit that costs points is printed under its page, so a red
  build names the problem without a report to download.
- **The scores are published.** The home page's scores are added to `build-stats.json`,
  and the colophon page shows them next to the bundle sizes.
- **CI step "Lighthouse budgets"** runs after the build checks and before the upload; a
  page under budget stops the deployment like any other gate.

Getting to 100 took four fixes the audit found: the CSP's `frame-ancestors` (ignored in a
meta tag, logged as an error) was removed; the home page got its `<main>` landmark; the
experience section's mobile dots became 24px touch targets; the theme script was inlined
under a CSP hash (ADR 0020). The colophon's numbers were given a fixed grid, which removed
a layout shift.

## Consequences

- About 40 seconds more per CI run, and two dev dependencies (`lighthouse`,
  `chrome-launcher`).
- Lighthouse scores move with Lighthouse versions; a dependency update can turn the build
  red with no change to the site. That is the moment to look, not to lower a budget.
- The first version served the build uncompressed. On Lighthouse's simulated mobile
  network the JavaScript then weighed four times what a visitor downloads, and the
  simulation pushed Largest Contentful Paint to 4–4.5 s: performance read 83–88, and the
  entrance animations from `opacity: 0` looked like the cause. They were not. Measured with
  gzip, the same build scores 95–98 with the animations unchanged — rebuilding the hero
  entrance without `opacity` moved nothing outside the noise. The server gzips now, and the
  budget went up to 90. The lesson is in the comment above `COMPRESSED`: measure what the
  host serves.
