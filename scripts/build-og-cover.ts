/**
 * Renders the site's own sharing image, `public/images/og-cover.jpg` (1200×630), the one
 * `index.html` and `page-meta.ts` point at for every page without a card of its own. It
 * repeats the hero in its dark theme: the black-and-white portrait cut-out
 * (`src/images/portrait.webp`) on the right, the name and role on the left. Run it again
 * after changing the portrait or the copy. Uses Playwright's Chromium.
 *
 *   node scripts/build-og-cover.ts
 */
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const dataUri = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(path).toString("base64")}`;

const portrait = dataUri("src/images/portrait.webp", "image/webp");
const logo = dataUri("public/images/logo.svg", "image/svg+xml");

// The dark theme's colours, from src/styles/_brand.scss; the card is a standalone page.
const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700;800&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    font-family: Urbanist, "Segoe UI", sans-serif; color: #e8e6f0;
    background:
      radial-gradient(380px 300px at 78% 40%, rgb(232 230 240 / 0.08), transparent 100%),
      #11131f;
  }
  .portrait {
    position: absolute; right: 70px; bottom: 0; height: 600px; aspect-ratio: 1023 / 1537;
    background: url("${portrait}") center bottom / contain no-repeat;
    mask-image:
      linear-gradient(180deg, #000 55%, transparent 96%),
      linear-gradient(90deg, transparent 0%, #000 20%, #000 80%, transparent 100%);
    mask-composite: intersect;
  }
  .copy {
    position: absolute; left: 72px; top: 0; bottom: 0; width: 640px;
    display: flex; flex-direction: column; justify-content: center; gap: 18px;
  }
  .copy img { width: 56px; height: 56px; margin-bottom: 18px;
    filter: invert(1) hue-rotate(180deg) brightness(1.1); }
  .role { font-size: 34px; font-weight: 600; }
  h1 { font-size: 84px; line-height: 0.95; font-weight: 700; letter-spacing: -0.03em; }
  .lead { font-size: 26px; line-height: 1.4; color: rgb(232 230 240 / 0.78); max-width: 30ch; }
  .host { margin-top: 18px; font-size: 21px; font-weight: 600; letter-spacing: 0.04em;
    color: rgb(232 230 240 / 0.55); }
</style></head>
<body>
  <div class="portrait"></div>
  <div class="copy">
    <img src="${logo}" alt="">
    <p class="role">Senior Frontend Engineer</p>
    <h1>Dmytro Huliaiev</h1>
    <p class="lead">Angular platforms that stay fast, tested and easy to change.</p>
    <p class="host">gudvit.github.io/dimacodehub</p>
  </div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/images/og-cover.jpg", type: "jpeg", quality: 86 });
} finally {
  await browser.close();
}
