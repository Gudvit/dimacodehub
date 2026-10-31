import { describe, expect, it } from "vitest";
import { BULK_FROM, type Checkout, createCheckout } from "./checkout";

/** Reads every derived value, as the template does, and returns how many times each ran. */
function render(checkout: Checkout) {
  checkout.display();
  checkout.discount();
  return { ...checkout.runs };
}

describe("createCheckout", () => {
  it("computes the order", () => {
    const checkout = createCheckout();
    checkout.quantity.set(BULK_FROM);
    checkout.price.set(9);
    checkout.currency.set("USD");
    expect(checkout.subtotal()).toBe(90);
    expect(checkout.discount()).toBe(9);
    expect(checkout.display()).toBe("$81.00");
  });

  it("reruns only the display when the currency changes", () => {
    const checkout = createCheckout();
    const before = render(checkout);
    checkout.currency.set("USD");
    const after = render(checkout);
    expect(after).toEqual({ ...before, display: before.display + 1 });
  });

  it("leaves the discount alone below the bulk quantity", () => {
    const checkout = createCheckout();
    const before = render(checkout);
    checkout.price.set(29); // the discount does not read the subtotal yet
    checkout.quantity.update((quantity) => quantity + 1); // isBulk stays false
    const after = render(checkout);
    expect(after.discount).toBe(before.discount);
    expect(after.subtotal).toBe(before.subtotal + 1);
  });

  it("stops at a value that did not change", () => {
    const checkout = createCheckout();
    checkout.price.set(29);
    checkout.quantity.set(BULK_FROM - 1);
    const before = render(checkout);
    checkout.quantity.set(BULK_FROM); // 261 before, 290 − 29 = 261 after
    const after = render(checkout);
    expect(after.total).toBe(before.total + 1);
    expect(after.display).toBe(before.display);
  });

  it("does nothing for a value set to what it already was", () => {
    const checkout = createCheckout();
    const before = render(checkout);
    checkout.price.set(checkout.price());
    expect(render(checkout)).toEqual(before);
  });
});
