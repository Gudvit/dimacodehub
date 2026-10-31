import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeToggleComponent } from "./theme-toggle.component";
import { THEME_STORAGE_KEY } from "./theme.service";

describe("ThemeToggleComponent", () => {
  const root = document.documentElement;

  async function render(): Promise<HTMLButtonElement> {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector("button");
  }

  afterEach(() => {
    delete root.dataset["theme"];
    localStorage.clear();
  });

  it("follows the system setting while nothing is picked", async () => {
    // The jsdom matchMedia polyfill reports a light system.
    const button = await render();
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
  });

  it("pins and remembers the opposite theme on click", async () => {
    const button = await render();
    button.click();
    expect(root.dataset["theme"]).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("starts from a theme pinned before the app loaded", async () => {
    root.dataset["theme"] = "dark";
    const button = await render();
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
  });
});
