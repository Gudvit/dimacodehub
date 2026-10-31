import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ThemeService } from "./theme.service";

/** The header's light / dark switch; the logic lives in `ThemeService`. */
@Component({
  selector: "app-theme-toggle",
  templateUrl: "./theme-toggle.component.html",
  styleUrl: "./theme-toggle.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themes = inject(ThemeService);

  readonly theme = this.themes.theme;
  readonly label = this.themes.switchLabel;

  toggle(): void {
    this.themes.toggle();
  }
}
