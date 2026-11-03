import { ApplicationConfig, inject, provideZonelessChangeDetection } from "@angular/core";
import { provideClientHydration, withNoIncrementalHydration } from "@angular/platform-browser";
import {
  provideRouter,
  Router,
  UrlTree,
  withComponentInputBinding,
  withViewTransitions,
} from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // Route changes animate through the browser's View Transitions API (styles in
    // `styles.scss`); the first navigation is the prerendered page arriving, so it is skipped.
    // Browsers without the API simply swap the page. A jump to a heading on the same page
    // (only the fragment changes) is a scroll, not a page change, so it gets no transition.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
          const navigation = inject(Router).currentNavigation();
          const from = navigation?.previousNavigation?.finalUrl;
          const to = navigation?.finalUrl;
          // In dev mode the router logs the skip as an AbortError; production stays quiet.
          if (from && to && withoutFragment(from) === withoutFragment(to)) {
            transition.skipTransition();
          }
        },
      }),
    ),
    // The pages arrive prerendered (ADR 0019); hydration adopts that DOM instead of
    // throwing it away and rendering it again. Incremental hydration is off because it
    // inlines its event-replay scripts into every page, and the CSP allows no inline script.
    provideClientHydration(withNoIncrementalHydration()),
  ],
};

function withoutFragment(url: UrlTree): string {
  return new UrlTree(url.root, url.queryParams).toString();
}
