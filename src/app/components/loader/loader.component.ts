import { ChangeDetectionStrategy, Component } from "@angular/core";

/**
 * The brand mark, spinning while its ring draws itself: the "coming soon" sign of a case
 * study that is not written up yet. The gradient id is per instance, so two on a page
 * cannot collide; its colours are the theme's ink and wine.
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
