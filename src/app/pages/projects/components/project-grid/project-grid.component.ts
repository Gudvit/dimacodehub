import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { CaseStudy } from "../../models/case-study.model";
import { ProjectTileComponent } from "../project-tile/project-tile.component";

/** More than this many no longer fit one screen; the grid then falls back to scrolling rows. */
const FITS_ONE_SCREEN = 6;

/**
 * The projects as a grid of pictures, for the home slide: the first large on the left, the
 * rest as tiles beside it, laid out by how many there are (1 to 6 each get their own
 * composition). On a desktop it fills the height the slide gives it; below that it is a
 * compact block — two columns of short tiles under a wide first one — so the slide still
 * fits one screen on a phone.
 */
@Component({
  selector: "app-project-grid",
  templateUrl: "./project-grid.component.html",
  styleUrl: "./project-grid.component.scss",
  imports: [ProjectTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.is-overflowing]": "overflowing()" },
})
export class ProjectGridComponent {
  readonly projects = input.required<readonly CaseStudy[]>();
  readonly overflowing = computed(() => this.projects().length > FITS_ONE_SCREEN);
}
