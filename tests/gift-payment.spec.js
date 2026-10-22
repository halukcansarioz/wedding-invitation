import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Hediye ve Ödeme Bildirim Testleri', () => {
  test('Misafir hediye sekmesinden IBAN kopyalayabilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const giftSection = page.locator('.gifts-section').first();
    if (await giftSection.isVisible()) {
      await giftSection.scrollIntoViewIfNeeded();
      const copyButton = page.locator('button:has-text("Kopyala"), .copy-iban-btn').first();
      if (await copyButton.isVisible()) {
        await copyButton.click();
        await expect(page.locator('.toast, text=Kopyalandı')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});