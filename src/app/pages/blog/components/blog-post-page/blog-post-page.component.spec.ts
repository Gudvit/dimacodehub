import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlogService } from "../../services/blog.service";
import { tableOfContents } from "../../table-of-contents";
import { BlogPostPageComponent } from "./blog-post-page.component";

describe("BlogPostPageComponent", () => {
  let fixture: ComponentFixture<BlogPostPageComponent>;
  const post = new BlogService()
    .getAll()
    .find((candidate) => tableOfContents(candidate).length >= 3)!;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    fixture = TestBed.createComponent(BlogPostPageComponent);
    fixture.componentRef.setInput("slug", post.slug);
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  const headings = (): HTMLElement[] => [
    ...fixture.nativeElement.querySelectorAll(".post-content__heading"),
  ];

  it("gives every heading the id its contents entry links to", () => {
    const links = [...fixture.nativeElement.querySelectorAll(".post-toc__link")];
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      headings().map((heading) => `/#${heading.id}`),
    );
    expect(links.map((link) => link.textContent.trim())).toEqual(
      headings().map((heading) => heading.textContent?.trim()),
    );
  });

  it("scrolls to a heading from its contents entry", () => {
    const target = headings()[1]!;
    const scroll = vi.spyOn(target, "scrollIntoView");

    fixture.componentInstance.scrollToHeading(target.id);

    expect(scroll).toHaveBeenCalledOnce();
  });

  it("marks the last heading scrolled past as the one being read", async () => {
    // The first heading is above the screen, the second just below the header, the rest below.
    const tops = [-400, 40];
    headings().forEach((heading, index) =>
      vi
        .spyOn(heading, "getBoundingClientRect")
        .mockReturnValue({ top: tops[index] ?? 900 + index * 300 } as DOMRect),
    );
    const second = headings()[1]!;

    window.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await fixture.whenStable();

    expect(fixture.componentInstance.activeId()).toBe(second!.id);
    expect(
      fixture.nativeElement.querySelector('.post-toc__link[aria-current="location"]').textContent,
    ).toContain(second!.textContent?.trim());
  });

  it("marks the last heading on screen once the page is scrolled to the end", async () => {
    // A short last section: its heading stays in the lower half when the page can go no further.
    const tops = [-1200, -700, -200, 300, 560];
    headings().forEach((heading, index) =>
      vi
        .spyOn(heading, "getBoundingClientRect")
        .mockReturnValue({ top: tops[index] ?? 2000 } as DOMRect),
    );
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(3000);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(3000 - window.innerHeight);

    window.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await fixture.whenStable();

    const onScreen = headings().filter((_, index) => (tops[index] ?? 2000) < window.innerHeight);
    expect(fixture.componentInstance.activeId()).toBe(onScreen.at(-1)!.id);
  });

  it("links each tag to the list filtered by it", () => {
    const tags = [...fixture.nativeElement.querySelectorAll(".post-header__tag")];
    expect(tags.map((tag) => tag.getAttribute("href"))).toEqual(
      post.tags.map((tag) => `/blog?tag=${encodeURIComponent(tag)}`),
    );
  });
});
