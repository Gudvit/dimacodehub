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

test("contact section keeps the mailto link as a fallback", async ({ page }) => {
  await page.goto("/#contacts");

  const cta = page.getByRole("link", { name: "Write me an email" });
  await expect(cta).toBeVisible();

  const href = await cta.getAttribute("href");
  expect(href).toContain("mailto:gudvitt@gmail.com");
  expect(href).toContain("subject=Project%20inquiry");
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

test("contact form refuses to submit an invalid message", async ({ page }) => {
  let requests = 0;
  await page.route("https://api.web3forms.com/**", async (route) => {
    requests += 1;
    await route.fulfill({ json: { success: true } });
  });

  await page.goto("/#contacts");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Please enter your name")).toBeVisible();
  await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  await expect(page.getByText("A couple of sentences is enough")).toBeVisible();
  expect(requests).toBe(0);
});

test("contact form posts the message and confirms only after the service accepts it", async ({
  page,
}) => {
  const payloads: Record<string, unknown>[] = [];
  await page.route("https://api.web3forms.com/**", async (route) => {
    payloads.push(route.request().postDataJSON());
    await route.fulfill({ json: { success: true, message: "Email sent successfully!" } });
  });

  await page.goto("/#contacts");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Message").fill("I would like to talk about an Angular rewrite.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Message sent.")).toBeVisible();
  expect(payloads).toHaveLength(1);
  expect(payloads[0]!["email"]).toBe("ada@example.com");
  expect(payloads[0]!["message"]).toBe("I would like to talk about an Angular rewrite.");
});

test("contact form admits failure instead of claiming a message was sent", async ({ page }) => {
  await page.route("https://api.web3forms.com/**", async (route) => {
    await route.fulfill({ status: 500, json: { success: false, message: "Server error" } });
  });

  await page.goto("/#contacts");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Message").fill("I would like to talk about an Angular rewrite.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("The message could not be sent")).toBeVisible();
  await expect(page.getByText("Message sent.")).toHaveCount(0);
});
