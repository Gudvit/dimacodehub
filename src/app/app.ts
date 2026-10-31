import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { countPageViews } from "./analytics/page-views";
import { syncPageUrl } from "./seo/page-url";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private pendingCursorFrame = 0;

  constructor() {
    syncPageUrl();
    countPageViews();
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
