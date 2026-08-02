# dimacodehub architecture

A personal portfolio site: a single-page home (hero → about → experience → contacts), a
blog section and a Projects placeholder. Angular 21, static build, GitHub Pages.

This is the high-level overview and the ADR index. Day-to-day working rules (style,
commits, the checklist before calling a task done) live in `CLAUDE.md` at the repository
root and in the local `CLAUDE.md` files under `src/app/pages/home/` and
`src/app/pages/blog/`.

## High-level view

```
                    browser
                       │
        ┌──────────────┴───────────────┐
        │  index.html (static meta /   │  ← the same content also ships as 404.html:
        │  OG tags, base href)         │    the SPA fallback for GitHub Pages
        └──────────────┬───────────────┘
                       │ bootstrapApplication(App, appConfig)
                       ▼
            App  ─ router-outlet ─ cursor spotlight (CSS variables)
                       │
      ┌────────────────┼─────────────────────┐
      ▼                ▼                     ▼
  HomePage         ProjectsPage        BLOG_ROUTES  (lazy chunk)
  slider of 4      placeholder         ├── BlogPage      list
  sections,        + LoadingDirective  └── BlogPostPage  post, :slug → input()
  manual scroll                               │
                                              ▼
                                        BlogService — posts as an in-code array
```

Cross-cutting facts that explain nearly every decision below:

- **There is no backend.** No database, no migrations, no server-side models, no
  authentication. All content is part of the bundle.
- **External integrations are minimal:** Google Fonts (the Urbanist typeface) and
  Web3Forms, which receives the contact form (ADR 0015) — one `fetch`, no `HttpClient`.
  The rest are outbound links (`mailto:`, `tel:`, GitHub, X, LinkedIn, Telegram) and
  the CV file.
- **The build is static**, deployed into the `/dimacodehub/` subdirectory on GitHub Pages.
- **The app is zoneless**, so state is signals and animations are CSS.

## ADR index

| #                                               | Decision                         | About                                                            |
| ----------------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| [0001](0001-angular-standalone-signals.md)      | Angular 21, standalone + signals | stack and code-style choice, dropping NgModule                   |
| [0002](0002-zoneless-change-detection.md)       | Zoneless change detection        | why there is no zone.js and what that means for the code         |
| [0003](0003-github-pages-hosting.md)            | GitHub Pages                     | static build, `--base-href`, `index.html` copied to `404.html`   |
| [0004](0004-routing-lazy-blog-input-binding.md) | Routing                          | lazy blog, `withComponentInputBinding()`, `title` in routes      |
| [0005](0005-content-in-code.md)                 | Content in code                  | posts and roles as TS structures, no CMS and no markdown         |
| [0006](0006-local-signal-state.md)              | State                            | local signals only, no NgRx                                      |
| [0007](0007-scss-no-ui-framework.md)            | Styling                          | hand-written SCSS and CSS variables, no UI framework             |
| [0008](0008-vitest-and-playwright.md)           | Testing                          | Vitest for logic, Playwright for behaviour; no Karma             |
| [0009](0009-ci-quality-gate-before-deploy.md)   | CI                               | one workflow: format → lint → tests → build → deploy             |
| [0010](0010-mailto-instead-of-contact-form.md)  | Contact (superseded)             | `mailto` instead of a form that sent nothing                     |
| [0011](0011-asset-placement.md)                 | Assets                           | `public/` versus `src/images/`, removing build duplicates        |
| [0012](0012-css-animations-and-dom-access.md)   | Animations and DOM               | CSS + `animate.enter/leave`, `afterNextRender`, rAF              |
| [0013](0013-seo-metadata.md)                    | Metadata                         | static OG in `index.html`, `title` from routes, `Meta` for posts |
| [0014](0014-accessibility-approach.md)          | Accessibility                    | semantic markup + ESLint a11y + role-based locators in e2e       |
| [0015](0015-contact-form-via-web3forms.md)      | Contact                          | a real form posting to Web3Forms, `mailto` as the fallback       |

## What the architecture deliberately does not solve

These are not debt but consequences of the decisions above. They only become problems if
the requirements change:

- Social previews for an **individual post** (needs prerender/SSR — ADR 0013, 0003).
- Preserving state across navigations (ADR 0006).
- A dark theme (ADR 0007).
- Localisation: i18n is not wired in, all copy is English literals in templates.
- Analytics: there are no counters or trackers of any kind.

## How to work with ADRs

One file per decision, named `NNNN-short-title.md`, numbered sequentially and never
reused. Structure: title, status, context, decision, consequences (including the
downsides). A decision is never rewritten: if it is reversed, the old ADR gets the status
"Superseded by NNNN" and the new one is written separately (the contact section is the
example: 0010 replaced the fake form with `mailto`, 0015 brought the form back with a
real receiver).
