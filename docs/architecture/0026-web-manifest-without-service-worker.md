# 0026. A web manifest without a service worker

## Status

Accepted. In effect.

## Context

The site had a favicon and a `theme-color` and nothing else for phones: added to a home
screen it showed a screenshot or a letter, and the browser had no name for it. The usual
answer is a PWA — a manifest plus a service worker that caches the app for offline use.

The service worker is the costly half. The site is static, prerendered and small, so a
cache would make it barely faster, and a portfolio is opened once or twice from a link,
not read offline. On GitHub Pages, which cannot send cache headers per file, a worker is
also the one way to serve visitors a stale copy after a deploy, and a broken one stays in
their browsers until it updates itself. It would have to keep its hands off the Web3Forms
post and the GoatCounter beacon too.

## Decision

- **A manifest, no service worker.** `public/manifest.webmanifest` names the site, sets its
  colours and lists the icons; `index.html` links it and an `apple-touch-icon` for iOS.
  Nothing is cached, so every visit gets the current deploy.
- **Relative URLs throughout**, like every other asset (ADR 0011): `start_url`, `scope` and
  the icons resolve against the manifest, so the same file works under `/dimacodehub/` and
  on a custom domain.
- **One icon design for every size**, rendered from `logo.svg` by `npm run build:icons`
  (`scripts/build-icons.ts`): the mark on white inside the middle 60%, so the 512px icon
  doubles as the maskable one.

## Consequences

- The site can be added to a home screen with its own icon and name, and opens there in a
  window of its own; it still needs the network, as any page does.
- No offline mode and no install prompt beyond what the browser offers on its own. Adding a
  service worker later is a new decision, with the update problem above to answer.
- Changing the logo means running `npm run build:icons` and committing the three PNGs.
