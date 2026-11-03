/**
 * Renders the app icons the web manifest and iOS point at, from `public/images/logo.svg`:
 * the mark centred on a white square, inside the middle 60% so a maskable crop (a circle, a
 * squircle) never cuts it. One design for every size; run it again after changing the logo.
 * Uses Playwright's Chromium, which the e2e suite already installs.
 *
 *   node scripts/build-icons.ts
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const OUT = "public/images/icons";
const SIZES: readonly (readonly [file: string, size: number])[] = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

const logo = `data:image/svg+xml;base64,${readFileSync("public/images/logo.svg").toString("base64")}`;

const browser = await chromium.launch();
try {
  for (const [file, size] of SIZES) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<!doctype html>
      <style>
        html, body { margin: 0; width: ${size}px; height: ${size}px; }
        body { display: grid; place-items: center; background: #fff; }
        img { width: 60%; height: 60%; }
      </style>
      <img src="${logo}" alt="" />`);
    await page.locator("img").evaluate((img: HTMLImageElement) => img.decode());
    await page.screenshot({ path: `${OUT}/${file}`, omitBackground: false });
    await page.close();
  }
} finally {
  await browser.close();
}
