import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("index.html", () => {
  const html = new DOMParser().parseFromString(readFileSync("src/index.html", "utf8"), "text/html");
  const policy =
    html.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute("content") ?? "";

  // The CSP allows exactly one inline script, by the hash of its text. Edit the script (or
  // let Prettier reformat it) without updating the hash and the browser silently skips it.
  it("allows the theme script by its current hash", () => {
    const script = html.getElementById("theme-init")?.textContent ?? "";
    const hash = createHash("sha256").update(script).digest("base64");
    expect(policy).toContain(`'sha256-${hash}'`);
  });

  it("allows no other inline script", () => {
    const inline = [...html.querySelectorAll("script:not([src])")].filter(
      (script) => script.id !== "theme-init",
    );
    expect(inline).toEqual([]);
  });
});
