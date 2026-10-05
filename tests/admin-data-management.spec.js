import { test, expect } from '@playwright/test';

test.describe('Admin Paneli: Veri Yedekleme (Data Export) İşlemleri', () => {
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

  test('JSON İndir butonuna basıldığında tarayıcı indirme işlemini başlatmalı', async ({ page }) => {
    // ÇÖZÜM: Filtrelemek yerine doğrudan butonun kendisini Role üzerinden yakalıyoruz.
    const dataTabButton = page.getByRole('button', { name: /Veri Yedeği|Data/i });
    await dataTabButton.click();

    // ÇÖZÜM: İndirme event'ini kurmadan önce butonun DOM'a gelmesini (Lazy load asenkron durumu) bekliyoruz.
    const downloadBtn = page.locator('button', { hasText: /JSON İndir|Download JSON/i });
    await expect(downloadBtn).toBeVisible({ timeout: 15000 });

    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });
});