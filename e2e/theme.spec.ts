import { expect, type Page, test } from "@playwright/test";

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("the site follows a dark system setting", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/blog");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  expect(await background(page)).toBe("rgb(17, 19, 31)");
});

test("the header toggle switches the theme and remembers it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/blog");
  expect(await background(page)).toBe("rgb(246, 243, 245)");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
  expect(await background(page)).toBe("rgb(17, 19, 31)");

  // The pick survives a reload, on a light system, from the first paint.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
