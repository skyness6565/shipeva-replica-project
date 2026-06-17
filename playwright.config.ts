import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 * Set BASE_URL to point at the live preview (e.g. https://...lovableproject.com)
 * or leave unset to use the local dev server at http://localhost:5173.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
