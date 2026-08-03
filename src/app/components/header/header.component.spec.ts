import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { HeaderComponent } from "./header.component";

describe("HeaderComponent", () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      // Any route matches: the header only needs navigation to succeed, not to land
      // anywhere in particular.
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
  });

  function toggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(".menu-toggle");
  }

  function nav(): HTMLElement {
    return fixture.nativeElement.querySelector(".nav");
  }

  it("starts with the menu closed", () => {
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(nav().classList.contains("is-open")).toBe(false);
  });

  it("opens and closes the menu from the toggle", async () => {
    toggle().click();
    await fixture.whenStable();

    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(nav().classList.contains("is-open")).toBe(true);

    toggle().click();
    await fixture.whenStable();

    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(nav().classList.contains("is-open")).toBe(false);
  });

  it("closes the menu when a link is followed", async () => {
    toggle().click();
    await fixture.whenStable();

    const blogLink: HTMLAnchorElement = fixture.nativeElement.querySelector('.nav a[href="/blog"]');
    blogLink.click();
    await fixture.whenStable();

    expect(toggle().getAttribute("aria-expanded")).toBe("false");
  });
});
