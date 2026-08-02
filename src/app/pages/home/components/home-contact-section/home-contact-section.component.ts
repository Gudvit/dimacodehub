import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { FooterComponent } from "../../../../components/footer/footer.component";

const CONTACT_EMAIL = "gudvitt@gmail.com";

@Component({
  selector: "app-home-contact-section",
  templateUrl: "./home-contact-section.component.html",
  styleUrl: "./home-contact-section.component.scss",
  imports: [FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContactSectionComponent {
  readonly backToTop = output<void>();

  readonly mailtoHref =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent("Project inquiry")}` +
    `&body=${encodeURIComponent("Hi Dmytro,\n\n")}`;
}
