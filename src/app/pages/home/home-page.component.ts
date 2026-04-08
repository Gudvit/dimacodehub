import { Component, ElementRef, viewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterLink,
  ],
})
export class HomePageComponent {
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>('homeSlider');

  scrollToNextSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    slider.scrollTo({
      top: slider.scrollTop + slider.clientHeight,
      behavior: 'smooth',
    });
  }
}
