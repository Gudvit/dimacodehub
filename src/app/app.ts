import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly routeAnimationsEnabled = signal(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private hasNavigated = false;
  private pendingCursorFrame = 0;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // Skip the first navigation so the initial page does not animate in.
        if (!this.hasNavigated) {
          this.hasNavigated = true;
          return;
        }
        this.routeAnimationsEnabled.set(true);
      });

    afterNextRender(() => this.trackCursor());
  }

  /**
   * The cursor spotlight is pure CSS state, so the listener is registered manually
   * (not via @HostListener) to keep it out of change detection, and writes are
   * coalesced into one frame.
   */
  private trackCursor(): void {
    const onMouseMove = (event: MouseEvent) => {
      if (this.pendingCursorFrame) {
        cancelAnimationFrame(this.pendingCursorFrame);
      }

      this.pendingCursorFrame = requestAnimationFrame(() => {
        this.pendingCursorFrame = 0;
        const style = document.documentElement.style;
        style.setProperty("--cursor-x", `${event.clientX}px`);
        style.setProperty("--cursor-y", `${event.clientY}px`);
      });
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });

    this.destroyRef.onDestroy(() => {
      document.removeEventListener("mousemove", onMouseMove);
      if (this.pendingCursorFrame) {
        cancelAnimationFrame(this.pendingCursorFrame);
      }
    });
  }
}
