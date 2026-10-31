import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";

export type Theme = "light" | "dark";

// Shared with the inline `#theme-init` script in `index.html`, which applies the stored choice
// before the first paint.
export const THEME_STORAGE_KEY = "theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Light / dark switch. With no choice stored the site follows the system setting, live;
 * a click pins the opposite of what is on screen to `data-theme` on `<html>` and remembers
 * it. The colours themselves are custom properties in `styles.scss`.
 */
@Component({
  selector: "app-theme-toggle",
  templateUrl: "./theme-toggle.component.html",
  styleUrl: "./theme-toggle.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  // The prerendered page cannot know the visitor's theme; the browser corrects it on hydration.
  readonly theme = signal<Theme>("light");
  readonly label = computed(() =>
    this.theme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const system = matchMedia(DARK_QUERY);
      this.theme.set(pinnedTheme() ?? (system.matches ? "dark" : "light"));

      const followSystem = (event: MediaQueryListEvent) => {
        if (!pinnedTheme()) {
          this.theme.set(event.matches ? "dark" : "light");
        }
      };
      system.addEventListener("change", followSystem);
      this.destroyRef.onDestroy(() => system.removeEventListener("change", followSystem));
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
