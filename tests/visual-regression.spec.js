import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Görsel Regresyon Testleri', () => {
  test.beforeEach(async ({ page }) => {
    if (process.env.CI) {
      test.skip();
    }
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Giriş ekranı tasarımı eşleşmeli', async ({ page }) => {
    const introCard = page.locator('.intro-card');
    await expect(introCard).toHaveScreenshot('intro-card.png');
  });
});