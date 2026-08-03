import { expect, test } from "@playwright/test";

test("contact section keeps the direct channels as a fallback", async ({ page }) => {
  await page.goto("/#contacts");

  const cta = page.getByRole("link", { name: "Write me an email" });
  await expect(cta).toBeVisible();

  const href = await cta.getAttribute("href");
  expect(href).toContain("mailto:gudvitt@gmail.com");
  expect(href).toContain("subject=Project%20inquiry");

  // The visible details come from the same constants as the link above.
  await expect(page.getByRole("link", { name: "gudvitt@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:gudvitt@gmail.com",
  );
  await expect(page.getByRole("link", { name: "+48 577 68 22 99" })).toHaveAttribute(
    "href",
    "tel:+48577682299",
  );
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
