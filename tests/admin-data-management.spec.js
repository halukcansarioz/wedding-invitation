import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Veri Yedekleme (Data Export) İşlemleri', () => {

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
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();
    }
  });

  test('JSON İndir butonuna basıldığında tarayıcı indirme işlemini başlatmalı', async ({ page }) => {
    // Veri Yedekleme sekmesine (DataTab) geçiş yap
    const dataTabButton = page.locator('button, div').filter({ hasText: 'Veri Yedeği' }).first();
    await dataTabButton.waitFor({ state: 'visible' });
    await dataTabButton.click();

    // İndirme (Download) eventini dinlemeye başla
    const downloadPromise = page.waitForEvent('download');
    
    // JSON İndir butonuna bas
    const downloadBtn = page.locator('button', { hasText: /JSON İndir/i });
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();

    // İndirme işleminin gerçekleştiğini doğrula
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });
});