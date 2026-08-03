import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A flake in CI costs a whole deployment, so give it two more chances there; locally a
  // failure should stay a failure.
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:4200",
    trace: "on-first-retry",
  },
  // Two viewports, no duplicated work: everything runs on the desktop one except the
  // collapsed navigation, which only exists on a phone.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run start -- --port 4200 --host 127.0.0.1",
    url: "http://127.0.0.1:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
