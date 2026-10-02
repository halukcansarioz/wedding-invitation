import { test, expect } from '@playwright/test';

test.describe('Anı Defteri ve Admin Süreçleri', () => {
  
  test('Misafir anı defterine mesaj bırakabilmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    
    // Görselin yüklenmesini bekle
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    // Animasyon veya UI kaymalarının bitmesini bekleyerek force: true kullanımını kaldırıyoruz
    await page.waitForTimeout(1000); 
    await envelopeSeal.click();
    
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
    
    const wishesSection = page.locator('.wish-form');
    await wishesSection.waitFor({ state: 'attached' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wishesSection.scrollIntoViewIfNeeded();

    await page.fill('input[name="name"]', 'Playwright Bot');
    await page.fill('textarea[name="message"]', 'Harika bir düğün test mesajı!');
  });

  test('Kullanıcı admin paneline hatalı şifreyle girememeli', async ({ page }) => {
    await page.goto('/admin');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    await emailInput.fill('testadmin@example.com');
    await passwordInput.fill('yanlis_sifre_123');
    
    // Supabase uyarı katmanının vb. engel olmaması için elementi odağa alıyoruz, force: true kaldırıldı
    await loginButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); 
    await loginButton.click();

    // Hata mesajının çıkmasını bekle
    const errorMessage = page.locator('.admin-login-message.error');
    await expect(errorMessage).toBeVisible();
  });
});