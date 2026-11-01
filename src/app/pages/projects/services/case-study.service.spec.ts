import { describe, expect, it } from "vitest";
import { CASE_STUDIES } from "../case-studies";
import { CaseStudyService } from "./case-study.service";

describe("CaseStudyService", () => {
  const service = new CaseStudyService();

  it("gives each case study a unique slug", () => {
    const slugs = CASE_STUDIES.map((study) => study.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves a case study by slug", () => {
    for (const study of service.getAll()) {
      expect(service.getBySlug(study.slug)).toBe(study);
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(service.getBySlug("does-not-exist")).toBeUndefined();
  });

  it("keeps every case study renderable by the case page", () => {
    for (const study of CASE_STUDIES) {
      expect(study.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(study.title.length).toBeGreaterThan(0);
      expect(study.summary.length).toBeGreaterThan(0);
      expect(study.stack.length).toBeGreaterThan(0);
      expect(study.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(study.outcomes.length).toBeLessThanOrEqual(4);
      expect(study.context.length).toBeGreaterThan(0);
      expect(study.constraints.length).toBeGreaterThan(0);
      expect(study.decisions.length).toBeGreaterThan(0);
      expect(study.results.length).toBeGreaterThan(0);
      for (const decision of study.decisions) {
        expect(decision.choice.length).toBeGreaterThan(0);
        expect(decision.tradeoff.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps covers, sites and highlights usable", () => {
    for (const study of CASE_STUDIES) {
      // Relative, or it ignores the base href and 404s on GitHub Pages.
      if (study.cover) {
        expect(study.cover.src).not.toMatch(/^\//);
        expect(study.cover.alt.length).toBeGreaterThan(0);
      }
      if (study.site) {
        expect(study.site).toMatch(/^https:\/\//);
      }
      for (const highlight of study.highlights ?? []) {
        expect(highlight.title.length).toBeGreaterThan(0);
        expect(highlight.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("publishes no placeholders", () => {
    for (const study of CASE_STUDIES.filter((entry) => !entry.draft)) {
      expect(JSON.stringify(study), study.slug).not.toContain("[TODO");
    }
  });
});
