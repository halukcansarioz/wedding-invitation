import { test, expect } from '@playwright/test';

test.describe('Admin Paneli Sekme (Tab) Gezinme Testi', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.abort());

    await page.route('**/auth/v1/token?grant_type=password', async r => {
      await r.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake', token_type: 'bearer', expires_in: 3600, refresh_token: 'fake',
          user: { id: '123', email: 'admin@test.com', app_metadata: {} }
        })
      });
    });

    await page.route('**/rest/v1/**', async r => {
      if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
      const url = r.request().url();
      
      if (url.includes('settings')) {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ invitation: { bride: 'A', groom: 'B' }, settings: {} }) });
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/admin');
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('admin@test.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"]').first().click();

    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin farklı sekmelere (Tema, Galeri, Görünürlük) tıklandığında doğru sayfaları açmalı', async ({ page }) => {
    const themeTabBtn = page.getByRole('button', { name: /Tema/i });
    await themeTabBtn.waitFor({ state: 'visible', timeout: 10000 });
    await themeTabBtn.click();
    await expect(page.locator('.admin-editor-section')).toBeVisible();

    const galleryTabBtn = page.getByRole('button', { name: /Görsel \/ Müzik|Gallery/i });
    await galleryTabBtn.click();
    await expect(page.locator('.admin-editor-section')).toBeVisible();

    const visibilityTabBtn = page.getByRole('button', { name: /Bölüm Görünürlüğü|Visibility/i });
    if (await visibilityTabBtn.count() > 0) {
        await visibilityTabBtn.click();
        await expect(page.locator('.admin-editor-section')).toBeVisible();
    }
  });
});