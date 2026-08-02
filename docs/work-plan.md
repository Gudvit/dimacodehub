# Work plan

Follow-up items from the repository review of 2026-08-03. This is a backlog, not an ADR:
entries get ticked off and deleted once done. Anything that turns out to be a deliberate
decision rather than a task belongs in `docs/architecture/` instead.

Each entry says **where** it lives, **what** to change and **done when** — the condition
that makes it verifiably finished. Priorities:

- **P1** — correctness and security. Small, cheap, no reason to wait.
- **P2** — dead weight and payload: code nobody executes, bytes nobody needs.
- **P3** — the test gap. The largest structural weakness of the project.
- **P4** — desirable. Do when touching the area anyway.

Nothing here is critical: the site works, CI is green, and no finding puts data or users
at risk.

---

## P1 — correctness and security

- [ ] **Bump Angular to 21.2.19.**
      `package.json` pins `^21.2.0`, the lock resolves 21.2.6, which carries two XSS
      advisories on `@angular/core` / `@angular/compiler`
      (GHSA-58w9-8g37-x9v5, GHSA-f3m7-gqxr-g87x). The fix is inside the declared range,
      so it is a lockfile refresh, not a migration.
      _Done when:_ `npm audit --omit=dev` reports no advisories and the full CI gate
      (`format:check`, `lint`, `test:unit`, `test:e2e`, `build:gh`) is green.

- [ ] **Fix the duplicated `@for` track key in the experience section.**
      `home-experience-section.component.html:6` and `:53` track by `role.title`, but
      `"Angular Developer"` appears twice in `roles` (IdeaSoft and Lazy Ants). Angular
      reports NG0955 and may reuse the wrong DOM node. Track `$index` (the list is
      static) or `role.company + role.period`.
      _Done when:_ both loops use a key that is unique across `roles`, and switching
      through every role in the browser produces no NG0955 in the console.

- [ ] **Escape the URL fragment before it reaches `querySelector`.**
      `home-page.component.ts:90` builds `` `#${fragment}` `` from the URL. `/#2024` or
      `/#a b` is an invalid selector: the `SyntaxError` is thrown inside the
      `route.fragment` subscription (`:38-40`), which has no error handler, so the
      subscription dies and anchor navigation stops working until a reload. Use
      `CSS.escape(fragment)` or `getElementById` plus a containment check.
      _Done when:_ `/#2024` scrolls nowhere and leaves the console clean, and `/#contacts`
      still works afterwards in the same session. Cover it with an e2e case.

- [ ] **Tell `AbortError` apart from a real failure in the contact form.**
      `home-contact-section.component.ts:72` catches everything into `status = "error"`.
      When the component is destroyed mid-flight, `DestroyRef.onDestroy` (`:52`) aborts
      the request and the rejection writes an error state into a component that is
      already gone. Nothing is logged either, so an outage at Web3Forms leaves no trace.
      _Done when:_ an aborted request sets no status, other failures still show the error
      block, and the underlying error is at least logged. Add a unit case for the
      transport rejecting with `AbortError`.

- [ ] **Fix the stale comment above the Web3Forms key.**
      `contact-form.service.ts:8-9` still says "Until a real key is in place every send
      fails", while `:11` holds a working key. It describes the previous state of the
      feature and misleads on first read.
      _Done when:_ the comment describes what the key is and why it is public (it already
      does that part), without the obsolete condition.

---

## P2 — dead code and payload

- [ ] **Delete the dead CSS in `home-page.component.scss` (~330 of 413 lines).**
      `.competencies-*`, `.principles-*`, `.trust-*`, `.work-*`, `.stats-grid`,
      `.domain-pills`, `.work-grid`, `.work-tags`, `.work-cta`, `.principles-cta` match
      nothing in any template — leftovers of removed sections.
      _Done when:_ every class selector left in the file exists in a template, and the
      home page is visually unchanged.

- [ ] **Move `.slide-section` to `src/styles.scss`.**
      The block at `home-page.component.scss:10-16` (and its `:23-27` media override)
      cannot apply: under emulated encapsulation a component's styles only match its own
      template, and the `.slide-section` elements live in the four section components.
      It works today because each section repeats the same rules
      (`home-hero-section.component.scss:6,27-28`, `home-about-section.component.scss:8,14-15`,
      `home-experience-section.component.scss:7-8,14-15`,
      `home-contact-section.component.scss:7-9`). Keep the `.home-slider` half of the
      media query where it is — that one does work.
      _Done when:_ the shared rules live in one place, the per-section duplicates are
      gone, and scroll snapping still behaves on desktop and stays off below 768px.

- [ ] **Recompress `src/images/background.jpg` (811 kB).**
      It is the hero background (`home-hero-section.component.scss:20`) and the single
      largest thing on first paint — roughly nine times the compressed JS bundle (93 kB
      transfer). No `webp`/`avif` variant, no `image-set()`.
      _Done when:_ the hero ships an avif/webp variant with a jpg fallback, the file is
      under ~150 kB, and the hero looks unchanged on a retina screen.

- [ ] **Delete `public/shared-images/` (~200 kB).**
      Four unused images for a Projects section that does not exist; they are copied into
      every deployment (verified in `dist/`). Already listed under "Known debt" in
      `CLAUDE.md`.
      _Done when:_ the directory is gone, `dist/dimacodehub/browser` no longer contains
      it, and the `CLAUDE.md` debt entry is removed with it.

- [ ] **Remove `@angular/animations`.**
      In `dependencies`, imported nowhere (the app uses `animate.enter/leave` and CSS —
      ADR 0012).
      _Done when:_ the package is out of `package.json`, `npm ci && npm run build` passes,
      and the `CLAUDE.md` debt entry is removed.

- [ ] **Decide what happens to `LoadingDirective`.**
      Used once, on the "coming soon" placeholder (`projects-page.component.html:11`).
      It builds its overlay with `innerHTML` (`loading.directive.ts:27`), creates it even
      when `appLoading` is never true, references `.loader-overlay` — a class that is not
      styled anywhere in the project — carries a hardcoded SVG `id="gradientMove"` that
      would collide on a second instance, and its `.loader` class fights the global one
      (`styles.scss:98` at 120px versus `projects-page.component.scss:47` at 1rem).
      Either replace it with a small component that has a real template, or delete it and
      the orphaned global styles.
      _Done when:_ there is one loader implementation, its styles sit next to it, and the
      placeholder page still shows the spinner.

- [ ] **Stop duplicating the contact details.**
      `CONTACT_EMAIL` lives in `home-contact-section.component.ts:14`, yet the same
      address is hardcoded in the template (`home-contact-section.component.html:19`)
      along with the phone number (`:15`). E2E only asserts the constant-driven link, so
      a divergence would ship unnoticed.
      _Done when:_ address and phone come from one place in the component, and e2e checks
      the visible address too.

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

- [ ] **Correct the slider notes in `src/app/pages/home/CLAUDE.md`.**
      It presents `.slide-section` and the mobile snap override as rules of
      `home-page.component.scss`; in practice the per-section copies are what apply. Fold
      this in with the `.slide-section` move above.

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

- **Per-post chunking for the blog.** Every post ships inside the lazy blog chunk
  (23 kB for three). The list page will eventually carry full article bodies it never
  renders, but the threshold is far off and the trade-off is recorded in ADR 0005. The
  point to revisit: when the list starts costing more than the posts anyone opens.
- **Reverting the `Meta` tags on navigation** (`blog-post-page.component.ts:27-39`). Known
  and documented in `pages/blog/CLAUDE.md`: crawlers read the static `index.html`, so it
  only affects in-app navigation.
