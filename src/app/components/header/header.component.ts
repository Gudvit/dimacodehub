import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, map } from "rxjs";
import { HOME_SECTIONS, HomeSectionsService } from "../../navigation/home-sections";
import { CommandPaletteService } from "../command-palette/command-palette.service";
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";

@Component({
  selector: "app-header",
  imports: [RouterLink, ThemeToggleComponent],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
  readonly sections = HOME_SECTIONS;

  private readonly router = inject(Router);
  private readonly homeSections = inject(HomeSectionsService);

  /** The current path, without query or fragment: `/`, `/blog`, `/projects/apomeds`. */
  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => pathOf(event.urlAfterRedirects)),
    ),
    { initialValue: pathOf(this.router.url) },
  );

  /**
   * The menu item to mark. At home, the slide in view; elsewhere, the slide the page belongs
   * to — a case study to Projects, the blog to Writing.
   */
  readonly activeSection = computed(() => {
    const path = this.path();
    if (path === "/") {
      return this.homeSections.current();
    }
    if (path.startsWith("/projects")) {
      return "projects";
    }
    if (path.startsWith("/blog")) {
      return "writing";
    }
    return null;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly palette = inject(CommandPaletteService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // The header is fixed above the slider, so whatever scrolls to a section has to
    // subtract its height. It publishes that height itself rather than letting other
    // components measure `.site-header` through the document: the size depends on the
    // breakpoint and on this component's markup, and nobody else should have to know that.
    // Read and write are separate phases, so the value is in place before the home page's
    // own `afterNextRender` scrolls to a fragment.
    afterNextRender({
      earlyRead: () => this.headerElement()?.offsetHeight ?? 0,
      write: (height) => this.publishHeight(height),
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * The link itself sets the fragment; on the home page this also asks for the scroll, which
   * a second click on the same link needs — the router ignores the URL it is already on.
   */
  goToSection(id: string): void {
    this.closeMenu();
    if (this.path() === "/") {
      this.homeSections.request(id);
    }
  }

  openPalette(): void {
    this.closeMenu();
    this.palette.open();
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
    // `contentRect` would be the content box alone; what overlaps the page is the whole
    // header, padding and border included, so this reads the same box as the first render.
    const observer = new ResizeObserver(() => this.writeHeight(header.offsetHeight));
    observer.observe(header);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private writeHeight(height: number | undefined): void {
    document.documentElement.style.setProperty("--header-height", `${height ?? 0}px`);
  }
}

function pathOf(url: string): string {
  return url.split(/[?#]/)[0] || "/";
}
