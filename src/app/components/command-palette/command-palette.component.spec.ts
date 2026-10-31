import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_EMAIL } from "../../site";
import { ThemeService } from "../theme-toggle/theme.service";
import { CommandPaletteComponent } from "./command-palette.component";
import { CommandPaletteService } from "./command-palette.service";

describe("CommandPaletteComponent", () => {
  let fixture: ComponentFixture<CommandPaletteComponent>;
  let palette: CommandPaletteService;

  // jsdom has <dialog> but not its modal methods.
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    };
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    fixture = TestBed.createComponent(CommandPaletteComponent);
    palette = TestBed.inject(CommandPaletteService);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset["theme"];
    localStorage.clear();
  });

  const element = (): HTMLElement => fixture.nativeElement;
  const dialog = () => element().querySelector("dialog")!;
  const input = () => element().querySelector<HTMLInputElement>(".palette__input")!;
  const options = () => [...element().querySelectorAll<HTMLElement>("[role=option]")];

  async function open(): Promise<void> {
    palette.open();
    await fixture.whenStable();
  }

  async function type(query: string): Promise<void> {
    input().value = query;
    input().dispatchEvent(new Event("input"));
    await fixture.whenStable();
  }

  async function press(key: string): Promise<void> {
    input().dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true }));
    await fixture.whenStable();
  }

  it("opens and closes with Ctrl+K or ⌘K", async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    await fixture.whenStable();
    expect(dialog().open).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "K", metaKey: true }));
    await fixture.whenStable();
    expect(dialog().open).toBe(false);
    expect(palette.isOpen()).toBe(false);
  });

  it("filters as you type and starts over when reopened", async () => {
    await open();
    await type("resume");
    expect(options().map((option) => option.textContent)).toEqual(["Download CVActions"]);

    palette.close();
    await fixture.whenStable();
    await open();
    expect(input().value).toBe("");
    expect(options().length).toBeGreaterThan(5);
  });

  it("moves the highlight with the arrow keys and points the input at it", async () => {
    await open();
    expect(input().getAttribute("aria-activedescendant")).toBe(options()[0]!.id);

    await press("ArrowDown");
    expect(options()[1]!.getAttribute("aria-selected")).toBe("true");
    expect(input().getAttribute("aria-activedescendant")).toBe(options()[1]!.id);

    await press("ArrowUp");
    await press("ArrowUp");
    expect(options().at(-1)!.getAttribute("aria-selected")).toBe("true");
  });

  it("runs the highlighted command on Enter and closes", async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl");
    await open();
    await type("how this site");
    await press("Enter");

    expect(navigate).toHaveBeenCalledWith("/colophon");
    expect(dialog().open).toBe(false);
  });

  it("switches the theme and names the next switch", async () => {
    const themes = TestBed.inject(ThemeService);
    await open();
    await type("theme");
    expect(options()[0]!.textContent).toContain("Switch to dark theme");

    options()[0]!.click();
    expect(themes.theme()).toBe("dark");
  });

  it("copies the email and says so", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await open();
    await type("copy email");
    await press("Enter");
    await Promise.resolve();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith(CONTACT_EMAIL);
    expect(element().querySelector("[role=status]")?.textContent).toContain(CONTACT_EMAIL);
  });

  it("says when nothing matches", async () => {
    await open();
    await type("kubernetes");
    expect(options()).toEqual([]);
    expect(element().querySelector(".palette__empty")?.textContent).toContain("kubernetes");
  });
});
