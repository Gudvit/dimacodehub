# Work plan

Follow-up items from the repository review of 2026-08-03. This is a backlog, not an ADR:
entries get ticked off and deleted once done. Anything that turns out to be a deliberate
decision rather than a task belongs in `docs/architecture/` instead.

Each entry says **where** it lives, **what** to change and **done when** — the condition
that makes it verifiably finished. Priorities:

- **P2** — dead weight and payload: code nobody executes, bytes nobody needs.
- **P3** — the test gap. The largest structural weakness of the project.
- **P4** — desirable. Do when touching the area anyway.

Nothing here is critical: the site works, CI is green, and no finding puts data or users
at risk.

**P1 is done** (correctness and security): Angular raised to 21.2.19 and both XSS
advisories cleared, the duplicated `@for` track key fixed, the URL fragment escaped before
it reaches `querySelector`, and an abort told apart from a real send failure in the contact
form. Most of P2 has landed too — what is left below is what still needs a decision or a
tool this machine does not have.

---

## P2 — dead code and payload

Landed: the dead CSS in `home-page.component.scss` is gone (413 lines down to 20), the
shared `.slide-section` snap rules moved to `src/styles.scss` and the four per-section
copies were removed, `@angular/animations` is uninstalled, `LoadingDirective` became
`app/components/loader/` (a real template, local styles, a per-instance gradient id), and
the contact details now live in one pair of constants that both the template and the e2e
specs read.

- [ ] **Ship an avif or webp variant of the hero background.**
      `src/images/background.jpg` went from 811 kB to 217 kB by dropping 3088x2316 to
      2400x1800 at quality 50, which was as far as the machine it was compressed on could
      go: it has no `cwebp`, no `avifenc` and no ImageMagick, and `sips` refuses to write
      either format. An avif at the same visual quality is worth roughly half of what is
      left.
      _Done when:_ the hero declares the modern format with the jpg as fallback (an
      `image-set()` in `home-hero-section.component.scss:20`), and the jpg stays for
      browsers that need it.

---

## P3 — the test gap

- [ ] **Switch the unit-test entry point to `ng test`.**
      CI runs bare `vitest run`, which has no Angular compiler — TestBed component tests
      cannot be written against it. The `test` target in `angular.json` already works
      (`@angular/build:unit-test`, verified: same 9 tests pass).
      _Done when:_ `npm run test:unit` goes through the Angular builder, the existing
      specs still pass, and one rendering component test proves the path works.

- [ ] **Unit-test the gesture logic of the experience section.**
      `onFocusPanelWheel` (`home-experience-section.component.ts:234-290`) and
      `onTouchEnd` (`:198-228`) hold the densest logic in the project — wheel
      accumulator, cooldown, edge-exit budget, horizontal-intent detection — and nothing
      covers them: e2e does not emulate wheel or touch. The methods are near-pure, so
      they need no TestBed.
      _Done when:_ there are cases for the first and last role, a reversal of scroll
      direction, `deltaX > deltaY`, the cooldown window, and a vertical swipe that must
      not switch roles.

- [ ] **Close the edge cases in `contact-form.service.spec.ts`.**
      Missing: `fetch` itself rejecting (connection dropped), the 15 s timeout and
      `AbortSignal.any` composition (`contact-form.service.ts:39,44` — untested), the
      caller's `signal` actually reaching `fetch`, and a non-JSON response body (the
      `.catch(() => ({}))` branch at `:56`).
      _Done when:_ each of those four has a case.

- [ ] **Extend the e2e suite.**
      Not covered today: the `/projects` page, slider navigation (`scrollToNextSection`,
      "Contact me", back-to-top), the actual scroll on `/#contacts` (the current spec
      visits the URL but only checks a link), keyboard operation of `.scroll-hint`
      (`role="button"` + `tabindex="0"`), and `prefers-reduced-motion`.
      _Done when:_ each of those has a spec. Split the file while doing it — `home.spec.ts`
      currently holds blog, header and contact-form tests.

- [ ] **Give Playwright retries and traces.**
      `playwright.config.ts` sets no `retries`, no `trace`, and no `projects`; the CI job
      uploads a report (`deploy.yml:40-46`) that carries little without a trace.
      _Done when:_ `retries: process.env.CI ? 2 : 0`, `trace: "on-first-retry"`, and an
      explicit chromium project are in place; the mobile viewport currently set by hand
      in the menu spec becomes a project too.

