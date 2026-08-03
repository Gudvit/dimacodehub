import { expect, test } from "@playwright/test";

test("header navigates to the blog and sets the page title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Dmytro Huliaiev - Senior Frontend Engineer");

  await page.getByRole("navigation").getByRole("link", { name: "Blog" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page).toHaveTitle("Blog - Dmytro Huliaiev");
  await expect(
    page.getByRole("heading", { name: "Thoughts on frontend engineering" }),
  ).toBeVisible();
});

test("blog cards are reachable with the keyboard", async ({ page }) => {
  await page.goto("/blog");
  const firstPost = page.getByRole("link", {
    name: "What AI Actually Changes About Frontend Engineering",
  });
  await firstPost.focus();
  await expect(firstPost).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/blog\/ai-frontend-engineering$/);
});

test("blog post deep link renders the article and its metadata", async ({ page }) => {
  await page.goto("/blog/angular-architecture-patterns");
  await expect(
    page.getByRole("heading", { name: "Angular Architecture Patterns I Use in Production" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/^Angular Architecture Patterns I Use in Production - /);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Angular Architecture Patterns I Use in Production",
  );
  await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible();
});

test("unknown blog slug shows the not-found state", async ({ page }) => {
  await page.goto("/blog/no-such-post");
  await expect(page.getByText("Post not found.")).toBeVisible();
});
