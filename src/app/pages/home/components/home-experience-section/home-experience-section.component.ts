import { Component, ElementRef, computed, signal, viewChild } from "@angular/core";

type ExperienceImpact = {
  label: string;
  value: string;
};

type ExperienceRole = {
  company: string;
  shortLabel: string;
  title: string;
  period: string;
  bullets: string[];
  impact: ExperienceImpact[];
};

@Component({
  selector: "app-home-experience-section",
  templateUrl: "./home-experience-section.component.html",
  styleUrl: "./home-experience-section.component.scss",
})
export class HomeExperienceSectionComponent {
  private readonly swipeThresholdPx = 40;
  private readonly desktopBreakpointPx = 980;
  private readonly wheelThresholdPx = 84;
  private readonly wheelCooldownMs = 360;
  private readonly edgeExitThresholdPx = 170;
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  private sawHorizontalSwipe = false;
  private wheelAccumulator = 0;
  private wheelLockedUntil = 0;
  private edgeExitAccumulator = 0;
  private edgeExitDirection: 1 | -1 | null = null;
  private readonly timelineRef = viewChild<ElementRef<HTMLElement>>("timeline");

  readonly roles: ExperienceRole[] = [
    {
      company: "Apomedical",
      shortLabel: "Now",
      title: "Senior Software Engineer",
      period: "Dec 2021 - Present",
      bullets: [
        "Owned frontend architecture for a business-critical Angular platform and set long-term technical direction.",
        "Designed scalable module boundaries and state strategy with NgRx/NGXS for different feature domains.",
        "Introduced Playwright E2E and covered critical user/payment flows to reduce production risk.",
        "Improved reliability and performance for a product used by tens of thousands of users across Europe.",
      ],
      impact: [
        { label: "Users", value: "50K+" },
        { label: "Modules", value: "5+" },
        { label: "Teams", value: "8" },
      ],
    },
    {
      company: "IdeaSoft",
      shortLabel: "Angular",
      title: "Angular Developer",
      period: "May 2019 - Dec 2021",
      bullets: [
        "Led frontend delivery of CRM products and acted as the technical owner for key UI decisions.",
        "Built predictable state management flows with NgRx for complex business scenarios.",
        "Worked directly with clients from Sweden and Israel, translating business requirements into stable solutions.",
        "Raised delivery quality through code standards, reviews, and clearer release processes.",
      ],
      impact: [
        { label: "Region", value: "EU" },
        { label: "Domain", value: "CRM" },
        { label: "Stack", value: "Angular" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Lead JS",
      title: "Lead JS Developer",
      period: "Oct 2018 - Apr 2019",
      bullets: [
        "Owned code quality across projects and introduced consistent review practices for the team.",
        "Set up scalable frontend architecture with lazy loading and quality tooling (ESLint/Prettier/Compodoc).",
        "Improved performance bottlenecks and reduced UI-level regressions in active products.",
      ],
      impact: [
        { label: "Role", value: "Lead" },
        { label: "Focus", value: "Quality" },
        { label: "Outcome", value: "Perf Up" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "MOBILE IONIC",
      title: "Ionic Developer",
      period: "Feb 2018 - Oct 2018",
      bullets: [
        "Built production mobile apps with Angular + Ionic and maintained delivery pace in tight timelines.",
        "Integrated third-party services: QR, YouTube API, PayPal, Google Maps API, Firebase Push.",
        "Implemented and stabilized multiple authentication flows across different user scenarios.",
      ],
      impact: [
        { label: "Platform", value: "Mobile" },
        { label: "Stack", value: "Ionic 3" },
        { label: "Integrations", value: "5+" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Angular",
      title: "Angular Developer",
      period: "Sep 2016 - Jan 2018",
      bullets: [
        "Developed Angular 2/4 applications with Angular CLI, TypeScript, and RxJS patterns.",
        "Structured features for maintainability and cleaner scaling as products evolved.",
        "Implemented E2E coverage with Protractor + Selenium for core user journeys.",
      ],
      impact: [
        { label: "Framework", value: "Angular 2/4" },
        { label: "Testing", value: "E2E" },
        { label: "Core", value: "RxJS" },
      ],
    },
    {
      company: "Lazy Ants",
      shortLabel: "Markup",
      title: "Markup Developer",
      period: "Nov 2014 - Sep 2016",
      bullets: [
        "Delivered responsive cross-browser UI layouts with solid HTML/CSS/SCSS fundamentals.",
        "Built UI interactions with JavaScript/jQuery and animation-driven UX behavior.",
        "Worked in team delivery workflows with Git and project management tooling.",
      ],
      impact: [
        { label: "Core", value: "HTML/CSS" },
        { label: "JS", value: "jQuery" },
        { label: "Workflow", value: "Git" },
      ],
    },
  ];

  readonly activeIndex = signal(0);
  readonly activeRole = computed(() => this.roles[this.activeIndex()]!);
  readonly panelKey = signal(0);

  setActive(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }

    this.activeIndex.set(index);
    this.panelKey.update((value) => value + 1);
    this.scrollTimelineItemIntoView(index);
  }

  prevRole(): void {
    const nextIndex = this.activeIndex() > 0 ? this.activeIndex() - 1 : this.roles.length - 1;
    this.setActive(nextIndex);
  }

  nextRole(): void {
    const nextIndex = this.activeIndex() < this.roles.length - 1 ? this.activeIndex() + 1 : 0;
    this.setActive(nextIndex);
  }

  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.sawHorizontalSwipe = false;
  }

  onTouchMove(event: TouchEvent): void {
    if (this.touchStartX === null || this.touchStartY === null) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.sawHorizontalSwipe = true;
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null || this.touchStartY === null) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      this.resetTouch();
      return;
    }

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const isHorizontalIntent = this.sawHorizontalSwipe || absX > absY;

    this.resetTouch();

    // React only to intentional horizontal swipes to avoid accidental switches on vertical scroll.
    if (!isHorizontalIntent || absX < this.swipeThresholdPx || absX <= absY) {
      return;
    }

    if (deltaX < 0) {
      this.nextRole();
      return;
    }

    this.prevRole();
  }

  onTouchCancel(): void {
    this.resetTouch();
  }

  onFocusPanelWheel(event: WheelEvent): void {
    if (!this.isDesktopViewport()) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const currentIndex = this.activeIndex();
    const atFirstItem = currentIndex === 0;
    const atLastItem = currentIndex === this.roles.length - 1;
    const shouldPassToOuterScroll =
      (direction > 0 && atLastItem) || (direction < 0 && atFirstItem);

    // On boundaries, require a small extra scroll budget before passing wheel to outer page scroll.
    if (shouldPassToOuterScroll) {
      if (this.edgeExitDirection !== direction) {
        this.edgeExitDirection = direction;
        this.edgeExitAccumulator = 0;
      }

      this.edgeExitAccumulator += Math.abs(event.deltaY);
      if (this.edgeExitAccumulator < this.edgeExitThresholdPx) {
        event.preventDefault();
        return;
      }

      this.edgeExitAccumulator = 0;
      this.edgeExitDirection = null;
      this.wheelAccumulator = 0;
      this.wheelLockedUntil = 0;
      return;
    }

    this.edgeExitAccumulator = 0;
    this.edgeExitDirection = null;

    const now = performance.now();
    if (now < this.wheelLockedUntil) {
      event.preventDefault();
      return;
    }

    this.wheelAccumulator += event.deltaY;
    if (Math.abs(this.wheelAccumulator) < this.wheelThresholdPx) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const nextIndex = Math.min(this.roles.length - 1, Math.max(0, currentIndex + direction));
    this.setActive(nextIndex);

    this.wheelAccumulator = 0;
    this.wheelLockedUntil = now + this.wheelCooldownMs;
  }

  private resetTouch(): void {
    this.touchStartX = null;
    this.touchStartY = null;
    this.sawHorizontalSwipe = false;
  }

  private isDesktopViewport(): boolean {
    return typeof window !== "undefined" && window.innerWidth > this.desktopBreakpointPx;
  }

  private scrollTimelineItemIntoView(index: number): void {
    const timeline = this.timelineRef()?.nativeElement;
    if (!timeline || !this.isDesktopViewport()) {
      return;
    }

    const target = timeline.querySelector<HTMLElement>(`.timeline__item[data-index="${index}"]`);
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}
