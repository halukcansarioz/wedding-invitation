import { test, expect } from '@playwright/test';

test.describe('Admin Paneli Arayüz Etkileşimleri', () => {
  test('Kullanıcı Şifremi Unuttum formu ile Giriş formu arasında geçiş yapabilmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.fulfill({ status: 200, body: '' }));
    
    // GÜNCELLENDİ: waitUntil ve timeout eklendi
    await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 15000 }); 

    const loginButton = page.locator('button[type="submit"]', { hasText: /Giriş Yap|Login/i });
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click({ force: true });

    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await expect(resetFormButton).toBeVisible();
    await expect(loginButton).toBeHidden();

    const backToLoginLink = page.locator('button', { hasText: /Giriş ekranına dön|Back to login/i });
    await backToLoginLink.click({ force: true });

    await expect(loginButton).toBeVisible();
    await expect(resetFormButton).toBeHidden();
  });
});