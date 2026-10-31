import { describe, expect, it } from "vitest";
import { SITE_URL, ogImagePath, pageUrl } from "./site";

describe("pageUrl", () => {
  it("is the site root for the home page", () => {
    expect(pageUrl("")).toBe(SITE_URL);
    expect(pageUrl("/")).toBe(SITE_URL);
  });

  // Pages answers 200 only on the directory URL; without the slash it redirects.
  it("ends every other page with the slash Pages answers on", () => {
    expect(pageUrl("/blog/some-post")).toBe(`${SITE_URL}blog/some-post/`);
    expect(pageUrl("blog/")).toBe(`${SITE_URL}blog/`);
  });
});

describe("ogImagePath", () => {
  // The build script writes to this path and the pages link to it: one function for both.
  it("maps a route to its image under og/", () => {
    expect(ogImagePath("blog/some-post")).toBe("og/blog/some-post.jpg");
    expect(ogImagePath("/projects/case/")).toBe("og/projects/case.jpg");
  });
});
