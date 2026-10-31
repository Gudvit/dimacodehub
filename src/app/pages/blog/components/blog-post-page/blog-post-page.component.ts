import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../../../components/header/header.component";
import { FooterComponent } from "../../../../components/footer/footer.component";
import { PERSON, syncJsonLd } from "../../../../seo/json-ld";
import { syncPageMeta } from "../../../../seo/page-meta";
import { SITE_URL, ogImagePath, pageUrl } from "../../../../site";
import { BlogService } from "../../services/blog.service";
import { tableOfContents, TOC_MIN_ENTRIES } from "../../table-of-contents";
import { CodeBlockComponent } from "../code-block/code-block.component";

/**
 * A heading counts as the one being read once it is in the top third of the screen, below
 * the header: by then the reader's eyes are in its section.
 */
const ACTIVE_HEADING_LINE = 1 / 3;

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

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

  /** The heading the reader is in, highlighted in the contents list. */
  readonly activeId = signal<string | null>(null);

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

    afterNextRender(() => {
      // A deep link to a heading: the prerendered page may already be there, but hydration
      // and the entrance animation can move it, so land on it once more.
      const fragment = this.route.snapshot.fragment;
      if (fragment) {
        this.scrollToHeading(fragment, "auto");
      }
      this.trackActiveHeading();
    });
  }

  /**
   * The contents links change the URL through `routerLink`; scrolling is done here, so a
   * second click on the same entry still scrolls (the router ignores an unchanged URL).
   * `scroll-margin-top` on the headings keeps them clear of the fixed header.
   */
  scrollToHeading(id: string, behavior?: ScrollBehavior): void {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.headings()
      .find((heading) => heading.id === id)
      ?.scrollIntoView({ behavior: behavior ?? (reduceMotion ? "auto" : "smooth") });
  }

  private headings(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(".post-content__heading[id]"),
    );
  }

  /** A scroll listener coalesced into one frame, outside change detection (as in `app.ts`). */
  private trackActiveHeading(): void {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      );
      const line = (header || 0) + window.innerHeight * ACTIVE_HEADING_LINE;
      const headings = this.headings();
      // The last sections are often too short to bring their heading up to the line before
      // the page ends; at the bottom, the last heading on screen is the one being read.
      const root = document.documentElement;
      const atBottom =
        root.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= root.scrollHeight - 2;
      const reached = atBottom
        ? headings.filter((h) => h.getBoundingClientRect().top < window.innerHeight)
        : headings.filter((h) => h.getBoundingClientRect().top <= line);
      this.activeId.set(reached.at(-1)?.id ?? null);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    });
  }
}
