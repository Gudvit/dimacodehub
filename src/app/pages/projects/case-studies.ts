import type { CaseStudy } from "./models/case-study.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is page
 * order. `case-study.service.spec.ts` validates every entry.
 *
 * A side project is a case study with `kind: "side"`: the same poster on the projects page and
 * the same page, listed under Side projects.
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
    // Built from the Agendo-Booking-Widget repository: its code and its history (my commits
    // run Oct 2019 – Aug 2021, through IdeaSoft). [TODO] marks what only the author knows.
    slug: "agendo",
    title: "Agendo",
    tagline: "An online booking widget any business can put on its own website",
    cover: {
      src: "images/projects/agendo.webp",
      alt: "The Agendo website: four kinds of booking — a meeting room by the hour, a storage unit by the month, a time with a specialist and a group course with its schedule.",
    },
    summary:
      "Two years on the booking widget of a Swedish scheduling platform: one script tag puts a book button on a business's own website, and the booking — service, resource, time, sign-in and payment — runs in an Angular app inside an iframe. I took over a codebase begun in 2016 and added several buttons per page, branded buttons, payment links and a rework of how the widget learns its language.",
    company: "Agendo · via IdeaSoft",
    role: "Angular Developer",
    period: "Oct 2019 – Aug 2021",
    stack: ["Angular", "NgRx", "RxJS", "TypeScript", "postMessage", "Angular Material"],
    outcomes: [
      { value: "1", label: "script tag puts booking on any website" },
      { value: "5", label: "steps from choosing a service to paying" },
      { value: "2016", label: "the year the codebase I took over was started" },
      { value: "270+", label: "of my commits over two years" },
    ],
    context: [
      "Agendo sells online booking to businesses in Sweden, and the booking is not only of appointments: a meeting room by the hour, a storage unit by the month until cancelled, a time with a specialist, a group course with a schedule and a waiting list. [TODO: who the clients are — and whether all of this already existed in 2019–2021] Their customers book on the business's own website, not on Agendo's.",
      "The widget is what makes that work: a small loader script adds a book button to the page, and pressing it opens the booking itself — choose a service or a course, a resource, a time, sign in or sign up, confirm and pay — in an Angular app running inside an iframe.",
      "[TODO: what the state of the widget was when you joined, and what the business needed from it]",
    ],
    constraints: [
      "The widget lives on websites nobody on the team controls: any CSS, any scripts, any CMS.",
      "A codebase begun in 2016 by other developers, on Angular and NgRx, with the built bundle committed to the repository.",
      "Booking and payment had to work inside an iframe on phones, where mobile browsers are least forgiving.",
      "[TODO: team size, deadlines, how releases happened]",
    ],
    decisions: [
      {
        title: "An iframe, not a script on the page",
        choice:
          "The loader only creates an iframe and the button; the whole booking runs in its own document. The host page's styles cannot break the widget, the widget's cannot break the page, and the two talk only through a small event protocol over postMessage.",
        tradeoff:
          "Everything that crosses the boundary has to be a message, and mobile browsers treat iframes their own way — the payment step needed fixes for phones that a plain page would not have.",
      },
      {
        title: "Many buttons, one widget",
        choice:
          "One loader on a page serves every element that matches its selector, so a business can put a book button next to each service. The button's look comes from the business's profile, fetched by the site's domain; if that request fails, a plain button in the page's language is shown, so booking never disappears.",
        tradeoff:
          "Every page view costs a request before the button appears, and a business is recognised by its domain — a site moved to a new domain loses its styling until the profile is updated.",
      },
      {
        title: "Pay later, from a link",
        choice:
          "A booking can be paid from a link that carries a hash. The widget fetches the booking by that hash and rebuilds its state — the customer, the appointment, the time, the quantity — then opens straight at the payment step, on any device.",
        tradeoff:
          "Every step's store had to accept being entered in the middle, not only in order, and the link works only while the booking it points to is still payable.",
      },
    ],
    results: [
      "[TODO: what changed for the business — bookings, payments through links, support load]",
    ],
    lessons: ["[TODO: what you would do differently]"],
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
  {
    // Built from the productivity-bot repository: README, ROADMAP, CHANGELOG and its ADRs.
    // [TODO] marks what only the author knows. Lingua was its early name and is not listed;
    // its picture stays in public/ because the bot's share card loads it from main.
    slug: "lingopath",
    kind: "side",
    title: "LingoPath",
    tagline: "Learn Polish and English in a Telegram bot",
    cover: {
      src: "shared-images/lingopath.jpg",
      alt: "LingoPath: London and Kraków joined by a glowing path of flashcards, under the words Learn Polish & English.",
    },
    site: "https://t.me/LingoPathBot",
    summary:
      "A Telegram bot for a few minutes of Polish or English a day: spaced repetition over 7,600 words graded by CEFR level, a 30-day English course, short Polish grammar tips and a streak that forgives one missed day. Built alone, from the word lists to the deployment.",
    company: "Personal project",
    role: "Author · product, content, backend and deployment",
    period: "May 2026 – present",
    stack: ["Node.js", "TypeScript", "Telegraf", "SQLite", "Luxon", "Docker", "GitHub Actions"],
    outcomes: [
      { value: "7,600+", label: "words in two languages, graded A1 to C2" },
      { value: "30", label: "days in the English course: words, reading, writing, video" },
      { value: "4", label: "interface languages: English, Polish, Ukrainian, Russian" },
      { value: "41", label: "architecture decisions written down" },
    ],
    context: [
      "A language sticks when it is practised a little every day, and the place people already open every day is a messenger. LingoPath lives in Telegram: a reminder at the hour you choose, in your own time zone, then a short session of words — each one known, hard or new, and brought back on a spaced-repetition schedule.",
      "Learning English, you also get a 30-day course: words, idioms and phrasal verbs, practice, a short article to read, sentences to write and a video, with a weekly test and a final exam. Learning Polish, you get grammar hacks and common mistakes, and every word can be heard aloud.",
      "[TODO: why you started it, and who it is for — newcomers to Poland, the Ukrainian community?]",
    ],
    constraints: [
      "One developer: product, word lists, copy in four languages, backend and operations.",
      "A free Oracle Cloud VM with 1 GB of RAM, and no paid APIs at run time.",
      "Telegram is the whole interface: buttons, inline keyboards and messages — a button label cannot run past 28 characters.",
      "A streak is a promise: a reminder must never arrive twice, and a day must never be counted that nobody studied.",
    ],
    decisions: [
      {
        title: "One process, one SQLite file",
        choice:
          "A modular monolith on Telegraf: the bot handlers and a minute-by-minute scheduler share one Node.js process, and everything is stored in SQLite in WAL mode. Delivery is made idempotent by markers in the database, so a missed tick sends a reminder late but never twice. Schema migrations run at startup.",
        tradeoff:
          "One machine is one failure domain: when the bot is down, so is the scheduler — and the database cannot grow past a single node.",
      },
      {
        title: "Content is reviewed by hand, not generated",
        choice:
          "The word lists, the 30 course days and the grammar tips are JSON files in the repository, checked before they ship. Pronunciation is generated once — about 2,100 Polish clips — and committed, so the bot plays it without calling anything at run time.",
        tradeoff:
          "Every new word is a commit, a fresh batch of audio and a deploy — and the Polish voice is synthetic, because there is no free human-recorded source.",
      },
      {
        title: "A streak is derived, not stored",
        choice:
          "The streak is counted from the days a person actually studied, in their own time zone. A Streak Freeze protects one missed day within a three-day window without ever recording it as studied, and the rewards — a freeze at 25, 50 and 100 days, a card to share every ten — are worked out when a session is recorded, not by a job at midnight, so a redeploy overnight cannot lose one.",
        tradeoff:
          "Two missed days in a row are still a break. It costs some users their run, and keeps the number honest.",
      },
      {
        title: "The interface language is not the learning language",
        choice:
          "What you read the bot in (English, Polish, Ukrainian or Russian) and what you learn (Polish or English) are two separate settings, chosen at the first start. A Ukrainian speaker learns Polish with buttons in Ukrainian.",
        tradeoff:
          "Every message and button exists four times over, and a validator holds each label to Telegram's length.",
      },
    ],
    results: [
      "[TODO: how many people use it, how many study daily, the longest streak]",
      "The repository is run like a team's: an ADR for every decision, a changelog for operators, CI on every pull request and sixty smoke-test files, over 228 commits in four months.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
  },
  {
    // Built from the vault-document repository: README and its ADRs. [TODO] marks what only
    // the author knows. The vault is private: no `site`, and a cover only with synthetic data.
    slug: "document-vault",
    kind: "side",
    title: "Document Vault",
    tagline: "A private vault for a family's documents and medical history",
    // [TODO: cover — a screenshot filled with made-up records, never real ones]
    summary:
      "A family's passports, insurance, vaccinations and medical history in one private web app: profiles for each person and pet, a medical timeline, full-text search, expiry tracking with reminders to the family's Telegram group, and encrypted backups that are proven to restore.",
    company: "Personal project",
    role: "Author",
    period: "Sep 2026",
    stack: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS"],
    outcomes: [
      { value: "15 min", label: "lifetime of every link to a stored file" },
      { value: "1", label: "encrypted file holds every row, account and document" },
      { value: "7", label: "architecture decisions written down" },
      { value: "6", label: "test suites run against a real local Supabase" },
    ],
    context: [
      "A family's paperwork is scattered: passports in a drawer, scans in a mailbox, test results in a clinic's portal, a pet's vaccinations on a card. The vault keeps all of it in one place, by person: documents with their files, a medical timeline that links to them, and a list of what expires soon.",
      "Expiring documents are the point. Each category has its own lead time, a reminder can be snoozed or closed by a renewal, and the reminders arrive in the family's Telegram group, so nobody has to open the app to remember a passport.",
      "[TODO: why you built it, and who in the family uses it]",
    ],
    constraints: [
      "The most sensitive data a family has — medical records and identity documents.",
      "Supabase's free plan keeps no backups, and no plan backs up stored files.",
      "Scans of 20 MB, while Server Actions cap a request at 1 MB and Vercel at 4.5 MB.",
      "Storage cannot take part in a database transaction.",
    ],
    decisions: [
      {
        title: "Invitation-only accounts",
        choice:
          "Sign-up, anonymous sign-in and every OAuth provider are off; an administrator creates each account, with passwords of twelve characters or more, and access-control tests guard it. Every signed-in account is a trusted family member.",
        tradeoff:
          "Everyone sees and can change everything. Splitting the data per person later means an owner column and stricter policies in a new migration.",
      },
      {
        title: "Uploads go around the server, saves are atomic",
        choice:
          "Files go from the browser straight into a private bucket; a Postgres function then saves the record in one transaction and checks the file really exists. The form picks the record's id on the first attempt, so pressing Save again after a lost response finishes the same save instead of creating a second one.",
        tradeoff:
          "A file can outlive a failed save, so files are deleted only through a cleanup queue, and only when no record can point at them.",
      },
      {
        title: "Backups made by hand, and proven",
        choice:
          "One command writes an encrypted file with every row, every family account and every stored file, with a checksum for each. A restore drill starts a throwaway Supabase, restores into it and compares every count and checksum — a backup that has never passed a drill is not proof of anything.",
        tradeoff:
          "Backups happen only when someone runs the command, and without the passphrase none of them can be restored.",
      },
      {
        title: "Reminders live in the database",
        choice:
          "pg_cron calls an Edge Function every hour; the database decides what is due, with the same rules as the app, and claims each reminder before it is sent, so two runs can never send one twice. The bot token never reaches the app, GitHub or a laptop.",
        tradeoff:
          "The rules for what is due exist twice — in SQL and in TypeScript — and a test has to hold them to each other.",
      },
    ],
    results: [
      "[TODO: is the family using it, and for what]",
      "The repository is run like a team's: an ADR for every decision, pull requests, CI on every push, and tests against a real database that refuse to run against anything but a local one.",
    ],
    lessons: ["[TODO: what you would do differently]"],
    draft: true,
  },
];
