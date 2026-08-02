# 0002. Zoneless change detection

## Status

Accepted. In effect.

## Context

The home page attaches a `mousemove` listener to the whole document (the cursor
spotlight), the experience section handles `wheel` and `touchmove`, and the slider
handles scrolling. With zone.js every one of those events schedules a full check of the
entire component tree, even though the overwhelming majority of them change nothing that
appears in a template.

On top of that, zone.js is roughly 30 KB of polyfill in the bundle and patches global
APIs in a way that muddles stack traces.

## Decision

`provideZonelessChangeDetection()` in `src/app/app.config.ts`; zone.js is not wired in,
neither through `polyfills` nor through `angular.json`. Change detection runs only on
signal changes, `AsyncPipe`, template events and explicit `markForCheck` calls.

Practical rules that follow from the decision (also mirrored in `CLAUDE.md`):

- Any state that reaches a template must be a signal.
- High-frequency listeners are attached by hand inside `afterNextRender()` via
  `addEventListener` rather than `@HostListener`, and coalesced with
  `requestAnimationFrame` (see `trackCursor()` in `app.ts` for the pattern).
- DOM work happens only after the first render; cleanup goes through
  `DestroyRef.onDestroy()`.

## Consequences

- `mousemove` never touches change detection at all: the handler writes the
  `--cursor-x` / `--cursor-y` CSS variables on `documentElement` and CSS does the rest.
- Smaller bundle, cleaner stack traces.
- The price is a class of bugs where "the field changed but the screen did not". Those
  are not caught by types and only show up at runtime, which is why e2e deliberately
  cover state-dependent flows (mobile menu, role switching) — see ADR 0008.
- Component unit tests would have to be written with manual `detectChanges` in mind;
  as it stands there are no component tests at all (ADR 0008).
- Any third-party library that relies on zone.js will not drop into this project without
  a wrapper.
