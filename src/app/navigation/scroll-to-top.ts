import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";

/**
 * Opens every new page at its top. The router leaves the window where it was, so a post
 * opened from halfway down the blog list would open halfway down the post.
 *
 * Only a change of page counts: a jump to a heading (`#…`) and a blog tag filter (`?tag=`)
 * change the URL but not the page, and keep their scroll. Back and forward are left to the
 * browser. Angular's `withInMemoryScrolling` is not used because it cannot tell these apart —
 * it would throw the contents list and the tag filter back to the top.
 * Runs for the whole app — call it once, from the root component's constructor.
 */
export function scrollToTopOnPageChange(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return;
  }

  let trigger: NavigationStart["navigationTrigger"];
  let lastPath: string | null = null;

  inject(Router)
    .events.pipe(takeUntilDestroyed())
    .subscribe((event) => {
      if (event instanceof NavigationStart) {
        trigger = event.navigationTrigger;
      } else if (event instanceof NavigationEnd) {
        const [path, fragment] = splitUrl(event.urlAfterRedirects);
        const pageChanged = lastPath !== null && path !== lastPath;
        lastPath = path;
        if (pageChanged && trigger !== "popstate" && !fragment) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }
    });
}

function splitUrl(url: string): [path: string, fragment: string] {
  const hash = url.indexOf("#");
  const beforeHash = hash === -1 ? url : url.slice(0, hash);
  return [beforeHash.split("?")[0]!, hash === -1 ? "" : url.slice(hash + 1)];
}
