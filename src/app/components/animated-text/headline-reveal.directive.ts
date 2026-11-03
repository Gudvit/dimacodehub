import { afterNextRender, Directive, DestroyRef, ElementRef, inject, signal } from "@angular/core";

/**
 * Starts a home slide's letter-by-letter headline when the headline is scrolled into view:
 * `visible()` swaps the plain text for `app-animated-text`, and `is-visible` on the host ends
 * the `motion.headline-reveal` hidden state. The two go together, so use them together.
 */
@Directive({
  selector: "[appHeadlineReveal]",
  exportAs: "headlineReveal",
  host: { "[class.is-visible]": "visible()" },
})
export class HeadlineRevealDirective {
  readonly visible = signal(false);

  private readonly headline = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => this.observe());
    inject(DestroyRef).onDestroy(() => this.disconnect());
  }

  private observe(): void {
    // Under reduced motion nothing here runs: the stylesheet already shows the headline at
    // full opacity, and `is-visible` is what swaps the plain heading for the letter-by-letter
    // reveal — the one animation this preference is asking us not to play.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Without an observer there is nothing to wait for, so reveal it right away.
    if (!("IntersectionObserver" in window)) {
      this.visible.set(true);
      return;
    }

    const headline = this.headline.nativeElement;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        this.visible.set(true);
        this.disconnect();
      },
      {
        root: headline.closest<HTMLElement>(".home-slider"),
        threshold: 0.35,
      },
    );

    this.observer.observe(headline);
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
