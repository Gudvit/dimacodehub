import { DestroyRef, effect, inject } from "@angular/core";
import { Meta } from "@angular/platform-browser";

export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Absolute URL of the sharing image; the site-wide cover when absent. */
  readonly image?: string;
}

const SITE_TITLE = "Dmytro Huliaiev - Senior Frontend Engineer";
const SITE_IMAGE = "https://gudvit.github.io/dimacodehub/images/og-cover.jpg";
const SITE_SUMMARY =
  "Senior Frontend Engineer with 10+ years of experience in Angular, frontend architecture, and performance.";

/**
 * Every tag `syncPageMeta` rewrites, with the site-wide value it goes back to. These repeat
 * `src/index.html` — `page-meta.spec.ts` fails if the two drift apart.
 *
 * They cannot be read from the document instead: a page opened directly arrives
 * prerendered (ADR 0019), so its own tags are already in the DOM before anything runs.
 */
export const SITE_META_TAGS: readonly { readonly selector: string; readonly content: string }[] = [
  {
    selector: 'name="description"',
    content: `${SITE_SUMMARY} Based in Cracow, Poland - open to remote work.`,
  },
  { selector: 'property="og:type"', content: "website" },
  { selector: 'property="og:title"', content: SITE_TITLE },
  { selector: 'property="og:description"', content: SITE_SUMMARY },
  { selector: 'name="twitter:title"', content: SITE_TITLE },
  { selector: 'name="twitter:description"', content: SITE_SUMMARY },
  { selector: 'property="og:image"', content: SITE_IMAGE },
  { selector: 'name="twitter:image"', content: SITE_IMAGE },
];

/**
 * Points the description and sharing tags at one piece of content (a post, a case study)
 * for as long as the calling page lives. The document `<title>` is not touched — routes
 * set it (see CLAUDE.md).
 *
 * The site-wide values (`SITE_META_TAGS`) are put back when the page is destroyed, or `/`
 * would keep describing the last thing opened.
 *
 * Call it from a component constructor (it needs an injection context). `source` returns
 * `undefined` while there is nothing to describe, e.g. for an unknown slug.
 */
export function syncPageMeta(source: () => PageMeta | undefined): void {
  const meta = inject(Meta);

  effect(() => {
    const page = source();
    if (!page) {
      return;
    }

    meta.updateTag({ name: "description", content: page.description });
    meta.updateTag({ property: "og:type", content: "article" });
    meta.updateTag({ property: "og:title", content: page.title });
    meta.updateTag({ property: "og:description", content: page.description });
    meta.updateTag({ name: "twitter:title", content: page.title });
    meta.updateTag({ name: "twitter:description", content: page.description });
    meta.updateTag({ property: "og:image", content: page.image ?? SITE_IMAGE });
    meta.updateTag({ name: "twitter:image", content: page.image ?? SITE_IMAGE });
  });

  inject(DestroyRef).onDestroy(() => {
    for (const { selector, content } of SITE_META_TAGS) {
      meta.updateTag({ content }, selector);
    }
  });
}
