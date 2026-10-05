import { test, expect } from '@playwright/test';

test.describe('Admin Paneli & Davetiye: Bölüm Görünürlük (Visibility) Testi', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.abort());

    // Admin Token Mock
    await page.route('**/auth/v1/token?grant_type=password', async r => {
      await r.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake', token_type: 'bearer', expires_in: 3600, refresh_token: 'fake',
          user: { id: '123', email: 'admin@test.com', app_metadata: {} }
        })
      });
    });

    // Settings REST API Mock
    await page.route('**/rest/v1/settings*', async r => {
      if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
      return r.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          invitation: { bride: 'Hande', groom: 'Haluk' },
          settings: { visibility: { gallery: true, countdown: true } }
        })
      });
    });

    await page.goto('/admin');
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('admin@test.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"]').first().click();

    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Görünürlük sekmesinden galeri kapatıldığında ayar state üzerinde güncellenmeli', async ({ page }) => {
    // Bölüm Görünürlüğü sekmesine git
    const visibilityTabBtn = page.getByRole('button', { name: /Bölüm Görünürlüğü|Visibility/i });
    await visibilityTabBtn.waitFor({ state: 'visible', timeout: 10000 });
    await visibilityTabBtn.click();

    // Galeri checkbox'ını bul ve işaretini kaldır
    const galleryCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(galleryCheckbox).toBeVisible({ timeout: 10000 });
    
    if (await galleryCheckbox.isChecked()) {
      await galleryCheckbox.uncheck();
    }

    expect(await galleryCheckbox.isChecked()).toBe(false);
  });
});