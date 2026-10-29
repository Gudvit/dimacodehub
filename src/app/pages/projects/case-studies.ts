import { CaseStudy } from "./models/case-study.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is page
 * order. `case-study.service.spec.ts` validates every entry.
 *
 * Drafts are visible on the dev server only. Placeholders in a draft are written as
 * `[TODO: …]` so they are easy to find and impossible to miss on the page.
 */
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    // Roadmap 1.4. Built from the two frontend repositories of the platform — their
    // architecture docs, decision records and history. [TODO] marks what only the author knows.
    slug: "telemedicine-platform-architecture",
    title: "The frontend of a European telemedicine platform",
    summary:
      "Nearly six years on the frontend of an online doctor-and-pharmacy platform: three brands, seven countries, server-rendered storefronts, an Angular checkout and consultation app, and one back office serving staff, partners and doctors — two Nx monorepos, taken from Angular 11 to 22.",
    company: "Apomedical",
    role: "Senior Software Engineer · frontend architecture",
    // Until Dec 2021 through IdeaSoft, then in-house.
    period: "Dec 2020 – present · via IdeaSoft until 2021",
    stack: ["Angular", "NGXS", "Nx", "NestJS SSR", "Stencil", "TypeScript", "Vitest"],
    outcomes: [
      { value: "100K+", label: "patients served across Europe" },
      { value: "3 × 7", label: "brands × countries on one codebase" },
      { value: "11 → 22", label: "Angular majors climbed on a 135K-line back office" },
      { value: "15", label: "payment providers behind one payment layer" },
    ],
    context: [
      "A patient fills in a medical questionnaire, a doctor reviews it and issues a prescription, a pharmacy ships the treatment — often as a subscription. Three brands sell this in seven countries and nine languages: Germany, Switzerland in German and French, the UK, Denmark, Sweden, Portugal and Lithuania.",
      "The frontend is two Nx monorepos. The storefront: server-rendered pages for SEO, an Angular app for the consultation, checkout and patient account, and a web-component library both of them use. The back office: one Angular app for orders, subscriptions, shipments, refunds, finance, the CMS and the doctors' prescription queue.",
      "[TODO: what it was like when you joined — and what hurt most: releases, bugs, the stuck Angular 11?]",
    ],
    constraints: [
      "Medicine: a questionnaire, a prescription and a payment must never break — and every country has its own rules, payment methods and copy.",
      "Product work never stops: architecture changes ship alongside features, by the same team.",
      "The back office had almost no automated tests, so every large change was verified by the type check, the build and a manual click-through.",
      "Backends are separate services owned by other teams, with no shared schema between them and the frontend.",
    ],
    decisions: [
      {
        title: "Server-rendered pages, an Angular app only where it pays",
        choice:
          "Content and SEO pages are rendered on the server (NestJS + Handlebars) with small per-page scripts; Angular runs only the stateful flows — consultation, checkout, account — which the server pages host. Shared UI is built once as Stencil web components that work on both sides.",
        tradeoff:
          "Two rendering stacks, and a host contract between them that had to become its own library once a second brand's site started hosting the same app.",
      },
      {
        title: "One back office, three deployments",
        choice:
          "Staff, the second brand and the doctors' cabinet run the same codebase; a runtime configuration file picks the brand, the navigation and the APIs, so the build that was tested is the build that ships to every environment. Switching the website inside the app reloads it, so one brand's data can never linger on another's screen.",
        tradeoff:
          "Role checks in the UI are visibility only — real authorisation stays with each service — and every feature has to be checked in three flavours.",
      },
      {
        title: "CMS schemas live in code",
        choice:
          "The page schemas the back office edits are templates in the storefront repository, served to the CMS editor over an API and rendered as dynamic forms. A content manager fills fields; the shape of a page is versioned and reviewed with the code that renders it.",
        tradeoff:
          "A new CMS field is a developer's change, not a click in the admin — and per-category copy travels through three repositories before it reaches a page.",
      },
      {
        title: "Upgrade as a ladder, not a rewrite",
        choice:
          "The back office went from Angular 11 to 22 one major at a time, each hop its own branch with Nx migrated in step, verified by the type check, a production build and a click-through of every domain. Blocking third-party libraries were solved on a spike first; one date picker that could not follow was vendored into the repository.",
        tradeoff:
          "Slow and manual, and it left debt on purpose — non-strict TypeScript and hundreds of components pinned to the old change detection — instead of rewriting 600 templates in the same pass.",
      },
    ],
    results: [
      "Both apps are on a current Angular, the back office on the esbuild builder, and both have Vitest in place to grow the test net. The storefront hosts a second brand's site on the same checkout and consultation app, with Nx boundaries that stop one brand's code from importing the other's.",
      "Thirty-five architecture decision records in the storefront and a documented back office mean a new developer reads why things are the way they are instead of asking. [TODO: anything you can measure — release cadence, onboarding time, incidents, page weight]",
    ],
    lessons: [
      "Staying on Angular 11 for four years turned a routine update into an eleven-step project. Upgrading every major as it lands is cheaper than any ladder.",
      "With no shared API schema, a renamed backend field surfaces only when someone opens the screen. A published schema or contract tests would have paid for themselves early. [TODO: confirm or replace with your own]",
    ],
    draft: true,
  },
  {
    // Roadmap 1.4. Built from the epic's decision record and its commit history; the
    // numbers are the ones the record states. What only the author knows is marked [TODO].
    slug: "category-page-redesign",
    title: "Redesigning a live page, one block at a time",
    summary:
      "Led the redesign of the prescription category page of a European online pharmacy: built block by block by several developers while the old page kept serving every store, then switched seven stores over in a single release.",
    company: "Apomedical",
    role: "Senior Software Engineer · led the epic",
    period: "Sep – Oct 2026",
    stack: ["NestJS SSR", "Handlebars", "TypeScript", "SCSS", "Webpack", "Headless CMS"],
    outcomes: [
      { value: "7", label: "stores switched over in one release" },
      { value: "9", label: "languages, copy written per locale" },
      { value: "0", label: "edits to the live page while it was rebuilt" },
      { value: "6 weeks", label: "from the decision record to release" },
    ],
    context: [
      "The category page of a European online pharmacy: server-rendered, live in seven stores and nine languages, and earning money every hour of the redesign.",
      "Earlier redesigns on the site — home, product, blog — had been big-bang swaps: the new template in and the old one deleted in a single commit. That works for one ticket. This one was an epic, split across several developers and sprints, and the repository had no feature-flag infrastructure at all.",
      "The page was also five templates rather than one, and its copy came from two pipelines with different owners: page chrome from the CMS, category content from the catalog feed.",
    ],
    constraints: [
      "The live page keeps serving traffic for the whole epic, and nothing built for the redesign may regress it.",
      "A redesign has to stay cheap to throw away: another redesign on the same site had been rejected at user acceptance and deleted wholesale.",
      "Several developers build the same page at the same time.",
      "Seven stores and nine languages, German among them — copy cannot be glued together from fragments.",
    ],
    decisions: [
      {
        title: "One gate, decided in one place",
        choice:
          "The new page got its own template and its own asset bundle, behind a single gate for demos and QA. The template and the bundle are resolved at different points of a request, so both consult one function instead of re-deriving the answer. Every page is served uncached, so a per-request switch cannot leak a variant to the wrong visitor.",
        tradeoff:
          "No store-by-store rollout: the epic shipped everywhere in one step, so every store's copy had to be verified by hand before the merge.",
      },
      {
        title: "The new page shows finished blocks only",
        choice:
          "It started as a copy of the live template, but carried-over blocks were dropped as soon as the first redesigned one landed: a page mixing old and new chrome cannot be reviewed — a designer cannot tell unfinished from broken. A block is one unit — markup, styles, view model and CMS copy — owned by one developer, and the shared files are lists with one line per block, so parallel work collides on different lines instead of shared structure.",
        tradeoff:
          "The preview was not the finished page until the last block landed, so SEO, analytics and the full-page design review all waited for the end of the epic.",
      },
      {
        title: "Headlines are written whole, per category",
        choice:
          "The code never assembles a headline from a category name and a CMS word. A placeholder was tried twice: filled from the full name it read “Treating Erectile dysfunction treatments”; filled from a short name it broke German, which declines the condition differently after every preposition. The copywriter writes the sentence, and it lives on the catalog category.",
        tradeoff:
          "The sentence is retyped for every category in every store, and one new category field touches three repositories — catalog service, feed adapter, website — before it reaches the page.",
      },
      {
        title: "Missing copy means no block",
        choice:
          "Each block's view model returns nothing when its copy is missing, so a store whose content has not arrived renders fewer blocks — never an empty heading, never another category's text. The product list is the exception: it loses only its heading, because hiding it would take the products off the page.",
        tradeoff:
          "A half-filled store is silent by design: nothing reports it, so checking it stays a manual step.",
      },
    ],
    results: [
      "On release day the gate was removed: the new page became the only prescription category page in every store at once, and the legacy templates — with the view-model fields only they used — were deleted, so the codebase did not keep two versions of the page.",
      "[TODO: what changed after release — conversion, bounce rate, page weight, bugs in the first weeks?]",
    ],
    lessons: [
      "[TODO: your hindsight — e.g. a report of half-filled stores would have replaced the manual check before the merge]",
    ],
    draft: true,
  },
  {
    // Roadmap 1.5. Built only from what the site already says about this work; every
    // number and detail still to confirm is marked [TODO].
    slug: "payment-flows-e2e",
    title: "Making payment flows safe to change",
    summary:
      "Introduced Playwright end-to-end tests for the critical user and payment flows of a healthcare platform, so the team could ship changes to them without fear. [TODO: the result in one line]",
    company: "Apomedical",
    role: "Senior Software Engineer",
    period: "[TODO: when] · Dec 2021 – present",
    stack: ["Angular", "Playwright", "NgRx", "CI"],
    outcomes: [
      { value: "[TODO]", label: "critical flows covered" },
      { value: "[TODO]", label: "production incidents in those flows" },
      { value: "[TODO]", label: "release frequency" },
    ],
    context: [
      "A business-critical Angular platform used by tens of thousands of people across Europe, where checkout and payments carry the revenue.",
      "[TODO: what was wrong before — manual regression? bugs reaching production? fear of touching the code?]",
    ],
    constraints: [
      "[TODO: e.g. no dedicated QA team]",
      "[TODO: e.g. third-party payment provider in the loop]",
      "[TODO: e.g. tests must run in CI under N minutes]",
    ],
    decisions: [
      {
        title: "Playwright over [TODO: the alternative]",
        choice: "[TODO: why Playwright]",
        tradeoff: "[TODO: what it cost]",
      },
      {
        title: "[TODO: e.g. which flows first]",
        choice: "[TODO]",
        tradeoff: "[TODO]",
      },
    ],
    results: ["[TODO: what changed for the team and the product]"],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
  },
];
