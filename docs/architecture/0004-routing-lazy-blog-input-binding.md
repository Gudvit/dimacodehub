# 0004. Routing: lazy blog, route params as inputs, titles in routes

## Status

Accepted. In effect.

## Context

There are only a handful of routes: home, the projects placeholder, the blog list and the
post page. But home pulls in four heavy sections with their own SCSS, and the blog pulls
in the whole post corpus. Shipping all of it in one chunk on first load is undesirable:
home is the main entry point.

A separate question is how the post page receives `:slug` and how `<title>` gets set.

## Decision

`src/app/app.routes.ts`:

- `/` and `/projects` are plain component routes (home is needed immediately, projects is
  a tiny placeholder).
- `/blog` uses `loadChildren` for `BLOG_ROUTES`: the only lazily loaded chunk.
- `**` redirects to `/`. The application has no dedicated 404 page.

`src/app/app.config.ts`: `provideRouter(routes, withComponentInputBinding())` — route
params arrive as ordinary inputs: `readonly slug = input.required<string>()` in
`BlogPostPageComponent`. `ActivatedRoute` is injected only where a stream rather than a
parameter is needed (`fragment` on the home page).

The page title is set by the `title` field of the route definition: a string for static
pages and a `ResolveFn` (`postTitle` in `blog.routes.ts`) for a post. `Title` is never
called by hand.

## Consequences

- First load does not ship blog content; navigating to `/blog` costs one extra request
  for the chunk.
- The post component knows nothing about the router: `slug` is a plain input, so the
  component is trivially reusable and testable without a router harness.
- Titles live next to the routes instead of being scattered across components, and e2e
  assert them on all three page types.
- The resolver calls `BlogService.getBySlug` before the component is created, and the
  component calls it again. For an in-memory array that costs nothing, but switching to
  an asynchronous data source (ADR 0005) would introduce a double fetch and require a cache.
- `**` redirecting means a typo in the URL silently lands on home. A post with a
  non-existent slug behaves differently: it shows an explicit "Post not found." — a
  deliberate divergence, so that a broken link to a post is noticeable.
