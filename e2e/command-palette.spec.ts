import { expect, test } from "@playwright/test";

test("Ctrl+K opens the palette and a search leads to a page", async ({ page }) => {
  await page.goto("/blog");
  const palette = page.getByRole("dialog", { name: "Command palette" });
  const search = page.getByRole("combobox", { name: "Search pages, posts and actions" });

  // The palette is a deferred chunk; the shortcut works once it has loaded.
  await expect(async () => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(search).toBeFocused();

  await search.fill("how this site");
  await expect(page.getByRole("option", { name: /How this site is built/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/colophon$/);
  await expect(palette).toBeHidden();
});

test("the header button opens the palette and Escape gives focus back", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search and commands" });
  const palette = page.getByRole("dialog", { name: "Command palette" });

  await trigger.click();
  await expect(palette).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the palette opens a post and switches the theme", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search and commands" });
  const search = page.getByRole("combobox", { name: "Search pages, posts and actions" });

  await trigger.click();
  await search.fill("ngrx state");
  await page.getByRole("option", { name: /State Management/ }).click();
  await expect(page).toHaveURL(/\/blog\/state-management-production$/);

  await trigger.click();
  await search.fill("dark");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("the palette copies the email address", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.getByRole("button", { name: "Search and commands" }).click();
  await page.getByRole("combobox", { name: "Search pages, posts and actions" }).fill("copy email");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("status").filter({ hasText: "Copied" })).toHaveText(
    "Copied gudvitt@gmail.com",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("gudvitt@gmail.com");
});
