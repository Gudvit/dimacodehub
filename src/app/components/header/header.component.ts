import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "app-header",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly menuOpen = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // The header is fixed above the slider, so whatever scrolls to a section has to
    // subtract its height. It publishes that height itself rather than letting other
    // components measure `.site-header` through the document: the size depends on the
    // breakpoint and on this component's markup, and nobody else should have to know that.
    // Read and write are separate phases, so the value is in place before the home page's
    // own `afterNextRender` scrolls to a fragment.
    afterNextRender({
      earlyRead: () => this.headerElement()?.clientHeight ?? 0,
      write: (height) => this.publishHeight(height),
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private headerElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector(".site-header");
  }

  private publishHeight(height: number): void {
    this.writeHeight(height);

    const header = this.headerElement();
    if (!header || !("ResizeObserver" in window)) {
      return;
    }

    // The height moves with the viewport: padding and logo size are breakpoint-bound.
    const observer = new ResizeObserver(([entry]) => this.writeHeight(entry?.contentRect.height));
    observer.observe(header);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private writeHeight(height: number | undefined): void {
    document.documentElement.style.setProperty("--header-height", `${height ?? 0}px`);
  }
}
