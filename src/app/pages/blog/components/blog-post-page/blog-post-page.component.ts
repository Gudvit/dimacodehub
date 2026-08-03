import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { BlogService } from "../../services/blog.service";

@Component({
  selector: "app-blog-post-page",
  templateUrl: "./blog-post-page.component.html",
  styleUrl: "./blog-post-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPageComponent {
  /** Bound from the `:slug` route param by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  private readonly blogService = inject(BlogService);
  private readonly meta = inject(Meta);

  readonly post = computed(() => this.blogService.getBySlug(this.slug()));

  constructor() {
    // The document title comes from the route resolver; this covers the sharing preview.
    effect(() => {
      const post = this.post();
      if (!post) {
        return;
      }

      this.meta.updateTag({ name: "description", content: post.preview });
      this.meta.updateTag({ property: "og:type", content: "article" });
      this.meta.updateTag({ property: "og:title", content: post.title });
      this.meta.updateTag({ property: "og:description", content: post.preview });
      this.meta.updateTag({ name: "twitter:title", content: post.title });
      this.meta.updateTag({ name: "twitter:description", content: post.preview });
    });
  }
}
