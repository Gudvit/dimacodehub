# 0013. Page metadata: a static baseline plus route-driven titles

## Status

Accepted. The per-post preview limitation below is lifted by
[0019](0019-build-time-prerender.md): every post is prerendered with its own tags.

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

## Addendum: the SEO baseline

Added once prerender (ADR 0019) made per-page tags visible to crawlers.

- **Canonical and `og:url`** follow the route (`syncPageUrl()`), as the directory URL with a
  trailing slash (`pageUrl()` in `src/app/site.ts`) — the address Pages answers 200 on.
- **JSON-LD** (`syncJsonLd()` in `src/app/seo/json-ld.ts`): `Person` on the home page,
  `BlogPosting` on each post. It is a data block, so the CSP's ban on inline scripts does
  not touch it; `<` is escaped so content cannot close the element.
- **`sitemap.xml` and `feed.xml` (RSS 2.0)** are written after `ng build` by
  `scripts/build-feeds.ts`, which imports the same in-code content (ADR 0005) into plain
  Node. Drafts are left out. The feed is announced with `<link rel="alternate">` in
  `index.html`.
- **A sharing image per post and case study** (`og/<route>.jpg`, 1200×630) is rendered
  after the build by `scripts/build-og-images.ts`: an HTML card in the site's palette,
  screenshotted with Playwright's Chromium — the browser e2e already installs, so no image
  library joins the dependencies. `ogImagePath()` in `site.ts` is the one place the path is
  decided, for the script and for `og:image`. Pages without content of their own keep the
  site-wide cover. Without network access the card falls back to a system font.
- **No `robots.txt`.** Crawlers read it only at the host root (`gudvit.github.io/robots.txt`);
  a file under `/dimacodehub/` is ignored, and the root belongs to another repository. The
  sitemap is submitted in Search Console instead. With a custom domain, add
  `public/robots.txt` pointing at the sitemap.
