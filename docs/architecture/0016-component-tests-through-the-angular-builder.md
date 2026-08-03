# 0016. Unit tests run through the Angular builder, so components can be tested

## Status

Accepted. Supersedes [0008](0008-vitest-and-playwright.md) in part: the two-tier split
stands, but the rule "no `TestBed`, anything compiled belongs in Playwright" does not.

## Context

ADR 0008 pointed at its own weakest spot: the gesture handling in the experience section —
a wheel accumulator, a cooldown, an "exit budget" at the edges, swipe-intent detection —
was covered by nothing. Playwright emulates neither a trackpad nor a two-finger swipe, and
the unit tier could not touch the component because `npm run test:unit` was plain
`vitest run` with no Angular compiler. The densest logic in the project was also the only
logic no test could reach.

The same ADR recorded a second irritation: `angular.json` already declared a `test` target
with `@angular/build:unit-test`, while the npm script called Vitest directly. Two ways to
run the tests, one of them dead.

Angular 21's `@angular/build:unit-test` builder resolves both at once. It builds the specs
with the Angular compiler, runs them on Vitest in a Node + jsdom environment (no browser
download), and initialises `TestBed` before the setup files.

## Decision

`npm run test:unit` is `ng test`. The builder is configured in `angular.json` with
`tsConfig: tsconfig.spec.json` and `setupFiles: [src/vitest.setup.ts]`; everything else
stays at its default — jsdom, `**/*.spec.ts`, Vitest as the runner. `vitest.config.ts` is
deleted: the builder does not read it unless asked to, and keeping a second source of
truth was the confusion this ADR removes.

Component tests are now allowed, and the tests that were missing exist:

- `home-experience-section.component.spec.ts` drives the gestures directly — the wheel
  budget, the cooldown (`performance.now` stubbed), the edge exit at the first and last
  role, direction reversal, a horizontal wheel that must be ignored, swipes below and
  above the threshold, a vertical swipe that must not switch roles, and a cancelled touch.
- `header.component.spec.ts` is the rendering case: the menu opens, closes, and closes
  again when a link is followed. It runs under `provideZonelessChangeDetection()`, so it
  fails the same way production would if state stopped being a signal.
- `contact-form.service.spec.ts` gained the transport edge cases: a dropped connection, a
  body that is not JSON, an abort surfacing as `AbortError`, and the caller's signal
  reaching `fetch` through `AbortSignal.any`.

`src/vitest.setup.ts` grew a second jsdom polyfill, `Element.prototype.scrollIntoView`,
next to the existing `matchMedia` one.

Playwright is reorganised in the same pass: the single `home.spec.ts` becomes `home`,
`blog`, `contact` and `mobile`; the config gains `retries: 2` in CI, `trace: on-first-retry`
and two projects — `desktop` (Desktop Chrome, ignores `mobile.spec.ts`) and `mobile`
(Pixel 5, only that file). Nothing runs twice.

## Consequences

- The least-tested code in the project is now the best-tested: 28 unit tests, of which 16
  are the gestures.
- One entry point. `ng test` is what CI runs, what the npm script runs, and what the
  `angular.json` target describes.
- A run now includes an Angular build of the specs — about three seconds. That is the
  price of the compiler, and it buys `TestBed`.
- Component tests make it tempting to duplicate what e2e already prove. The boundary
  stays: e2e own user-facing flows and anything involving real layout or scrolling, unit
  tests own logic and rendering that can be asserted without a viewport.
- Still one browser engine. The `mobile` project is a viewport, not a Safari — the
  rendering differences ADR 0008 listed (`mix-blend-mode`, `scroll-snap-stop`,
  `overflow: clip`) remain unchecked.
- `tsconfig.spec.json` now also includes `src/vitest.setup.ts`, otherwise the builder warns
  that the file is bundled without being type-checked.
