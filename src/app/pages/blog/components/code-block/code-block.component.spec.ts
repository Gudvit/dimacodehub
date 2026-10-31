import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { CodeBlockComponent } from "./code-block.component";

describe("CodeBlockComponent", () => {
  it("renders the source verbatim, with the highlighted parts in spans", async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(CodeBlockComponent);
    const source = 'const html = "<b>not bold</b>";\n  return html;';
    fixture.componentRef.setInput("block", { language: "typescript", source });
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector("code")?.textContent).toBe(source);
    expect(element.querySelector("b")).toBeNull();
    expect(element.querySelector(".token--string")?.textContent).toBe('"<b>not bold</b>"');
    expect(element.querySelector("figcaption")?.textContent).toBe("typescript");
  });
});
