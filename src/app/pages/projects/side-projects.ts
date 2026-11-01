import type { SideProject } from "./models/side-project.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is page
 * order. `side-project.service.spec.ts` validates every entry.
 *
 * Drafts are visible on the dev server only. Placeholders are written as `[TODO: …]`, as in
 * the case studies.
 */
export const SIDE_PROJECTS: readonly SideProject[] = [
  {
    // From the krakow-now-api README; the public links and the status are the author's.
    slug: "krakow-now",
    name: "Kraków Now",
    tagline: "A curated guide to what is on in Kraków, delivered by a Telegram bot.",
    description:
      "A curator, not an aggregator: events from many sources pass through ingestion, normalisation, de-duplication and AI scoring, and a human approves what reaches readers — trust beats completeness. A NestJS modular monolith shaped as a pipeline over PostgreSQL. [TODO: confirm, and what you want a visitor to notice]",
    image: "shared-images/krakow-events.jpg",
    stack: ["NestJS", "TypeScript", "PostgreSQL", "Prisma", "Claude API", "Telegram"],
    status: "In progress",
    links: [],
    draft: true,
  },
  {
    slug: "lingopath",
    name: "LingoPath",
    tagline: "[TODO: one line — learning Polish and English?]",
    description: "[TODO: why it exists, who it is for, and what is interesting in how it is built]",
    image: "shared-images/lingopath.jpg",
    stack: ["[TODO]"],
    status: "In progress",
    links: [],
    draft: true,
  },
  {
    slug: "lingua",
    name: "Lingua",
    tagline: "[TODO: one line — a separate project, or an early LingoPath?]",
    description: "[TODO: why it exists, who it is for, and what is interesting in how it is built]",
    image: "shared-images/lingua.jpg",
    stack: ["[TODO]"],
    status: "In progress",
    links: [],
    draft: true,
  },
];
