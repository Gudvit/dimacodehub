/**
 * Measures the production build and writes `build-stats.json` next to the pages, for the
 * colophon page to show. Runs after `ng build` in plain Node, like `build-feeds.ts`.
 *
 *   node scripts/build-stats.ts dist/dimacodehub/browser
 */
import { globSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { BUILD_STATS_FILE, type BuildStats } from "../src/app/pages/colophon/build-stats.ts";

const outDir = process.argv[2];
if (!outDir) {
  throw new Error("Usage: node scripts/build-stats.ts <build output directory>");
}

const gzipped = (file: string) => gzipSync(readFileSync(join(outDir, file))).length;
const sum = (files: readonly string[]) => files.reduce((total, file) => total + gzipped(file), 0);

// What the home page loads before anything else: its module script, the chunks it
// preloads, and the global stylesheet. Every other chunk arrives on demand.
const home = readFileSync(join(outDir, "index.html"), "utf8");
const referenced = (pattern: RegExp) => [...home.matchAll(pattern)].map((match) => match[1]);
const initialJs = [
  ...referenced(/<script src="([^"]+\.js)" type="module"/g),
  ...referenced(/<link rel="modulepreload" href="([^"]+\.js)"/g),
];
const initialCss = referenced(/<link rel="stylesheet" href="([^"]+\.css)"/g);
const lazyJs = globSync("*.js", { cwd: outDir }).filter((file) => !initialJs.includes(file));

// Declarations, not runs: each `it(` / `test(` is one scenario however many browsers run it.
const countTests = (pattern: string, declaration: RegExp) =>
  globSync(pattern).reduce(
    (total, file) => total + (readFileSync(file, "utf8").match(declaration)?.length ?? 0),
    0,
  );

const stats: BuildStats = {
  builtAt: new Date().toISOString(),
  commit: process.env["GITHUB_SHA"] ?? null,
  initialJs: sum(initialJs),
  initialCss: sum(initialCss),
  lazyJs: sum(lazyJs),
  lazyChunks: lazyJs.length,
  prerenderedPages: globSync("**/index.html", { cwd: outDir }).length,
  unitTests: countTests("src/**/*.spec.ts", /^\s*it\(/gm),
  e2eTests: countTests("e2e/**/*.spec.ts", /^\s*test\(/gm),
};

writeFileSync(join(outDir, BUILD_STATS_FILE), `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Wrote ${BUILD_STATS_FILE}:`, stats);
