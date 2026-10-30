import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";

interface ExternalLink {
  readonly label: string;
  readonly href: string;
}

const PROFILES: readonly ExternalLink[] = [
  { label: "GitHub", href: "https://github.com/Gudvit" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dmytro-huliaiev-1320aba7/" },
  { label: "Telegram", href: "https://t.me/gudvit" },
  { label: "X", href: "https://x.com/dimasss4889" },
];

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
