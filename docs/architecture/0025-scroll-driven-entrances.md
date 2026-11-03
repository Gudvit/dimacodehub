# 0025. Scroll-driven entrances

## Status

Accepted. In effect. Extends [0012](0012-css-animations-and-dom-access.md).

## Context

The home page is a slider of full-screen slides, but only the hero had an entrance. The
about section's metrics did have one — on a timer that started at page load, while the
section was still a screen below, so nobody ever saw it. The usual fix, an
`IntersectionObserver` per element that adds a class, is a listener and a signal per
element in a zoneless app, for something the browser can now do on its own.

## Decision

- **CSS scroll-driven animations.** Content rises into place (`reveal-rise`: opacity and a
  32px translate) as it scrolls into view, with its progress tied to the scroll position:
  it plays when seen, plays backwards when scrolled away, and needs no script. The mixins
  live in `src/styles/_motion.scss`; the keyframes are global in `styles.scss`.
- **A home slide is its own timeline.** Every `.slide-section` declares
  `view-timeline-name: --slide`, and `motion.slide-reveal($order)` animates its parts
  along it, staggered by `$order` — title first, then copy, then cards. A plain `view()`
  would not work there: the sections clip their overflow, which makes each one a scroll
  container, and `view()` follows the nearest one.
- **Document pages use `view()`** (`motion.view-reveal`), on the colophon's sections.
- **Above the fold is never hidden.** Content in view at load is already at the end of its
  range, so `/#contacts` or the top of the colophon appear complete — no Largest
  Contentful Paint waiting on an animation. The hero and the blog keep their page-load
  entrances; whether to change those is the open LCP question from ADR 0021.
- **No support, no motion.** Browsers without scroll-driven animations (Firefox, at the
  time of writing) and `prefers-reduced-motion: reduce` get the content without animation —
  both conditions are inside the mixin, so no call site can forget them.

## Consequences

- The about section's timed `metric-rise` is gone; the metrics now rise in as the slide
  arrives.
- An element that already has an animation (the experience panel's role switch) must not
  get a reveal too — one would replace the other. Reveal its wrapper instead, as
  `.experience-layout` does.
