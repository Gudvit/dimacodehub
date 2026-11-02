import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { CaseStudyService } from "./services/case-study.service";

@Component({
  selector: "app-projects-page",
  templateUrl: "./projects-page.component.html",
  styleUrl: "./projects-page.component.scss",
  imports: [HeaderComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent {
  /** Client work and side projects in one grid, in the order of `case-studies.ts`. */
  readonly projects = inject(CaseStudyService).getAll();

  /** The stand-in for a missing cover: `Document Vault` → `DV`, `Apomeds` → `A`. */
  initials(title: string): string {
    return title
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }
}
