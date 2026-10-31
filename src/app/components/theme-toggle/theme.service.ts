import { afterNextRender, computed, DestroyRef, inject, Injectable, signal } from "@angular/core";

export type Theme = "light" | "dark";

// Shared with the inline `#theme-init` script in `index.html`, which applies the stored choice
// before the first paint.
export const THEME_STORAGE_KEY = "theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * The light / dark theme, for every control that switches it: the header toggle and the
 * command palette. With no choice stored the site follows the system setting, live; a
 * switch pins the opposite of what is on screen to `data-theme` on `<html>` and remembers
 * it. The colours themselves are custom properties in `styles.scss`.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
  // The prerendered page cannot know the visitor's theme; the browser corrects it on hydration.
  readonly theme = signal<Theme>("light");
  /** What switching does, worded as an action: "Switch to dark theme". */
  readonly switchLabel = computed(() =>
    this.theme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const system = matchMedia(DARK_QUERY);
      this.theme.set(pinnedTheme() ?? (system.matches ? "dark" : "light"));

      const followSystem = (event: MediaQueryListEvent) => {
        if (!pinnedTheme()) {
          this.theme.set(event.matches ? "dark" : "light");
        }
      };
      system.addEventListener("change", followSystem);
      destroyRef.onDestroy(() => system.removeEventListener("change", followSystem));
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset["theme"] = next;
      this.theme.set(next);
    };

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be off (private mode, blocked cookies); the switch still works for the visit.
    }

    // Cross-fade the whole page instead of repainting it colour by colour.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }
}

function pinnedTheme(): Theme | null {
  const theme = document.documentElement.dataset["theme"];
  return theme === "light" || theme === "dark" ? theme : null;
}
