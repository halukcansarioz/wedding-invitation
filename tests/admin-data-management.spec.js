import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Veri Yedekleme (Data Export) İşlemleri', () => {

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
    
    // DÜZELTME: Metin aramak yerine ana admin kapsayıcısının yüklenmesini bekliyoruz
    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('JSON İndir butonuna basıldığında tarayıcı indirme işlemini başlatmalı', async ({ page }) => {
    const dataTabButton = page.locator('button, a, div').filter({ hasText: /Veri Yedeği|Data/i }).first();
    await dataTabButton.waitFor({ state: 'visible', timeout: 10000 });
    await dataTabButton.click();

    const downloadPromise = page.waitForEvent('download');
    
    const downloadBtn = page.locator('button', { hasText: /JSON İndir|Download JSON/i });
    await expect(downloadBtn).toBeVisible({ timeout: 10000 });
    await downloadBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });
});