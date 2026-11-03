import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home/home-page.component";

export const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
    title: "Dmytro Huliaiev - Senior Frontend Engineer",
  },
  {
    // Home stays eager - it is the first screen. Projects and case studies load on demand
    // like the blog.
    path: "projects",
    loadChildren: () => import("./pages/projects/projects.routes").then((m) => m.PROJECTS_ROUTES),
  },
  {
    path: "blog",
    loadChildren: () => import("./pages/blog/blog.routes").then((m) => m.BLOG_ROUTES),
  },
  {
    path: "colophon",
    loadComponent: () =>
      import("./pages/colophon/colophon-page.component").then((m) => m.ColophonPageComponent),
    title: "How this site is built - Dmytro Huliaiev",
  },
  {
    path: "**",
    redirectTo: "",
    pathMatch: "full",
  },
];
