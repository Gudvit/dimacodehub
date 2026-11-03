import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AnimatedTextComponent } from "../../../../components/animated-text/animated-text.component";
import { HeadlineRevealDirective } from "../../../../components/animated-text/headline-reveal.directive";
import { BlogService } from "../../../blog/services/blog.service";
import { countTags } from "../../../blog/tags";

/** How many posts the home page teases; the rest live on `/blog`. */
const LATEST_POSTS = 3;

@Component({
  selector: "app-home-writing-section",
  templateUrl: "./home-writing-section.component.html",
  styleUrl: "./home-writing-section.component.scss",
  imports: [AnimatedTextComponent, DatePipe, HeadlineRevealDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeWritingSectionComponent {
  private readonly blog = inject(BlogService);

  /** The newest first: it gets the large card. */
  readonly posts = this.blog.getLatest(LATEST_POSTS);
  /** Every tag of the published posts, each a way into the filtered blog list. */
  readonly topics = countTags(this.blog.getPublished().flatMap((post) => post.tags));
}
