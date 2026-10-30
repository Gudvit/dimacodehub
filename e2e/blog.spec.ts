import { expect, test } from "@playwright/test";

test("header navigates to the blog and sets the page title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Dmytro Huliaiev - Senior Frontend Engineer");

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Blog" }).click();
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

test("leaving a post restores the site-wide metadata", async ({ page }) => {
  await page.goto("/blog/angular-architecture-patterns");
  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute(
    "content",
    "Angular Architecture Patterns I Use in Production",
  );

  await page.getByRole("link", { name: "Back to blog" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(ogTitle).toHaveAttribute("content", "Dmytro Huliaiev - Senior Frontend Engineer");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
});

test("unknown blog slug shows the not-found state", async ({ page }) => {
  await page.goto("/blog/no-such-post");
  await expect(page.getByText("Post not found.")).toBeVisible();
});

test("the footer contact link leads from the blog to the contact form", async ({ page }) => {
  await page.goto("/blog");

  await page
    .getByRole("navigation", { name: "Footer" })
    .getByRole("link", { name: "Contact" })
    .click();

  await expect(page).toHaveURL(/\/#contacts$/);
  await expect(page.getByRole("heading", { name: "LET'S CONNECT" })).toBeInViewport();
});

test("a post describes itself to search engines and leaves nothing behind", async ({ page }) => {
  await page.goto("/blog/angular-architecture-patterns");

  const jsonLd = page.locator('script[type="application/ld+json"]');
  const data = JSON.parse((await jsonLd.textContent()) ?? "{}");
  expect(data["@type"]).toBe("BlogPosting");
  expect(data.headline).toBe("Angular Architecture Patterns I Use in Production");
  expect(data.author.name).toBe("Dmytro Huliaiev");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://gudvit.github.io/dimacodehub/blog/angular-architecture-patterns/",
  );

  await page.getByRole("link", { name: "Back to blog" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(jsonLd).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://gudvit.github.io/dimacodehub/blog/",
  );
});
