import { describe, expect, it } from "vitest";
import { BlogService } from "./blog.service";

describe("BlogService", () => {
  const service = new BlogService();

  it("exposes every post", () => {
    expect(service.getAll().length).toBeGreaterThan(0);
  });

  it("gives each post a unique slug", () => {
    const slugs = service.getAll().map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves a post by slug", () => {
    const [first] = service.getAll();
    expect(service.getBySlug(first!.slug)).toBe(first);
  });

  it("returns undefined for an unknown slug", () => {
    expect(service.getBySlug("does-not-exist")).toBeUndefined();
  });

  it("keeps every post renderable by the post page", () => {
    for (const post of service.getAll()) {
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.readingTime).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(post.date))).toBe(false);
      expect(post.sections.length).toBeGreaterThan(0);
      for (const section of post.sections) {
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });
});
