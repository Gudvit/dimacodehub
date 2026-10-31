import { computed, signal } from "@angular/core";

/** From this quantity on, an order is "bulk" and gets the discount. */
export const BULK_FROM = 10;
export const BULK_DISCOUNT = 0.1;
export const PRICES = [9, 19, 29] as const;

export type Currency = "EUR" | "USD";

/** The derived values of the demo, in dependency order; also the keys of `runs`. */
export const DERIVED = ["subtotal", "isBulk", "discount", "total", "display"] as const;
export type Derived = (typeof DERIVED)[number];

/**
 * A tiny checkout as a signal graph, for the colophon's live demo. Every `computed()` counts
 * its own runs in a plain object — not a signal, so counting cannot cause a run — and the
 * page shows those numbers. They are the real thing: what the demo claims about
 * recomputation is what these counters measured.
 */
export function createCheckout() {
  const runs: Record<Derived, number> = {
    subtotal: 0,
    isBulk: 0,
    discount: 0,
    total: 0,
    display: 0,
  };

  const quantity = signal(2);
  const price = signal<number>(PRICES[1]);
  const currency = signal<Currency>("EUR");

  const subtotal = computed(() => {
    runs.subtotal++;
    return quantity() * price();
  });

  // Changes only when the quantity crosses BULK_FROM; anything downstream of it is spared
  // the other quantity changes.
  const isBulk = computed(() => {
    runs.isBulk++;
    return quantity() >= BULK_FROM;
  });

  // Reads `subtotal` only for a bulk order, so until then a price change does not reach it:
  // dependencies are whatever the last run read.
  const discount = computed(() => {
    runs.discount++;
    return isBulk() ? subtotal() * BULK_DISCOUNT : 0;
  });

  const total = computed(() => {
    runs.total++;
    return subtotal() - discount();
  });

  const display = computed(() => {
    runs.display++;
    return formatMoney(total(), currency());
  });

  return { quantity, price, currency, subtotal, isBulk, discount, total, display, runs };
}

export type Checkout = ReturnType<typeof createCheckout>;

export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
