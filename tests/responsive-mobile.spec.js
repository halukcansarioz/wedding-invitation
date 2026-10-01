import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow)', () => {

  test('Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
    
    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible({ timeout: 15000 });
    
    const slideControls = page.locator('.slide-controls');
    await expect(slideControls).toBeVisible();
  });
});