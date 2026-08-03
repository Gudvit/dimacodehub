# 0001. Angular 21 with standalone components and signals

## Status

Accepted. In effect.

## Context

A portfolio site maintained by a single developer: a few mostly static pages, a bit of
interaction (slider, timeline, mobile menu), no server. The stack had to be one the
author is productive in (10+ years of Angular, per the site itself) and one that requires
no infrastructure to keep running.

Within Angular itself there was a choice between the "classic" style (NgModule,
constructor DI, `@Input`/`@Output`, RxJS for component state) and the Angular 21 style
(standalone, `inject()`, `input()`/`output()`, signals).

## Decision

Angular 21 in the modern style, without a single NgModule:

- Bootstrapped with `bootstrapApplication(App, appConfig)` in `src/main.ts`.
- Component dependencies are declared in the component's own `imports`.
- DI through `inject()`, inputs/outputs through `input()` / `output()`.
- Component state through `signal()` / `computed()`.
- Template control flow through `@if` / `@for` / `@switch`.
- `ChangeDetectionStrategy.OnPush` on every component.
- TypeScript `strict` plus `strictTemplates`, `noPropertyAccessFromIndexSignature`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`.

The convention is written down in the root `CLAUDE.md` and partly enforced by ESLint
(`angular-eslint` + `typescript-eslint`, including the stylistic set).

## Consequences

- The dependency graph is visible in the component itself rather than hidden in module
  declarations.
- Lazy loading is possible per route without a wrapper module (see ADR 0004).
- Signals are a precondition for going zoneless (ADR 0002): without them the zoneless
  mode simply would not repaint the UI.
- RxJS stays, but in a residual role: only `Router.events` and `route.fragment`, both
  through `takeUntilDestroyed()`. That is why `rxjs` cannot be dropped from dependencies.
- The downside: the code is tied to a recent Angular. Downgrading, or backporting pieces
  into an Angular ≤ 15 project, means rewriting rather than copying.
- `strictTemplates` + `noPropertyAccessFromIndexSignature` occasionally force more verbose
  code (`params['slug']`, non-null assertions in specs) — accepted deliberately.
