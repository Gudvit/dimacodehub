# 0013. Page metadata: a static baseline plus route-driven titles

## Status

Accepted. In effect.

## Context

The portfolio has to look right when a link is shared in messengers and social networks,
and to have meaningful tab titles. At the same time the site is a pure client-side SPA
with no SSR or prerender (ADR 0003): a crawler that does not execute JavaScript only ever
sees `src/index.html`.

Previously there was no metadata at all: one `<title>` for the whole app, no description,
no Open Graph.

## Decision

Three layers.

1. **A static baseline in `src/index.html`** — what any JS-less crawler sees:
   `description`, `author`, `theme-color`, a full set of Open Graph tags
   (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`) and a
   Twitter Card (`summary_large_image`). The image and page URLs are absolute and
   hardcoded to `https://gudvit.github.io/dimacodehub/` — relative paths do not work in OG.
2. **The tab title comes from the routes** (ADR 0004): the `title` field in
   `app.routes.ts` for home and projects, in `blog.routes.ts` for the list; for a post,
   the `postTitle` `ResolveFn` looks the post up by slug and returns
   `"<title> - Dmytro Huliaiev"`, or "Post not found" for an unknown slug.
3. **Per-post OG tags** — an `effect()` in `BlogPostPageComponent` uses the `Meta` service
   to update `description`, `og:type` (to `article`), `og:title`, `og:description`,
   `twitter:title` and `twitter:description` from the post's fields.

Titles and the post's OG tag are asserted in e2e (`toHaveTitle` and a check on
`meta[property="og:title"]`).

## Consequences

- A link to the site root expands into a correct preview on any service.
- The tab title is always meaningful, including for a bad slug.
- The main limitation: previews of an **individual post** will not work. The crawler
  requests `/blog/:slug`, GitHub Pages serves `404.html` (a copy of `index.html`) with the
  static tags, and the JS-driven tag update is generally not seen by crawlers. Fixing this
  requires prerender or SSR — that is, revisiting ADR 0003.
- `Meta` tags are not reset when leaving a post page: the values persist from the last
  opened post until a reload. This does not affect SEO (see above) but is hidden state.
- There is one `og:image` for the entire site; posts have no per-post image.
- There is no `sitemap.xml`, `robots.txt` or canonical link — the assumption is that a site
  this small did not need them; neither the code nor the history records any discussion.
