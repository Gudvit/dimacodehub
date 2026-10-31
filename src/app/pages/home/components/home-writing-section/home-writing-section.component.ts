import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { BlogService } from "../../../blog/services/blog.service";

/** How many posts the home page teases; the rest live on `/blog`. */
const LATEST_POSTS = 3;

@Component({
  selector: "app-home-writing-section",
  templateUrl: "./home-writing-section.component.html",
  styleUrl: "./home-writing-section.component.scss",
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeWritingSectionComponent {
  readonly posts = inject(BlogService).getLatest(LATEST_POSTS);
}
