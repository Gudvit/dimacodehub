import { expect, test } from "@playwright/test";

test("the footer leads to the page about how the site is built", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("navigation", { name: "Footer" })
    .getByRole("link", { name: "How it's built" })
    .click();

  await expect(page).toHaveURL(/\/colophon$/);
  await expect(page).toHaveTitle("How this site is built - Dmytro Huliaiev");
  await expect(
    page.getByRole("heading", { level: 1, name: "How this site is built" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /^The architecture, decisions, quality gates/,
  );

  const decisions = page.getByRole("region", { name: "Architecture decisions" });
  await expect(
    decisions.getByRole("link", { name: /^0019 Every route is prerendered/ }),
  ).toHaveAttribute(
    "href",
    "https://github.com/Gudvit/dimacodehub/blob/main/docs/architecture/0019-build-time-prerender.md",
  );
  await expect(
    page.getByRole("region", { name: "Quality gates" }).getByRole("heading", { name: "E2E tests" }),
  ).toBeVisible();
});

test("without a production build the numbers say where they come from", async ({ page }) => {
  await page.goto("/colophon");
  await expect(
    page.getByText("The production build measures these; the dev server has no numbers to show."),
  ).toBeVisible();
});

test("the numbers come from the build that produced the page", async ({ page }) => {
  await page.route("**/build-stats.json", (route) =>
    route.fulfill({
      json: {
        builtAt: "2026-10-30T12:00:00.000Z",
        commit: "4a66f68c0ffee",
        initialJs: 128873,
        initialCss: 1090,
        lazyJs: 20194,
        lazyChunks: 5,
        prerenderedPages: 7,
        unitTests: 56,
        e2eTests: 33,
        lighthouse: { performance: 87, accessibility: 100, bestPractices: 100, seo: 100 },
      },
    }),
  );
  await page.goto("/colophon");

  const numbers = page.getByRole("region", { name: "By the numbers" });
  await expect(numbers.getByText("128.9 kB")).toBeVisible();
  await expect(numbers.getByText("loaded on demand, in 5 chunks")).toBeVisible();
  await expect(numbers.getByText("87")).toBeVisible();
  await expect(numbers.getByRole("link", { name: "commit 4a66f68" })).toHaveAttribute(
    "href",
    "https://github.com/Gudvit/dimacodehub/commit/4a66f68c0ffee",
  );
});

test("the signals demo shows what a change reruns", async ({ page }) => {
  await page.goto("/colophon");
  const demo = page.locator("app-signals-demo");
  await demo.scrollIntoViewIfNeeded();

  await demo.getByRole("button", { name: "USD" }).click();
  await expect(page.locator(".demo-summary")).toHaveText(
    "Ran again: display. Skipped: subtotal, isBulk, discount, total. 1 value rewritten on screen.",
  );
  await expect(demo.locator('[data-binding="display"]')).toHaveText("$38.00");
});
