import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { PROFILES } from "../../site";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  // Read in the browser, so a deployment never shows the year it happened to be built in.
  readonly year = new Date().getFullYear();
  readonly profiles = PROFILES;
  readonly sourceHref = "https://github.com/Gudvit/dimacodehub";
}
