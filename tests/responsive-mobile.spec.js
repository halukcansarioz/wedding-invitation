import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Mobil Cihazlarda Responsive Slayt (Slideshow) Davranışı', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    // DÜZELTME: Testin takılmasını (timeout) önlemek için sayfa yükleme stratejisi değiştirildi.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Mobil ekranda scroll gizlenmeli ve slayt kontrolleri görünmeli', async ({ page }) => {
    // Çözünürlüğü mobl boyutuna getiriyoruz
    await page.setViewportSize({ width: 375, height: 812 });

    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible({ timeout: 10000 });

    // Gövdedeki taşmanın (overflow) gizlendiğini teyit et
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Slayt kontrollerinin görünür olduğunu doğrula
    const slideControls = page.locator('.slide-controls');
    await expect(slideControls).toBeVisible();
  });
});