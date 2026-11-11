import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import type { CaseStudy } from "../../models/case-study.model";
import { CaseStudyService } from "../../services/case-study.service";
import { CaseStudyPageComponent } from "./case-study-page.component";

// A case of its own, so the placeholder stays covered whether or not a real case is coming
// soon at the moment.
const SOON: CaseStudy = {
  slug: "soon",
  title: "Soon",
  tagline: "A case that is not written up yet",
  summary: "Not written up yet.",
  company: "Personal project",
  role: "Author",
  period: "2026",
  stack: ["Angular"],
  task: ["The draft text of the task."],
  contributions: ["Built the thing."],
  results: ["It works."],
  draft: true,
  comingSoon: true,
};

describe("CaseStudyPageComponent", () => {
  let fixture: ComponentFixture<CaseStudyPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: "**", children: [] }]),
        { provide: CaseStudyService, useValue: { getBySlug: () => SOON, getAll: () => [SOON] } },
      ],
    });
    fixture = TestBed.createComponent(CaseStudyPageComponent);
    fixture.componentRef.setInput("slug", "soon");
  });

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? "";
  }

  it("shows a case that is coming soon as the placeholder, not its draft", async () => {
    await fixture.whenStable();

    expect(text()).toContain("Coming soon");
    expect(text()).not.toContain("The draft text of the task.");
    expect(fixture.nativeElement.querySelector("#task")).toBeNull();
  });

  it("shows the draft of a coming-soon case at ?draft on the dev server", async () => {
    fixture.componentRef.setInput("draft", "");
    await fixture.whenStable();

    expect(text()).not.toContain("Coming soon");
    expect(text()).toContain("The draft text of the task.");
    expect(fixture.nativeElement.querySelector('[role="note"]')?.textContent).toContain("Draft");
  });
});
