import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core";
import { provideClientHydration, withNoIncrementalHydration } from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    // The pages arrive prerendered (ADR 0019); hydration adopts that DOM instead of
    // throwing it away and rendering it again. Incremental hydration is off because it
    // inlines its event-replay scripts into every page, and the CSP allows no inline script.
    provideClientHydration(withNoIncrementalHydration()),
  ],
};
