# 0019. Every route is prerendered at build time

## Status

Accepted. In effect. Amends [0003](0003-github-pages-hosting.md) (the build is no longer a
bare SPA) and lifts the main limitation of [0013](0013-seo-metadata.md).

## Context

Until now the build produced one `index.html`. A crawler that runs no JavaScript — which
covers the link previews of LinkedIn, Telegram, Slack, X and most messengers — received the
site-wide tags for every URL. A shared post was previewed as the home page, whatever
`syncPageMeta()` did in the browser.

The site is still static files on GitHub Pages: there is no server to render on request,
and none is wanted.

## Decision

- `@angular/ssr` with `outputMode: "static"`: the build boots the app in Node once per
  route and writes the result to disk. Nothing runs on a server afterwards.
- The routes are listed in `src/app/app.routes.server.ts`. `/`, `/blog`, `/projects` and
  every post and case study are `RenderMode.Prerender`; the slugs come from `BlogService`
  and `CaseStudyService` through `getPrerenderParams`, so a new post is prerendered with no
  extra step. Drafts are filtered out in a production build and never reach the disk.
- Everything else is `RenderMode.Client`. That makes the build emit `index.csr.html`, an
  empty shell, and the deploy copies **that** file to `404.html`. Copying `index.html` (now
  the prerendered home page) would hydrate home markup on an unknown URL.
- `provideClientHydration(withNoIncrementalHydration())`. Hydration keeps the prerendered
  DOM instead of rendering it again. Incremental hydration, on by default in Angular 22,
  inlines event-replay scripts into each page, and the CSP (`script-src 'self'`) forbids
  inline scripts.
- `inlineCritical` is off for the same reason: the critical-CSS step loads the full
  stylesheet with an inline script. The global stylesheet is under 2 kB, so there is little
  to gain from it anyway.
- `og:url` follows the route (`syncPageUrl()` in `src/app/seo/page-url.ts`), since sharing
  services treat it as the page's identity.
- `syncPageMeta()` restores the site-wide tags from a constant (`SITE_META_TAGS`), not from
  a snapshot of the document: on a prerendered post the document already carries the post's
  tags. A unit test keeps the constant equal to `src/index.html`.

## Consequences

- Every page arrives as real HTML with its own title, description and OG tags; previews
  and search engines see what a visitor sees.
- A direct hit on a post is now an HTTP 200, not a 404 with the right content.
- Code that runs during rendering must not touch browser globals. The existing rule —
  DOM work in `afterNextRender()` — is what keeps it safe; `afterNextRender` does not run
  on the server.
- A `@defer` block renders its placeholder at build time: the home page's writing section
  is not in the prerendered HTML. Acceptable — the posts have their own pages.
- The footer year and anything else computed at render time is first written at build time
  and then corrected by hydration in the browser.
- `ng serve` renders on the server as well, so e2e exercise the same code path.
- The initial bundle grew by about 10 kB (transfer) for hydration.
