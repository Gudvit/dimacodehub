import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CaseStudyService } from "./services/case-study.service";
import { SideProjectService } from "./services/side-project.service";

@Component({
  selector: "app-projects-page",
  templateUrl: "./projects-page.component.html",
  styleUrl: "./projects-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent {
  readonly caseStudies = inject(CaseStudyService).getAll();
  readonly sideProjects = inject(SideProjectService).getAll();
}
