import { test, expect } from '@playwright/test';

test.describe('Admin Paneli Arayüz Etkileşimleri', () => {

  test('Kullanıcı Şifremi Unuttum formu ile Giriş formu arasında geçiş yapabilmeli', async ({ page }) => {
    // Admin URL parametresine git (Projenizdeki gerçek admin rotası `/admin` veya `/?admin=1` olabilir)
    await page.goto('/admin'); 

    // 1. Varsayılan giriş butonunu bul ve kontrol et
    const loginButton = page.locator('button[type="submit"]', { hasText: /Giriş Yap|Login/i });
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    // 2. Şifremi unuttum butonuna tıkla
    const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
    await forgotPasswordLink.click({ force: true });

    // 3. Şifre sıfırlama formunun geldiğini ve giriş butonunun gizlendiğini onayla
    const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
    await expect(resetFormButton).toBeVisible();
    await expect(loginButton).toBeHidden();

    // 4. Tekrar giriş ekranına dön linkine tıkla
    const backToLoginLink = page.locator('button', { hasText: /Giriş ekranına dön|Back to login/i });
    await backToLoginLink.click({ force: true });

    // 5. Orijinal giriş formunun geri geldiğini onayla
    await expect(loginButton).toBeVisible();
    await expect(resetFormButton).toBeHidden();
  });
});