import { test, expect, type Page } from "@playwright/test";

/**
 * E2E tests for the admin package flow on a mobile viewport.
 * Requires:
 *   - BASE_URL pointing at a running preview (defaults to http://localhost:5173)
 *   - ADMIN_PASSWORD env var (defaults to the project's seeded admin password)
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "65657667";

async function signIn(page: Page) {
  await page.goto("/auth");
  // The auth page may immediately redirect to /admin if a session already exists.
  await page.waitForLoadState("networkidle");
  if (!page.url().includes("/auth")) return;

  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 20_000 });
}

test.describe("Admin package creation (mobile)", () => {
  test("signs in and creates a new package, then redirects to detail page", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/packages/new");
    await expect(page.getByRole("heading", { name: /new package/i })).toBeVisible();

    const stamp = Date.now();
    await page.getByLabel(/package name/i).first().fill(`Mobile E2E ${stamp}`);
    await page.getByLabel(/full name/i).nth(0).fill("E2E Sender");
    await page.getByLabel(/full name/i).nth(1).fill("E2E Receiver");
    await page.getByLabel(/origin country/i).fill("USA");
    await page.getByLabel(/destination country/i).fill("UK");

    await page.getByRole("button", { name: /create package/i }).click();

    // Server returns the created row and the app navigates to /admin/packages/<uuid>.
    await page.waitForURL(
      /\/admin\/packages\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      { timeout: 20_000 },
    );
    await expect(page.getByText(`Mobile E2E ${stamp}`)).toBeVisible();
  });

  test("blocks submission when each required field is missing and surfaces the validation message", async ({
    page,
  }) => {
    await signIn(page);

    const required = [
      { label: /package name/i, skip: "package_name" },
      { label: /full name/i, skip: "sender_name", index: 0 },
      { label: /full name/i, skip: "receiver_name", index: 1 },
      { label: /origin country/i, skip: "origin_country" },
      { label: /destination country/i, skip: "destination_country" },
    ] as const;

    for (const missing of required) {
      await page.goto("/admin/packages/new");
      await expect(
        page.getByRole("heading", { name: /new package/i }),
      ).toBeVisible();

      // Fill every required field EXCEPT the one we're testing.
      const fill = async (
        label: RegExp,
        value: string,
        index?: number,
      ) => {
        const loc =
          index === undefined
            ? page.getByLabel(label).first()
            : page.getByLabel(label).nth(index);
        await loc.fill(value);
      };

      if (missing.skip !== "package_name")
        await fill(/package name/i, "Mobile Validation");
      if (missing.skip !== "sender_name") await fill(/full name/i, "Sender", 0);
      if (missing.skip !== "receiver_name")
        await fill(/full name/i, "Receiver", 1);
      if (missing.skip !== "origin_country") await fill(/origin country/i, "USA");
      if (missing.skip !== "destination_country")
        await fill(/destination country/i, "UK");

      await page.getByRole("button", { name: /create package/i }).click();

      // The browser's native constraint validation focuses the first invalid
      // required input and reports a non-empty validationMessage. The form
      // must NOT submit, so the URL stays on /admin/packages/new.
      await page.waitForTimeout(300);
      expect(page.url()).toContain("/admin/packages/new");

      const invalid = page.locator("input:invalid").first();
      await expect(invalid).toBeVisible();
      const message = await invalid.evaluate(
        (el: HTMLInputElement) => el.validationMessage,
      );
      expect(message.length).toBeGreaterThan(0);
    }
  });
});
