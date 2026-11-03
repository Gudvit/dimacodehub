import { expect, test } from "@playwright/test";

test("home hero renders the primary actions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dmytro Huliaiev", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download CV" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Discuss a project" })).toBeVisible();
  // The proof strip: the agreed numbers and the company logos, named for screen readers.
  await expect(page.getByText("100K+", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "IdeaSoft" })).toBeVisible();
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

test("discuss a project jumps to the contact section and back to top returns", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Discuss a project" }).click();
  await expect(page.getByRole("heading", { name: "LET'S CONNECT" })).toBeInViewport();

  await page.getByRole("button", { name: "Back to top" }).click();
  await expect(page.getByRole("heading", { name: "Dmytro Huliaiev", level: 1 })).toBeInViewport();
});

test("the published header height matches the whole header", async ({ page }) => {
  await page.goto("/");

  // Every scroll offset on the slider and the hero portrait's top edge read this variable.
  // It once held the content box alone (32px of an 81px header), and jsdom cannot see it.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const published = getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height",
        );
        const header = document.querySelector<HTMLElement>(".site-header");
        return Number.parseFloat(published) - (header?.offsetHeight ?? -1);
      }),
    )
    .toBe(0);
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

  for (const [id, selector] of [
    ["projects", ".projects__headline"],
    ["writing", ".writing__headline"],
  ]) {
    test(`the ${id} headline is plain text from the start`, async ({ page }) => {
      await page.goto(`/#${id}`);
      const headline = page.locator(selector);

      await expect(headline).toHaveCSS("opacity", "1");
      await expect(headline.locator("app-animated-text")).toHaveCount(0);
    });
  }
});

for (const [id, selector] of [
  ["projects", ".projects__headline"],
  ["writing", ".writing__headline"],
]) {
  test(`the ${id} headline animates in when its slide is reached`, async ({ page }) => {
    await page.goto(`/#${id}`);
    const headline = page.locator(selector);

    await expect(headline.locator("app-animated-text")).toBeVisible();
    await expect(headline).toHaveCSS("opacity", "1");
  });
}

test("the header marks the slide in view and scrolls to it again on a second click", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });

  await nav.getByRole("link", { name: "Experience" }).click();
  await expect(page).toHaveURL(/\/#experience$/);
  await expect(nav.getByRole("link", { name: "Experience" })).toHaveAttribute(
    "aria-current",
    "location",
  );

  // Away from the slide by hand, then the same link again: the URL does not change.
  await page.locator(".home-slider").evaluate((slider) => slider.scrollTo({ top: 0 }));
  await expect(nav.getByRole("link", { name: "Experience" })).not.toHaveAttribute(
    "aria-current",
    "location",
  );
  await nav.getByRole("link", { name: "Experience" }).click();
  await expect(nav.getByRole("link", { name: "Experience" })).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("the logo always leads back to the first slide", async ({ page }) => {
  await page.goto("/#experience");
  const nav = page.getByRole("navigation", { name: "Main" });
  const logo = page.getByRole("link", { name: "Dmytro Huliaiev - home" });

  // On the home page: the slider scrolls back to the hero.
  await expect(nav.getByRole("link", { name: "Experience" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  await logo.click();
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "location");
  await expect.poll(() => page.locator(".home-slider").evaluate((s) => s.scrollTop)).toBe(0);

  // From another page: the home page opens at its first slide.
  await page.goto("/blog");
  await logo.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "location");
});

// The dev server shows drafts, so the draft case studies double as fixtures here.
test("the projects slide shows the projects as pictures and links to each", async ({ page }) => {
  await page.goto("/");

  // Deferred until it nears the viewport, like the writing section below it.
  await page.locator(".projects-placeholder").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "PROJECTS" })).toBeVisible();
  await expect(page.locator("app-project-tile").first()).toBeVisible();

  await page.getByRole("link", { name: "Apomeds", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/apomeds$/);
});

test("the header's Projects link scrolls the home page to the projects slide", async ({ page }) => {
  await page.goto("/blog");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Projects" })
    .click();

  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.getByRole("heading", { name: "PROJECTS" })).toBeInViewport();
});

test("the writing section lists the latest posts and links to the blog", async ({ page }) => {
  await page.goto("/");

  // Deferred until it nears the viewport: the placeholder holds its place until then.
  await page.locator(".writing-placeholder").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "WRITING" })).toBeVisible();

  const cards = page.locator(".writing-card");
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toContainText("What AI Actually Changes About Frontend Engineering");

  await page
    .getByRole("link", { name: "What AI Actually Changes About Frontend Engineering" })
    .click();
  await expect(page).toHaveURL(/\/blog\/ai-frontend-engineering$/);

  await page.goto("/");
  await page.locator(".writing-placeholder").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: "All posts" }).click();
  await expect(page).toHaveURL(/\/blog$/);
});

test("the writing section's topics open the blog filtered", async ({ page }) => {
  // The topics give way on a short desktop screen, which the default 720px viewport is.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.locator(".writing-placeholder").scrollIntoViewIfNeeded();

  const topics = page.getByRole("navigation", { name: "Blog topics" });
  await topics.getByRole("link", { name: "Posts tagged NgRx" }).click();
  await expect(page).toHaveURL(/\/blog\?tag=NgRx$/);
  await expect(page.getByRole("status").filter({ hasText: "tagged" })).toHaveText(
    "2 posts tagged “NgRx”",
  );
});

test("the home page names its author for search engines", async ({ page }) => {
  await page.goto("/");

  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
  );
  expect(data["@type"]).toBe("Person");
  expect(data.name).toBe("Dmytro Huliaiev");
  expect(data.sameAs).toContain("https://github.com/Gudvit");
});
