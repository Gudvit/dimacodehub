import type { SideProject } from "./models/side-project.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is page
 * order. `side-project.service.spec.ts` validates every entry.
 *
 * A side project that has grown a page of its own lives in `case-studies.ts` with
 * `kind: "side"` (Kraków Events); this list holds the ones told in a card.
 *
 * Drafts are visible on the dev server only. Placeholders are written as `[TODO: …]`, as in
 * the case studies.
 */
export const SIDE_PROJECTS: readonly SideProject[] = [
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
