/**
 * The facts the colophon page states about the repository. They are hand-written, and
 * `colophon.spec.ts` holds them to the source of truth: the ADR files, the CI workflow and
 * the coverage floor in `angular.json`. Numbers that change with every commit — bundle
 * size, test counts — are not here; the build measures them (`scripts/build-stats.ts`).
 */

export const REPOSITORY_URL = "https://github.com/Gudvit/dimacodehub";

export interface StackItem {
  readonly name: string;
  readonly detail: string;
}

export const STACK: readonly StackItem[] = [
  {
    name: "Angular 22",
    detail:
      "Standalone components, signals for every piece of state, and no zone.js — change detection runs only when a signal says so.",
  },
  {
    name: "Prerendered, then hydrated",
    detail:
      "Every route is written to its own HTML file at build time, so a page arrives complete with its metadata; Angular adopts that DOM instead of rendering it again.",
  },
  {
    name: "Static hosting, no backend",
    detail:
      "GitHub Pages serves files and nothing else. Content lives in TypeScript; the contact form and a cookie-free page-view beacon are the only outbound requests.",
  },
  {
    name: "Hand-written SCSS",
    detail:
      "No UI framework. One palette of custom properties drives both themes; motion is CSS and the browser's View Transitions.",
  },
];

export interface Adr {
  readonly number: string;
  readonly title: string;
  readonly file: string;
}

/**
 * Mirrors `docs/architecture/`; the spec fails when a record is added or renamed. Titles are
 * the files' headings without the Markdown code marks.
 */
export const ADRS: readonly Adr[] = [
  ["0001", "Angular 21 with standalone components and signals", "angular-standalone-signals"],
  ["0002", "Zoneless change detection", "zoneless-change-detection"],
  ["0003", "GitHub Pages hosting: static build, base-href, SPA fallback", "github-pages-hosting"],
  [
    "0004",
    "Routing: lazy blog, route params as inputs, titles in routes",
    "routing-lazy-blog-input-binding",
  ],
  ["0005", "Content lives in code, not in a CMS or markdown files", "content-in-code"],
  ["0006", "State is local signals only, with no global store", "local-signal-state"],
  [
    "0007",
    "Styling: hand-written SCSS with CSS variables, no UI framework",
    "scss-no-ui-framework",
  ],
  ["0008", "Testing: Vitest for logic, Playwright for behaviour", "vitest-and-playwright"],
  [
    "0009",
    "One workflow: quality is a precondition for deployment",
    "ci-quality-gate-before-deploy",
  ],
  ["0010", "Contact through mailto instead of a form", "mailto-instead-of-contact-form"],
  ["0011", "Asset placement: public/ versus src/images/", "asset-placement"],
  [
    "0012",
    "CSS animations and direct DOM access instead of Angular abstractions",
    "css-animations-and-dom-access",
  ],
  ["0013", "Page metadata: a static baseline plus route-driven titles", "seo-metadata"],
  [
    "0014",
    "Accessibility comes from markup and is checked automatically",
    "accessibility-approach",
  ],
  ["0015", "A working contact form through Web3Forms", "contact-form-via-web3forms"],
  [
    "0016",
    "Unit tests run through the Angular builder, so components can be tested",
    "component-tests-through-the-angular-builder",
  ],
  ["0017", "CI enforces a global unit coverage floor", "unit-coverage-floor"],
  ["0018", "Dependency updates are deliberate and manual", "manual-dependency-updates"],
  ["0019", "Every route is prerendered at build time", "build-time-prerender"],
  ["0020", "A light and a dark theme from one set of tokens", "light-and-dark-theme"],
  ["0021", "Lighthouse budgets in CI", "lighthouse-budgets"],
  ["0022", "Cookie-free page views through GoatCounter", "cookie-free-analytics"],
].map(([number, title, slug]) => ({ number, title, file: `${number}-${slug}.md` }));

export interface PipelineStep {
  /** The step's `name:` in `.github/workflows/deploy.yml`. */
  readonly step: string;
  readonly detail: string;
}

/** Coverage floor, as enforced in `angular.json` (ADR 0017). */
export const COVERAGE_FLOOR = { lines: 50, functions: 55 } as const;

export const PIPELINE: readonly PipelineStep[] = [
  { step: "Audit production dependencies", detail: "npm audit on what ships to the browser." },
  { step: "Format check", detail: "Prettier: one style, no review comments about it." },
  {
    step: "Lint",
    detail: "ESLint over TypeScript and templates, including the accessibility rules.",
  },
  {
    step: "Unit tests with coverage",
    detail: `Vitest through the Angular builder, with a floor of ${COVERAGE_FLOOR.lines}% of lines and ${COVERAGE_FLOOR.functions}% of functions.`,
  },
  {
    step: "E2E tests",
    detail: "Playwright on a desktop and a mobile viewport, asserting on real page copy.",
  },
  {
    step: "Build",
    detail: "Prerenders every route, then writes the sitemap, the RSS feed and sharing images.",
  },
  {
    step: "Check the prerendered pages and feeds",
    detail: "Each post has its own HTML, sharing image and feed entry — or nothing deploys.",
  },
  {
    step: "Lighthouse budgets",
    detail:
      "Mobile Lighthouse on the home page, the blog, a post and this page: accessibility, best practices and SEO must score 100, performance at least 80.",
  },
  {
    step: "Deploy to GitHub Pages",
    detail: "Only from main, and only after every step above has passed.",
  },
];

export const PERFORMANCE: readonly string[] = [
  "HTML for every route is ready before the first byte of JavaScript runs.",
  "The blog, the projects and this page are lazy routes; the home page's post list is a deferred block that loads as it scrolls into view.",
  "No UI framework, no animation library, no zone.js — the dependencies are Angular, RxJS and the forms package.",
  "The hero photo is AVIF with a JPEG fallback, and the Urbanist font is the only third-party asset.",
];
