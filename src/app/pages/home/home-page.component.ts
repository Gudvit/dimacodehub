import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { RouterLink } from "@angular/router";
import { AnimatedTextComponent } from "../../components/animated-text/animated-text.component";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterLink,
    AnimatedTextComponent,
  ],
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>("homeSlider");
  readonly aboutHeadlineRef = viewChild<ElementRef<HTMLElement>>("aboutHeadline");
  readonly aboutHeadlineVisible = signal(false);
  private aboutHeadlineObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const headline = this.aboutHeadlineRef()?.nativeElement;
    const slider = this.homeSliderRef()?.nativeElement;
    if (!headline) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      this.aboutHeadlineVisible.set(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.aboutHeadlineVisible.set(true);
      return;
    }

    this.aboutHeadlineObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        this.aboutHeadlineVisible.set(true);
        this.aboutHeadlineObserver?.disconnect();
        this.aboutHeadlineObserver = null;
      },
      {
        root: slider ?? null,
        threshold: 0.35,
      },
    );

    this.aboutHeadlineObserver.observe(headline);
  }

  ngOnDestroy(): void {
    this.aboutHeadlineObserver?.disconnect();
    this.aboutHeadlineObserver = null;
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
}
