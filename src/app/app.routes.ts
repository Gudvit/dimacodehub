import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home/home-page.component";

export const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
    title: "Dmytro Huliaiev - Senior Frontend Engineer",
  },
  {
    // Home stays eager - it is the first screen. A placeholder does not belong in that
    // bundle, so it loads on demand like the blog.
    path: "projects",
    loadComponent: () =>
      import("./pages/projects/projects-page.component").then((m) => m.ProjectsPageComponent),
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
