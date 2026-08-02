import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { HeaderComponent } from "../../../../components/header/header.component";

@Component({
  selector: "app-home-hero-section",
  templateUrl: "./home-hero-section.component.html",
  styleUrl: "./home-hero-section.component.scss",
  imports: [HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeroSectionComponent {
  readonly scrollNext = output<void>();
  readonly scrollToContacts = output<void>();
}
