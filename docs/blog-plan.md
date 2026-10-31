# Blog plan

Post ideas taken from this repository's own decisions (`docs/architecture/`). Each one
already has its proof in the code, so a post is mostly telling the story and picking the
snippets. Roadmap item 4.3.

The order is a suggestion: the strongest stories first, the ones with a mistake or a reversal
in them, because those are what nobody else can write. Every post fits the current content
model (`heading`, `paragraphs`, `code` with `typescript` / `html` / `scss` / `shell`).

Existing tags to reuse: `Angular`, `Architecture`, `NgRx`, `State Management`, `AI`,
`Frontend`, `UX`. New ones below are marked _new_.

---

## 1. Lighthouse said my animations were slow. They weren't.

- **Sources:** ADR 0021, commit `37fcffa`.
- **Tags:** Frontend, Performance _new_, Lighthouse _new_.
- **Hook:** home LCP of 4.4 s, a hero animation that looked guilty, and a fix that was about
  to ship for the wrong reason.
- **Points:**
  - How Lighthouse's simulated throttling (lantern) estimates LCP from the network graph,
    and why transfer size matters more than anything on the main thread.
  - The local test server sent files uncompressed; GitHub Pages gzips. The audit was
    measuring a site that doesn't exist.
  - The experiment: animation removed → still slow; gzip on → 95–98 with the original code.
  - Takeaway: make the test stand behave like production before trusting any number;
    budgets (100 for a11y/SEO/best practices, 90 for performance) and why they differ.
- **Code:** the `COMPRESSED` set and `gzipSync` in `scripts/lighthouse.ts`.
- **About:** 6 min.

## 2. A contact form that never says "sent" when it wasn't

- **Sources:** ADR 0010 → ADR 0015 (a decision reversed).
- **Tags:** Angular, UX, Testing _new_.
- **Hook:** I removed the form once, because a fake one is worse than none. Then I brought
  it back on one condition.
- **Points:**
  - Why the first version lost: a form that shows success without a confirmed send.
  - Web3Forms from a static site: a public access key that is not a secret, and why.
  - `ok` **and** `success: true`, a 15 s `AbortSignal.timeout`, `status` as a signal.
  - The e2e test for the failure path, so nobody quietly breaks this later.
  - The honeypot instead of a captcha; `mailto` kept as the fallback.
- **Code:** `postToWeb3Forms()`, the failure-path e2e test.
- **About:** 6 min.

## 3. Zoneless Angular: what actually changes in your code

- **Sources:** ADR 0002, 0006, 0012.
- **Tags:** Angular, Architecture.
- **Hook:** removing zone.js takes one line. What then breaks takes longer to explain.
- **Points:**
  - A plain field only renders when something else triggers change detection, which is why
    it "works" in development and fails later.
  - `@HostListener('scroll')` schedules a CD cycle per event; `addEventListener` inside
    `afterNextRender()` plus `requestAnimationFrame` coalescing.
  - Wheel and touch gestures in the experience section: framework-free arithmetic
    (`role-gestures.ts`), unit-tested without TestBed.
  - What you get back: a smaller bundle and change detection you can reason about.
- **Code:** `trackCursor()` in `app.ts`; `WheelNavigator` from `role-gestures.ts`.
- **About:** 7 min.

## 4. Prerendering an Angular site for GitHub Pages

- **Sources:** ADR 0003, 0011, 0013, 0019.
- **Tags:** Angular, SEO _new_.
- **Hook:** link previews showed the home page for every post, because Pages has no
  server to answer `/blog/:slug`.
- **Points:**
  - `outputMode: "static"`; slugs from the services via `getPrerenderParams`.
  - `404.html` must be the empty client shell (`index.csr.html`), not the prerendered home.
  - `--base-href` and why every asset link is relative.
  - The CSP vs incremental hydration: generated inline scripts can't be hashed, so it
    stays off.
  - Per-page meta that cleans up after itself (`syncPageMeta`).
- **Code:** `app.routes.server.ts`; the 404 step from `deploy.yml`.
- **About:** 7 min.

