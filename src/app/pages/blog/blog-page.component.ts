import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { BlogService } from "./services/blog.service";
import { countTags, type TagCount } from "./tags";

@Component({
  selector: "app-blog-page",
  templateUrl: "./blog-page.component.html",
  styleUrl: "./blog-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPageComponent {
  private readonly blogService = inject(BlogService);
  readonly posts = this.blogService.getAll();

  /** Every tag in use, the most common first. */
  readonly tags: readonly TagCount[] = countTags(this.posts.flatMap((post) => post.tags));

  /** The `?tag=` query parameter, bound by `withComponentInputBinding()`. */
  readonly tag = input<string>();

  // The page is prerendered without a query, so the browser first hydrates the full list
  // and only then applies the filter; filtering during hydration would not match the HTML.
  private readonly hydrated = signal(false);

  readonly selectedTag = computed(() => (this.hydrated() ? this.tag() || null : null));

  readonly visiblePosts = computed(() => {
    const tag = this.selectedTag();
    return tag ? this.posts.filter((post) => post.tags.includes(tag)) : this.posts;
  });

  constructor() {
    afterNextRender(() => this.hydrated.set(true));
  }
}
