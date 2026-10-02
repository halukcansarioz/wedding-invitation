import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Şifremi Unuttum (Recovery) Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    // Reset Password Supabase Endpoint'ini Mockla
    await page.route('**/auth/v1/recover', async route => {
      // CORS Preflight
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
        return;
      }
      
      // Şifre sıfırlama maili başarıyla gönderildi yanıtı
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.goto('/admin');
  });

  test('Şifremi unuttum formundan başarılı şekilde kurtarma e-postası talep edilebilmeli', async ({ page }) => {
    // 1. Şifremi unuttum butonuna bas
    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    // 2. E-posta inputunun göründüğünü doğrula
    const emailInput = page.locator('.admin-forgot-form input[type="email"]');
    await expect(emailInput).toBeVisible();

    // 3. E-postayı doldur
    await emailInput.fill('kurtarma@test.com');

    // 4. Sıfırlama Linki Gönder butonuna bas
    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await resetFormButton.click();

    // 5. Başarı mesajının ekranda belirdiğini doğrula (UI tepkisi)
    const successMessage = page.locator('.admin-login-message');
    await expect(successMessage).toContainText(/gönderildi|sent/i, { timeout: 10000 });
  });

  test('Geçersiz (boş) e-posta ile şifre sıfırlama talep edilememeli', async ({ page }) => {
    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click();

    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await resetFormButton.click();

    const errorMessage = page.locator('.admin-login-message');
    await expect(errorMessage).toContainText(/yazmalısın|enter admin email/i);
  });
});