## 5. Scroll-driven animations, and the overflow trap

- **Sources:** ADR 0025.
- **Tags:** CSS _new_, Frontend, UX.
- **Hook:** `animation-timeline: view()` did nothing at all, and no error said why.
- **Points:**
  - `view()` follows the nearest scroll container; `overflow: hidden` creates one.
  - A named `view-timeline` per slide and `slide-reveal($order)` for staggering.
  - Above the fold is never hidden, so LCP doesn't wait on an animation (links to post 1).
  - Reduced motion and browsers without support: content is simply there.
- **Code:** `_motion.scss`.
- **About:** 5 min.

## 6. A dark theme where components don't know which theme is on

- **Sources:** ADR 0020, 0007.
- **Tags:** CSS _new_, Architecture.
- **Points:**
  - One set of roles, two sets of values; `--brand-*` custom properties.
  - Helpers that mix the custom property (`color-mix(in srgb, var(--brand-ink) 40%, transparent)`),
    so translucent shades written before the dark theme followed it untouched.
  - No flash on load: a tiny inline script, allowed by its CSP hash, and a unit test that
    keeps the hash in step.
  - The hero as a deliberate exception.
- **Code:** `ink()` from `_brand.scss`; the theme script in `index.html`.
- **About:** 5 min.

## 7. A syntax highlighter in about 100 lines, without innerHTML

- **Sources:** ADR 0023.
- **Tags:** Angular, Frontend.
- **Points:**
  - Why not Prism or Shiki: bundle size, and `innerHTML` under a strict CSP.
  - Sticky regular expressions (`/y`), ordered rules, tokens rendered as `<span>`s via
    interpolation.
  - "It colours, it doesn't parse": a misread construct is the wrong colour, never broken.
  - The invariant test: joining the tokens gives back the source.
  - The same post covers the table of contents: heading ids and the active-section line.
- **Code:** `highlight.ts` (it's short enough to show almost all of it).
- **About:** 6 min.

## 8. ⌘K with a native `<dialog>`

- **Sources:** ADR 0024.
- **Tags:** Angular, UX, Accessibility _new_.
- **Points:**
  - What `showModal()` gives for free: focus trap, Esc, inert background, focus return.
  - The ARIA combobox: focus stays in the input, `aria-activedescendant` points at the option.
  - Ranking as a pure function (label prefix, word prefix, the rest) and its tests.
  - `@defer (on idle)`, and a service in the main bundle so the button works before the chunk.
- **Code:** `filterCommands()`; the template's combobox attributes.
- **About:** 6 min.

## 9. Documentation that fails the build

- **Sources:** ADR 0009, 0016, 0017, the colophon page.
- **Tags:** Testing _new_, Architecture.
- **Points:**
  - The colophon describes the repository, and `colophon.spec.ts` checks it: rename an ADR
    or a CI step and the unit tests fail until the page agrees.
  - A coverage floor, not a target: set below the baseline so it catches drops, not
    to chase a number.
  - Content validation as unit tests (`blog.service.spec.ts`).
  - The full CI gate: format, lint, typecheck, unit with coverage, e2e, Lighthouse.
- **About:** 5 min.

## 10. Page views without a tracking script

- **Sources:** ADR 0022.
- **Tags:** Frontend, Privacy _new_.
- **Points:**
  - Why GoatCounter: no cookies, so no banner.
  - Skipping `count.js`: one `sendBeacon` per `NavigationEnd` that changes the path.
  - Only production counts: the prerender, dev server, e2e and Lighthouse send nothing.
  - The CSP gains one `connect-src` origin, and a test keeps it equal to the endpoint.
- **Code:** `countPageViews()`.
- **About:** 4 min.

---

## Leftovers

Smaller ideas that could become short notes or sections of the posts above:

- Scrolling to the top on navigation, but not on Back, `#heading` or `?tag=` (`scroll-to-top.ts`).
- Skipping the view transition when only the fragment changes.
- A solution-style `tsconfig` with `erasableSyntaxOnly` for scripts Node runs by stripping types.
- A live signal graph with run counters on the colophon: a possible companion to post 3.
