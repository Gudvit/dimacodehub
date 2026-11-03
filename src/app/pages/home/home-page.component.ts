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
import { ActivatedRoute } from "@angular/router";
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
   * Hidden on the first slide, which has its own arrow.
   */
  readonly stepDirection = signal<"down" | "up">("down");
  /** On the last slide the arrow moves aside, clear of the footer's links. */
  readonly stepRaised = computed(() => this.sections.current() === "contacts");
  readonly stepVisible = computed(() => {
    const current = this.sections.current();
    return current !== null && current !== "home";
  });

  constructor() {
    syncJsonLd(() => PERSON);

    // The slider must exist before a fragment can be scrolled into view.
    afterNextRender(() => {
      this.route.fragment
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((fragment) => this.scrollToFragment(fragment, "auto"));
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
      const passed = Array.from(slider.querySelectorAll<HTMLElement>(".slide-section")).filter(
        (section) => section.offsetTop <= line,
      );
      this.sections.current.set(passed.at(-1)?.id || null);
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
