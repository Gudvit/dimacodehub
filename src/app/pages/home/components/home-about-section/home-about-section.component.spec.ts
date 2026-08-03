import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeAboutSectionComponent } from "./home-about-section.component";

/**
 * The reveal decision is made once, in `afterNextRender`, and everything it depends on
 * (`prefers-reduced-motion`, the presence of an `IntersectionObserver`) is environment
 * state that e2e can only emulate from the outside. Pinning the three branches here is
 * what keeps the reduced-motion path from silently turning back into an animation.
 */
describe("HomeAboutSectionComponent reveal", () => {
  function mockReducedMotion(matches: boolean) {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches, media: query }) as MediaQueryList,
    );
  }

  function stubIntersectionObserver() {
    const callbacks: IntersectionObserverCallback[] = [];
    const observe = vi.fn();

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        readonly observe = observe;
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
        readonly takeRecords = () => [];

        constructor(callback: IntersectionObserverCallback) {
          callbacks.push(callback);
        }
      },
    );

    return {
      get count() {
        return callbacks.length;
      },
      observe,
      intersect() {
        callbacks[0]([{ isIntersecting: true } as IntersectionObserverEntry], {
          disconnect: () => undefined,
        } as IntersectionObserver);
      },
    };
  }

  function headlineOf(fixture: { nativeElement: HTMLElement }): HTMLElement {
    return fixture.nativeElement.querySelector<HTMLElement>(".about-hero__headline")!;
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it("leaves the headline alone under reduced motion", async () => {
    mockReducedMotion(true);
    const observer = stubIntersectionObserver();

    const fixture = TestBed.createComponent(HomeAboutSectionComponent);
    await fixture.whenStable();

    // No observer, no `is-visible`, no `app-animated-text`: the stylesheet shows the
    // plain heading and no animation ever starts.
    expect(observer.count).toBe(0);
    expect(fixture.componentInstance.aboutHeadlineVisible()).toBe(false);
    expect(headlineOf(fixture).classList.contains("is-visible")).toBe(false);
    expect(headlineOf(fixture).querySelector("app-animated-text")).toBeNull();
  });

  it("waits for the headline to be scrolled into view when motion is allowed", async () => {
    mockReducedMotion(false);
    const observer = stubIntersectionObserver();

    const fixture = TestBed.createComponent(HomeAboutSectionComponent);
    await fixture.whenStable();

    expect(observer.observe).toHaveBeenCalledWith(headlineOf(fixture));
    expect(fixture.componentInstance.aboutHeadlineVisible()).toBe(false);

    observer.intersect();
    await fixture.whenStable();

    expect(fixture.componentInstance.aboutHeadlineVisible()).toBe(true);
    expect(headlineOf(fixture).classList.contains("is-visible")).toBe(true);
    expect(headlineOf(fixture).querySelector("app-animated-text")).not.toBeNull();
  });

  it("reveals the headline outright when the browser has no observer", async () => {
    mockReducedMotion(false);

    const fixture = TestBed.createComponent(HomeAboutSectionComponent);
    await fixture.whenStable();

    expect(fixture.componentInstance.aboutHeadlineVisible()).toBe(true);
  });
});
