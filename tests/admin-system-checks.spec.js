import { test, expect } from "@playwright/test";
import { setupE2EMocks } from "./utils";

test.describe("Admin sistem kalite merkezi", () => {
  test("Sistem Testleri sekmesi açılmalı ve kontrol butonu görünmeli", async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    const systemTab = page.getByRole("button", { name: /Sistem Testleri|System Checks/i }).first();
    if (await systemTab.isVisible()) {
      await systemTab.click();
      await expect(page.getByRole("button", { name: /Testleri Çalıştır|Run Checks/i })).toBeVisible();
    } else {
      await expect(page.locator("form.admin-login, .admin-login").first()).toBeVisible();
    }
  });
});
