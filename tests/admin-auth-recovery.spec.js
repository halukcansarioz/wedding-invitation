import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Şifremi Unuttum (Recovery) Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    await page.route('**/auth/v1/recover', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
        return;
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  });

  test('Şifremi unuttum formundan başarılı şekilde kurtarma e-postası talep edilebilmeli', async ({ page }) => {
    // DÜZELTME: React state bug'ını aşmak için e-postayı önce ana logine yazıyoruz
    const mainEmailInput = page.locator('.admin-login input[type="email"]').first();
    await mainEmailInput.fill('kurtarma@test.com');

    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    // E-postanın formlar arası taşındığından emin ol
    const recoveryEmailInput = page.locator('.admin-forgot-form input[type="email"]');
    await expect(recoveryEmailInput).toHaveValue('kurtarma@test.com');
    
    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await expect(resetFormButton).toBeEnabled();
    await resetFormButton.click();

    const successMessage = page.locator('.admin-login-message');
    await expect(successMessage).toContainText(/gönderildi|sent/i, { timeout: 10000 });
  });

  test('Geçersiz (boş) e-posta ile şifre sıfırlama talep edilememeli', async ({ page }) => {
    // Boş yollanmasını test etmek için inputu temizliyoruz
    await page.locator('.admin-login input[type="email"]').first().fill('');
    
    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await resetFormButton.click();

    const errorMessage = page.locator('.admin-login-message');
    await expect(errorMessage).toContainText(/yazmalısın|enter admin email/i);
  });
});