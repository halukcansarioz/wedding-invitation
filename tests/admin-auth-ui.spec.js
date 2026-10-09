import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli Arayüz Etkileşimleri', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page); // Kritik: Tüm ağı sahtele
    await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 15000 }); 
  });

  test('Kullanıcı Şifremi Unuttum formu ile Giriş formu arasında geçiş yapabilmeli', async ({ page }) => {
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