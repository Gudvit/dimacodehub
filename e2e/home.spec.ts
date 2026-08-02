import { expect, test } from "@playwright/test";

test("home hero renders the primary actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dmytro Huliaiev", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download CV" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Contact me" })).toBeVisible();
});

test("cv link stays relative so it survives the base href", async ({ page }) => {
  await page.goto("/");
  const href = await page.getByRole("link", { name: "Download CV" }).first().getAttribute("href");
  expect(href).toBe("dmytro_huliaiev_cv.pdf");
});

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

test("mobile menu toggles open and closed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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

test("contact section offers a real mailto link, not a fake form", async ({ page }) => {
  await page.goto("/#contacts");

  const cta = page.getByRole("link", { name: "Write me an email" });
  await expect(cta).toBeVisible();

  const href = await cta.getAttribute("href");
  expect(href).toContain("mailto:gudvitt@gmail.com");
  expect(href).toContain("subject=Project%20inquiry");

  // The form used to claim a message was sent while sending nothing - it must stay gone.
  await expect(page.locator("form.message-form")).toHaveCount(0);
});
