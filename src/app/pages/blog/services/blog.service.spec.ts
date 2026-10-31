import { describe, expect, it } from "vitest";
import { BLOG_POSTS } from "../blog-posts";
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

  it("lists the latest posts newest first", () => {
    const published = service.getAll().filter((post) => !post.draft);
    const latest = service.getLatest(2);
    expect(latest.length).toBe(Math.min(2, published.length));
    const newest = Math.max(...published.map((post) => Date.parse(post.date)));
    expect(Date.parse(latest[0]!.date)).toBe(newest);
    expect(Date.parse(latest[0]!.date)).toBeGreaterThanOrEqual(Date.parse(latest[1]!.date));
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

  it("leaves drafts out of the latest posts", () => {
    expect(service.getLatest(BLOG_POSTS.length).some((post) => post.draft)).toBe(false);
  });

  it("publishes no placeholders", () => {
    for (const post of BLOG_POSTS.filter((entry) => !entry.draft)) {
      expect(JSON.stringify(post), post.slug).not.toContain("[TODO");
    }
  });
});
