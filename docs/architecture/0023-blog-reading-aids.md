# 0023. Blog reading aids without libraries

## Status

Accepted. In effect. Extends [0005](0005-content-in-code.md) and
[0012](0012-css-animations-and-dom-access.md).

## Context

The blog rendered a post as headings and paragraphs and listed every post in one column.
Four things were missing for a technical blog: highlighted code, a table of contents, a
way to see the posts on one topic, and a sense of how much of a post is left.

The usual tools did not fit. Shiki and Prism produce HTML, and the post template does not
interpret HTML (ADR 0005); Shiki also brings a grammar engine and theme files measured in
hundreds of kilobytes. A scroll listener for a progress bar is change detection on every
scroll event in a zoneless app.

## Decision

- **Highlighting is a small tokenizer** (`pages/blog/code/highlight.ts`): an ordered list
  of sticky regular expressions per language — TypeScript, Angular templates, SCSS, shell.
  It returns tokens, the template renders each as a `<span>` through interpolation, so the
  source is never parsed as markup. It colours, it does not parse; a construct it misreads
  is shown in the wrong colour, never broken. A code block is `{ language, source }` in the
  content model. The colours are theme tokens (`--code-*`), with comments and keywords on
  the existing muted and wine.
- **The table of contents comes from the section headings.** Ids are made from the heading
  text (`table-of-contents.ts`), so a heading is linkable and the prerendered page lands on
  it. The list appears from three headings up: in the flow above the article on narrow
  screens, sticky in the right margin from 1200px. A scroll listener coalesced into one
  frame (as in `app.ts`) marks the heading being read with `aria-current="location"`.
  A jump to a heading changes only the fragment, so it skips the route's view transition
  and is not counted as a page view (ADR 0022).
- **The tag filter is a query parameter**, `/blog?tag=NgRx`, bound to the list as an input:
  a filtered list can be linked, and the browser's back button undoes a filter. The chips
  are links, not buttons, for the same reason; a post's own tags link to the filtered list.
  The page is prerendered without a query, so the filter applies only after hydration —
  applying it during hydration would not match the HTML.
- **Reading progress is CSS.** The article is a view timeline and the bar under the header
  scales along it (`animation-timeline`). No script, no listener. A browser without
  scroll-driven animations (Firefox, at the time of writing) shows no bar.

## Consequences

- No post has a code block yet; the highlighter is covered by unit tests on samples.
  A language beyond the four needs a grammar in `highlight.ts`.
- Renaming a heading changes its id and breaks links to it.
- `/blog?tag=x` arrives as the full list and narrows a moment later, after hydration.
- In dev mode the router logs a skipped transition as an `AbortError`; production does not.
