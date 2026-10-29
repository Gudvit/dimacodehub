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
import { EXPERIENCE_ROLES } from "./experience-roles";
import { SwipeTracker, WheelNavigator } from "./role-gestures";

/** Below this width the timeline collapses and the wheel belongs to the page again. */
const DESKTOP_BREAKPOINT_PX = 980;

@Component({
  selector: "app-home-experience-section",
  templateUrl: "./home-experience-section.component.html",
  styleUrl: "./home-experience-section.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeExperienceSectionComponent {
  readonly roles = EXPERIENCE_ROLES;

  readonly activeIndex = signal(0);
  readonly activeRole = computed(() => this.roles[this.activeIndex()]!);
  readonly panelKey = signal(0);

  private readonly timelineRef = viewChild<ElementRef<HTMLElement>>("timeline");
  private readonly focusPanelRef = viewChild<ElementRef<HTMLElement>>("focusPanel");
  private readonly destroyRef = inject(DestroyRef);
  private readonly wheel = new WheelNavigator();
  private readonly swipe = new SwipeTracker();

  constructor() {
    afterNextRender(() => this.listenToPanelGestures());
  }

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
    if (touch) {
      this.swipe.start(touch.clientX, touch.clientY);
    }
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    if (touch) {
      this.swipe.move(touch.clientX, touch.clientY);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    if (!touch) {
      this.swipe.cancel();
      return;
    }

    const decision = this.swipe.end(touch.clientX, touch.clientY);
    if (decision === "next") {
      this.nextRole();
    } else if (decision === "previous") {
      this.prevRole();
    }
  }

  onTouchCancel(): void {
    this.swipe.cancel();
  }

  onFocusPanelWheel(event: WheelEvent): void {
    if (!this.isDesktopViewport()) {
      return;
    }

    const decision = this.wheel.decide(
      event.deltaX,
      event.deltaY,
      this.activeIndex(),
      this.roles.length,
      performance.now(),
    );

    // "ignore" is a horizontal wheel, "release" means the section is done with it: both
    // belong to the page, so they keep their default behaviour.
    if (decision === "ignore" || decision === "release") {
      return;
    }

    event.preventDefault();

    if (decision === "next") {
      this.setActive(Math.min(this.roles.length - 1, this.activeIndex() + 1));
    } else if (decision === "previous") {
      this.setActive(Math.max(0, this.activeIndex() - 1));
    }
  }

  /**
   * `wheel` and `touchmove` fire dozens of times per gesture. A template binding would
   * schedule a change detection pass for each one, so they are registered by hand — the
   * handlers only touch signals when a role actually changes. `wheel` must not be passive:
   * swallowing the page scroll inside the section is the point of it.
   */
  private listenToPanelGestures(): void {
    const panel = this.focusPanelRef()?.nativeElement;
    if (!panel) {
      return;
    }

    const onWheel = (event: WheelEvent) => this.onFocusPanelWheel(event);
    const onTouchMove = (event: TouchEvent) => this.onTouchMove(event);

    panel.addEventListener("wheel", onWheel, { passive: false });
    panel.addEventListener("touchmove", onTouchMove, { passive: true });

    this.destroyRef.onDestroy(() => {
      panel.removeEventListener("wheel", onWheel);
      panel.removeEventListener("touchmove", onTouchMove);
    });
  }

  private isDesktopViewport(): boolean {
    return typeof window !== "undefined" && window.innerWidth > DESKTOP_BREAKPOINT_PX;
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
