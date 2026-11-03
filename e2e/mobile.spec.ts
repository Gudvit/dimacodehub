import { expect, test, type Page } from "@playwright/test";

// Runs only in the `mobile` project (see playwright.config.ts) — the navigation collapses
// into a toggle below the desktop breakpoint.
test("mobile menu toggles open and closed", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  const aboutLink = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "About" });

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(aboutLink).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(aboutLink).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(aboutLink).toBeHidden();
});

test("following a link from the mobile menu closes it", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await toggle.click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();

  await expect(page).toHaveURL(/\/#about$/);
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

// The arrow on the card's right edge is the thumb's way through the roles; the swipe stays.
test("the experience arrow steps through the roles and wraps around", async ({ page }) => {
  await page.goto("/#experience");

  const next = page.getByRole("button", { name: "Next role" });
  const dots = page.getByRole("button", { name: /^Go to role / });
  const count = await dots.count();

  await expect(dots.first()).toHaveAttribute("aria-current", "true");
  await next.tap();
  await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");

  for (let i = 1; i < count; i++) {
    await next.tap();
  }
  await expect(dots.first()).toHaveAttribute("aria-current", "true");
});

// A jump to a slide travels there (the slider scrolls smoothly); wait until it has arrived.
async function settle(page: Page): Promise<void> {
  const top = () => page.locator(".home-slider").evaluate((slider) => slider.scrollTop);
  let last = -1;
  await expect
    .poll(async () => {
      const now = await top();
      const still = now === last;
      last = now;
      return still;
    })
    .toBe(true);
}

// The phone's arrow at the foot of the slides: down while going down, up on the last slide
// and on the way back. The first slide has its own arrow, so this one waits until the second.
test("the hero's arrow and the slide arrow are never on screen together", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await settle(page);

  const heroArrow = page.getByRole("button", { name: "Scroll to next section" });
  const slideArrow = page.locator(".slide-step");
  await expect(heroArrow).toBeInViewport();
  await expect(slideArrow).not.toHaveClass(/is-visible/);

  // A slow scroll stopped halfway: the next slide is in view, the hero's arrow still is too.
  await page.locator(".home-slider").evaluate((slider) => {
    slider.scrollTo({ top: slider.clientHeight * 0.75, behavior: "instant" });
  });
  await expect(page.locator("#about")).toBeInViewport();
  await expect(heroArrow).toBeInViewport();
  await expect(slideArrow).not.toHaveClass(/is-visible/);

  await page.locator(".home-slider").evaluate((slider) => {
    const about = slider.querySelector<HTMLElement>("#about");
    slider.scrollTo({ top: about?.offsetTop, behavior: "instant" });
  });
  await expect(heroArrow).not.toBeInViewport();
  await expect(slideArrow).toHaveClass(/is-visible/);
});

test("the slide arrow steps down the slides and back up", async ({ page }) => {
  // The bounce never settles, and Playwright only taps what holds still.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#about");
  await settle(page);

  const down = page.getByRole("button", { name: "Next section", exact: true });
  await down.tap();
  await expect(page.getByRole("heading", { name: "EXPERIENCE" })).toBeInViewport();

  await page.goto("/#contacts");
  await settle(page);
  const up = page.getByRole("button", { name: "Previous section", exact: true });
  await up.tap();
  await expect(page.getByRole("heading", { name: "WRITING" })).toBeInViewport();
  await expect(page.getByRole("heading", { name: "LET'S CONNECT" })).not.toBeInViewport();
});
