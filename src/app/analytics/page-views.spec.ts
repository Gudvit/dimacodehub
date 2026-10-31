import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { countPageViews, GOATCOUNTER_ENDPOINT, pageViewUrl } from "./page-views";

@Component({ selector: "app-page-views-host", template: "" })
class HostComponent {
  constructor() {
    countPageViews();
  }
}

describe("pageViewUrl", () => {
  it("encodes the view the way GoatCounter's count.js does", () => {
    const url = new URL(
      pageViewUrl({
        path: "/blog/some-post",
        title: "Some post - Dmytro Huliaiev",
        referrer: "https://www.linkedin.com/",
        screen: { width: 390, height: 844, ratio: 3 },
      }),
    );

    expect(`${url.origin}${url.pathname}`).toBe(GOATCOUNTER_ENDPOINT);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      p: "/blog/some-post",
      t: "Some post - Dmytro Huliaiev",
      r: "https://www.linkedin.com/",
      s: "390,844,3",
    });
  });
});

describe("countPageViews", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends nothing outside the production host", async () => {
    const beacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    TestBed.createComponent(HostComponent);

    await TestBed.inject(Router).navigateByUrl("/blog");

    expect(beacon).not.toHaveBeenCalled();
  });
});
