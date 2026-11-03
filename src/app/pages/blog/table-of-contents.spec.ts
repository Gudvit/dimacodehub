import { describe, expect, it } from "vitest";
import type { BlogPost } from "./models/blog-post.model";
import { BlogService } from "./services/blog.service";
import { tableOfContents } from "./table-of-contents";

const post = (headings: (string | undefined)[]): BlogPost => ({
  slug: "x",
  title: "X",
  date: "2026-01-01",
  tags: [],
  preview: "",
  readingTime: 1,
  sections: headings.map((heading) => ({ heading, paragraphs: ["p"] })),
});

describe("tableOfContents", () => {
  it("lists the section headings with ids made from their text", () => {
    expect(tableOfContents(post([undefined, "Why signals?", "Zoneless: what changes"]))).toEqual([
      { id: "why-signals", text: "Why signals?" },
      { id: "zoneless-what-changes", text: "Zoneless: what changes" },
    ]);
  });

  it("keeps ids unique when a heading repeats", () => {
    const ids = tableOfContents(post(["Summary", "Summary", "!!!"])).map((entry) => entry.id);
    expect(ids).toEqual(["summary", "summary-2", "section"]);
  });

  it("gives every published heading a unique id", () => {
    for (const published of new BlogService().getAll()) {
      const ids = tableOfContents(published).map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
