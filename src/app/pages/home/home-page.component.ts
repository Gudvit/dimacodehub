import { Component, ElementRef, viewChild } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterLink } from "@angular/router";
import { HomeAboutSectionComponent } from "./components/home-about-section/home-about-section.component";
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
    FooterComponent,
    RouterLink,
  ],
})
export class HomePageComponent {
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>("homeSlider");

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
}
