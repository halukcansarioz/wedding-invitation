import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli Sekme (Tab) Gezinme Testi', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    // Supabase Auth Mock
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
    
    // Login
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();
    }
  });

  test('Admin farklı sekmelere (Tema, Galeri, Görünürlük) tıklandığında doğru sayfaları açmalı', async ({ page }) => {
    // 1. Tema Sekmesine Tıkla
    const themeTabBtn = page.locator('button, div').filter({ hasText: /^Tema$/ }).first();
    await themeTabBtn.click();
    await expect(page.locator('h3', { hasText: 'Tema ve Yayın Ayarları' })).toBeVisible({ timeout: 10000 });

    // 2. Galeri Sekmesine Tıkla
    const galleryTabBtn = page.locator('button, div').filter({ hasText: /^Görsel \/ Müzik$/ }).first();
    await galleryTabBtn.click();
    await expect(page.locator('h3', { hasText: 'Görsel ve Müzik' })).toBeVisible({ timeout: 10000 });

    // 3. Bölüm Görünürlüğü Sekmesine Tıkla
    const visibilityTabBtn = page.locator('button, div').filter({ hasText: 'Bölüm Görünürlüğü' }).first();
    await visibilityTabBtn.click();
    
    // Checkboxların yüklendiğini doğrula
    const countdownCheckbox = page.locator('text=/Geri Sayım/i').first();
    await expect(countdownCheckbox).toBeVisible();
  });
});