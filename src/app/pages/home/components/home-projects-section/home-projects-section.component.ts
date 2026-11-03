import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AnimatedTextComponent } from "../../../../components/animated-text/animated-text.component";
import { HeadlineRevealDirective } from "../../../../components/animated-text/headline-reveal.directive";
import { CaseStudyService } from "../../../projects/services/case-study.service";
import { ProjectGridComponent } from "../../../projects/components/project-grid/project-grid.component";

/**
 * The projects as a home slide — the site's only list of them (`/projects` redirects here):
 * a grid of pictures filling one screen, each leading to its case study. Deferred in
 * `home-page.component.html`, like the writing section, so the case studies stay out of the
 * initial bundle.
 */
@Component({
  selector: "app-home-projects-section",
  templateUrl: "./home-projects-section.component.html",
  styleUrl: "./home-projects-section.component.scss",
  imports: [AnimatedTextComponent, HeadlineRevealDirective, ProjectGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProjectsSectionComponent {
  readonly projects = inject(CaseStudyService).getAll();
}
