import type { CaseStudy } from "./models/case-study.model";

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
    // The redesign and the e2e work, once case studies of their own, are its highlights.
    slug: "apomeds",
    title: "Apomeds",
    tagline: "An online doctor and pharmacy for seven European countries",
    cover: {
      src: "images/projects/apomeds.webp",
      alt: "The Apomeds website in a browser window: who the company is and how the service works.",
    },
    site: "https://apomeds.com",
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
    highlights: [
      {
        // From the epic's decision record and its commit history.
        title: "Redesigning a live page, one block at a time",
        period: "Sep – Oct 2026",
        text: [
          "I led the redesign of the prescription category page: built block by block by several developers behind one gate while the old page kept serving every store, then switched seven stores and nine languages over in a single release — and deleted the old templates the same day.",
          "Headlines are written whole for every category and language, never glued from fragments: German declines the condition differently after every preposition. A block whose copy has not arrived simply does not render. [TODO: what changed after release]",
        ],
      },
      {
        title: "Making payment flows safe to change",
        period: "[TODO: when]",
        text: [
          "Introduced Playwright end-to-end tests for the critical user and payment flows, so changes to them could ship without fear. [TODO: which flows, how they run in CI, what changed for the team]",
        ],
      },
    ],
    draft: true,
  },
  {
    // Built from the krakow-now-api repository: README, PROJECT_VISION, ARCHITECTURE (its
    // ADRs) and DEPLOYMENT. [TODO] marks what only the author knows. The repository and the
    // code call it Kraków Now; in production the bot is Kraków Events.
    slug: "krakow-events",
    kind: "side",
    title: "Kraków Events",
    tagline: "A curated guide to what is on in Kraków, in a Telegram bot",
    cover: {
      // [TODO: replace with a poster made from screenshots of the bot and the admin panel]
      src: "shared-images/krakow-events.jpg",
      alt: "Kraków Events: the city's landmarks at night, a concert crowd and a meetup.",
    },
    site: "https://t.me/KrakowEventsBot",
    summary:
      "A curator, not an aggregator: a thousand events a week come in from seventeen sources, are cleaned, de-duplicated and scored by AI, and a human picks the twenty or thirty worth an evening — delivered by a Telegram bot. Built alone, from the pipeline to the admin panel.",
    company: "Personal project",
    role: "Author · product, architecture, backend and admin panel",
    period: "Jun 2026 – present",
    stack: [
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Gemini",
      "Telegraf",
      "Next.js",
      "Docker",
    ],
    outcomes: [
      { value: "17", label: "event sources behind one connector interface" },
      { value: "141", label: "architecture decisions written down" },
      { value: "1 GB", label: "of RAM runs the API, the bot and the database" },
      { value: "150", label: "test files" },
    ],
    context: [
      "Kraków has more events than anyone can read about: listings, theatres, clubs, meetups, the city's own calendar. Newcomers, the Ukrainian community and people who want to practise a language need a short list they can trust, not a search engine over a thousand entries.",
      "Kraków Events collects everything and publishes only what is worth a person's evening. The target ratio is a thousand events collected a week, twenty to thirty approved and five to ten featured — and a list short enough to read in under a minute.",
      "[TODO: why you started it, and who uses it today]",
    ],
    constraints: [
      "One developer: product, backend, admin panel, deployment and the copy in the bot.",
      "A free Oracle Cloud VM with one CPU and 1 GB of RAM hosts everything.",
      "Every source speaks its own format — iCal feeds, a public GraphQL API, HTML pages — and any of them can change or vanish without notice.",
      "Trust is the product: one wrong date or a duplicate costs more than ten missing events.",
    ],
    decisions: [
      {
        title: "A modular monolith shaped as a pipeline",
        choice:
          "One NestJS application, with a module per stage — sources, ingestion, normalisation, de-duplication, scoring, moderation, publishing — each owning one step and talking to its neighbours through a typed contract. The Telegram bot and the admin panel are consumers of the same publishing service, never of the database.",
        tradeoff:
          "No queue between the stages: a long import runs in-process, so every outbound call needed a timeout and every run a way to be cancelled before a stuck source could hang the pipeline.",
      },
      {
        title: "Sources are plugins",
        choice:
          "A source is one connector behind a SourceConnector port, and raw payloads are stored verbatim, so re-importing never duplicates an event or loses a moderator's decision. Adding Resident Advisor or Kraków.travel touched nothing downstream.",
        tradeoff:
          "Seventeen connectors are seventeen things that break on someone else's schedule; filtering a national feed down to Kraków happens in each connector, not in one place.",
      },
      {
        title: "AI proposes, a human disposes",
        choice:
          "Gemini scores every event from one to ten, picks its category and writes a blurb, behind a ScoringProvider port with its reasoning and confidence stored on the event. A moderator approves, rejects or features; the bot never shows an event nobody has reviewed. Without an API key the pipeline still runs — events just wait unscored.",
        tradeoff:
          "Publishing is never fully automatic, so the list is only as fresh as the moderation queue. [TODO: how long moderation takes you a week]",
      },
      {
        title: "Long polling on a free VM",
        choice:
          "The bot polls Telegram instead of receiving webhooks, so production needs no domain and no TLS: Docker Compose runs PostgreSQL, a one-shot migration and the app. CI builds the image and pushes it to GHCR; the server only pulls it, because building on 1 GB of RAM took swap and patience.",
        tradeoff:
          "One small machine is one point of failure — a dead-man's-switch health check reports when the database or the bot stops answering.",
      },
    ],
    results: [
      "[TODO: is the bot live for everyone? users, weekly readers, events published per week]",
      "The repository is run like a team's: a written architecture, an ADR for every decision, strict TypeScript, CI on every pull request and a reviewer agent that holds changes to the principles.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
  },
];
