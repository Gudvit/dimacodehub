# 0006. State is local signals only, with no global store

## Status

Accepted. In effect.

## Context

The author writes at length in the blog about NgRx and about where a store is justified
and where it is not. His own criterion: the store is for state that crosses feature
boundaries or has to survive navigation.

This application has none of that. All state is local UI state: whether the mobile menu
is open, which role is active in the timeline, whether the about heading has been
revealed, whether route animations are enabled. The data (posts, roles) is immutable and
synchronously available (ADR 0005).

## Decision

No store: no NgRx, no NGXS, no signal-based state services.

- State lives in the component that owns it: `menuOpen` in `HeaderComponent`,
  `activeIndex` / `panelKey` in the experience section, `aboutHeadlineVisible` in the
  about section, `routeAnimationsEnabled` in `App`.
- Derived values are `computed()` (`activeRole`, `post`, `words`).
- Shared data access is a plain root service with no internal state (`BlogService`).
- Home sections do not hold state that belongs elsewhere; they report intent upward
  through `output()`, and `HomePageComponent` coordinates.

Fields that take no part in rendering (gesture accumulators, touch coordinates, the
`IntersectionObserver` reference) are deliberately left as plain fields — making them
signals would only cause extra repaints.

## Consequences

- There is not a single layer of indirection between a user action and a UI change: the
  code reads top to bottom in one file.
- Zero extra dependencies and zero actions/reducers/effects boilerplate.
- The flip side: state does not survive navigation. Leave the blog page and come back and
  the scroll position and active role are reset. Fine for a portfolio.
- There is no DevTools timeline of state changes; debugging is plain breakpoints.
- If cross-cutting state ever appears (theme, language, auth), start with a signal-based
  root service rather than jumping straight to NgRx — nothing here would justify a store.
