/**
 * Renders a project cover for the projects slide, 1600×900 WebP, in two layers: at the back
 * the product's page blown up, tilted, blurred and darkened; in front the same page as a
 * plain screenshot, flat and sharp, with a soft shadow. Every cover is made by this one
 * template, so the grid reads as a set. Uses Playwright's Chromium, which the e2e suite
 * already installs.
 *
 *   node scripts/build-cover.ts <shot> <out.webp> [background] [focus] [blur]
 *   node scripts/build-cover.ts shots/apomeds-desktop.png public/images/projects/apomeds.webp
 *
 * The shot is a 16:10 capture of the page at a desktop width (1440×900), taken at 2× for
 * sharpness, without chat launchers or cookie banners. The back layer is the same shot,
 * zoomed in on `focus` (a background-position, "70% 40%" by default — aim it at the page's
 * picture rather than its text), unless another picture is given: a photo from the
 * product, say, which then fills the back as it is.
 *
 * `--light` keeps the back layer bright, for a light page behind a dark one.
 *
 * `--phone <shot>` puts a phone's shot in a phone over the window's lower right corner: an
 * app and its mobile side together.
 *
 * A shot taller than it is wide goes in front in a phone frame instead, nearly the full
 * height (860px); a wide tile crops its top and foot, never its middle.
 *
 * The front layer is 1080px wide, inside the middle ~1100×680: every tile on the site crops the cover
 * differently (21:9 to nearly square), and the back layer is all any crop cuts.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

// `--phone <shot>` anywhere in the arguments adds a phone in front of the window (below).
const args = process.argv.slice(2);
const phoneFlag = args.indexOf("--phone");
const companion = phoneFlag >= 0 ? args.splice(phoneFlag, 2)[1] : undefined;
// `--light` keeps the back layer in daylight: for a back picture of a light page, which the
// usual shade would turn grey.
const lightFlag = args.indexOf("--light");
const light = lightFlag >= 0 && args.splice(lightFlag, 1).length > 0;
const [shot, out, backArg, focusArg, blurArg, deviceArg] = args;
// An empty argument skips one: `"" "88% 40%"` keeps the shot behind and moves the focus.
const background = backArg || shot;
const focus = focusArg || "70% 40%";
// Pixels of blur on the back layer: 3 keeps a photo recognisable; a page that is mostly text
// needs more, or its words read through.
const blur = Number(blurArg || 3);
if (!shot || !out) {
  throw new Error(
    "Usage: node scripts/build-cover.ts <shot> <out.webp> [background] [focus] [blur] [tablet] [--phone <shot>] [--light]",
  );
}

const dataUri = (path: string) => {
  const mime = extname(path).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
};

// The front keeps the shot's own proportions, up to 16:10; a taller shot is cut at the
// foot, so the top of the page stays in view.
const size = (path: string) => {
  const png = readFileSync(path);
  // PNG: width and height are the first two fields of the IHDR chunk.
  return extname(path).toLowerCase() === ".png"
    ? { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
    : { width: 16, height: 10 };
};
const { width, height } = size(shot);
// A shot taller than it is wide is a phone's: it goes in front in a phone, its screen the
// shot's own proportions (up to an iPhone's 9:19.5), as tall as the safe middle allows.
const phone = height > width;
// "tablet" as the last argument puts the shot in an upright tablet instead.
const tablet = deviceArg === "tablet";
const companionSize = companion ? size(companion) : { width: 9, height: 19.5 };
const companionAspect = `${companionSize.width} / ${Math.min(companionSize.height, (companionSize.width * 19.5) / 9)}`;
const aspect = phone
  ? `${width} / ${Math.min(height, (width * 19.5) / 9)}`
  : `${width} / ${Math.min(height, (width * 10) / 16)}`;

const html = `<!doctype html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1600px; height: 900px; overflow: hidden; }
      body { position: relative; background: #0d0e12; }

      /* The back layer: the page again, much larger and turned a little, out of focus and
         in shadow, so it reads as a place rather than as content. */
      .back {
        position: absolute; inset: -18%;
        background: url("${dataUri(background)}") ${focus} / ${background === shot ? "260%" : "cover"} no-repeat;
        transform: rotate(-7deg) scale(1.08);
        filter: blur(${blur}px) brightness(${light ? 0.92 : 0.42}) saturate(1.1);
      }
      .vignette {
        position: absolute; inset: 0;
        background: radial-gradient(75% 75% at 50% 50%, transparent 40%, rgb(0 0 0 / ${light ? 0.18 : 0.55}) 100%);
      }

      /* The front layer: the page itself, flat and sharp. */
      .front {
        position: absolute; left: 50%; top: 50%; width: 1080px; aspect-ratio: ${aspect};
        transform: translate(-50%, -50%);
        border-radius: 10px;
        background: #fff url("${dataUri(shot)}") top center / 100% auto no-repeat;
        box-shadow:
          0 0 0 1px rgb(255 255 255 / 0.08),
          0 40px 80px rgb(0 0 0 / 0.55),
          0 12px 24px rgb(0 0 0 / 0.35);
      }

      /* A phone shot: the same layer inside a dark frame with a thin metal edge and the
         island, nearly the full height. */
      .front.phone {
        width: auto; height: 860px; padding: 16px; border-radius: 70px;
        background: #0c0c0e;
        box-shadow:
          inset 0 0 0 2px #3a3b40,
          0 40px 80px rgb(0 0 0 / 0.6),
          0 12px 24px rgb(0 0 0 / 0.35);
      }
      .front.phone .screen {
        height: 100%; aspect-ratio: ${aspect}; border-radius: 54px;
        background: #fff url("${dataUri(shot)}") top center / 100% auto no-repeat;
      }
      .front.phone::after {
        content: ""; position: absolute; top: 31px; left: 50%; width: 124px; height: 35px;
        margin-left: -62px; border-radius: 18px; background: #000;
      }

      /* A tablet, upright, nearly the full height: covers more of the picture than a phone.
         A phone's shot fills its 3:4 screen from the top, so the foot of a tall shot is cut. */
      .front.tablet {
        height: 860px; aspect-ratio: auto; width: auto; padding: 22px; border-radius: 46px;
        background: #0c0c0e;
        box-shadow:
          inset 0 0 0 2px #3a3b40,
          0 40px 80px rgb(0 0 0 / 0.6),
          0 12px 24px rgb(0 0 0 / 0.35);
      }
      .front.tablet .screen {
        height: 100%; aspect-ratio: 3 / 4; border-radius: 26px;
        background: #fff url("${dataUri(shot)}") top center / 100% auto no-repeat;
      }
      .front.tablet::after {
        content: ""; position: absolute; top: 9px; left: 50%; width: 7px; height: 7px;
        margin-left: -3.5px; border-radius: 50%; background: #1f2126;
      }

      /* A window and a phone together: the window a little left of centre, the phone over
         its lower right corner. Both stay inside the middle ~1100px a square tile keeps. */
      .front.with-phone { left: 250px; top: 50%; width: 960px; transform: translateY(-58%); }
      .companion {
        position: absolute; right: 250px; bottom: 60px; height: 740px; padding: 14px;
        border-radius: 60px; background: #0c0c0e;
        box-shadow:
          inset 0 0 0 2px #3a3b40,
          -20px 40px 80px rgb(0 0 0 / 0.65),
          0 12px 24px rgb(0 0 0 / 0.4);
      }
      .companion .screen {
        height: 100%; aspect-ratio: ${companionAspect}; border-radius: 46px;
        background: #fff url("${companion ? dataUri(companion) : ""}") top center / 100% auto no-repeat;
      }
      .companion::after {
        content: ""; position: absolute; top: 27px; left: 50%; width: 106px; height: 30px;
        margin-left: -53px; border-radius: 16px; background: #000;
      }
    </style>
  </head>
  <body>
    <div class="back"></div>
    <div class="vignette"></div>
    ${
      tablet
        ? `<div class="front tablet"><div class="screen"></div></div>`
        : phone
          ? `<div class="front phone"><div class="screen"></div></div>`
          : companion
            ? `<div class="front with-phone"></div><div class="companion"><div class="screen"></div></div>`
            : `<div class="front"></div>`
    }
  </body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.setContent(html, { waitUntil: "load" });
  // Chromium's own WebP encoder, through a canvas: no image tooling to install.
  const png = await page.screenshot({ type: "png" });
  const webp = await page.evaluate(
    async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      return canvas.toDataURL("image/webp", 0.86);
    },
    `data:image/png;base64,${png.toString("base64")}`,
  );
  writeFileSync(out, Buffer.from(webp.split(",")[1]!, "base64"));
} finally {
  await browser.close();
}
console.log(`Wrote ${out}.`);
