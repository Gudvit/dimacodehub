/**
 * What `scripts/build-stats.ts` measures after a production build and writes to
 * `build-stats.json` next to the pages. The colophon page reads it at runtime, so the numbers
 * always describe the deployment being looked at. Imported by the script as a type only.
 */
export interface BuildStats {
  /** ISO timestamp of the build. */
  readonly builtAt: string;
  /** The commit CI built, or null for a local build. */
  readonly commit: string | null;
  /** Gzipped bytes of the JavaScript the first page load needs. */
  readonly initialJs: number;
  /** Gzipped bytes of the global stylesheet. */
  readonly initialCss: number;
  /** Gzipped bytes and count of the chunks loaded later, on demand. */
  readonly lazyJs: number;
  readonly lazyChunks: number;
  readonly prerenderedPages: number;
  readonly unitTests: number;
  readonly e2eTests: number;
}

export const BUILD_STATS_FILE = "build-stats.json";

export function formatKilobytes(bytes: number): string {
  return `${(bytes / 1000).toFixed(1)} kB`;
}
