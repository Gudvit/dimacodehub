# 0011. Asset placement: `public/` versus `src/images/`

## Status

Accepted. In effect.

## Context

`angular.json` copies everything under `public/` into the build verbatim, without hashing
and without any usage analysis. Assets under `src/`, on the other hand, go through the
bundler: it hashes them, puts them in `media/` and substitutes the final path into the CSS.

The hero background used to live in `public/` and was referenced from SCSS by a relative
path (`../../../public/...`). As a result the image shipped twice: once as a copied
`public/` asset and once as a bundler-processed file in `media/`. For an 800 KB file that
is almost a wasted megabyte in the artifact.

## Decision

Where an asset lives is determined by who references it.

- **`src/images/`** — files referenced only from SCSS/TS. Today that is `background.jpg`
  (the hero background, referenced by a relative path from
  `home-hero-section.component.scss`). The bundler hashes them into `media/`.
- **`public/`** — only what must be reachable at a stable, predictable URL:
  `favicon.ico`, `dmytro_huliaiev_cv.pdf` (the "Download CV" link),
  `images/logo.svg` (loaded through `<img src>` in the header) and
  `images/og-cover.jpg` (an absolute URL in the OG tags — the crawler must get it
  without a hash).
- The same file in both places is a duplicate in the deployment; do not do it.
- Unused files and uncompressed PNG sources do not go into `public/`.

## Consequences

- The duplicate is gone and the deployed artifact size is predictable.
- Hashing `src/images/` gives correct long-lived caching: changing the picture changes the
  file name.
- Files in `public/` are cached at a stable URL, so an updated CV or OG cover may not
  reach a returning visitor until their cache expires. For those three files that is
  acceptable and is the price of a stable URL.
- Nothing prevents accidentally dropping junk into `public/` — there is no lint for it.
  `public/shared-images/` currently holds four unused images (~208 KB) for an unbuilt
  Projects section; they ship with every deployment.
- `.prettierignore` excludes `public` and `src/images` so that Prettier leaves binaries alone.
