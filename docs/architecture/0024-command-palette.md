# 0024. A command palette on ⌘K

## Status

Accepted. In effect.

## Context

The site is small, but what a visitor came for is spread over it: the email is at the end
of the home slider, the CV is in the hero and the footer, a post is two clicks away, the
theme switch is a small icon. A command palette puts all of it behind one shortcut — and
on a developer's portfolio it is also something a developer expects to find.

## Decision

- **A native `<dialog>` opened with `showModal()`.** The browser provides the focus trap,
  Esc, the inert page behind it and the return of focus to where it was. No overlay or
  focus-trap code of our own.
- **An ARIA combobox inside.** The input keeps focus and points at the highlighted option
  with `aria-activedescendant`; arrows move, Enter runs, a click or a tap runs too.
- **The palette is a deferred chunk** (`@defer (on idle)` in `app.html`): it is not needed
  for the first paint and it imports the blog posts. Whether it is open lives in
  `CommandPaletteService`, a few lines in the main bundle, so the header's button works
  even before the chunk arrives. The shortcut listener is registered with
  `addEventListener`, outside change detection, so typing elsewhere costs nothing.
- **The commands are data** (`Command`: label, group, keywords, `run`), filtered by a pure
  function: every word of the query must match, a label prefix ranks first, then a word
  prefix. Pages, every post, copy the email, download the CV, switch the theme, open a
  profile.
- **The theme logic moved into `ThemeService`**, shared by the header toggle and the
  palette. The contact email and the CV path moved into `site.ts`.
- **A phone gets a button**, the magnifier in the header, since it has no ⌘K.

## Consequences

- The header gained a 32px button; on a phone the first row is now brand, palette, theme,
  menu.
- Copying the email needs the Clipboard API; where it is refused the toast shows the
  address instead.
- New pages or actions are added to the list in `CommandPaletteComponent`; posts appear on
  their own.
