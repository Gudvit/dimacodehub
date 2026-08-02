import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { HomeAboutSectionComponent } from "./components/home-about-section/home-about-section.component";
import { HomeContactSectionComponent } from "./components/home-contact-section/home-contact-section.component";
import { HomeExperienceSectionComponent } from "./components/home-experience-section/home-experience-section.component";
import { HomeHeroSectionComponent } from "./components/home-hero-section/home-hero-section.component";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  imports: [
    HomeHeroSectionComponent,
    HomeAboutSectionComponent,
    HomeExperienceSectionComponent,
    HomeContactSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>("homeSlider");

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    // The slider must exist before a fragment can be scrolled into view.
    afterNextRender(() => {
      this.route.fragment
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((fragment) => this.scrollToFragment(fragment, "auto"));
    });
  }

  scrollToNextSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    const sections = Array.from(slider.querySelectorAll<HTMLElement>(".slide-section"));
    const currentTop = slider.scrollTop + this.getHeaderOffset() + 1;
    const nextSection = sections.find((section) => section.offsetTop > currentTop);

    if (!nextSection) {
      return;
    }

    slider.scrollTo({
      top: Math.max(0, nextSection.offsetTop - this.getHeaderOffset()),
      behavior: "smooth",
    });
  }

  scrollToContactsSection(): void {
    this.scrollToFragment("contacts", "smooth");
  }

  scrollToTop(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    slider.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  private scrollToFragment(fragment: string | null, behavior: ScrollBehavior): void {
    if (!fragment) {
      return;
    }

    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    // The fragment comes from the URL: `/#2024` is not a valid selector unescaped, and the
    // SyntaxError would kill the subscription this runs in.
    const target = slider.querySelector<HTMLElement>(`#${CSS.escape(fragment)}`);
    if (!target) {
      return;
    }

    slider.scrollTo({
      top: Math.max(0, target.offsetTop - this.getHeaderOffset()),
      behavior,
    });
  }

  private getHeaderOffset(): number {
    const header = document.querySelector<HTMLElement>(".site-header");
    return header?.offsetHeight ?? 0;
  }
}
