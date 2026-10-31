import {
  afterEveryRender,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from "@angular/core";
import {
  BULK_FROM,
  createCheckout,
  type Currency,
  DERIVED,
  type Derived,
  PRICES,
} from "./checkout";

const QUANTITY_MAX = 20;

/** What each derived value reads — the edges of the graph, as the page prints them. */
const READS: Record<Derived, string> = {
  subtotal: "quantity × price",
  isBulk: `quantity ≥ ${BULK_FROM}`,
  discount: "isBulk ? subtotal × 10% : 0",
  total: "subtotal − discount",
  display: "total, currency",
};

/**
 * The colophon's live demo of signals in a zoneless app: change an input and see which
 * computed values run again and how much of the DOM changes.
 *
 * The run counters and the summary are written straight into the DOM after each render, not
 * through signals: a signal written after render would schedule another render, and the demo
 * would end up measuring itself.
 */
@Component({
  selector: "app-signals-demo",
  templateUrl: "./signals-demo.component.html",
  styleUrl: "./signals-demo.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsDemoComponent {
  readonly checkout = createCheckout();
  readonly prices = PRICES;
  readonly currencies: readonly Currency[] = ["EUR", "USD"];
  readonly derived = DERIVED;
  readonly reads = READS;
  readonly bulkFrom = BULK_FROM;
  readonly quantityMax = QUANTITY_MAX;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private painted: Record<Derived, number> | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    afterNextRender(() => {
      // Counts what Angular rewrites on screen, in the preview only.
      const preview = this.host.nativeElement.querySelector(".demo-preview");
      if (preview && "MutationObserver" in window) {
        this.observer = new MutationObserver(() => undefined);
        this.observer.observe(preview, { characterData: true, childList: true, subtree: true });
      }
    });
    afterEveryRender(() => this.paint());
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  step(by: number): void {
    this.checkout.quantity.update((quantity) => Math.min(QUANTITY_MAX, Math.max(1, quantity + by)));
  }

  /** Writes the run counters, flashes what ran, and sums the change up. */
  private paint(): void {
    const root = this.host.nativeElement;
    const runs = { ...this.checkout.runs };
    const ran = DERIVED.filter((name) => this.painted && runs[name] !== this.painted[name]);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const name of DERIVED) {
      const counter = root.querySelector(`[data-runs="${name}"]`);
      if (counter) {
        counter.textContent = `${runs[name]}×`;
      }
      if (ran.includes(name) && !reduceMotion) {
        const node = root.querySelector(`[data-node="${name}"]`);
        node?.classList.remove("is-running");
        void (node as HTMLElement | null)?.offsetWidth; // restart the animation
        node?.classList.add("is-running");
      }
    }

    const records = this.observer?.takeRecords() ?? [];
    const summary = root.querySelector(".demo-summary");
    // Any render of the app lands here, including ones this demo had no part in (the theme
    // switch, the command palette); only a change that ran something is worth reporting.
    if (summary && ran.length) {
      const skipped = DERIVED.filter((name) => !ran.includes(name));
      const touched = new Set(
        records
          .map((record) =>
            record.target instanceof Element ? record.target : record.target.parentElement,
          )
          .map((element) => element?.closest("[data-binding]"))
          .filter(Boolean),
      );
      summary.textContent =
        `Ran again: ${ran.join(", ") || "nothing"}. ` +
        `Skipped: ${skipped.join(", ") || "nothing"}. ` +
        `${touched.size} ${touched.size === 1 ? "value" : "values"} rewritten on screen.`;
    }
    this.painted = runs;
  }
}
