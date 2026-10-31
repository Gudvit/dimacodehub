/**
 * Runs Lighthouse against the production build and fails when a page drops below its
 * budget. The scores of the home page are added to `build-stats.json`, which the colophon
 * page shows. Runs after `npm run build:gh`, in plain Node, with Playwright's Chromium.
 *
 *   node scripts/lighthouse.ts dist/dimacodehub/browser
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { gzipSync } from "node:zlib";
import type { AddressInfo } from "node:net";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";
import {
  BUILD_STATS_FILE,
  type BuildStats,
  type LighthouseScores,
} from "../src/app/pages/colophon/build-stats.ts";

const outDir = process.argv[2];
if (!outDir) {
  throw new Error("Usage: node scripts/lighthouse.ts <build output directory>");
}

/** The pages audited: one of each kind. */
const PAGES = ["", "blog/", "blog/ai-frontend-engineering/", "colophon/"];

/**
 * Minimum category scores, 0–100 (ADR 0021). Raise them as the site improves; never lower
 * one to get a red build through. Performance measures 95–100 locally; the floor leaves
 * room for a slower CI runner.
 */
const BUDGETS: LighthouseScores = {
  performance: 90,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
};

const CATEGORIES = {
  performance: "performance",
  accessibility: "accessibility",
  bestPractices: "best-practices",
  seo: "seo",
} as const;

/** What GitHub Pages compresses: text. Images and PDFs are compressed already. */
const COMPRESSED = new Set([".html", ".js", ".css", ".json", ".svg", ".xml"]);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
};

// The build is made for a subpath (`<base href="/dimacodehub/">`), so it is served under that
// subpath, the way GitHub Pages does: a directory answers with its index.html, anything else
// with 404.html. Text is gzipped, as Pages does too — served raw, the JavaScript weighs four
// times as much on Lighthouse's simulated mobile network and drags Largest Contentful Paint
// a second and a half later than any visitor sees it.
const base = /<base href="([^"]+)"/.exec(readFileSync(join(outDir, "index.html"), "utf8"))?.[1];
if (!base) {
  throw new Error("No <base href> in the build's index.html");
}

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  let file = path.startsWith(base) ? join(outDir, path.slice(base.length)) : "";
  if (file && existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  }
  const found = Boolean(file) && existsSync(file);
  const served = found ? file : join(outDir, "404.html");
  const body = existsSync(served) ? readFileSync(served) : Buffer.alloc(0);
  const gzip =
    COMPRESSED.has(extname(served)) && /\bgzip\b/.test(request.headers["accept-encoding"] ?? "");
  response.writeHead(found ? 200 : 404, {
    "content-type": TYPES[extname(served)] ?? "application/octet-stream",
    ...(gzip && { "content-encoding": "gzip" }),
  });
  response.end(gzip ? gzipSync(body) : body);
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox"],
});

const results: {
  readonly page: string;
  readonly scores: LighthouseScores;
  /** What costs the page points, for the log: "category: audit title (value)". */
  readonly findings: readonly string[];
}[] = [];
try {
  for (const page of PAGES) {
    const run = await lighthouse(`${origin}${base}${page}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: Object.values(CATEGORIES),
    });
    const lhr = run?.lhr;
    const categories = lhr?.categories ?? {};
    const findings = Object.entries(categories).flatMap(([id, category]) =>
      category.auditRefs
        .filter((ref) => ref.weight > 0)
        .map((ref) => lhr?.audits[ref.id])
        .filter((audit) => audit && audit.score !== null && audit.score < 0.9)
        .map(
          (audit) =>
            `${id}: ${audit?.title}${audit?.displayValue ? ` (${audit.displayValue})` : ""}`,
        ),
    );
    const score = (id: string) => Math.round((categories[id]?.score ?? 0) * 100);
    results.push({
      page: `/${page}`,
      scores: {
        performance: score(CATEGORIES.performance),
        accessibility: score(CATEGORIES.accessibility),
        bestPractices: score(CATEGORIES.bestPractices),
        seo: score(CATEGORIES.seo),
      },
      findings,
    });
  }
} finally {
  chrome.kill();
  server.close();
}

console.table(Object.fromEntries(results.map(({ page, scores }) => [page, scores])));

for (const { page, findings } of results) {
  if (findings.length) {
    console.log(`${page}\n  ${findings.join("\n  ")}`);
  }
}

const failures = results.flatMap(({ page, scores }) =>
  (Object.keys(BUDGETS) as (keyof LighthouseScores)[])
    .filter((category) => scores[category] < BUDGETS[category])
    .map((category) => `${page} ${category}: ${scores[category]} < ${BUDGETS[category]}`),
);

const statsFile = join(outDir, BUILD_STATS_FILE);
if (existsSync(statsFile)) {
  const stats: BuildStats = JSON.parse(readFileSync(statsFile, "utf8"));
  const home = results[0]?.scores;
  writeFileSync(statsFile, `${JSON.stringify({ ...stats, lighthouse: home }, null, 2)}\n`);
}

if (failures.length) {
  console.error(`Below the Lighthouse budget:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("Every page is within its Lighthouse budget.");
