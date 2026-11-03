import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  let footer: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(FooterComponent);
    await fixture.whenStable();
    footer = fixture.nativeElement;
  });

  it("shows the current year rather than a hardcoded one", () => {
    expect(footer.querySelector(".footer-meta")?.textContent).toContain(
      `© ${new Date().getFullYear()} Dmytro Huliaiev`,
    );
  });

  it("keeps the CV link relative so it survives the base href", () => {
    const cv = footer.querySelector<HTMLAnchorElement>("a[download]");
    expect(cv?.getAttribute("href")).toBe("dmytro_huliaiev_cv.pdf");
  });

  it("opens every external link safely in a new tab", () => {
    const external = footer.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\//);
      expect(link.rel).toBe("noopener noreferrer");
    }
  });
});
