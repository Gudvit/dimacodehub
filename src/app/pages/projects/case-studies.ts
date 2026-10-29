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
