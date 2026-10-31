import { DestroyRef, DOCUMENT, effect, inject } from "@angular/core";
import { PROFILES, SITE_AUTHOR, SITE_URL } from "../site";

/** Structured data, as schema.org JSON-LD. Loosely typed on purpose: schema.org is vast. */
export type JsonLd = Readonly<Record<string, unknown>>;

const SCRIPT_ID = "page-json-ld";

/** The site's author, for the home page and as the author of every post. */
export const PERSON: JsonLd = {
  "@type": "Person",
  name: SITE_AUTHOR,
  jobTitle: "Senior Frontend Engineer",
  url: SITE_URL,
  sameAs: PROFILES.map((profile) => profile.href),
};

/**
 * Writes the page's structured data into `<head>` for as long as the calling page lives.
 * Prerendering (ADR 0019) puts it into the page's HTML, which is where search engines read it.
 *
 * The block is a `<script type="application/ld+json">` — data, not code, so the CSP's ban on
 * inline scripts does not apply to it. Call it from a component constructor; `source`
 * returns `undefined` while there is nothing to describe.
 */
export function syncJsonLd(source: () => JsonLd | undefined): void {
  const document = inject(DOCUMENT);

  // `<head>` is not hydrated: on a prerendered page the block is already there.
  const find = () => document.getElementById(SCRIPT_ID);

  effect(() => {
    const data = source();
    if (!data) {
      find()?.remove();
      return;
    }

    let script = find();
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.setAttribute("type", "application/ld+json");
      document.head.appendChild(script);
    }
    // `<` is escaped so that no string in the data can close the script element.
    script.textContent = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
      /</g,
      "\\u003c",
    );
  });

  inject(DestroyRef).onDestroy(() => find()?.remove());
}
