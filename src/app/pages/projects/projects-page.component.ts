import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoadingDirective } from "../../directives/loading.directive";

@Component({
  selector: "app-projects-page",
  templateUrl: "./projects-page.component.html",
  styleUrl: "./projects-page.component.scss",
  imports: [HeaderComponent, FooterComponent, LoadingDirective],
})
export class ProjectsPageComponent {}
