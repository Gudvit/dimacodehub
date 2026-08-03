import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { LoaderComponent } from "../../components/loader/loader.component";

@Component({
  selector: "app-projects-page",
  templateUrl: "./projects-page.component.html",
  styleUrl: "./projects-page.component.scss",
  imports: [HeaderComponent, FooterComponent, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent {}
