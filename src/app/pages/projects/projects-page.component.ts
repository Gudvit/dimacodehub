import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CaseStudyService } from "./services/case-study.service";

@Component({
  selector: "app-projects-page",
  templateUrl: "./projects-page.component.html",
  styleUrl: "./projects-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent {
  private readonly projects = inject(CaseStudyService).getAll();

  /** Client work, as posters. */
  readonly caseStudies = this.projects.filter((study) => study.kind !== "side");
  /** My own projects, as the same posters. */
  readonly sideProjects = this.projects.filter((study) => study.kind === "side");
}
