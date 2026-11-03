import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { HomeSectionsService } from "../../navigation/home-sections";
import { PERSON, syncJsonLd } from "../../seo/json-ld";
import { HomeAboutSectionComponent } from "./components/home-about-section/home-about-section.component";
import { HomeContactSectionComponent } from "./components/home-contact-section/home-contact-section.component";
import { HomeExperienceSectionComponent } from "./components/home-experience-section/home-experience-section.component";
import { HomeHeroSectionComponent } from "./components/home-hero-section/home-hero-section.component";
import { HomeProjectsSectionComponent } from "./components/home-projects-section/home-projects-section.component";
import { HomeWritingSectionComponent } from "./components/home-writing-section/home-writing-section.component";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  imports: [
    HomeHeroSectionComponent,
    HomeAboutSectionComponent,
    HomeExperienceSectionComponent,
    HomeProjectsSectionComponent,
    HomeWritingSectionComponent,
    HomeContactSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly homeSliderRef = viewChild<ElementRef<HTMLElement>>("homeSlider");

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly sections = inject(HomeSectionsService);

  /**
   * The phone's floating arrow (`.slide-step`): which way the reader is going. It points down
   * while they scroll down and up once they turn back; on the last slide it can only go up.
   */
  readonly stepDirection = signal<"down" | "up">("down");
  /** On the last slide the arrow moves aside, clear of the footer's links. */
  readonly stepRaised = computed(() => this.sections.current() === "contacts");
  /**
   * The first slide has its own arrow, which scrolls away with it. This one waits until the
   * hero has gone under the header, so the two are never on screen together.
   */
  readonly stepVisible = signal(false);

  constructor() {
    syncJsonLd(() => PERSON);

    // Read now: by the first render the navigation that opened the page is over.
    const cameBack = inject(Router).currentNavigation()?.trigger === "popstate";

    // The slider must exist before a fragment can be scrolled into view. The first jump is
    // `instant`: it lands before the page is painted, so `/#projects` opens on the projects
    // instead of showing the hero and then gliding down (the slider's CSS is
    // `scroll-behavior: smooth`, which `auto` would follow). Later fragment changes glide.
    afterNextRender(() => {
      let first = true;
      this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
        const behavior = first ? "instant" : "smooth";
        first = false;
        // Back to a bare `/` returns to the slide the reader left from.
        const target = fragment ?? (cameBack ? this.sections.lastSection : null);
        this.scrollToFragment(target, behavior);
        if (behavior === "instant" && target) {
          this.holdLanding(target);
        }
      });
      // The header's menu: a click on the link of the slide already in the URL still scrolls.
      this.sections.requests
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((id) => this.scrollToFragment(id, "smooth"));
      this.trackCurrentSection();
    });
  }

  scrollToNextSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    const next = this.slideSections(slider).find(
      (section) => this.landingTop(section) > slider.scrollTop + 2,
    );
    if (next) {
      slider.scrollTo({ top: this.landingTop(next), behavior: "smooth" });
    }
  }

  scrollToPreviousSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    const previous = this.slideSections(slider)
      .filter((section) => this.landingTop(section) < slider.scrollTop - 2)
      .at(-1);
    slider.scrollTo({ top: previous ? this.landingTop(previous) : 0, behavior: "smooth" });
  }

  step(): void {
    if (this.stepDirection() === "up") {
      this.scrollToPreviousSection();
    } else {
      this.scrollToNextSection();
    }
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

    slider.scrollTo({ top: this.landingTop(target), behavior });
  }

  /**
   * Keeps an instant jump on its slide while the deferred slides arrive. A jump lands in the
   * viewport of a `@defer` block, which then swaps its placeholder for the section; on a
   * desktop the slider's mandatory snapping loses the slide it was snapped to and re-snaps to
   * the next one. So for a moment every change to the slider's children lands again — until
   * the reader does anything at all, or the moment is over.
   */
  private holdLanding(id: string): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider || typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(() => this.scrollToFragment(id, "instant"));
    const release = () => {
      observer.disconnect();
      clearTimeout(timer);
      for (const type of userInput) {
        window.removeEventListener(type, release, true);
      }
    };
    // Anywhere on the page: the phone's arrow, the header and the palette sit outside the slider.
    const userInput = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const timer = setTimeout(release, 3000);

    observer.observe(slider, { childList: true });
    for (const type of userInput) {
      window.addEventListener(type, release, { capture: true, passive: true });
    }
    this.destroyRef.onDestroy(release);
  }

  private slideSections(slider: HTMLElement): HTMLElement[] {
    return Array.from(slider.querySelectorAll<HTMLElement>(".slide-section"));
  }

  /**
   * Where the slider stops for a section: its top, unless its own top padding is shorter than
   * the fixed header — then far enough above it that the heading clears the header. On a
   * phone every slide pads itself below the header, so it lands at its top and fits the
   * screen; stopping a header's height short would push its foot below the screen.
   */
  private landingTop(section: HTMLElement): number {
    const padding = Number.parseFloat(getComputedStyle(section).paddingTop) || 0;
    return Math.max(0, section.offsetTop - Math.max(0, this.getHeaderOffset() - padding));
  }

  /**
   * Keeps `HomeSectionsService.current` on the slide in view, for the header's menu. The
   * slide in view is the last one whose top has passed a line a third of the way down the
   * visible part of the slider. The deferred slides arrive later, which is why this measures
   * on scroll instead of observing a fixed set. `scroll` fires per frame, so it is coalesced
   * through `requestAnimationFrame` and kept out of the template (root CLAUDE.md, Zoneless).
   */
  private trackCurrentSection(): void {
    const slider = this.homeSliderRef()?.nativeElement;
    if (!slider) {
      return;
    }

    let frame = 0;
    let lastTop = slider.scrollTop;
    const measure = () => {
      frame = 0;
      const top = slider.scrollTop;
      const atEnd = top + slider.clientHeight >= slider.scrollHeight - 2;
      if (atEnd) {
        this.stepDirection.set("up");
      } else if (Math.abs(top - lastTop) > 4) {
        this.stepDirection.set(top > lastTop ? "down" : "up");
      }
      lastTop = top;
      const header = this.getHeaderOffset();
      const line = slider.scrollTop + header + (slider.clientHeight - header) / 3;
      const slides = this.slideSections(slider);
      const passed = slides.filter((section) => section.offsetTop <= line);
      this.sections.current.set(passed.at(-1)?.id || null);
      this.stepVisible.set(slides.length > 1 && slides[1].offsetTop - top <= header);
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(measure);
      }
    };

    measure();
    slider.addEventListener("scroll", onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      slider.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      this.sections.lastSection = this.sections.current();
      this.sections.current.set(null);
    });
  }

  /**
   * The fixed header overlaps the top of every section. Its height is published as
   * `--header-height` by `HeaderComponent` itself — reading the variable keeps this page
   * out of the header's markup.
   */
  private getHeaderOffset(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
    return Number.parseFloat(raw) || 0;
  }
}
