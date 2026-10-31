import type { BlogPost } from "./models/blog-post.model";

export interface TocEntry {
  /** The heading's `id`, and the fragment that links to it: `/blog/x#why-signals`. */
  readonly id: string;
  readonly text: string;
}

/** Below this many headings a post is short enough to read without a contents list. */
export const TOC_MIN_ENTRIES = 3;

/**
 * One entry per section heading, in order. The ids are derived from the text, so a link to
 * a heading survives as long as the heading does; a repeated heading gets a numeric suffix.
 */
export function tableOfContents(post: BlogPost): TocEntry[] {
  const seen = new Map<string, number>();
  return post.sections.flatMap(({ heading }) => {
    if (!heading) {
      return [];
    }
    const base =
      heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return [{ id: count === 1 ? base : `${base}-${count}`, text: heading }];
  });
}
