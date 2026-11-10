import { afterNextRender, DestroyRef, ElementRef, inject, signal, Signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

/**
 * A heading counts as the one being read once it is in the top third of the screen, below
 * the header: by then the reader's eyes are in its section.
 */
const ACTIVE_HEADING_LINE = 1 / 3;

export interface HeadingTracker {
  /** The heading the reader is in, highlighted in the contents list. */
  readonly activeId: Signal<string | null>;
  /**
   * The contents links change the URL through `routerLink`; scrolling is done here, so a
   * second click on the same entry still scrolls (the router ignores an unchanged URL).
   * `scroll-margin-top` on the headings keeps them clear of the fixed header.
   */
  scrollTo(id: string, behavior?: ScrollBehavior): void;
}

/**
 * The "On this page" list of a long page (a post, a case study): which of the headings
 * matching `selector` is being read, and scrolling to one. Call it in an injection context.
 */
export function trackHeadings(selector: string): HeadingTracker {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const route = inject(ActivatedRoute);
  const destroyRef = inject(DestroyRef);
  const activeId = signal<string | null>(null);

  const headings = () => Array.from(host.querySelectorAll<HTMLElement>(selector));

  const scrollTo = (id: string, behavior?: ScrollBehavior) => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    headings()
      .find((heading) => heading.id === id)
      ?.scrollIntoView({ behavior: behavior ?? (reduceMotion ? "auto" : "smooth") });
  };

  afterNextRender(() => {
    // A deep link to a heading: the prerendered page may already be there, but hydration
    // and the entrance animation can move it, so land on it once more.
    const fragment = route.snapshot.fragment;
    if (fragment) {
      scrollTo(fragment, "auto");
    }

    // A scroll listener coalesced into one frame, outside change detection (as in `app.ts`).
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      );
      const line = (header || 0) + window.innerHeight * ACTIVE_HEADING_LINE;
      const all = headings();
      // The last sections are often too short to bring their heading up to the line before
      // the page ends; at the bottom, the last heading on screen is the one being read.
      const root = document.documentElement;
      const atBottom =
        root.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= root.scrollHeight - 2;
      const reached = atBottom
        ? all.filter((h) => h.getBoundingClientRect().top < window.innerHeight)
        : all.filter((h) => h.getBoundingClientRect().top <= line);
      activeId.set(reached.at(-1)?.id ?? null);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    destroyRef.onDestroy(() => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    });
  });

  return { activeId: activeId.asReadonly(), scrollTo };
}
