import { Injectable, isDevMode } from "@angular/core";
import { BLOG_POSTS } from "../blog-posts";
import { BlogPost } from "../models/blog-post.model";

@Injectable({ providedIn: "root" })
export class BlogService {
  // A production build never sees a draft: not in the list, not by its URL.
  private readonly posts = BLOG_POSTS.filter((post) => !post.draft || isDevMode());

  getAll(): readonly BlogPost[] {
    return this.posts;
  }

  /** The newest published posts first, by `date` — not by array position. */
  getLatest(count: number): readonly BlogPost[] {
    return this.posts
      .filter((post) => !post.draft)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, count);
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this.posts.find((p) => p.slug === slug);
  }
}
