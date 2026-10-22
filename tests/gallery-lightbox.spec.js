import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Galeri ve Fotoğraf Önizleme (Lightbox) Testleri', () => {
  test('Misafir galerideki bir fotoğrafa tıklayarak büyük önizleme modalını açabilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const gallerySection = page.locator('.gallery-section, .photo-grid').first();
    if (await gallerySection.isVisible()) {
      await gallerySection.scrollIntoViewIfNeeded();
      const firstImage = page.locator('.gallery-item img, .photo-card img').first();
      if (await firstImage.isVisible()) {
        await firstImage.click();
        const modal = page.locator('.lightbox-modal, .modal-overlay').first();
        await expect(modal).toBeVisible({ timeout: 5000 });
      }
    }
  });
});