import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Routes } from "@angular/router";
import { ProjectsPageComponent } from "./projects-page.component";
import { CaseStudyPageComponent } from "./components/case-study-page/case-study-page.component";
import { CaseStudyService } from "./services/case-study.service";

const caseStudyTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const study = inject(CaseStudyService).getBySlug(route.paramMap.get("slug") ?? "");
  return study ? `${study.title} - Dmytro Huliaiev` : "Project not found - Dmytro Huliaiev";
};

export const PROJECTS_ROUTES: Routes = [
  {
    path: "",
    component: ProjectsPageComponent,
    title: "Projects - Dmytro Huliaiev",
  },
  {
    path: ":slug",
    component: CaseStudyPageComponent,
    title: caseStudyTitle,
  },
];