---

## P4 — desirable

- [ ] **Restrict the Web3Forms key to the site's domain** (dashboard setting, no code).
      The key is public by design and that is correct (ADR 0015), but without a domain
      allowlist anyone can post from any origin and burn the 250/month quota. The
      `botcheck` honeypot is the only other line of defence.
      _Done when:_ the allowlist contains the production origin and a send from the live
      site still succeeds.

- [ ] **Add a CSP `<meta>` to `src/index.html`.**
      GitHub Pages cannot set headers, but the meta form covers most of it: `default-src`
      and `connect-src` on `'self'` plus `https://api.web3forms.com`, `font-src` on
      `https://fonts.gstatic.com`, `style-src` on `'self' 'unsafe-inline'` plus
      `https://fonts.googleapis.com`. The `'unsafe-inline'` for styles is unavoidable —
      Angular inlines component styles.
      _Done when:_ the site loads with no CSP violations in the console, fonts render and
      the contact form still sends.

- [ ] **Add dependency automation and an audit step.**
      Nothing watches dependencies, which is exactly how the Angular patch level drifted.
      _Done when:_ Dependabot (or Renovate) is configured and the workflow runs
      `npm audit --omit=dev` as part of the gate.

- [ ] **Lazy-load the projects placeholder.**
      `app.routes.ts:3` imports `ProjectsPageComponent` statically, so a "coming soon"
      page sits in the initial bundle. Home stays eager — it is the first screen.

- [ ] **Split `HomeExperienceSectionComponent` (311 lines).**
      Four responsibilities in one class: role data, active-role state, touch gestures,
      wheel handling with accumulator/cooldown/edge-exit. The gesture code touches no
      Angular API and moves cleanly into a directive or helper; `roles` belongs in a
      constant or service, the way the blog keeps posts in `BlogService`.

- [ ] **Make the content structures read-only.**
      `BlogService.getAll()` (`blog.service.ts:162`) hands out the internal array, and
      `roles` is a public mutable field. `ContactMessage` already uses `readonly` — apply
      the same to `BlogPost`, `BlogPostSection` and the experience interfaces.

- [ ] **Reach for the header height without a global lookup.**
      `getHeaderOffset()` (`home-page.component.ts:101-104`) queries `.site-header`
      through `document`, reaching into `HeaderComponent`'s markup: renaming that class
      silently breaks every scroll offset and no test would catch it. A
      `--header-height` CSS variable or `scroll-margin-top` on the sections keeps the
      boundary intact.

- [ ] **Refresh `README.md`.**
      It predates the contact form: no mention of Web3Forms, of `npm run lint` /
      `format`, or of the `npx playwright install chromium` step, while repeating
      base-href instructions that `CLAUDE.md` covers better.

- [ ] **Decide on `cli.analytics` in `angular.json:6`.**
      A telemetry UUID that reports from every dev machine and CI run. Set it to `false`
      unless it is wanted.

- [ ] **Pin the Node version.**
      CI fixes Node 20 and `packageManager` fixes npm, but there is no `.nvmrc` or
      `engines` field, so local versions are free to drift.

- [ ] **Pin the GitHub Actions by commit SHA** instead of the major tag
      (`actions/checkout@v4` and friends in `.github/workflows/deploy.yml`).

---

## Deliberately not doing yet

- **Deleting `public/shared-images/`.** Four unused images (~200 kB) that ship with every
  deployment. Kept deliberately: they are the material for the Projects section, so they
  stay until that section is either built or abandoned.

- **Per-post chunking for the blog.** Every post ships inside the lazy blog chunk
  (23 kB for three). The list page will eventually carry full article bodies it never
  renders, but the threshold is far off and the trade-off is recorded in ADR 0005. The
  point to revisit: when the list starts costing more than the posts anyone opens.
- **Reverting the `Meta` tags on navigation** (`blog-post-page.component.ts:27-39`). Known
  and documented in `pages/blog/CLAUDE.md`: crawlers read the static `index.html`, so it
  only affects in-app navigation.
