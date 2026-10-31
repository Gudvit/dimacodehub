import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { BlogService } from "../../pages/blog/services/blog.service";
import { CONTACT_EMAIL, CV_PATH, PROFILES } from "../../site";
import { ThemeService } from "../theme-toggle/theme.service";
import { CommandPaletteService } from "./command-palette.service";
import { type Command, filterCommands } from "./commands";

/** How long the confirmation of an action ("Email copied") stays on screen. */
const TOAST_MS = 2500;

/**
 * ⌘K / Ctrl+K: jump to a page or a post, copy the email, download the CV, switch the theme.
 * A modal `<dialog>` (focus stays inside, Esc closes, focus returns to where it was) with an
 * ARIA combobox: the input keeps focus and points at the highlighted option. The app loads it
 * as a deferred chunk; `CommandPaletteService` says whether it is open.
 */
@Component({
  selector: "app-command-palette",
  templateUrl: "./command-palette.component.html",
  styleUrl: "./command-palette.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent {
  private readonly palette = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly themes = inject(ThemeService);
  private readonly blog = inject(BlogService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");

  readonly query = signal("");
  readonly activeIndex = signal(0);
  readonly toast = signal("");
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  readonly commands = computed<Command[]>(() => [
    { id: "page-home", label: "Home", group: "Pages", run: () => this.go("/") },
    {
      id: "page-projects",
      label: "Projects",
      group: "Pages",
      keywords: "case studies work",
      run: () => this.go("/projects"),
    },
    {
      id: "page-blog",
      label: "Blog",
      group: "Pages",
      keywords: "posts articles",
      run: () => this.go("/blog"),
    },
    {
      id: "page-contact",
      label: "Contact",
      group: "Pages",
      keywords: "message form hire",
      run: () => void this.router.navigate(["/"], { fragment: "contacts" }),
    },
    {
      id: "page-colophon",
      label: "How this site is built",
      group: "Pages",
      keywords: "colophon architecture stack lighthouse",
      run: () => this.go("/colophon"),
    },
    ...this.blog.getAll().map<Command>((post) => ({
      id: `post-${post.slug}`,
      label: post.title,
      group: "Posts",
      keywords: post.tags.join(" "),
      run: () => this.go(`/blog/${post.slug}`),
    })),
    {
      id: "action-copy-email",
      label: "Copy email address",
      group: "Actions",
      keywords: `mail contact ${CONTACT_EMAIL}`,
      run: () => this.copyEmail(),
    },
    {
      id: "action-cv",
      label: "Download CV",
      group: "Actions",
      keywords: "resume pdf",
      run: () => this.downloadCv(),
    },
    {
      id: "action-theme",
      label: this.themes.switchLabel(),
      group: "Actions",
      keywords: "theme dark light mode appearance",
      run: () => this.themes.toggle(),
    },
    ...PROFILES.map<Command>((profile) => ({
      id: `profile-${profile.label.toLowerCase()}`,
      label: `Open ${profile.label}`,
      group: "Profiles",
      keywords: "social profile",
      run: () => window.open(profile.href, "_blank", "noopener,noreferrer"),
    })),
  ]);

  readonly results = computed(() => filterCommands(this.commands(), this.query()));
  readonly activeId = computed(() => this.results()[this.activeIndex()]?.id ?? null);

  constructor() {
    afterNextRender(() => this.listenForShortcut());

    // The service is the source of truth; the dialog follows it.
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.palette.isOpen() && !dialog.open) {
        this.query.set("");
        this.activeIndex.set(0);
        dialog.showModal();
      } else if (!this.palette.isOpen() && dialog.open) {
        dialog.close();
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.toastTimer));
  }

  /** Esc, a backdrop click or a command closed the dialog; tell the service. */
  onDialogClose(): void {
    this.palette.close();
  }

  /** A click on the backdrop lands on the `<dialog>` itself, outside its panel. */
  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.palette.close();
    }
  }

  onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (count) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        this.activeIndex.update((index) => (index + step + count) % count);
        this.revealActive();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = this.results()[this.activeIndex()];
      if (command) {
        this.run(command);
      }
    }
  }

  run(command: Command): void {
    this.palette.close();
    command.run();
  }

  private go(url: string): void {
    void this.router.navigateByUrl(url);
  }

  private copyEmail(): void {
    navigator.clipboard.writeText(CONTACT_EMAIL).then(
      () => this.showToast(`Copied ${CONTACT_EMAIL}`),
      () => this.showToast(`Could not copy — the address is ${CONTACT_EMAIL}`),
    );
  }

  private downloadCv(): void {
    const link = document.createElement("a");
    link.href = CV_PATH;
    link.download = "";
    link.click();
  }

  private showToast(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(""), TOAST_MS);
  }

  private revealActive(): void {
    requestAnimationFrame(() => {
      const id = this.activeId();
      if (id) {
        document.getElementById(id)?.scrollIntoView({ block: "nearest" });
      }
    });
  }

  /** One keydown listener on the document, outside change detection: typing elsewhere is free. */
  private listenForShortcut(): void {
    const onKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.palette.toggle();
      }
    };
    document.addEventListener("keydown", onKeydown);
    this.destroyRef.onDestroy(() => document.removeEventListener("keydown", onKeydown));
  }
}
