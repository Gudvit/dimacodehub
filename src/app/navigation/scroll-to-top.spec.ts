import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scrollToTopOnPageChange } from "./scroll-to-top";

@Component({ selector: "app-scroll-host", template: "" })
class HostComponent {
  constructor() {
    scrollToTopOnPageChange();
  }
}

describe("scrollToTopOnPageChange", () => {
  let router: Router;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    TestBed.createComponent(HostComponent);
    router = TestBed.inject(Router);
    await router.navigateByUrl("/blog");
    scrollTo.mockClear();
  });

  it("opens a new page at the top", async () => {
    await router.navigateByUrl("/blog/some-post");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("keeps the scroll for a filter or a heading on the same page", async () => {
    await router.navigateByUrl("/blog?tag=NgRx");
    await router.navigateByUrl("/blog#list");
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("leaves a link to a heading on another page to that page", async () => {
    await router.navigateByUrl("/blog/some-post#a-heading");
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
