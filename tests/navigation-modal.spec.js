import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Navigasyon ve Harita (Location) Modal Akışı', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Konuma Git butonuna tıklandığında harita seçeneklerini göstermeli ve kapatılabilmeli', async ({ page }) => {
    const goToMapBtn = page.locator('button', { hasText: /Konuma Git|Go to Map/i }).first();
    
    // Gereksiz waitForTimeout(500) silindi ve tıklamaya force eklendi
    await goToMapBtn.scrollIntoViewIfNeeded();
    await goToMapBtn.click({ force: true }); 

    const modal = page.locator('.location-nav-modal');
    await expect(modal).toBeVisible();

    await expect(modal.locator('a', { hasText: /Google Maps/i })).toHaveAttribute('href', /google\.com\/maps|goo\.gl|app\.goo\.gl/);
    await expect(modal.locator('a', { hasText: /Apple Maps/i })).toHaveAttribute('href', /maps\.apple\.com/);

    const closeBtn = modal.locator('button', { hasText: /Kapat|Close/i });
    await closeBtn.click({ force: true });

    await expect(modal).toBeHidden();
  });
});