import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli: Şifremi Unuttum (Recovery) Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page); // Kritik: Kendi zayıf route'ları yerine merkezi mock'u kullan
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  });

  test('Şifremi unuttum formundan başarılı şekilde kurtarma e-postası talep edilebilmeli', async ({ page }) => {
    const mainEmailInput = page.locator('.admin-login input[type="email"]').first();
    await mainEmailInput.fill('kurtarma@test.com');

    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    const recoveryEmailInput = page.locator('.admin-forgot-form input[type="email"]');
    await expect(recoveryEmailInput).toHaveValue('kurtarma@test.com');
    
    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await expect(resetFormButton).toBeEnabled();
    await resetFormButton.click();

    const successMessage = page.locator('.admin-login-message');
    await expect(successMessage).toContainText(/gönderildi|sent/i, { timeout: 10000 });
  });

  test('Geçersiz (boş) e-posta ile şifre sıfırlama talep edilememeli', async ({ page }) => {
    await page.locator('.admin-login input[type="email"]').first().fill('');
    
    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await resetFormButton.click();

    const errorMessage = page.locator('.admin-login-message');
    await expect(errorMessage).toContainText(/yazmalısın|enter admin email/i);
  });
});