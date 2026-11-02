/**
 * Renders a project cover for the projects index: the product's screenshot in a browser
 * window, tilted in perspective over a gradient in the product's own colours, 1600×900 WebP.
 * Every cover is made by this one template, so the index reads as a set (the Apomeds cover
 * is the model it follows). Uses Playwright's Chromium, which the e2e suite already installs.
 *
 *   node scripts/build-cover.ts <screenshot> <out.webp> <address> <colour from> <colour to>
 *   node scripts/build-cover.ts shots/agendo.png public/images/projects/agendo.webp \
 *     agendoapp.com "#8b5cf6" "#2e1065"
 *
 * The screenshot is cropped from its top to fill the window, so a 16:10 capture of the page
 * at a desktop width (1440×900 or so) fits best. The colours are the product's, not the
 * site's: the cover is a picture of someone else's brand.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const [screenshot, out, address, from, to] = process.argv.slice(2);
if (!screenshot || !out || !address || !from || !to) {
  throw new Error(
    "Usage: node scripts/build-cover.ts <screenshot> <out.webp> <address> <colour from> <colour to>",
  );
}

const mime = extname(screenshot).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
const screen = `data:${mime};base64,${readFileSync(screenshot).toString("base64")}`;

const html = `<!doctype html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1600px; height: 900px; overflow: hidden; }
      body {
        display: grid;
        place-items: center;
        font-family: -apple-system, "Segoe UI", sans-serif;
        background:
          radial-gradient(70% 80% at 85% 100%, rgb(0 0 0 / 0.35), transparent 70%),
          radial-gradient(80% 90% at 0% 0%, color-mix(in srgb, ${from} 85%, white), transparent 60%),
          linear-gradient(135deg, ${from}, ${to});
      }
      .stage { perspective: 2200px; }
      .window {
        width: 1200px;
        overflow: hidden;
        border-radius: 18px;
        background: #fff;
        transform: rotateX(5deg) rotateY(-9deg) rotateZ(-2.5deg) translateY(10px);
        box-shadow:
          0 2px 0 rgb(255 255 255 / 0.35) inset,
          0 50px 90px rgb(0 0 0 / 0.38),
          0 12px 24px rgb(0 0 0 / 0.18);
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 9px;
        height: 50px;
        padding: 0 20px;
        background: #eef0f4;
        border-bottom: 1px solid #dde1e8;
      }
      .dot { width: 13px; height: 13px; border-radius: 50%; }
      .url {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 520px;
        height: 30px;
        margin-left: 26px;
        padding: 0 14px;
        border-radius: 999px;
        background: #fff;
        color: #3b3f4a;
        font-size: 15px;
      }
      .url svg { width: 13px; height: 13px; }
      .screen {
        display: block;
        width: 100%;
        height: 600px;
        object-fit: cover;
        object-position: top center;
      }
    </style>
  </head>
  <body>
    <div class="stage">
      <div class="window">
        <div class="bar">
          <span class="dot" style="background:#ff5f57"></span>
          <span class="dot" style="background:#febc2e"></span>
          <span class="dot" style="background:#28c840"></span>
          <span class="url">
            <svg viewBox="0 0 24 24" fill="#c9a227"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>
            ${address}
          </span>
        </div>
        <img class="screen" src="${screen}" alt="" />
      </div>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.setContent(html, { waitUntil: "load" });
const png = await page.screenshot({ type: "png" });

// Chromium encodes WebP from a canvas; Playwright's own screenshots are PNG or JPEG only.
const webp = await page.evaluate(
  async (source: string) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")?.drawImage(image, 0, 0);
    return canvas.toDataURL("image/webp", 0.86);
  },
  `data:image/png;base64,${png.toString("base64")}`,
);
await browser.close();

writeFileSync(out, Buffer.from(webp.split(",")[1] ?? "", "base64"));
console.log(`Wrote ${out}`);
