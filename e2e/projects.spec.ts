import { expect, test } from "@playwright/test";

// The dev server shows drafts, so the draft case studies and side projects double as fixtures.
test("the projects page lists the case studies and the side projects", async ({ page }) => {
  await page.goto("/projects");

  await expect(
    page.getByRole("heading", { level: 1, name: "Work, and how it was done" }),
  ).toBeVisible();
  // One grid of pictures; each project's name is its heading and its link.
  await expect(page.getByRole("heading", { level: 2, name: "Apomeds" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Kraków Events" })).toBeVisible();

  await page.getByRole("link", { name: "Apomeds", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/apomeds$/);
});

test("a case study deep link renders the template and its metadata", async ({ page }) => {
  await page.goto("/projects/apomeds");

  await expect(page.getByRole("heading", { level: 1, name: "Apomeds" })).toBeVisible();
  await expect(page).toHaveTitle(/^Apomeds - /);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Apomeds");
  await expect(page.getByRole("note")).toContainText("Draft");
  await expect(page.getByRole("link", { name: /apomeds\.com/ })).toHaveAttribute(
    "href",
    "https://apomeds.com",
  );
  for (const heading of ["Context", "Constraints", "Key decisions", "Highlights", "Results"]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
});

test("a case study leads back to the projects list and to the contact form", async ({ page }) => {
  await page.goto("/projects/apomeds");

  await page.getByRole("link", { name: "Discuss a project" }).click();
  await expect(page).toHaveURL(/\/#contacts$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");

  await page.goto("/projects/apomeds");
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page).toHaveTitle("Projects - Dmytro Huliaiev");
});

test("a side project with a page opens from its poster", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "Kraków Events", exact: true }).click();

  await expect(page).toHaveURL(/\/projects\/krakow-events$/);
  await expect(page.getByRole("heading", { level: 1, name: "Kraków Events" })).toBeVisible();
  await expect(page.getByRole("link", { name: /t\.me\/KrakowEventsBot/ })).toHaveAttribute(
    "href",
    "https://t.me/KrakowEventsBot",
  );
});

test("unknown case study slug shows the not-found state", async ({ page }) => {
  await page.goto("/projects/no-such-project");
  await expect(page).toHaveTitle("Project not found - Dmytro Huliaiev");
  await expect(page.getByText("Project not found.")).toBeVisible();
});
