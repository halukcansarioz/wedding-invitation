import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli Sekme (Tab) Gezinme Testi', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    await page.route('**/auth/v1/token?grant_type=password', async route => {
      const now = Math.floor(Date.now() / 1000);
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
          user: { id: '123', aud: 'authenticated', email: 'admin@test.com' },
        }),
      });
    });

    await page.route('**/rest/v1/**', async route => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ invitation: { bride: 'A', groom: 'B' }, settings: {} })
      });
    });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();
    }
    
    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin farklı sekmelere (Tema, Galeri, Görünürlük) tıklandığında doğru sayfaları açmalı', async ({ page }) => {
    // DÜZELTME: Geniş filter() kullanımı yerine daha keskin getByRole hedeflendi
    const themeTabBtn = page.getByRole('button', { name: /Tema/i });
    await themeTabBtn.waitFor({ state: 'visible', timeout: 10000 });
    await themeTabBtn.click();
    await expect(page.locator('h3', { hasText: /Tema ve Yayın Ayarları|Theme & Publishing Settings/i })).toBeVisible({ timeout: 10000 });

    const galleryTabBtn = page.getByRole('button', { name: /Görsel \/ Müzik|Gallery/i });
    await galleryTabBtn.click();
    await expect(page.locator('h3', { hasText: /Görsel ve Müzik|Gallery & Music/i })).toBeVisible({ timeout: 10000 });

    const visibilityTabBtn = page.getByRole('button', { name: /Bölüm Görünürlüğü|Visibility/i });
    if (await visibilityTabBtn.count() > 0) {
        await visibilityTabBtn.click();
        const countdownCheckbox = page.locator('text=/Geri Sayım|Countdown/i').first();
        await expect(countdownCheckbox).toBeVisible({ timeout: 10000 });
    }
  });
});