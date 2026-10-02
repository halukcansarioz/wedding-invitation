import { test, expect } from '@playwright/test';

// Medyaları yüklemekle vakit kaybetmemek için mock fonksiyonu
const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Admin Paneli: Tema ve Ayarlar Etkileşimi', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    
    // 1. Supabase Auth Mock (Giriş İstemi - Eksik token bilgileri eklendi)
    await page.route('**/auth/v1/token?grant_type=password', async route => {
      const now = Math.floor(Date.now() / 1000);
      const timestamp = new Date().toISOString();
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token', 
          token_type: 'bearer', 
          expires_in: 3600, 
          expires_at: now + 3600, 
          refresh_token: 'fake-refresh-token',
          user: { id: '123', aud: 'authenticated', role: 'authenticated', email: 'test@admin.com', created_at: timestamp },
        }),
      });
    });

    // 2. Supabase REST API Mock
    await page.route('**/rest/v1/**', async route => {
        const url = route.request().url();
        if (url.includes('settings')) {
          await route.fulfill({
            status: 200, contentType: 'application/json',
            // DÜZELTME: loadSettingsFromDatabase büyük ihtimalle .single() kullanıyor.
            // Bu nedenle köşeli parantez (dizi) yerine doğrudan süslü parantez (obje) dönmeliyiz.
            body: JSON.stringify({ 
              invitation: { bride: 'Hande', groom: 'Haluk' }, 
              settings: { visibility: {}, theme: 'lavanta' }
            })
          });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
      });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' }); // Ekstra stabilite için eklendi
    
    const emailInput = page.locator('input[type="email"]');
    
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('halukcansarioz19@gmail.com');
    await page.locator('input[type="password"]').fill('211225');
    await page.locator('button[type="submit"]').click();
    
    // Giriş formunun kaybolduğunu doğrula
    await expect(emailInput).toBeHidden({ timeout: 15000 });
  });

  test('Tema kartına tıklanıp kaydedildiğinde HTML data-theme niteliği değişmeli', async ({ page }) => {
    // DÜZELTME 3: Doğrudan menü başlığını hedefliyoruz (AdminView.tsx ile uyumlu)
    const themeTabButton = page.locator('text="Tema"').first();
    await themeTabButton.waitFor({ state: 'visible', timeout: 10000 });
    await themeTabButton.click();

    // Dark (Koyu) Tema kartını seç
    const darkThemeCard = page.locator('[data-theme-preview="dark"]');
    await expect(darkThemeCard).toBeVisible({ timeout: 10000 });
    await darkThemeCard.click();

    // Kaydet butonuna bas
    const saveButton = page.locator('button', { hasText: /Kaydet|Save/i }).first();
    await saveButton.click();

    // HTML data-theme niteliğinin güncellendiğini doğrula
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');

    // Sage (Yeşil) Tema kartını seç
    const sageThemeCard = page.locator('[data-theme-preview="sage"]');
    await sageThemeCard.click();

    // Tekrar Kaydet butonuna bas
    await saveButton.click();

    // Yeniden doğrulama yap
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('sage');
  });
});