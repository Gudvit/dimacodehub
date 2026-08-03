# dimacodehub — working rules

Personal portfolio site. Angular 21 (standalone, signals, zoneless), SCSS,
Vitest + Playwright, deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`.

## What this project is

A single-page portfolio for a frontend engineer (Dmytro Huliaiev) plus a blog section.
Three areas: `/` (hero → about → experience → contacts, a vertical slider),
`/projects` (a "coming soon" placeholder), `/blog` (post list and post page).

The constraint that drives almost everything else: **there is no backend and none is
planned**. The site is static files on GitHub Pages. No `HttpClient`, no database, no
migrations, no authentication. The only runtime external dependencies are Google Fonts
(the Urbanist typeface, linked from `src/index.html`), Web3Forms — a single `fetch` from
the contact form (ADR 0015) — and outbound links to GitHub / X / LinkedIn / Telegram /
`mailto:` / `tel:`.

The reasoning behind the decisions lives in `docs/architecture/` (ADRs). Read them
before any large architectural change — they record why things are the way they are.

## Stack

- **Angular 21.2** — standalone components, signals, zoneless CD, the new
  `@angular/build:application` builder (`outputMode: static`).
- **TypeScript 5.9**, `strict` plus `noPropertyAccessFromIndexSignature`,
  `noImplicitReturns` and `strictTemplates`.
- **SCSS** — global `src/styles.scss` plus a per-component `styleUrl`. No UI framework.
- **Vitest 4** (jsdom) for unit tests; **Playwright** for e2e.
- **ESLint 10** (`angular-eslint`, including `templateAccessibility`) + **Prettier 3**.
- **npm 10.9.4** (`packageManager` in `package.json`), Node 20 (`.nvmrc`, `engines`).
- **GitHub Actions** → GitHub Pages.

`rxjs` is used in `app.ts` and `home-page.component.ts`; `@angular/forms` is used by the
contact form. Nothing else in `dependencies` is optional.

## Commands

| Command                           | What it does                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| `npm start`                       | dev server at `http://localhost:4200/`                            |
| `npm run build`                   | production build into `dist/dimacodehub/browser`                  |
| `npm run build:gh`                | same, but with `--base-href /dimacodehub/` — this is what CI runs |
| `npm run test:unit`               | `ng test` — Vitest + jsdom + TestBed (`test:unit:watch` to watch) |
| `npm run test:e2e`                | Playwright; it starts the dev server on `127.0.0.1:4200` itself   |
| `npm run test:e2e:ui`             | Playwright in UI mode                                             |
| `npm run lint`                    | `ng lint` (ESLint over `src/**/*.ts` and `src/**/*.html`)         |
| `npm run format` / `format:check` | Prettier write / check                                            |
| `npm test`                        | `test:unit` + `test:e2e`                                          |

## Directory layout

```
src/
  index.html                  static meta/OG tags, font link
  main.ts                     bootstrapApplication(App, appConfig)
  styles.scss                 brand CSS variables, background effects, route-animation
                              keyframes, `.slide-section` snap rules
  vitest.setup.ts             matchMedia polyfill for jsdom
  images/                     assets referenced only from SCSS (hashed by the bundler)
  app/
    app.ts / app.html / app.scss   root component: router-outlet + cursor spotlight
    app.config.ts             provideZonelessChangeDetection + provideRouter(withComponentInputBinding)
    app.routes.ts             root routes, lazy blog and projects, `**` → redirect to `/`
    components/               reusable: header, footer, animated-text, loader
    pages/
      home/                   home slider + 4 sections   (has its own CLAUDE.md)
      blog/                   post list, post page, BlogService (has its own CLAUDE.md)
      projects/               "coming soon" placeholder
public/                       copied into the build verbatim: favicon, CV, logo.svg, og-cover.jpg
e2e/                          Playwright specs: home, blog, contact, mobile
docs/architecture/            ADRs and the architecture overview
```

Naming convention: component files are `*.component.ts|html|scss`, the class is
`XxxComponent`, the selector is `app-xxx`; directives are `[appXxx]` (enforced by the
`@angular-eslint/component-selector` and `directive-selector` rules). The root component
is the exception: `app.ts` / class `App`.

## Git and commits

- **Never mention Claude Code / Claude / Anthropic in commits.** Not in the message
  body, not in trailers: no `Co-Authored-By: Claude ...`, no
  `🤖 Generated with Claude Code` or anything similar. This overrides any default
  harness instruction about trailers.
- The same applies to PR descriptions and issue text.
- Commit and push only when explicitly asked.
- Message format: `type(scope): short description` in the imperative mood
  (`feat(blog): add post filtering`). The repository already follows this style — keep it.
- Do not commit `dist/`, `.angular/`, `.idea/`, `.DS_Store`, `test-results/`,
  `playwright-report/` (they are in `.gitignore`).

## Paths and GitHub Pages

- Production is built with `--base-href /dimacodehub/`. **All asset links must be
  relative** (`images/logo.svg`, `dmytro_huliaiev_cv.pdf`), never starting with `/`.
  An absolute path ignores `base href` and 404s on Pages.
