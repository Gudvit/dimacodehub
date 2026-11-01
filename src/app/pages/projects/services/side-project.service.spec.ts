import { describe, expect, it } from "vitest";
import { SIDE_PROJECTS } from "../side-projects";

describe("side projects", () => {
  it("gives each side project a unique slug", () => {
    const slugs = SIDE_PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every side project renderable by the projects page", () => {
    for (const project of SIDE_PROJECTS) {
      expect(project.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.tagline.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
      // Relative, or it ignores the base href and 404s on GitHub Pages.
      expect(project.image).not.toMatch(/^\//);
      for (const link of project.links) {
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("publishes no placeholders", () => {
    for (const project of SIDE_PROJECTS.filter((entry) => !entry.draft)) {
      expect(JSON.stringify(project), project.slug).not.toContain("[TODO");
    }
  });
});
