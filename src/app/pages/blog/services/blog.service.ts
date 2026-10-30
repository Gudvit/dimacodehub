import { Injectable } from "@angular/core";
import { BLOG_POSTS } from "../blog-posts";
import { BlogPost } from "../models/blog-post.model";

@Injectable({ providedIn: "root" })
export class BlogService {
  private readonly posts = BLOG_POSTS;

  getAll(): readonly BlogPost[] {
    return this.posts;
  }

  /** The newest posts first, by `date` — not by array position. */
  getLatest(count: number): readonly BlogPost[] {
    return [...this.posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, count);
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this.posts.find((p) => p.slug === slug);
  }
}
