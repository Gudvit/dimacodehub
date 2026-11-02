import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import type { CaseStudy } from "../../models/case-study.model";

/**
 * A project as a picture: its cover and nothing else, until hover or keyboard focus darkens
 * it and the name rises into the middle. On a touch screen, which has no hover, the name
 * stays at the foot of the picture. The tile fills whatever box its host is given; the
 * grid around it decides the size. The name is an `<h3>`, under the home slide's heading.
 */
@Component({
  selector: "app-project-tile",
  templateUrl: "./project-tile.component.html",
  styleUrl: "./project-tile.component.scss",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTileComponent {
  readonly study = input.required<CaseStudy>();
  /** The large tile of a grid: a bigger name, and its picture loads first. */
  readonly featured = input(false);

  /** The stand-in for a missing cover: `Document Vault` → `DV`, `Apomeds` → `A`. */
  initials(title: string): string {
    return title
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }
}
