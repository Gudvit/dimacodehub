import { expect, type Locator, test } from "@playwright/test";

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

  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute(
    "content",
    "https://gudvit.github.io/dimacodehub/og/blog/angular-architecture-patterns.jpg",
  );

  await page.getByRole("link", { name: "Back to blog" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(ogTitle).toHaveAttribute("content", "Dmytro Huliaiev - Senior Frontend Engineer");
  await expect(ogImage).toHaveAttribute(
    "content",
    "https://gudvit.github.io/dimacodehub/images/og-cover.jpg",
  );
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

test("a post card and the post heading share one view-transition name", async ({ page }) => {
  const transitionName = (heading: Locator) =>
    heading.evaluate((element) => getComputedStyle(element).viewTransitionName);

  await page.goto("/blog");
  const card = page.getByRole("heading", {
    name: "What AI Actually Changes About Frontend Engineering",
  });
  expect(await transitionName(card)).toBe("post-ai-frontend-engineering");

  await card.getByRole("link").click();
  await expect(page).toHaveURL(/\/blog\/ai-frontend-engineering$/);
  const title = page.getByRole("heading", {
    level: 1,
    name: "What AI Actually Changes About Frontend Engineering",
  });
  await expect(title).toBeVisible();
  expect(await transitionName(title)).toBe("post-ai-frontend-engineering");
});

test("the tag filter narrows the list and lives in the URL", async ({ page }) => {
  await page.goto("/blog");
  const filter = page.getByRole("navigation", { name: "Filter posts by tag" });
  const cards = page.locator(".post-card");
  const all = await cards.count();

  await filter.getByRole("link", { name: /^NgRx/ }).click();
  await expect(page).toHaveURL(/\/blog\?tag=NgRx$/);
  await expect(page.getByRole("status")).toHaveText("2 posts tagged “NgRx”");
  await expect(cards).toHaveCount(2);
  await expect(filter.getByRole("link", { name: /^NgRx/ })).toHaveAttribute("aria-current", "page");

  await filter.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(cards).toHaveCount(all);
});

test("a filtered link opens the list already filtered", async ({ page }) => {
  await page.goto("/blog?tag=AI");
  await expect(page.locator(".post-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "What AI Actually Changes About Frontend Engineering" }),
  ).toBeVisible();
});

test("a post's tags lead back to the list filtered by that tag", async ({ page }) => {
  await page.goto("/blog/angular-architecture-patterns");
  await page.getByRole("link", { name: "More posts tagged NgRx" }).click();
  await expect(page).toHaveURL(/\/blog\?tag=NgRx$/);
  await expect(page.getByRole("status")).toHaveText("2 posts tagged “NgRx”");
});

test("the contents list jumps to a heading and marks it", async ({ page }) => {
  await page.goto("/blog/ai-frontend-engineering");
  const contents = page.getByRole("navigation", { name: "On this page" });
  const entry = contents.getByRole("link", { name: "Where does AI logic actually belong?" });

  await entry.click();
  await expect(page).toHaveURL(
    /\/blog\/ai-frontend-engineering#where-does-ai-logic-actually-belong$/,
  );
  await expect(
    page.getByRole("heading", { name: "Where does AI logic actually belong?" }),
  ).toBeInViewport();
  await expect(entry).toHaveAttribute("aria-current", "location");
});

test("a link to a heading opens the post at that heading", async ({ page }) => {
  await page.goto("/blog/ai-frontend-engineering#what-hasn-t-changed");
  await expect(page.getByRole("heading", { name: "What hasn't changed" })).toBeInViewport();
});
