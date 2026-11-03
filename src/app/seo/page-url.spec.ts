import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { SITE_URL } from "../site";
import { syncPageUrl } from "./page-url";

@Component({ selector: "app-page-url-host", template: "" })
class HostComponent {
  constructor() {
    syncPageUrl();
  }
}

describe("syncPageUrl", () => {
  it("points og:url and the canonical link at the current page", async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    TestBed.createComponent(HostComponent);
    const router = TestBed.inject(Router);

    await router.navigateByUrl("/blog/some-post?ref=x#part");

    const expected = `${SITE_URL}blog/some-post/`;
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      expected,
    );
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      expected,
    );

    await router.navigateByUrl("/");
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      SITE_URL,
    );
  });
});
