import { AfterViewInit, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
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
})
export class HomePageComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>("homeSlider");

  ngAfterViewInit(): void {
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fragment) => this.scrollToFragment(fragment));
  }

  scrollToNextSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    slider.scrollTo({
      top: slider.scrollTop + slider.clientHeight,
      behavior: "smooth",
    });
  }

  private scrollToFragment(fragment: string | null): void {
    if (!fragment) {
      return;
    }

    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    const target = slider.querySelector<HTMLElement>(`#${fragment}`);
    if (!target) {
      return;
    }

    slider.scrollTo({
      top: target.offsetTop,
      behavior: "smooth",
    });
  }
}
