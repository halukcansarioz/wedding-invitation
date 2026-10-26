import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Şifremi Unuttum Ekran Geçiş Testi', () => {
  test('Admin giriş ekranından şifre sıfırlama formuna geçip tekrar giriş formuna dönebilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const adminPage = page.locator('.admin-page').first();
    await expect(adminPage).toBeVisible({ timeout: 15000 });

    const emailInput = page.locator('.admin-login input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('ornek@dugun.com');

      const forgotBtn = page.locator('button.admin-link-button').filter({ hasText: /Şifremi unuttum|Forgot password/i }).first();
      await forgotBtn.click();

      const forgotForm = page.locator('form.admin-forgot-form');
      await expect(forgotForm).toBeVisible({ timeout: 5000 });
      await expect(forgotForm.locator('input[type="email"]')).toHaveValue('ornek@dugun.com');

      const backBtn = forgotForm.locator('button.admin-link-button');
      await backBtn.click();

      await expect(forgotForm).toBeHidden({ timeout: 5000 });
      await expect(page.locator('.admin-login input[type="password"]')).toBeVisible();
    }
  });
});