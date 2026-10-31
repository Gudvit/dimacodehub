import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it } from "vitest";
import { BlogPageComponent } from "./blog-page.component";
import { BlogService } from "./services/blog.service";

describe("BlogPageComponent", () => {
  let fixture: ComponentFixture<BlogPageComponent>;
  const posts = new BlogService().getAll();

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([{ path: "**", children: [] }])],
    });
    fixture = TestBed.createComponent(BlogPageComponent);
    await fixture.whenStable();
  });

  const titles = () =>
    [...fixture.nativeElement.querySelectorAll(".post-card__title")].map((h) =>
      h.textContent.trim(),
    );

  it("counts every tag in use, the most common first", () => {
    const tags = fixture.componentInstance.tags;
    expect(tags.reduce((sum, item) => sum + item.count, 0)).toBe(
      posts.reduce((sum, post) => sum + post.tags.length, 0),
    );
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1]!.count).toBeGreaterThanOrEqual(tags[i]!.count);
    }
  });

  it("shows only the posts with the selected tag", async () => {
    const tag = fixture.componentInstance.tags[0]!.tag;
    fixture.componentRef.setInput("tag", tag);
    await fixture.whenStable();

    expect(titles()).toEqual(posts.filter((p) => p.tags.includes(tag)).map((p) => p.title));
    expect(fixture.nativeElement.querySelector(".blog-list__status").textContent).toContain(tag);
    expect(
      fixture.nativeElement.querySelector('.tag-filter__chip[aria-current="page"]').textContent,
    ).toContain(tag);
  });

  it("says so when no post has the tag", async () => {
    fixture.componentRef.setInput("tag", "COBOL");
    await fixture.whenStable();

    expect(titles()).toEqual([]);
    expect(fixture.nativeElement.querySelector(".blog-list__empty").textContent).toContain(
      "No posts are tagged “COBOL”",
    );
  });

  it("lists every post without a tag", async () => {
    fixture.componentRef.setInput("tag", "");
    await fixture.whenStable();

    expect(titles()).toEqual(posts.map((p) => p.title));
    expect(fixture.nativeElement.querySelector(".blog-list__status").textContent.trim()).toBe("");
  });
});
