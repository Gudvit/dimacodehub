import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { PERSON, syncJsonLd } from "../../../../seo/json-ld";
import { syncPageMeta } from "../../../../seo/page-meta";
import { SITE_URL, ogImagePath, pageUrl } from "../../../../site";
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

  readonly post = computed(() => this.blogService.getBySlug(this.slug()));

  constructor() {
    // The document title comes from the route resolver; this covers the sharing preview.
    syncPageMeta(() => {
      const post = this.post();
      return (
        post && {
          title: post.title,
          description: post.preview,
          image: SITE_URL + ogImagePath(`blog/${post.slug}`),
        }
      );
    });

    syncJsonLd(() => {
      const post = this.post();
      return (
        post && {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.preview,
          datePublished: post.date,
          keywords: post.tags.join(", "),
          url: pageUrl(`blog/${post.slug}`),
          image: SITE_URL + ogImagePath(`blog/${post.slug}`),
          author: PERSON,
        }
      );
    });
  }
}
