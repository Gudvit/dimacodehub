import { Injectable, isDevMode } from "@angular/core";
import { CASE_STUDIES } from "../case-studies";
import { CaseStudy } from "../models/case-study.model";

@Injectable({ providedIn: "root" })
export class CaseStudyService {
  // A production build never sees a draft: not in the list, not by its URL.
  private readonly cases = CASE_STUDIES.filter((study) => !study.draft || isDevMode());

  getAll(): readonly CaseStudy[] {
    return this.cases;
  }

  getBySlug(slug: string): CaseStudy | undefined {
    return this.cases.find((study) => study.slug === slug);
  }
}
