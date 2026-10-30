import { inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Meta } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

/** Where production lives. `index.html` hardcodes the same origin in its OG tags. */
export const SITE_URL = "https://gudvit.github.io/dimacodehub/";

/**
 * Keeps `og:url` pointing at the page being shown. Sharing services treat `og:url` as the
 * page's identity: left at the site root, a shared post would be previewed as the home page.
 * Runs for the whole app — call it once, from the root component's constructor.
 */
export function syncPageUrl(): void {
  const meta = inject(Meta);

  inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe((event) => {
      // `/blog/x?y#z` → `blog/x`: a query or a fragment never names a different page.
      const path = event.urlAfterRedirects.split(/[?#]/)[0]!.replace(/^\//, "");
      meta.updateTag({ property: "og:url", content: SITE_URL + path });
    });
}
