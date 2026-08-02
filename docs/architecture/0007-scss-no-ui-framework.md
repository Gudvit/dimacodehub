# 0007. Styling: hand-written SCSS with CSS variables, no UI framework

## Status

Accepted. In effect.

## Context

The portfolio is a showcase of frontend craft: the design is bespoke (cursor spotlight,
noise texture, a snap slider, per-letter text animation). Not one element on the page is
"standard" — there are almost no buttons or forms in the usual sense. A component library
(Material, Tailwind, Bootstrap) would mostly supply styles that then have to be overridden.

## Decision

SCSS only, no CSS libraries and no utility frameworks.

- `src/styles.scss` is the global layer: the brand palette as CSS custom properties
  (`--brand-ink`, `--brand-wine`, `--brand-surface`, `--brand-muted`, `--brand-outline`),
  a `box-sizing` reset, the font, the `body::before` effect (cursor spotlight driven by
  `--cursor-x` / `--cursor-y`) and `body::after` (SVG noise as a data URI), the
  route-animation keyframes and the loader styles.
- Component styles go in `styleUrl` with Angular's default (emulated) encapsulation. The
  schematic is set to SCSS in `angular.json`.
- There is one theme, light, pinned by `color-scheme: light`.
- The Urbanist typeface is loaded from Google Fonts with `preconnect` in `src/index.html`.
- Build budgets: 8 KB warning / 14 KB error per component stylesheet, 500 KB / 1 MB for
  the initial bundle.

## Consequences

- Full control over the visuals and minimal CSS in the bundle; nothing needs overriding.
- Motion without JS: the cursor spotlight is two CSS variables, which is what makes the
  zoneless approach in ADR 0002 workable.
- The price is that everything is hand-written: grids, responsiveness, focus states. The
  SCSS is already around 2400 lines, the largest file being the experience section (475
  lines) against a 14 KB per-component budget; the next large section may well hit it.
- There are no shared SCSS primitives (mixins, functions, a breakpoints file): the
  breakpoints (`768px`, `980px`) are duplicated across files and in TypeScript
  (`desktopBreakpointPx`). A known source of drift.
- A dark theme is not structurally provided for: the colours are variables, but
  `color-scheme` and every contrast pair assume a light background.
- The external font is the only runtime network dependency and a potential FOUT.
