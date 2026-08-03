import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Routes } from "@angular/router";
import { BlogPageComponent } from "./blog-page.component";
import { BlogPostPageComponent } from "./components/blog-post-page/blog-post-page.component";
import { BlogService } from "./services/blog.service";

const postTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const post = inject(BlogService).getBySlug(route.paramMap.get("slug") ?? "");
  return post ? `${post.title} - Dmytro Huliaiev` : "Post not found - Dmytro Huliaiev";
};

export const BLOG_ROUTES: Routes = [
  {
    path: "",
    component: BlogPageComponent,
    title: "Blog - Dmytro Huliaiev",
  },
  {
    path: ":slug",
    component: BlogPostPageComponent,
    title: postTitle,
  },
];
