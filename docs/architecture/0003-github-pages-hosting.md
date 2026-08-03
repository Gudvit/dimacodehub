# 0003. GitHub Pages hosting: static build, base-href, SPA fallback

## Status

Accepted. In effect.

## Context

The portfolio has to cost nothing to run and deploy from the same repository that holds
the code. There is no custom domain — the site lives at something like
`https://gudvit.github.io/dimacodehub/`, that is, **in a subdirectory** rather than at the
host root.

GitHub Pages serves static files and has no SPA rewrite: a request for
`/dimacodehub/blog/angular-architecture-patterns` is a request for a file that does not
exist, and by default it returns a 404 instead of `index.html`.

## Decision

- An `@angular/build:application` build with `outputMode: "static"`; SSR and prerender
  are not enabled, and the contents of `dist/dimacodehub/browser` are deployed.
- Production is built by the `build:gh` script = `ng build --base-href /dimacodehub/`.
- **All asset links are relative** (`images/logo.svg`, `dmytro_huliaiev_cv.pdf`,
  `./favicon.ico`). A path starting with `/` ignores `<base href>` and 404s on Pages.
- SPA fallback: a workflow step copies `index.html` to `404.html` after the build. Pages
  serves `404.html` for any unknown path, and the Angular router parses the URL on the
  client.
- Absolute URLs are needed only in the OG/Twitter tags (`src/index.html`) — relative ones
  do not work there, so the domain is hardcoded.

## Consequences

- Zero cost and zero infrastructure; deploying is an ordinary push to `main` (ADR 0009).
- Direct links and page reloads on `/blog/:slug` work, but with an HTTP 404 status in the
  response. Browsers do not care; strict crawlers might. Acceptable for a portfolio.
- Moving to a custom domain would take three edits: `--base-href /`, absolute URLs in the
  OG tags, and a `CNAME` in `public/`.
- Renaming the repository breaks production until `build:gh` is updated (`README.md`
  warns about this too).
- Local `npm start` runs with `base href = /`, so the development environment differs
  from production exactly where paths break most often. The "cv link stays relative" e2e
  test exists precisely because of that gap.
- No response headers of any kind, so the Content Security Policy ships as a
  `<meta http-equiv>` in `src/index.html`. It allows `'self'`, the Web3Forms endpoint and
  Google Fonts, and nothing else; `'unsafe-inline'` is granted to styles only, because
  Angular inlines component styles. The build produces no inline script, so `script-src`
  needs no exception — check that this still holds before adding anything to `index.html`.
