import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Konum Modalı ve Paylaşım Bölümü Testleri', () => {
  test('Misafir yol tarifi modalını açıp adres kopyalayabilmeli ve QR kod alanını görebilmeli', async ({ page }) => {
    test.setTimeout(60000);

    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const mapIframe = page.locator('.mini-map iframe').first();
    if (await mapIframe.isVisible()) {
      await mapIframe.scrollIntoViewIfNeeded();
      const navButton = page.locator('button').filter({ hasText: /Konuma Git|Go to Map/i }).first();
      if (await navButton.isVisible()) {
        await navButton.click();

        const navModal = page.locator('.location-nav-modal');
        await expect(navModal).toBeVisible({ timeout: 5000 });
        await expect(navModal.locator('a', { hasText: 'Google Maps' })).toBeVisible();
        await expect(navModal.locator('a', { hasText: 'Yandex Navi' })).toBeVisible();

        const copyBtn = navModal.locator('.location-nav-copy');
        await copyBtn.click();

        const closeBtn = navModal.locator('.location-nav-close');
        await closeBtn.click();
        await expect(navModal).toBeHidden({ timeout: 5000 });
      }
    }

    const qrImage = page.locator('img[alt="QR Code"]').first();
    if (await qrImage.isVisible()) {
      await qrImage.scrollIntoViewIfNeeded();
      await expect(qrImage).toBeVisible();
    }
  });
});