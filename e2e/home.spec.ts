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

test("the scroll hint moves down the slider from the keyboard", async ({ page }) => {
  await page.goto("/");

  const hint = page.getByRole("button", { name: "Scroll to next section" });
  await hint.focus();
  await hint.press("Enter");

  await expect(page.getByRole("heading", { name: "ABOUT ME" })).toBeInViewport();
});

test("contact me jumps to the contact section and back to top returns", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Contact me" }).click();
  await expect(page.getByRole("heading", { name: "LET'S CONNECT" })).toBeInViewport();

  await page.getByRole("button", { name: "Back to top" }).click();
  await expect(page.getByRole("heading", { name: "Dmytro Huliaiev", level: 1 })).toBeInViewport();
});

test("a fragment deep link scrolls the slider to that section", async ({ page }) => {
  await page.goto("/#contacts");

  await expect(page.getByRole("heading", { name: "LET'S CONNECT" })).toBeInViewport();
});

test("an unusable url fragment is ignored instead of throwing", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  // `#2024` is a legal fragment but an illegal CSS selector: unescaped, it takes the
  // fragment subscription down with it and anchor scrolling dies for the whole session.
  await page.goto("/#2024");

  await expect(page.getByRole("heading", { name: "Dmytro Huliaiev", level: 1 })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the about headline is legible without waiting to be scrolled into view", async ({
    page,
  }) => {
    await page.goto("/");
    const headline = page.locator(".about-hero__headline");

    // No IntersectionObserver run, no letter-by-letter reveal: the heading is simply there,
    // as plain text at full opacity. Asserting the rendered result rather than the
    // `is-visible` class keeps this honest — that class is what *starts* the animation.
    await expect(headline).toHaveCSS("opacity", "1");
    await expect(headline.locator("app-animated-text")).toHaveCount(0);
  });
});

test("the projects page shows the placeholder", async ({ page }) => {
  await page.goto("/projects");

  await expect(page).toHaveTitle("Projects - Dmytro Huliaiev");
  await expect(page.getByText("Coming soon")).toBeVisible();
  await expect(page.locator("app-loader svg")).toBeVisible();
});
