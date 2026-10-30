import { DOCUMENT, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Meta } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { pageUrl } from "../site";

/**
 * Keeps `og:url` and `<link rel="canonical">` pointing at the page being shown. Sharing
 * services and search engines treat them as the page's identity: left at the site root, a
 * shared post would be previewed as the home page.
 * Runs for the whole app — call it once, from the root component's constructor.
 */
export function syncPageUrl(): void {
  const meta = inject(Meta);
  const document = inject(DOCUMENT);

  inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe((event) => {
      // A query or a fragment never names a different page.
      const url = pageUrl(event.urlAfterRedirects.split(/[?#]/)[0]!);
      meta.updateTag({ property: "og:url", content: url });

      // A prerendered page already carries its link; reuse it rather than add a second.
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    });
}
