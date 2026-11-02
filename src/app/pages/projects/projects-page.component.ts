import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CaseStudyService } from "./services/case-study.service";
import { SideProjectService } from "./services/side-project.service";

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
  /** My own projects with a page of their own, as posters at the top of Side projects. */
  readonly sidePosters = this.projects.filter((study) => study.kind === "side");
  readonly sideProjects = inject(SideProjectService).getAll();
}
