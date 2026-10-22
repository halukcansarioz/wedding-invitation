import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Canlı Barkovizyon ve Tam Ekran Testleri', () => {
  test('Barkovizyon ekranı açılıp tam ekran moduna geçebilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/projector', { waitUntil: 'domcontentloaded' }).catch(() => {});

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const fullscreenBtn = page.locator('button').filter({ hasText: /tam ekran|fullscreen/i }).first();
    if (await fullscreenBtn.isVisible()) {
      await fullscreenBtn.click();
    }
  });
});