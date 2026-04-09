import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from "@angular/core";
import { AnimatedTextComponent } from "../../../../components/animated-text/animated-text.component";

@Component({
  selector: "app-home-about-section",
  templateUrl: "./home-about-section.component.html",
  styleUrl: "./home-about-section.component.scss",
  imports: [AnimatedTextComponent],
})
export class HomeAboutSectionComponent implements AfterViewInit, OnDestroy {
  readonly aboutHeadlineRef = viewChild<ElementRef<HTMLElement>>("aboutHeadline");
  readonly aboutHeadlineVisible = signal(false);
  private aboutHeadlineObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const headline = this.aboutHeadlineRef()?.nativeElement;
    const slider = headline?.closest(".home-slider") as HTMLElement | null;
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
        root: slider,
        threshold: 0.35,
      },
    );

    this.aboutHeadlineObserver.observe(headline);
  }

  ngOnDestroy(): void {
    this.aboutHeadlineObserver?.disconnect();
    this.aboutHeadlineObserver = null;
  }
}
