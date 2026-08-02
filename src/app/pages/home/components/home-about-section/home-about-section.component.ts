import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { AnimatedTextComponent } from "../../../../components/animated-text/animated-text.component";

@Component({
  selector: "app-home-about-section",
  templateUrl: "./home-about-section.component.html",
  styleUrl: "./home-about-section.component.scss",
  imports: [AnimatedTextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAboutSectionComponent {
  readonly aboutHeadlineRef = viewChild<ElementRef<HTMLElement>>("aboutHeadline");
  readonly aboutHeadlineVisible = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => this.observeHeadline());
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  private observeHeadline(): void {
    const headline = this.aboutHeadlineRef()?.nativeElement;
    if (!headline) {
      return;
    }

    // Reveal immediately when the animation cannot or should not run.
    if (!("IntersectionObserver" in window) || this.prefersReducedMotion()) {
      this.aboutHeadlineVisible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        this.aboutHeadlineVisible.set(true);
        this.disconnect();
      },
      {
        root: headline.closest<HTMLElement>(".home-slider"),
        threshold: 0.35,
      },
    );

    this.observer.observe(headline);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
