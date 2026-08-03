# Work plan

Follow-up items from the repository review of 2026-08-03. This is a backlog, not an ADR:
entries get ticked off and deleted once done. Anything that turns out to be a deliberate
decision rather than a task belongs in `docs/architecture/` instead.

Each entry says **where** it lives, **what** to change and **done when** — the condition
that makes it verifiably finished. Priorities:

- **P2** — dead weight and payload: code nobody executes, bytes nobody needs.
- **P3** — the test gap. The largest structural weakness of the project.
- **P4** — desirable. Do when touching the area anyway.

P1 and P3 are done; P2 has one item left. What follows is mostly P4.

Nothing here is critical: the site works, CI is green, and no finding puts data or users
at risk.

**P1 is done** (correctness and security): Angular raised to 21.2.19 and both XSS
advisories cleared, the duplicated `@for` track key fixed, the URL fragment escaped before
it reaches `querySelector`, and an abort told apart from a real send failure in the contact
form. The CI gate now runs on every branch instead of only on `main` (ADR 0009).

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

Done, and recorded as [ADR 0016](architecture/0016-component-tests-through-the-angular-builder.md):
`npm run test:unit` is `ng test` through `@angular/build:unit-test` (jsdom, TestBed, no
browser download) and `vitest.config.ts` is gone, so there is one way to run the tests.
The gestures of the experience section have 16 unit tests, the header has a rendering
test under zoneless change detection, and the transport covers a dropped connection, a
non-JSON body, an abort surfacing as `AbortError` and the caller's signal reaching
`fetch`. The e2e suite split into `home`, `blog`, `contact` and `mobile`, gained the
projects page, slider navigation, the fragment deep link, keyboard use of the scroll hint
and a reduced-motion case, and the config now has CI retries, `trace: on-first-retry` and
a desktop/mobile project pair that does not duplicate runs.

- [ ] **Measure coverage.** Nothing reports it and no threshold exists; the builder takes
      `coverage`, `coverageThresholds` and `coverageExclude` options.
      _Done when:_ `ng test --coverage` reports, and CI fails below an agreed floor.

---

## P4 — desirable

Landed: the CSP `<meta>` (ADR 0003), `npm audit --omit=dev` in the gate plus Dependabot for
npm and actions, actions pinned by commit SHA, `/projects` lazy-loaded, the experience
component split into `experience-roles.ts` + `role-gestures.ts` (311 lines down to 120),
`readonly` blog and experience models, `--header-height` published by `HeaderComponent`
instead of a global `.site-header` lookup, a rewritten `README.md`, `cli.analytics: false`,
and `.nvmrc` + `engines`.

- [ ] **Restrict the Web3Forms key to the site's domain** (dashboard setting, no code —
      only the account owner can do this).
      The key is public by design and that is correct (ADR 0015), but without a domain
      allowlist anyone can post from any origin and burn the 250/month quota. The
      `botcheck` honeypot is the only other line of defence.
      _Done when:_ the allowlist contains the production origin and a send from the live
      site still succeeds.

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
