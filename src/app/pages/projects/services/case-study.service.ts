import { Injectable, isDevMode } from "@angular/core";
import { CASE_STUDIES } from "../case-studies";
import { CaseStudy } from "../models/case-study.model";

@Injectable({ providedIn: "root" })
export class CaseStudyService {
  // A production build never sees a draft — unless it is listed as coming soon, which shows
  // its tile and a placeholder page, never its text.
  private readonly cases = CASE_STUDIES.filter(
    (study) => !study.draft || study.comingSoon || isDevMode(),
  );

  getAll(): readonly CaseStudy[] {
    return this.cases;
  }

  getBySlug(slug: string): CaseStudy | undefined {
    return this.cases.find((study) => study.slug === slug);
  }
}
