# 0008. Testing: Vitest for logic, Playwright for behaviour

## Status

Accepted. In effect.

## Context

There is barely any business logic in the project: the only pure logic is content access
(`BlogService`) and splitting a string into letters (`AnimatedTextComponent`). What there
is plenty of is behaviour that only exists in a real browser: the scroll slider, snapping,
swipes, wheel handling, `IntersectionObserver`, the mobile menu, route animations,
`<title>` and meta tags.

On top of that, zoneless mode (ADR 0002) adds a class of "state changed, screen did not"
bugs that are only visible with a real render.

Angular's default Karma + Jasmine would, against that background, give a slow run of
browser-based unit tests exactly where such tests are least useful.

## Decision

A two-tier setup.

- **Vitest 4** (`vitest.config.ts`, jsdom environment, `globals: true`,
  `include: src/**/*.spec.ts`, setup file `src/vitest.setup.ts` with a `matchMedia`
  polyfill). Only things that need no rendering are tested: currently
  `blog.service.spec.ts`, instantiated with a plain `new BlogService()` — no `TestBed`.
- **Playwright** (`playwright.config.ts`, `testDir: ./e2e`, `fullyParallel`, a `webServer`
  block that starts `npm start` on `127.0.0.1:4200` and reuses an already running server
  locally). It covers user-facing flows: the hero and its CTAs, the relative CV link,
  navigation with `<title>` assertions, keyboard reachability of blog cards, a deep link
  to a post with an OG-tag assertion, "Post not found", the mobile menu, the `mailto` CTA
  and the absence of a fake form.
- Both suites must be green before deployment (ADR 0009).

## Consequences

- Unit tests start instantly and need no browser; e2e catch exactly what actually breaks
  in this project — DOM behaviour and zoneless regressions.
- `blog.service.spec.ts` effectively acts as a content validator: adding a malformed post
  fails CI (ADR 0005).
- The gap: there are no component tests at all. The gesture logic in the experience
  section (thresholds, cooldowns, the "exit budget") is covered by nothing — e2e do not
  exercise it and there are no unit tests for it. It is the least tested code in the project.
- Vitest is configured in its own file even though `angular.json` declares a `test` target
  with the `@angular/build:unit-test` builder; in practice `vitest run` is invoked
  directly through an npm script. Two ways to run tests is a source of confusion.
- Playwright needs a downloaded chromium; locally that is a separate step
  (`npx playwright install chromium`), and in CI it is a workflow step.
- There is one browser in the matrix (chromium by default, no `projects` section) — Safari
  and Firefox are never checked, even though some effects (`mix-blend-mode`,
  `scroll-snap-stop`, `overflow: clip`) behave differently there.
