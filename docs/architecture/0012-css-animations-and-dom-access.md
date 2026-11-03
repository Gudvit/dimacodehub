# 0012. CSS animations and direct DOM access instead of Angular abstractions

## Status

Accepted. In effect. Route transitions were moved from `animate.enter` / `animate.leave` to
the View Transitions API on 2026-10-30 (roadmap 2.4); the decision below describes the
current state.

## Context

The interface has a lot of motion: route transitions, per-letter text reveals, the about
heading revealing on scroll into view, the cursor spotlight, smooth scrolling between
sections, the timeline panel swap.

There were three tools available: the `@angular/animations` package (declarative triggers
in TypeScript), CSS animations plus the new Angular 21 template attributes
`animate.enter` / `animate.leave`, or manual class toggling.

A separate question is how to touch the DOM at all in a zoneless app (ADR 0002): container
scrolling, measuring the header height, `IntersectionObserver`, global listeners.

## Decision

**Animations are CSS.** `@angular/animations` is imported nowhere, and since the cleanup
that followed the 2026-08-03 review it is no longer a dependency either.

- Route changes go through the browser's View Transitions API, switched on by
  `withViewTransitions({ skipInitialTransition: true })` in `app.config.ts`. The browser
  snapshots the old page, the router renders the new one, and the `::view-transition-*`
  rules in `styles.scss` animate between the two: the old page fades out, the new one fades
  in with a short lift. The first navigation (the prerendered page arriving, ADR 0019) is
  not animated.
- Elements that should not move with the page get their own `view-transition-name`: the
  header (`site-header`) stays in place, and a post card's title on the blog list or the
  home page shares `post-<slug>` with the post's `<h1>`, so the browser morphs the card
  title into the heading and back. A name must be unique on a page — that is why it carries
  the slug.
- Why not the old `animate.enter` / `animate.leave` slide: it kept both pages in the DOM
  for the length of the animation, needed a wrapper with `overflow: hidden` on every page
  and an "is this the first navigation?" signal in `App`, and could not connect an element
  on one page to an element on the next. Browsers without the API just swap the page.
- Per-letter text animation: `AnimatedTextComponent` splits the string into words and
  letters and passes the index to the template; CSS computes each letter's delay.
- The panel swap in the experience section is replayed manually: a `panelKey` counter is
  incremented on every switch, and the template flips `[style.animationName]` between two
  identical keyframes, `panel-enter-a` / `panel-enter-b`, based on its parity. Changing the
  animation name is the way to replay it on the same node.
- The cursor spotlight is a CSS gradient on `body::before`, positioned through CSS variables.

**DOM access is direct, but scoped to the lifecycle.**

- Elements are reached through `viewChild()` + `ElementRef`.
- Every DOM access happens inside `afterNextRender()`.
- Manual listeners and observers are torn down in `DestroyRef.onDestroy()`.
- High-frequency events are coalesced with `requestAnimationFrame` (`trackCursor` in `app.ts`).
- The `IntersectionObserver` in the about section is given `root: .home-slider`, because
  the container scrolls, not the viewport.
- `Renderer2` is used nowhere: the one directive that needed it, `LoadingDirective`, was
  replaced by the `app-loader` component, which draws its SVG from a template.

## Consequences

- Animations run in the browser's compositor and do not depend on change detection —
  which is what makes zoneless mode practical.
- Zero kilobytes of animation runtime, and one dependency fewer.
- The price: animations are not orchestrated from TypeScript. Sequences, interruptions and
  "on complete" callbacks would have to be built by hand; duplicating the keyframes for
  `panelKey` is precisely a workaround for the missing imperative "replay this animation".
- `prefers-reduced-motion` is honoured pointwise (the early return in the about section,
  the `animation: none` for every `::view-transition-*` pseudo-element) rather than by a
  global rule — easy to forget when adding an animation.
- Direct DOM access (`document.querySelector(".site-header")`, looking up
  `.slide-section` and `[data-index]`) couples TypeScript to class names in templates and
  SCSS. Renaming a class breaks the logic silently; the compiler will not say a word.
  This is the most fragile part of the codebase.
