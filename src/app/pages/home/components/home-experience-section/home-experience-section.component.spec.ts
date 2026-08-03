import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeExperienceSectionComponent } from "./home-experience-section.component";

/**
 * The gesture handling here is the densest logic in the project and e2e cannot reach it —
 * Playwright emulates neither a trackpad nor a two-finger swipe. The thresholds under test
 * are the private constants of the component: 84px of wheel budget, a 360ms cooldown, a
 * 170px budget before the wheel is handed to the outer page scroll, and 40px of swipe.
 */
describe("HomeExperienceSectionComponent gestures", () => {
  let fixture: ComponentFixture<HomeExperienceSectionComponent>;
  let component: HomeExperienceSectionComponent;
  let now: number;

  function wheel(deltaY: number, deltaX = 0) {
    const event = { deltaY, deltaX, preventDefault: vi.fn() };
    component.onFocusPanelWheel(event as unknown as WheelEvent);
    return event;
  }

  function swipe(from: [number, number], to: [number, number]) {
    const [startX, startY] = from;
    const [endX, endY] = to;

    component.onTouchStart({
      touches: [{ clientX: startX, clientY: startY }],
    } as unknown as TouchEvent);
    component.onTouchMove({
      touches: [{ clientX: endX, clientY: endY }],
    } as unknown as TouchEvent);
    component.onTouchEnd({
      changedTouches: [{ clientX: endX, clientY: endY }],
    } as unknown as TouchEvent);
  }

  beforeEach(async () => {
    now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HomeExperienceSectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("wheel", () => {
    it("waits for the full budget before switching roles", () => {
      wheel(50);
      expect(component.activeIndex()).toBe(0);

      wheel(50);
      expect(component.activeIndex()).toBe(1);
    });

    it("ignores a horizontal wheel so trackpad panning does not switch roles", () => {
      const event = wheel(20, 200);

      expect(component.activeIndex()).toBe(0);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("holds the next switch until the cooldown expires", () => {
      wheel(100);
      expect(component.activeIndex()).toBe(1);

      now = 100;
      wheel(100);
      expect(component.activeIndex()).toBe(1);

      now = 500;
      wheel(100);
      expect(component.activeIndex()).toBe(2);
    });

    it("scrolls back through the roles when the wheel reverses", () => {
      wheel(100);
      now = 500;
      wheel(100);
      expect(component.activeIndex()).toBe(2);

      now = 1000;
      wheel(-100);
      expect(component.activeIndex()).toBe(1);
    });

    it("keeps the page from scrolling past the first role until the exit budget is spent", () => {
      const first = wheel(-100);
      expect(first.preventDefault).toHaveBeenCalled();
      expect(component.activeIndex()).toBe(0);

      // 200px total, past the 170px budget: the wheel now belongs to the outer scroll.
      const second = wheel(-100);
      expect(second.preventDefault).not.toHaveBeenCalled();
      expect(component.activeIndex()).toBe(0);
    });

    it("restarts the exit budget when the direction changes at the edge", () => {
      // 100px of the 170px budget spent trying to leave upwards.
      wheel(-100);

      // Scrolling down from the first role is a normal switch, not an edge exit.
      wheel(100);
      expect(component.activeIndex()).toBe(1);

      // Back at the top the budget starts from zero, so one flick is not enough to leave.
      component.setActive(0);
      now = 500;
      const back = wheel(-100);
      expect(back.preventDefault).toHaveBeenCalled();
      expect(component.activeIndex()).toBe(0);
    });

    it("hands the wheel over at the last role", () => {
      component.setActive(component.roles.length - 1);

      const first = wheel(120);
      expect(first.preventDefault).toHaveBeenCalled();

      const second = wheel(120);
      expect(second.preventDefault).not.toHaveBeenCalled();
      expect(component.activeIndex()).toBe(component.roles.length - 1);
    });
  });

  describe("touch", () => {
    it("switches to the next role on a swipe left", () => {
      swipe([260, 100], [140, 110]);

      expect(component.activeIndex()).toBe(1);
    });

    it("wraps around to the last role on a swipe right from the first", () => {
      swipe([140, 100], [260, 110]);

      expect(component.activeIndex()).toBe(component.roles.length - 1);
    });

    it("leaves the role alone when the page is scrolled vertically", () => {
      swipe([200, 400], [205, 120]);

      expect(component.activeIndex()).toBe(0);
    });

    it("ignores a swipe that never leaves the threshold", () => {
      swipe([200, 100], [175, 104]);

      expect(component.activeIndex()).toBe(0);
    });

    it("forgets a cancelled touch instead of acting on the next one", () => {
      component.onTouchStart({
        touches: [{ clientX: 260, clientY: 100 }],
      } as unknown as TouchEvent);
      component.onTouchCancel();
      component.onTouchEnd({
        changedTouches: [{ clientX: 140, clientY: 110 }],
      } as unknown as TouchEvent);

      expect(component.activeIndex()).toBe(0);
    });
  });
});