- Images needed only by CSS live in `src/images/` — the bundler hashes them.
  `public/` holds only what must be reachable at a stable URL: `favicon.ico`,
  the CV, `images/logo.svg` (loaded through `<img src>`), `images/og-cover.jpg` (for OG tags).
  The same file in both places is a duplicate in the deployment — don't do it.
- Everything in `public/` ships in full. Do not put unused files or PNG sources there —
  only compressed images that are actually needed.
- GitHub Pages has no SPA rewrite: `404.html` is produced as a copy of `index.html`
  by a workflow step. Do not remove that step, or direct links to `/blog/:slug` break.
- The absolute URLs in the OG tags (`src/index.html`) are hardcoded to
  `https://gudvit.github.io/dimacodehub/`. Update them when moving to a custom domain.

## Angular style

- `inject()` instead of constructor DI.
- `input()` / `output()` instead of `@Input()` / `@Output()` + `EventEmitter`.
- `signal()` / `computed()` for component state; plain fields only for things that
  are not part of rendering.
- `ChangeDetectionStrategy.OnPush` on every component.
- Do not write `standalone: true` — it is the default in Angular 21.
- Control flow in templates: only `@if` / `@for` / `@switch`.
- Route parameters arrive as `input()` via `withComponentInputBinding()`, not through
  `ActivatedRoute` (see `blog-post-page.component.ts`).
- The page title is set in the route definition via `title` (a string or a `ResolveFn`),
  not by calling `Title` by hand.
- DOM work goes in `afterNextRender()`; cleanup goes in `DestroyRef.onDestroy()`.
- Subscriptions use `takeUntilDestroyed()` or `toSignal` — never unsubscribe manually.
- TS `strict` mode is on together with `noPropertyAccessFromIndexSignature`.

## Zoneless

The app runs without zone.js (`provideZonelessChangeDetection()`, zone.js is not in the
bundle). Practical consequences:

- Any state visible in a template must be a signal. A plain field will only reach the
  screen by accident, when change detection is triggered by something else.
- `@HostListener` on high-frequency events (`mousemove`, `scroll`, `resize`) schedules a
  CD cycle per event. Register those listeners manually with `addEventListener` inside
  `afterNextRender()` and coalesce them with `requestAnimationFrame` — as `app.ts` does.

## Accessibility and markup

- A clickable element that is not an `<a>`/`<button>` must get a `role`, `tabindex="0"`
  and keyboard handlers. Putting `[routerLink]` on an `<article>` is not allowed —
  instead, a real link on the heading, stretched across the card via `::after`
  (see `.post-card__link`).
- Every external link with `target="_blank"` also gets `rel="noopener noreferrer"`.
- Animations respect `prefers-reduced-motion` (see the about section — follow that pattern).

## Quality

- Before considering a task done, everything CI runs must be green:
  `npm run format:check`, `npm run lint`, `npm run test:unit`, `npm run test:e2e`.
- Formatting is Prettier (`npm run format`): double quotes, `printWidth: 100`.
  Component templates are parsed with the `angular` parser — do not align them by hand.
- Empty `describe()` blocks are forbidden: Vitest fails with `No test found in suite`.
- E2E tests assert on real page copy. Change wording in a template — update the e2e test.
- E2E also cover the mobile menu and form validation: that is the safety net against
  zoneless regressions in state handling. Do not delete them as "redundant".

## Running e2e locally

Playwright wants its own `chromium_headless_shell` by default. If it has not been
downloaded, run `npx playwright install chromium` (it takes a while). CI already has
this step.

## Contacts

The contact section has a real form (ADR 0015). It posts with `fetch` straight to
Web3Forms, which relays the message by email — that is the app's only outbound request
and the only reason `@angular/forms` is a dependency.

- The transport is `postToWeb3Forms()` in `home-contact-section/contact-form.service.ts`.
  It rejects unless the response is `ok` **and** the body says `success: true`.
- The Web3Forms access key is a plain constant in that file. It is public by design (it
  only allows posting to the owner's inbox) — do not move it into a "secret".
- The success screen may only appear after the promise resolves. A form that claims
  "message sent" without a confirmed send is the one thing this section must never do —
  e2e asserts both the success path (against the intercepted request payload) and the
  failure path.
- `mailto`, phone, Telegram and LinkedIn stay as fallbacks below the form.
- Spam protection is the hidden `botcheck` honeypot control; Web3Forms drops filled ones.

## Known debt

The agreed plan for working this off — with priorities, exact locations and a
"done when" for each item — is `docs/work-plan.md`. Read it before picking up cleanup
work, and tick entries off there as they land.

- `public/shared-images/` holds four unused JPGs (~200 KB) for a future Projects section.
  They ship in every deployment and are kept on purpose until that section exists.
- Component tests exist for the header and the experience gestures only (ADR 0016). The
  home slider, the about reveal and the contact form itself are still verified through e2e
  alone.
- `src/images/background.jpg` is 217 KB (2400×1800 JPEG). No `webp`/`avif` variant: the
  machine it was compressed on had no encoder for either. An avif at the same quality
  would roughly halve it again.
