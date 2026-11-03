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
    const measure = () => {
      frame = 0;
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
