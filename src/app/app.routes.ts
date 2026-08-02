import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home/home-page.component";
import { ProjectsPageComponent } from "./pages/projects/projects-page.component";

export const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
    title: "Dmytro Huliaiev - Senior Frontend Engineer",
  },
  {
    path: "projects",
    component: ProjectsPageComponent,
    title: "Projects - Dmytro Huliaiev",
  },
  {
    path: "blog",
    loadChildren: () => import("./pages/blog/blog.routes").then((m) => m.BLOG_ROUTES),
  },
  {
    path: "**",
    redirectTo: "",
    pathMatch: "full",
  },
];
