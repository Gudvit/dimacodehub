import { expect, test } from "@playwright/test";

// The dev server shows drafts, so the draft case study doubles as the template fixture.
test("a case study deep link renders the template and its metadata", async ({ page }) => {
  await page.goto("/projects/payment-flows-e2e");

  await expect(
    page.getByRole("heading", { level: 1, name: "Making payment flows safe to change" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/^Making payment flows safe to change - /);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Making payment flows safe to change",
  );
  await expect(page.getByRole("note")).toContainText("Draft");
  for (const heading of ["Context", "Constraints", "Key decisions", "Results"]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
});

test("a case study leads back to the projects list and to the contact form", async ({ page }) => {
  await page.goto("/projects/payment-flows-e2e");

  await page.getByRole("link", { name: "Discuss a project" }).click();
  await expect(page).toHaveURL(/\/#contacts$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");

  await page.goto("/projects/payment-flows-e2e");
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page).toHaveTitle("Projects - Dmytro Huliaiev");
});

test("unknown case study slug shows the not-found state", async ({ page }) => {
  await page.goto("/projects/no-such-project");
  await expect(page).toHaveTitle("Project not found - Dmytro Huliaiev");
  await expect(page.getByText("Project not found.")).toBeVisible();
});
