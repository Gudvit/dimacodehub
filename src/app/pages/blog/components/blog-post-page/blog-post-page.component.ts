import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { trackHeadings } from "../../../../navigation/heading-tracker";
import { PERSON, syncJsonLd } from "../../../../seo/json-ld";
import { syncPageMeta } from "../../../../seo/page-meta";
import { SITE_URL, ogImagePath, pageUrl } from "../../../../site";
import { BlogService } from "../../services/blog.service";
import { tableOfContents, TOC_MIN_ENTRIES } from "../../table-of-contents";
import { CodeBlockComponent } from "../code-block/code-block.component";

@Component({
  selector: "app-blog-post-page",
  templateUrl: "./blog-post-page.component.html",
  styleUrl: "./blog-post-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink, DatePipe, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPostPageComponent {
  /** Bound from the `:slug` route param by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  private readonly blogService = inject(BlogService);

  readonly post = computed(() => this.blogService.getBySlug(this.slug()));

  /** Heading ids by section index, for the template; empty when the post has none. */
  readonly toc = computed(() => {
    const post = this.post();
    return post ? tableOfContents(post) : [];
  });
  readonly showToc = computed(() => this.toc().length >= TOC_MIN_ENTRIES);
  readonly headingIds = computed(() => {
    const ids = this.toc().map((entry) => entry.id);
    return (this.post()?.sections ?? []).map((section) => (section.heading ? ids.shift() : null));
  });

  private readonly headings = trackHeadings(".post-content__heading[id]");

  /** The heading the reader is in, highlighted in the contents list. */
  readonly activeId = this.headings.activeId;

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

  scrollToHeading(id: string, behavior?: ScrollBehavior): void {
    this.headings.scrollTo(id, behavior);
  }
}
