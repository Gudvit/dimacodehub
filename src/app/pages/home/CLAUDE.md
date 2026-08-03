# pages/home — the home page

The most involved subsystem in the project: not a regular scrolling page but a vertical
slider with hand-rolled scroll and gesture handling. The gestures of the experience
section are covered by unit tests
(`home-experience-section.component.spec.ts` — thresholds, cooldown, edge exit, swipe
intent); everything that depends on real scrolling is covered by e2e only, so change
scroll behaviour carefully.

## Layout

```
home-page.component.*                     slider container, owns #homeSlider
components/home-hero-section/             first screen, header lives inside it
components/home-about-section/            "about", revealed by IntersectionObserver
components/home-experience-section/       role timeline: clicks, swipes, wheel
components/home-contact-section/          contacts + working message form + footer
```

The sections are dumb components: they know nothing about scrolling and talk to the
container through `output()` (`scrollNext`, `scrollToContacts`, `backToTop`). All slider
navigation lives in `HomePageComponent`. Do not move scroll logic into the sections.

## The scroll container

What scrolls is **`.home-slider`, not `window`** (`overflow-y: auto` + `scroll-snap` in
`home-page.component.scss`). Consequences that are easy to trip over:

- `window.scrollTo` / document-level `scrollIntoView` do not work here — you need
  `slider.scrollTo({ top })`.
- The offset is computed by hand: `target.offsetTop - getHeaderOffset()`, where
  `getHeaderOffset()` measures the real height of `.site-header` from the DOM. The header
  is `position: fixed` above the slider, so without subtracting it the section heading
  ends up underneath.
- The `IntersectionObserver` in the about section is given `root: .home-slider`. With
  `root: null` (the viewport) it would never fire — as far as the document is concerned,
  the section is always visible.

The sections `scrollToNextSection()` walks through are found by the `.slide-section`
class. A new section without that class will be skipped by the "down" arrow — and will
not snap, because that class is also what carries `scroll-snap-align`.

Those snap rules are **global** (`src/styles.scss`), not part of
`home-page.component.scss`. They have to be: the class sits in the section components'
templates, and under emulated encapsulation the home page's own styles never reach it.
Height and layout stay with each section — the experience panel sizes itself in `dvh`,
the hero is a grid — so do not pull those into the global rule.

`scroll-snap-type: y mandatory` is desktop-only: at `max-width: 768px` snapping,
`scroll-snap-align` and `overscroll-behavior: contain` are all turned off, otherwise
sections stick on mobile and the page becomes impossible to scroll properly.

## Fragment deep links

`/#contacts` is handled in `HomePageComponent`: a subscription to `route.fragment` inside
`afterNextRender()` (the slider is not in the DOM before the first render) and a scroll
with `behavior: "auto"`. The anchor is an `id` on the section element (`id="contacts"`).
Angular's `withInMemoryScrolling`/`anchorScrolling` is useless here for the same reason
`window.scrollTo` is.

## The experience section

One component implements three ways to switch the active role. All thresholds are private
constants at the top of the class — change those rather than hardcoding numbers inline:

- **Click** on a timeline item (desktop) or on a dot in `experience-mobile-nav` (mobile)
  → `setActive(i)`. This is the only keyboard-reachable entry point: both are real
  `<button>` elements.
- **Touch swipe**: horizontal intent is decided by `|dx| > |dy|`, with a
  `swipeThresholdPx = 40` threshold. Without that check vertical page scrolling would
  switch roles.
- **Wheel (desktop only, `> 980px`)**: a `wheelThresholdPx = 84` accumulator plus a
  `wheelCooldownMs = 360` cooldown, with `preventDefault()` on every event inside the
  section. On the first and last role an "exit budget" of `edgeExitThresholdPx = 170`
  applies: until it is spent, the wheel is not handed over to the outer scroll. Without
  it, one trackpad flick would skip past the whole section.

`prevRole()` / `nextRole()` (which wrap around) are not bound in the template — only the
swipe handlers call them.

`setActive()` increments `panelKey`, and the template flips `[style.animationName]`
between two identical keyframes, `panel-enter-a` / `panel-enter-b`, based on its parity.
That is the trick: changing the animation name makes the browser replay it on the same
node. Collapse it to one name and the role-change animation stops working.

`setActive()` also pulls the active timeline item into view
(`scrollIntoView({ block: "nearest" })`) — on desktop only.

Role data (`roles`) is hardcoded in the component. That is deliberate — see
`docs/architecture/0005-content-in-code.md`.

## Things to keep in mind when editing

- Anything visible in a template must be a signal: the app is zoneless, a plain field
  will not repaint.
- Do not attach high-frequency listeners with `@HostListener` (see the root CLAUDE.md).
- The about-heading animation must respect `prefers-reduced-motion` — the early return is
  already there; repeat it in any new animation.
- The contact section has a real form that posts to Web3Forms (`contact-form.service.ts`,
  ADR 0015). The success state may only be shown after the send is confirmed — the e2e
  test `contact form admits failure instead of claiming a message was sent` is there to
  keep it that way. The `mailto` link stays as the fallback.
- The form is the only place in the home page that uses reactive forms. `status` is a
  signal; the request is cancelled through an `AbortController` in `DestroyRef.onDestroy`.
