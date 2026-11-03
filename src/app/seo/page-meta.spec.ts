import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SITE_META_TAGS } from "./page-meta";

describe("SITE_META_TAGS", () => {
  // A page leaving its own tags puts these back; anything else would leave `/` describing
  // something `index.html` never said.
  it("matches the site-wide tags in index.html", () => {
    const html = new DOMParser().parseFromString(
      readFileSync("src/index.html", "utf8"),
      "text/html",
    );

    for (const { selector, content } of SITE_META_TAGS) {
      expect(html.querySelector(`meta[${selector}]`)?.getAttribute("content"), selector).toBe(
        content,
      );
    }
  });
});
