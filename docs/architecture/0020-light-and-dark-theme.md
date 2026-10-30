# 0020. A light and a dark theme from one set of tokens

## Status

Accepted. In effect. Extends [0007](0007-scss-no-ui-framework.md).

## Context

The site had one, light, palette. A visitor whose system is dark got a bright page, and
there was no way to switch. The colours were not ready for a second theme: translucent
shades came from `brand.ink($alpha)` / `brand.wine($alpha)`, which compiled to fixed
`rgba()` values, and about sixty literal whites were spread over the component styles.

Two constraints shape the solution. Every page is prerendered (ADR 0019), so the HTML
cannot know the visitor's theme. And the CSP allows no inline script, so the usual
"set the theme in a `<script>` in `<head>`" trick is not available as written.

## Decision

- **One set of roles, two sets of values.** `_brand.scss` holds the palette for both
  themes; `styles.scss` writes it into the `--brand-*` custom properties — ink, wine,
  surface, muted, paper (the layer above the page: cards, panels, the header), danger,
  shadow, outline — once for light and once for dark. Components never ask which theme is
  on.
- **The helpers mix the custom property, not the SCSS value.** `ink()`, `wine()`,
  `paper()`, `surface()` and `shadow()` compile to
  `color-mix(in srgb, var(--brand-…) N%, transparent)`, so every translucent shade written
  before follows the theme without being touched. `shadow()` is ink on the light page and
  black on the dark one, where a light glow would read as a border.
- **The system decides until the visitor does.** Dark applies under
  `prefers-color-scheme: dark` unless `<html data-theme="light">`; `data-theme="dark"`
  forces it. The header's `ThemeToggleComponent` pins the opposite of what is on screen,
  stores it in `localStorage` (`theme`) and cross-fades the page with a view transition.
  With nothing stored, it follows system changes live.
- **The stored pick is applied before the first paint** by `public/theme-init.js`, a
  classic script linked from `<head>` ahead of the stylesheets. As a file from the site's
  own origin it passes `script-src 'self'`. Without it a visitor who chose dark on a light
  system would see a white flash on every page load.
- **The hero is outside the theme.** It is text on a darkened photo in both themes, so it
  keeps its literal whites and uses `brand.fixed-ink()` for the dark text on its white
  button. The logo, a dark gradient, is inverted in the dark theme through
  `--logo-filter`; the cursor spotlight switches from `multiply` to `screen` through
  `--spotlight-blend`. Both are custom properties because a component's emulated styles
  cannot target `:root` reliably.

## Consequences

- The light theme renders as before: before/after screenshots of every page match outside
  the header (which gained the toggle) and the contact button, whose `#111` became the
  brand ink.
- A literal colour in a component style is now a bug in the dark theme. `CLAUDE.md` says
  so; nothing enforces it.
- `color-mix()` needs a 2023+ browser. Older ones drop those declarations and lose some
  borders and tints, not content.
- One extra request (`theme-init.js`, a few hundred bytes) blocks the first paint. It is
  same-origin and cached; the alternative, a hash in the CSP for an inline script, would
  have to be kept in sync by hand.
- The prerendered toggle always says "Switch to dark theme"; the browser corrects the
  label on hydration. Only the label, not the colours — those are pure CSS.
