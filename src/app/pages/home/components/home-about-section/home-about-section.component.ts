import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AnimatedTextComponent } from "../../../../components/animated-text/animated-text.component";
import { HeadlineRevealDirective } from "../../../../components/animated-text/headline-reveal.directive";

@Component({
  selector: "app-home-about-section",
  templateUrl: "./home-about-section.component.html",
  styleUrl: "./home-about-section.component.scss",
  imports: [AnimatedTextComponent, HeadlineRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAboutSectionComponent {}
