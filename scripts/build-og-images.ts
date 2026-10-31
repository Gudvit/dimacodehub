/**
 * Renders a 1200×630 sharing image for every post and published case study into
 * `<out>/og/…` (see `ogImagePath()`), with Playwright's Chromium — the browser the e2e suite
 * already installs. Runs after `ng build`, like `build-feeds.ts`.
 *
 *   node scripts/build-og-images.ts dist/dimacodehub/browser
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { BLOG_POSTS } from "../src/app/pages/blog/blog-posts.ts";
import { CASE_STUDIES } from "../src/app/pages/projects/case-studies.ts";
import { SITE_AUTHOR, SITE_URL, ogImagePath } from "../src/app/site.ts";

const outDir = process.argv[2];
if (!outDir) {
  throw new Error("Usage: node scripts/build-og-images.ts <build output directory>");
}

interface Card {
  readonly route: string;
  readonly kind: string;
  readonly title: string;
  readonly chips: readonly string[];
  readonly meta: string;
}

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const cards: Card[] = [
  ...BLOG_POSTS.map((post) => ({
    route: `blog/${post.slug}`,
    kind: "Blog",
    title: post.title,
    chips: post.tags.slice(0, 4),
    meta: `${dateFormat.format(new Date(post.date))} · ${post.readingTime} min read`,
  })),
  ...CASE_STUDIES.filter((study) => !study.draft).map((study) => ({
    route: `projects/${study.slug}`,
    kind: "Case study",
    title: study.title,
    chips: study.stack.slice(0, 4),
    meta: `${study.company} · ${study.period}`,
  })),
];

const escapeHtml = (text: string) =>
  text.replace(/[<>&"]/g, (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", '"': "quot" }[c]};`);

const dataUri = (path: string, type: string) =>
  `data:${type};base64,${readFileSync(path).toString("base64")}`;

const logo = dataUri("public/images/logo.svg", "image/svg+xml");
const photo = dataUri("public/images/og-cover.jpg", "image/jpeg");
const host = SITE_URL.replace(/^https:\/\//, "").replace(/\/$/, "");

// The palette repeats src/styles/_brand.scss; the card is a standalone page, not the app.
const html = (card: Card) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700;800&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    font-family: Urbanist, "Segoe UI", sans-serif; color: #191d3f;
    background:
      radial-gradient(560px circle at 100% 0%, rgba(97, 34, 51, 0.22), transparent 70%),
      radial-gradient(620px circle at 0% 100%, rgba(25, 29, 63, 0.14), transparent 70%),
      #f6f3f5;
    padding: 64px 72px 56px; display: flex; flex-direction: column;
  }
  header { display: flex; align-items: center; justify-content: space-between; }
  header img { width: 56px; height: 56px; }
  .kind {
    font-size: 22px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    color: #612233;
  }
  main { margin: auto 0; }
  h1 {
    font-size: ${card.title.length > 60 ? 62 : 74}px; line-height: 1.08; font-weight: 800;
    letter-spacing: -0.02em; max-width: 1000px;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
  }
  .chips { display: flex; gap: 12px; margin-top: 32px; }
  .chips span {
    font-size: 20px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: #612233; background: rgba(97, 34, 51, 0.08); padding: 8px 16px; border-radius: 8px;
  }
  footer {
    display: flex; align-items: center; gap: 20px;
    border-top: 2px solid rgba(25, 29, 63, 0.12); padding-top: 28px;
  }
  .avatar {
    width: 64px; height: 64px; border-radius: 50%;
    background: url("${photo}") 61% 30% / 330% no-repeat;
  }
  .who { display: grid; gap: 2px; }
  .who strong { font-size: 26px; font-weight: 800; }
  .who span, .meta { font-size: 21px; font-weight: 600; color: #6a6d7a; }
  .meta { margin-left: auto; text-align: right; display: grid; gap: 2px; }
</style></head>
<body>
  <header><img src="${logo}" alt=""><span class="kind">${escapeHtml(card.kind)}</span></header>
  <main>
    <h1>${escapeHtml(card.title)}</h1>
    <div class="chips">${card.chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}</div>
  </main>
  <footer>
    <div class="avatar"></div>
    <div class="who"><strong>${escapeHtml(SITE_AUTHOR)}</strong><span>Senior Frontend Engineer</span></div>
    <div class="meta"><span>${escapeHtml(card.meta)}</span><span>${escapeHtml(host)}</span></div>
  </footer>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const card of cards) {
    await page.setContent(html(card), { waitUntil: "networkidle" });
    // Without the network the card falls back to a system font rather than failing the build.
    await page.evaluate(() => document.fonts.ready);
    const path = join(outDir, ogImagePath(card.route));
    mkdirSync(dirname(path), { recursive: true });
    await page.screenshot({ path, type: "jpeg", quality: 88 });
  }
} finally {
  await browser.close();
}
console.log(`Wrote ${cards.length} sharing images.`);
