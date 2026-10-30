/**
 * Facts about the site that several layers need: the footer, the SEO helpers and the
 * build-time feed script (`scripts/build-feeds.ts`), which imports this file straight
 * into Node — so it must stay free of runtime imports.
 */

/** Where production lives. `index.html` hardcodes the same origin in its OG tags. */
export const SITE_URL = "https://gudvit.github.io/dimacodehub/";

/**
 * The public address of a route (`"blog/x"` → `…/blog/x/`). Every page is a directory with
 * an `index.html` (ADR 0019), and Pages redirects a URL without the trailing slash to the
 * one with it — so the slash is part of the address that actually answers 200.
 */
export function pageUrl(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed ? `${SITE_URL}${trimmed}/` : SITE_URL;
}

/**
 * The sharing image of a route (`"blog/x"` → `og/blog/x.jpg`), relative to the build output.
 * `scripts/build-og-images.ts` writes the file there; pages point `og:image` at
 * `SITE_URL` + this path.
 */
export function ogImagePath(route: string): string {
  return `og/${route.replace(/^\/+|\/+$/g, "")}.jpg`;
}

export const SITE_AUTHOR = "Dmytro Huliaiev";

export interface Profile {
  readonly label: string;
  readonly href: string;
}

export const PROFILES: readonly Profile[] = [
  { label: "GitHub", href: "https://github.com/Gudvit" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dmytro-huliaiev-1320aba7/" },
  { label: "Telegram", href: "https://t.me/gudvit" },
  { label: "X", href: "https://x.com/dimasss4889" },
];
