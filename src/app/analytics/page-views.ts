import { DOCUMENT, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, TitleStrategy } from "@angular/router";
import { filter } from "rxjs";
import { SITE_URL } from "../site";

/**
 * The GoatCounter site that receives the page views (ADR 0022). The CSP's `connect-src`
 * names its origin; `index-html.spec.ts` keeps the two in step.
 */
export const GOATCOUNTER_ENDPOINT = "https://dimacodehub.goatcounter.com/count";

/** Only the deployed site counts: not the dev server, the e2e runs or Lighthouse. */
const PRODUCTION_HOST = new URL(SITE_URL).host;

export interface PageView {
  /** The route, without the base href, query or fragment: `/blog/x`. */
  readonly path: string;
  readonly title: string;
  /** Where the visitor came from; empty after the first page of a visit. */
  readonly referrer: string;
  readonly screen: { readonly width: number; readonly height: number; readonly ratio: number };
}

/** The request GoatCounter's own `count.js` would send for this view. */
export function pageViewUrl(view: PageView): string {
  const url = new URL(GOATCOUNTER_ENDPOINT);
  url.searchParams.set("p", view.path);
  url.searchParams.set("t", view.title);
  url.searchParams.set("r", view.referrer);
  url.searchParams.set("s", [view.screen.width, view.screen.height, view.screen.ratio].join(","));
  return url.href;
}

/**
 * Counts a page view on every navigation, with a beacon to GoatCounter: no cookies, no
 * third-party script, nothing stored on the device. The prerender and every host but
 * production send nothing.
 * Runs for the whole app — call it once, from the root component's constructor.
 */
export function countPageViews(): void {
  const document = inject(DOCUMENT);
  const window = document.defaultView;
  if (
    !isPlatformBrowser(inject(PLATFORM_ID)) ||
    !window ||
    window.location.host !== PRODUCTION_HOST ||
    !window.navigator.sendBeacon
  ) {
    return;
  }

  const router = inject(Router);
  const titles = inject(TitleStrategy);
  let referrer = document.referrer;
  let lastPath: string | null = null;

  router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe((event) => {
      // A jump to a heading or a blog tag filter changes the URL, not the page.
      const path = event.urlAfterRedirects.split(/[?#]/)[0]!;
      if (path === lastPath) {
        return;
      }
      lastPath = path;

      const view: PageView = {
        path,
        // The router may set the document title after NavigationEnd; ask it directly.
        title: titles.buildTitle(router.routerState.snapshot) ?? document.title,
        referrer,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          ratio: window.devicePixelRatio || 1,
        },
      };
      referrer = "";
      window.navigator.sendBeacon(pageViewUrl(view));
    });
}
