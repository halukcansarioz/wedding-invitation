import { test, expect } from '@playwright/test';

test.describe('Canlı Barkovizyon (Live Projector) Testleri', () => {

  test('Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı', async ({ page }) => {
    // Media ve dış api isteklerini engelle (hız için)
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    
    // Doğrudan Live sayfasına git
    await page.goto('/live');

    // Live Projector'a özel "Canlı Anı Akışı" veya "Live Memories" yazısı var mı?
    const liveSubtitle = page.locator('text=/Canlı Anı Akışı|Live Memories/i');
    await expect(liveSubtitle).toBeVisible({ timeout: 10000 });

    // Gelin damat adının olduğu ana başlık (h1) ekranda mı?
    const titleElement = page.locator('h1');
    await expect(titleElement).toBeVisible();

    // Barkovizyon sayfasında body'nin dark theme'e geçirildiğini kontrol et (useEffect içindeki mantık)
    const isDarkTheme = await page.evaluate(() => document.documentElement.dataset.theme === 'dark');
    expect(isDarkTheme).toBeTruthy();

    // QR kod yönlendirme mesajı alt kısımda görünüyor mu?
    const footerText = page.locator('text=/Ekrana mesaj veya fotoğraf göndermek|Scan the QR code to send a message/i');
    await expect(footerText).toBeVisible();
  });
});