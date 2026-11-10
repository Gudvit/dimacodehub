import type { CaseStudy } from "./models/case-study.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is page
 * order. `case-study.service.spec.ts` validates every entry.
 *
 * A side project is a case study with `kind: "side"`: the same tile on the home slide and
 * the same page, listed under Side projects.
 *
 * Drafts are visible on the dev server only. Placeholders in a draft are written as
 * `[TODO: …]` so they are easy to find and impossible to miss on the page.
 *
 * `comingSoon` publishes a draft's tile with a "Coming soon" page; the text stays here until
 * the case is finished, then both flags go and the case is published whole.
 */
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    // Roadmap 1.4. The work is under NDA: the text stays at the level of what kind of problem
    // and what kind of solution — no internal names, figures or architecture.
    slug: "apomeds",
    title: "Apomeds",
    tagline: "An online doctor and pharmacy for different European countries",
    cover: {
      src: "images/projects/apomeds.webp",
      alt: "The Apomeds hair-loss page: request a treatment or send in a prescription, rated 4.87 on Trusted Shops.",
    },
    site: "https://apomeds.com",
    summary:
      "Nearly six years on the frontend of an online doctor and pharmacy used across Europe: the back office it runs on, payments for each market and one consent solution across its websites.",
    company: "Apomedical · via IdeaSoft until 2021",
    role: "Senior Software Engineer · frontend",
    // Until Dec 2021 through IdeaSoft, then in-house.
    period: "Dec 2020 – present",
    stack: ["Angular", "NGXS", "Nx", "NestJS SSR", "Stencil", "TypeScript", "Vitest"],
    contributions: [
      {
        title: "Back office",
        items: [
          "Built new sections for the teams that run the business — customers, translations, settings and configuration among them — and document upload and download.",
          "Made the building blocks the sections share: data tables with sorting, filtering, paging, configurable columns and bulk actions; forms assembled from configuration, with their own validation and conditional fields; one set of modals and UI patterns.",
          "Implemented role-based access together with the backend developers.",
          "Moved the older modules onto one way of managing state, so every section works the same.",
        ],
      },
      {
        title: "Payments across markets",
        items: [
          "Integrated card, wallet and regional payment methods through backend APIs and the providers' SDKs, taking each new one from requirements to release.",
          "Made the methods on offer depend on the patient's country, while the flows behind them keep one design.",
          "Handled what happens after the pay button: statuses, errors and retries.",
        ],
      },
      {
        title: "Consent across domains",
        items: [
          "Built cookie consent by category — necessary, analytics, marketing — where an optional third-party script does not run until the visitor agrees to it.",
          "Saw that every website, domain and landing page would need the same again, researched the options and proposed one solution: a Stencil web component any of them can include.",
          "Carried the visitor's choice between domains — in a cookie where they share one, in the link where they don't — so nobody is asked twice.",
        ],
      },
      {
        title: "Modern Angular",
        items: [
          "Worked on the upgrades to newer Angular versions and refactored legacy modules along the way.",
          "Brought modern Angular, signals among it, into new code.",
        ],
      },
      {
        title: "Ownership",
        items: [
          "About two years in, became the main maintainer of the back office, responsible for its technical quality and how well it ages.",
          "Reviewed the frontend team's code and kept new modules on the agreed patterns.",
          "Made the calls on refactoring and shared components, and helped other developers through the hardest problems.",
        ],
      },
    ],
    results: [
      "A new back-office section is assembled from shared, configuration-driven tables and forms instead of being built from scratch.",
      "Patients in each market see the payment methods that fit their country.",
      "Cookie consent and third-party scripts are handled by one solution across all the websites, not a separate one on each.",
      "The back office stayed easy to maintain, extend and support as the product and the teams around it grew.",
    ],
    lessons: [
      "I would have moved the tables and forms into a library of their own, with documentation, much earlier: until then the team copied them as often as it reused them.",
      "Consent should have been a shared component from the first site, not from the moment the same problem turned up on several domains.",
    ],
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
      src: "images/projects/krakow-events.webp",
      alt: "Kraków Events: the moderation panel, a list of approved concerts with their scores, and beside it the bot in Telegram on a phone showing one of them with buttons for the website, directions, saving and a reminder.",
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
    task: [
      "Kraków has more events than anyone can read about, and newcomers, the Ukrainian community and people practising a language need a short list they can trust. The bot had to turn about a thousand events a week from seventeen sources into the twenty or thirty worth an evening — built and run by one person on a free VM with 1 GB of RAM.",
      "[TODO: why you started it, and who uses it today]",
    ],
    contributions: [
      "Designed a modular monolith in NestJS shaped as a pipeline — sources, ingestion, normalisation, de-duplication, scoring, moderation, publishing — each stage behind a typed contract.",
      "Built seventeen source connectors (iCal feeds, a public GraphQL API, HTML pages) behind one port; raw payloads are kept verbatim, so a re-import never duplicates an event or loses a moderator's decision.",
      "Added AI scoring with Gemini — a score, a category and a blurb per event — while a human approves every event before the bot shows it.",
      "Built the Telegram bot on Telegraf and the Next.js moderation panel, both reading from one publishing service, never from the database.",
      "Deployed with Docker Compose: long polling instead of webhooks, so no domain or TLS; images built in CI and pulled to the server; a dead-man's-switch health check.",
    ],
    results: [
      "[TODO: is the bot live for everyone? users, weekly readers, events published per week]",
      "The API, the bot and the database run in 1 GB of RAM.",
      "141 architecture decisions written down, 150 test files, CI on every pull request and a reviewer agent that holds changes to the principles.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
    comingSoon: true,
  },
  {
    // Built from the Agendo-Booking-Widget repository: its code and its history (my commits
    // run Oct 2019 – Aug 2021, through IdeaSoft). [TODO] marks what only the author knows.
    slug: "agendo",
    title: "Agendo",
    tagline: "An online booking widget any business can put on its own website",
    cover: {
      src: "images/projects/agendo.webp",
      alt: "The Agendo website, “Alltid enkelt och tydligt för dina kunder”: four kinds of booking — a meeting room by the hour, a storage unit by the month, a time with a specialist and a group course with its schedule.",
    },
    summary:
      "Two years on the booking widget of a Swedish scheduling platform: one script tag puts a book button on a business's own website, and the booking — service, resource, time, sign-in and payment — runs in an Angular app inside an iframe. I took over a codebase begun in 2016 and added several buttons per page, branded buttons, payment links and a rework of how the widget learns its language.",
    company: "Agendo · via IdeaSoft",
    role: "Angular Developer",
    period: "Oct 2019 – Aug 2021",
    stack: ["Angular", "NgRx", "RxJS", "TypeScript", "postMessage", "Angular Material"],
    task: [
      "Agendo sells online booking to businesses in Sweden — rooms by the hour, storage by the month, a specialist's time, group courses — and their customers book on the business's own website. One script tag adds a book button, and the booking runs in an Angular app inside an iframe. I took over that widget, a codebase begun in 2016, on websites nobody on the team controls.",
      "[TODO: what the business needed from the widget when you joined]",
    ],
    contributions: [
      "Kept the whole booking in an iframe that talks to the host page only through a small postMessage protocol, so neither side's styles or scripts can break the other.",
      "Made one loader serve every book button on a page, so a business can put one next to each service.",
      "Added branded buttons styled from the business's profile, with a plain button in the page's language when the profile cannot load — booking never disappears.",
      "Built payment links: the widget rebuilds a booking from a hash and opens straight at the payment step, on any device.",
      "Fixed the payment step for mobile browsers inside the iframe, and reworked how the widget learns its language.",
    ],
    results: [
      "[TODO: what changed for the business — bookings, payments through links, support load]",
      "270+ commits over two years on a codebase I took over.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
    comingSoon: true,
  },
  {
    // [TODO] The cover is from modniy-ostrov.com; the text is to be written by the author.
    slug: "modniy-ostriv",
    title: "Modniy Ostriv",
    tileTitle: "MO",
    tagline: "A wholesale online store of a Ukrainian clothing manufacturer",
    cover: {
      src: "images/projects/modniy-ostrov.webp",
      alt: "The Modniy Ostriv store: a catalogue of women's clothing sold wholesale from five items, under the banner of its Fall Muse mid-season collection.",
    },
    site: "https://modniy-ostrov.com/ua",
    summary: "[TODO: the result in one sentence]",
    company: "[TODO: the client, and the company you worked through]",
    role: "[TODO: your role]",
    period: "[TODO: when]",
    stack: ["[TODO: the stack]"],
    task: ["[TODO: what the store was for, and what made it hard]"],
    contributions: ["[TODO: what you did, starting with a verb]"],
    results: ["[TODO: what came of it]"],
    draft: true,
    comingSoon: true,
  },
  {
    // Built from the vault-document repository: README and its ADRs. [TODO] marks what only
    // the author knows. The vault is private: no `site`, and a cover only with synthetic data.
    slug: "document-vault",
    kind: "side",
    title: "Document Vault",
    tagline: "A private vault for a family's documents and medical history",
    // Not the app itself: a drawn outline of it, with no text and no records, while its
    // design is still changing.
    cover: {
      src: "images/projects/document-vault.webp",
      alt: "An outline of the vault: cards for a passport, medical records, insurance, an expiry date, a document and a pet, and a Telegram reminder.",
    },
    summary:
      "A family's passports, insurance, vaccinations and medical history in one private web app: profiles for each person and pet, a medical timeline, full-text search, expiry tracking with reminders to the family's Telegram group, and encrypted backups that are proven to restore.",
    company: "Personal project",
    role: "Author",
    period: "Sep 2026",
    stack: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS"],
    task: [
      "A family's paperwork is scattered: passports in a drawer, scans in a mailbox, test results in a clinic's portal, a pet's vaccinations on a card. The vault had to keep all of it in one private place, by person, and warn before anything expires — for the most sensitive data a family has, on a free plan that keeps no backups.",
      "[TODO: why you built it, and who in the family uses it]",
    ],
    contributions: [
      "Built the app on Next.js and Supabase with invitation-only accounts: sign-up, anonymous sign-in and OAuth are off, and access-control tests guard it.",
      "Sent uploads of up to 20 MB from the browser straight into a private bucket, around the server's request limits; a Postgres function saves the record in one transaction, and pressing Save again never creates a duplicate.",
      "Moved reminders into the database: pg_cron and an Edge Function send what is due to the family's Telegram group, each reminder claimed before it is sent, so none goes out twice.",
      "Wrote encrypted backups of every row, account and file, with a restore drill that rebuilds them in a throwaway Supabase and compares every checksum.",
    ],
    results: [
      "[TODO: is the family using it, and for what]",
      "Every link to a stored file expires in 15 minutes; one encrypted file holds the whole vault.",
      "Seven architecture decisions written down, pull requests, CI on every push, and six test suites run against a real local Supabase.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
    comingSoon: true,
  },
];

/**
 * Case studies taken off the list for now, kept whole to come back: nothing reads this array,
 * so they are neither shown nor prerendered. LingoPath gave its place to another project.
 */
export const SHELVED_CASE_STUDIES: readonly CaseStudy[] = [
  {
    // Built from the productivity-bot repository: README, ROADMAP, CHANGELOG and its ADRs.
    // [TODO] marks what only the author knows. Lingua was its early name and is not listed;
    // its picture stays in public/ because the bot's share card loads it from main.
    slug: "lingopath",
    kind: "side",
    title: "LingoPath",
    tagline: "Learn Polish and English in a Telegram bot",
    cover: {
      src: "images/projects/lingopath.webp",
      alt: "LingoPath: Big Ben and Kraków's Cloth Hall on either side of a river at sunset, with flashcards rising from an open book.",
    },
    site: "https://t.me/LingoPathBot",
    summary:
      "A Telegram bot for a few minutes of Polish or English a day: spaced repetition over 7,600 words graded by CEFR level, a 30-day English course, short Polish grammar tips and a streak that forgives one missed day. Built alone, from the word lists to the deployment.",
    company: "Personal project",
    role: "Author · product, content, backend and deployment",
    period: "May 2026 – present",
    stack: ["Node.js", "TypeScript", "Telegraf", "SQLite", "Luxon", "Docker", "GitHub Actions"],
    task: [
      "A language sticks when it is practised a little every day, and the place people already open every day is a messenger. LingoPath had to teach Polish and English in a few minutes a day inside Telegram — on a free VM with 1 GB of RAM and no paid APIs at run time.",
      "[TODO: why you started it, and who it is for — newcomers to Poland, the Ukrainian community?]",
    ],
    contributions: [
      "Built a modular monolith on Telegraf and SQLite: the bot and a minute-by-minute scheduler in one process, with delivery made idempotent so a reminder is never sent twice.",
      "Prepared 7,600+ words graded A1 to C2, a 30-day English course and Polish grammar tips as reviewed JSON, with about 2,100 Polish audio clips generated once and committed.",
      "Designed a streak counted from the days actually studied, in the user's own time zone, with a Streak Freeze that forgives one missed day.",
      "Separated the interface language (four of them) from the learning language, with a validator that holds every button to Telegram's 28-character limit.",
    ],
    results: [
      "[TODO: how many people use it, how many study daily, the longest streak]",
      "41 architecture decisions written down, a changelog for operators, CI on every pull request and sixty smoke-test files, over 228 commits in four months.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
  },
];
