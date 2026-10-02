import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Navigasyon ve Harita (Location) Modal Akışı', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await page.waitForTimeout(500);
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Konuma Git butonuna tıklandığında harita seçeneklerini göstermeli ve kapatılabilmeli', async ({ page }) => {
    // Location kartına kaydır
    const locationSection = page.locator('.location-nav-btn').locator('..').locator('..'); // Veya text içeren section
    const goToMapBtn = page.locator('button', { hasText: /Konuma Git|Go to Map/i }).first();
    
    await goToMapBtn.scrollIntoViewIfNeeded();
    await goToMapBtn.click();

    // Modalın açıldığını doğrula
    const modal = page.locator('.location-nav-modal');
    await expect(modal).toBeVisible();

    // İçerisinde Google Maps ve Apple Maps linklerinin olduğunu doğrula
    await expect(modal.locator('a', { hasText: /Google Maps/i })).toHaveAttribute('href', /google.com\/maps/);
    await expect(modal.locator('a', { hasText: /Apple Maps/i })).toHaveAttribute('href', /maps.apple.com/);

    // Kapat butonuna basarak modaldan çık
    const closeBtn = modal.locator('button', { hasText: /Kapat|Close/i });
    await closeBtn.click();

    await expect(modal).toBeHidden();
  });
});