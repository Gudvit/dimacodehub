# dimacodehub

The personal portfolio of Dmytro Huliaiev: a single-page home (hero → about → experience →
contacts), a blog and a Projects placeholder. Angular 21 — standalone, signals, zoneless —
built to static files and served from GitHub Pages.

There is no backend and none is planned. The only outbound request the app makes is the
contact form, which posts straight to Web3Forms; everything else is bundled content and
outbound links.

## Getting started

Node 20 (see `.nvmrc`), npm 10.9.4.

```bash
npm install
npm start          # http://localhost:4200/
```

## Commands

| Command                           | What it does                                                     |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm start`                       | dev server                                                       |
| `npm run build`                   | production build into `dist/dimacodehub/browser`                 |
| `npm run build:gh`                | the same with `--base-href /dimacodehub/` — what CI deploys      |
| `npm run test:unit`               | `ng test`: Vitest + jsdom + TestBed (`test:unit:watch` to watch) |
| `npm run test:e2e`                | Playwright; it starts the dev server itself                      |
| `npm run lint`                    | ESLint over `src/**/*.ts` and `src/**/*.html`                    |
| `npm run format` / `format:check` | Prettier write / check                                           |
| `npm test`                        | unit + e2e                                                       |

Playwright needs its browser once: `npx playwright install chromium`.

## Tests

Unit tests run through the Angular builder, so components can be rendered with `TestBed`
without downloading a browser. They cover the blog content, the contact-form transport, the
header, and the gesture handling of the experience section. Playwright covers the
user-facing flows — the specs are split into `home`, `blog`, `contact` and `mobile`, the
last of which runs in a phone viewport.

E2E assert on real page copy: change the wording in a template and update the spec with it.

## CI and deployment

`.github/workflows/deploy.yml` runs on a push to any branch: audit → format → lint → unit →
e2e → build. A branch gets the verdict; only `main` continues to the deploy job, which
publishes to GitHub Pages. Pages has no SPA rewrite, so the workflow copies `index.html` to
`404.html` — without it, a direct link to `/blog/:slug` 404s.

The production build uses `--base-href /dimacodehub/`, matching the repository name. If the
repository is renamed or moves to a custom domain, update `build:gh` in `package.json` and
the absolute OG URLs in `src/index.html`.

## Where things are documented

- `CLAUDE.md` — working rules: code style, asset placement, the checklist before calling a
  task done.
- `docs/architecture/` — ADRs. Every notable decision and why it was made; read them before
  a large change.
- `docs/work-plan.md` — the open follow-ups from the last review.
- `src/app/pages/home/CLAUDE.md`, `src/app/pages/blog/CLAUDE.md` — the two areas with
  enough behaviour to need their own notes.
