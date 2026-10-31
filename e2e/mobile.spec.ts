import { expect, test } from "@playwright/test";

// Runs only in the `mobile` project (see playwright.config.ts) — the navigation collapses
// into a toggle below the desktop breakpoint.
test("mobile menu toggles open and closed", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  const blogLink = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Blog" });

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
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Blog" }).click();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

// A phone has no ⌘K: the header button is the only way in, and a tap runs a command.
test("the palette opens from the header button and runs a tapped command", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Search and commands" }).tap();
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await page.getByRole("option", { name: /^Blog/ }).tap();

  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
});
