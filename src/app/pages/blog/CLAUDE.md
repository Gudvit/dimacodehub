# pages/blog — the blog

The only feature area with lazy loading, its own routes and its own data.

```
blog.routes.ts                          BLOG_ROUTES + the post-title resolver
blog-page.component.*                   post list
components/blog-post-page/              post page
models/blog-post.model.ts               BlogPost / BlogPostSection
services/blog.service.ts                posts as an in-code array
services/blog.service.spec.ts           content validation, doubling as unit tests
```

Wired in from `app.routes.ts` through `loadChildren` — the single lazy chunk in the build.

## The content model

Posts live neither in a CMS nor in markdown files: `BlogService` keeps a `BlogPost[]`
right in TypeScript (see `docs/architecture/0005-content-in-code.md`). A post is a title,
a `slug`, a date as a string, tags, a preview, `readingTime` and an array of `sections`;
a section has an optional `heading`, required `paragraphs` and an optional `code` block.

The post template renders exactly these fields and **does not interpret HTML** — text
goes through interpolation. You cannot put markup inside a paragraph; if a new kind of
content is needed, extend `BlogPostSection` rather than smuggling in HTML.

### Adding a post

1. A new object at the front of the `posts` array (array order = page order; there is no
   sorting by date).
2. `slug` must be unique — `blog.service.spec.ts` checks this and fails on duplicates.
3. `readingTime` is counted by hand; nothing computes it.
4. `date` must be a string `Date.parse` understands (the project uses `YYYY-MM-DD`),
   otherwise the "keeps every post renderable by the post page" spec fails.

The `BlogService` specs are effectively content validation. If adding a post breaks a
test, fix the content, not the test.

## Routing and metadata

- `:slug` reaches the component as `input.required<string>()` thanks to
  `withComponentInputBinding()` in `app.config.ts` — `ActivatedRoute` is not needed here.
- The `<title>` is set by the `postTitle` `ResolveFn` in `blog.routes.ts` (which also
  holds the "Post not found" fallback), not by the component.
- OG/description tags are set by an `effect()` in `BlogPostPageComponent` through `Meta`.
  The tags are **not reverted** when you navigate away — they keep the last opened post's
  values until a reload. That does not matter for social previews (crawlers see the static
  `index.html`); for in-app navigation it is a known compromise.
- An unknown slug does not redirect: `post()` returns `undefined` and the template shows
  the "Post not found." state — there is an e2e test for it.
- A direct link to `/blog/:slug` only survives on GitHub Pages because of the
  "Add SPA fallback" workflow step (a copy of `index.html` as `404.html`).

## Card accessibility

The post card is an `<article>`, but the card itself is not the clickable thing: the real
link sits on the heading (`.post-card__link`) and is stretched across the card via
`::after`. Putting `[routerLink]` on the `<article>` is not allowed — the card would stop
being keyboard-reachable, a regression covered by the e2e test "blog cards are reachable
with the keyboard".
