import { DestroyRef, effect, inject } from "@angular/core";
import { Meta } from "@angular/platform-browser";

export interface PageMeta {
  readonly title: string;
  readonly description: string;
}

/** Every tag `syncPageMeta` rewrites, as `Meta` selectors. */
const PAGE_META_TAGS = [
  'name="description"',
  'property="og:type"',
  'property="og:title"',
  'property="og:description"',
  'name="twitter:title"',
  'name="twitter:description"',
] as const;

/**
 * Points the description and sharing tags at one piece of content (a post, a case study)
 * for as long as the calling page lives. The document `<title>` is not touched — routes
 * set it (see CLAUDE.md).
 *
 * The site-wide values come from `index.html`; they are snapshotted here and put back when
 * the page is destroyed, or `/` would keep describing the last thing opened.
 *
 * Call it from a component constructor (it needs an injection context). `source` returns
 * `undefined` while there is nothing to describe, e.g. for an unknown slug.
 */
export function syncPageMeta(source: () => PageMeta | undefined): void {
  const meta = inject(Meta);

  const defaults = PAGE_META_TAGS.map((selector) => ({
    selector,
    content: meta.getTag(selector)?.content ?? null,
  }));

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
  });

  inject(DestroyRef).onDestroy(() => {
    for (const { selector, content } of defaults) {
      if (content === null) {
        meta.removeTag(selector);
      } else {
        meta.updateTag({ content }, selector);
      }
    }
  });
}
