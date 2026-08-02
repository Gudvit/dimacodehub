# 0014. Accessibility comes from markup and is checked automatically

## Status

Accepted. In effect.

## Context

The design is built on non-standard elements: link cards, a burger menu, a role switcher
driven by swipes, decorative SVGs, a textless "back to top" button. Each of them is easy
to make unreachable by keyboard and invisible to a screen reader, and you cannot verify
that by looking — only a user notices the regression.

A concrete case that already happened: the post card was an `<article>` with
`[routerLink]`. It worked with a mouse but not with a keyboard: the element was not in the
tab order and had no link role.

## Decision

Accessibility is solved through markup rather than ARIA layered on top, and is pinned down
by two automated checks.

Markup rules (also mirrored in `CLAUDE.md`):

- A clickable element is an `<a>` or a `<button>`. The post card stayed an `<article>`,
  but the real link sits on the heading (`.post-card__link`) and is stretched across the
  whole card via `::after`; the card's hover/focus state is lifted through
  `&:has(.post-card__link:focus-visible)`.
- Where that is impossible, a `role`, `tabindex="0"` and keyboard handlers are mandatory.
- The burger menu is a `<button>` with `aria-label="Toggle navigation menu"`,
  `aria-controls` pointing at the nav `id`, and `[attr.aria-expanded]` bound to the
  `menuOpen()` signal.
- Textless buttons (`back-to-top`) and all external icon links get an `aria-label`; the
  icon SVGs themselves are marked `aria-hidden="true"`.
- Decorative glyphs (`→`, `←`, `·`, the duplicated name in the header) are `aria-hidden`.
- External links: `target="_blank"` only together with `rel="noopener noreferrer"`.
- Animations respect `prefers-reduced-motion`.

Checks:

- ESLint with the `angular.configs.templateAccessibility` set over every `*.html`
  (the `lint` step in CI, ADR 0009).
- The e2e test "blog cards are reachable with the keyboard": focus the link, press
  `Enter`, assert the URL. The test "mobile menu toggles open and closed" asserts
  `aria-expanded` in both states. Every locator in e2e is role-based (`getByRole`), so
  broken semantics fail the tests on their own.

## Consequences

- Keyboard navigation through the blog and the menu is protected against regressions
  rather than checked by hand.
- Using `getByRole` in e2e makes the tests double as semantics checks — a cheap two-for-one.
- The linter only catches static template violations: a missing `alt`, a click handler
  without a keyboard equivalent. Contrast, focus order and screen-reader behaviour are
  outside its reach, and nothing in the project tests them.
- The experience section is driven by swipes and the wheel; a keyboard alternative does
  exist — the timeline items and mobile navigation dots are real `<button>` elements with
  `aria-label` and `aria-current` — but e2e do not cover it.
- Stretching the link across the card with `::after` means text inside the card cannot be
  selected with the mouse — a deliberate trade for having exactly one link per card.
