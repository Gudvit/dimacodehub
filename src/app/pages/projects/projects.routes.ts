import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router, Routes } from "@angular/router";
import { CaseStudyPageComponent } from "./components/case-study-page/case-study-page.component";
import { CaseStudyService } from "./services/case-study.service";

const caseStudyTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const study = inject(CaseStudyService).getBySlug(route.paramMap.get("slug") ?? "");
  return study ? `${study.title} - Dmytro Huliaiev` : "Project not found - Dmytro Huliaiev";
};

export const PROJECTS_ROUTES: Routes = [
  {
    // The list of projects is a slide of the home page now; the old address still lands
    // there, so links to `/projects` from outside keep working.
    path: "",
    pathMatch: "full",
    redirectTo: () => inject(Router).createUrlTree(["/"], { fragment: "projects" }),
  },
  {
    path: ":slug",
    component: CaseStudyPageComponent,
    title: caseStudyTitle,
  },
];
