import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { JsonLd, syncJsonLd } from "./json-ld";

const data = signal<JsonLd | undefined>(undefined);

@Component({ selector: "app-json-ld-host", template: "" })
class HostComponent {
  constructor() {
    syncJsonLd(() => data());
  }
}

describe("syncJsonLd", () => {
  const block = () => document.head.querySelector('script[type="application/ld+json"]');

  beforeEach(() => {
    data.set(undefined);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it("writes the data as one block with the schema.org context", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    data.set({ "@type": "Person", name: "Ada" });
    await fixture.whenStable();

    expect(JSON.parse(block()!.textContent!)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Ada",
    });

    data.set({ "@type": "Person", name: "Grace" });
    await fixture.whenStable();
    expect(document.head.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);

    fixture.destroy();
    expect(block()).toBeNull();
  });

  it("cannot be closed early by a string in the data", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    data.set({ headline: "</script><script>alert(1)</script>" });
    await fixture.whenStable();

    expect(block()!.textContent).not.toContain("</script>");
    expect(JSON.parse(block()!.textContent!).headline).toBe("</script><script>alert(1)</script>");
    fixture.destroy();
  });

  it("writes nothing while there is nothing to describe", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    expect(block()).toBeNull();
    fixture.destroy();
  });
});
