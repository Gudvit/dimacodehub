import { expect, test } from "@playwright/test";

// Runs only in the `mobile` project (see playwright.config.ts) — the navigation collapses
// into a toggle below the desktop breakpoint.
test("mobile menu toggles open and closed", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  const blogLink = page.getByRole("navigation").getByRole("link", { name: "Blog" });

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(blogLink).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(blogLink).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(blogLink).toBeHidden();
});

test("following a link from the mobile menu closes it", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await toggle.click();
  await page.getByRole("navigation").getByRole("link", { name: "Blog" }).click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
