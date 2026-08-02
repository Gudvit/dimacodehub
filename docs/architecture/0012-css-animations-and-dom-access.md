# 0012. CSS animations and direct DOM access instead of Angular abstractions

## Status

Accepted. In effect.

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

- The route-transition keyframes (`route-enter`, `route-leave`) are declared in the global
  `styles.scss` and applied through the template attributes
  `animate.enter="route-enter"` / `animate.leave="route-leave"` on each page's root
  `.route-shell`.
- The first navigation is not animated: `App` skips the first `NavigationEnd` and only
  then sets `routeAnimationsEnabled`, while the CSS rule
  `.route-container:not(.route-enabled) .route-enter { animation-name: none }`
  suppresses the animation until that point.
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
- `prefers-reduced-motion` is honoured pointwise (the early return in the about section)
  rather than by a global rule — easy to forget when adding an animation.
- Direct DOM access (`document.querySelector(".site-header")`, looking up
  `.slide-section` and `[data-index]`) couples TypeScript to class names in templates and
  SCSS. Renaming a class breaks the logic silently; the compiler will not say a word.
  This is the most fragile part of the codebase.
