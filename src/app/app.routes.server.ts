import { inject } from "@angular/core";
import { RenderMode, ServerRoute } from "@angular/ssr";
import { BlogService } from "./pages/blog/services/blog.service";
import { CaseStudyService } from "./pages/projects/services/case-study.service";

/**
 * Every page is prerendered at build time into its own `index.html` (ADR 0019), so a
 * crawler that runs no JavaScript still gets the page's title, description and OG tags.
 * There is no server at runtime: GitHub Pages serves the files.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: "blog/:slug",
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(BlogService)
        .getAll()
        .map(({ slug }) => ({ slug })),
  },
  {
    // Drafts are filtered out in a production build, so they are never written to disk.
    path: "projects/:slug",
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(CaseStudyService)
        .getAll()
        .map(({ slug }) => ({ slug })),
  },
  {
    path: "",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "blog",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "projects",
    renderMode: RenderMode.Prerender,
  },
  {
    // Anything else is the client's business: the build emits an empty shell
    // (`index.csr.html`), which the deploy copies to `404.html`.
    path: "**",
    renderMode: RenderMode.Client,
  },
];
