import { Injectable } from "@angular/core";
import { BLOG_POSTS } from "../blog-posts";
import { BlogPost } from "../models/blog-post.model";

@Injectable({ providedIn: "root" })
export class BlogService {
  private readonly posts = BLOG_POSTS;

  getAll(): readonly BlogPost[] {
    return this.posts;
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this.posts.find((p) => p.slug === slug);
  }
}
