import { ChangeDetectionStrategy, Component } from "@angular/core";

/**
 * The brand spinner. Replaces the old `[appLoading]` directive, which built the same SVG
 * with `innerHTML`, kept its styles in the global stylesheet and reused one hardcoded
 * gradient id. The gradient id is per instance here, so two spinners on a page cannot
 * collide.
 */
@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrl: "./loader.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  private static instances = 0;

  readonly gradientId = `loader-gradient-${(LoaderComponent.instances += 1)}`;
  readonly gradientRef = `url(#${this.gradientId})`;
}
