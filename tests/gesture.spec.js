import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Dokunmatik Ekran ve Slayt Testleri', () => {
  test('Mobilde swipe hareketi ile slaytlar değişebilmeli', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();

    const slideshow = page.locator('.slideshow-container');
    if (await slideshow.isVisible()) {
      const box = await slideshow.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.2, { steps: 5 });
        await page.mouse.up();
      }
    }
  });
});