import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Kişisel Link Oluşturma Testi', () => {
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    await page.route('**/auth/v1/token?grant_type=password', async route => {
      const now = Math.floor(Date.now() / 1000);
      const timestamp = new Date().toISOString();
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'fake-refresh-token',
          user: { id: '123', aud: 'authenticated', role: 'authenticated', email: 'test@admin.com', email_confirmed_at: timestamp, app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: timestamp, updated_at: timestamp },
        }),
      });
    });

    await page.route('**/rest/v1/**', async route => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
      const url = route.request().url();
      if (url.includes('settings')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ invitation: { bride: 'Hande', groom: 'Haluk' }, settings: { visibility: {} } }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
    });

    await page.goto('/admin');
    
    // ÇÖZÜM: `isVisible` yerine `waitFor` kullanarak sayfanın (React bileşenlerinin) hazır olmasını bekliyoruz
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('test@admin.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"]').first().click();
    
    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Kişiye özel link oluşturma sekmesi çalışmalı ve link üretmeli', async ({ page }) => {
     // ÇÖZÜM: Tab butonları arasında daha spesifik bir gezinme
     const personalLinkTabBtn = page.getByRole('button', { name: /Özel Link|Personal Link/i });
     await personalLinkTabBtn.waitFor({ state: 'visible', timeout: 10000 });
     await personalLinkTabBtn.click();
     
     const nameInput = page.locator('input[placeholder*="Ahmet Yılmaz"], input[placeholder*="John Doe"]');
     await expect(nameInput).toBeVisible({ timeout: 10000 });
     await nameInput.fill('Örnek Misafir');
     
     const generatedLinkInput = page.locator('.admin-link-result-input');
     await expect(generatedLinkInput).toHaveValue(/%C3%96rnek%20Misafir|Örnek%20Misafir/);
  });
});