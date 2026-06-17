import { test, expect, type Page } from "@playwright/test";

/**
 * Tablet-viewport e2e: sign in and create a new package, then verify the
 * redirect to the package detail page.
 *
 * Run only this project with:
 *   BASE_URL=<preview-url> ADMIN_PASSWORD=65657667 \
 *     bunx playwright test --project=tablet-chrome
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "65657667";

async function signIn(page: Page) {
  await page.goto("/auth");
  await page.waitForLoadState("networkidle");
  if (!page.url().includes("/auth")) return;
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 20_000 });
}

test("tablet: signs in and creates a new package, redirects to detail page", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/admin/packages/new");
  await expect(page.getByRole("heading", { name: /new package/i })).toBeVisible();

  const stamp = Date.now();
  await page.getByLabel(/package name/i).first().fill(`Tablet E2E ${stamp}`);
  await page.getByLabel(/full name/i).nth(0).fill("Tablet Sender");
  await page.getByLabel(/full name/i).nth(1).fill("Tablet Receiver");
  await page.getByLabel(/origin country/i).fill("USA");
  await page.getByLabel(/destination country/i).fill("UK");

  await page.getByRole("button", { name: /create package/i }).click();

  await page.waitForURL(
    /\/admin\/packages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    { timeout: 20_000 },
  );
  await expect(page.getByText(`Tablet E2E ${stamp}`)).toBeVisible();
});
