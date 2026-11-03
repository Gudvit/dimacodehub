import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { SignalsDemoComponent } from "./signals-demo.component";

describe("SignalsDemoComponent", () => {
  let fixture: ComponentFixture<SignalsDemoComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(SignalsDemoComponent);
    await fixture.whenStable();
  });

  const element = (): HTMLElement => fixture.nativeElement;
  const runs = (name: string) => element().querySelector(`[data-runs="${name}"]`)?.textContent;
  const summary = () => element().querySelector(".demo-summary")?.textContent?.trim();

  async function click(label: string): Promise<void> {
    const button = [...element().querySelectorAll("button")].find(
      (candidate) =>
        (candidate.getAttribute("aria-label") ?? candidate.textContent?.trim()) === label,
    );
    button!.click();
    await fixture.whenStable();
  }

  it("shows that every value has run once", () => {
    expect(runs("subtotal")).toBe("1×");
    expect(runs("display")).toBe("1×");
  });

  it("counts and reports what a currency change reran", async () => {
    await click("USD");

    expect(runs("display")).toBe("2×");
    expect(runs("subtotal")).toBe("1×");
    expect(summary()).toBe(
      "Ran again: display. Skipped: subtotal, isBulk, discount, total. 1 value rewritten on screen.",
    );
    expect(element().querySelector('[data-node="display"]')?.classList).toContain("is-running");
  });

  it("keeps the quantity within its bounds", async () => {
    const decrease = element().querySelector<HTMLButtonElement>(
      '[aria-label="Decrease quantity"]',
    )!;
    await click("Decrease quantity");
    expect(element().querySelector("output")?.textContent).toBe("1");
    expect(decrease.disabled).toBe(true);
  });
});
