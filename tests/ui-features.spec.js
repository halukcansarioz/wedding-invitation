import { test, expect } from '@playwright/test';

test.describe('Kullanıcı Arayüzü ve Bileşen Etkileşimleri', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    // Sayfanın ve event listener'ların tam oturmasını bekliyoruz
    await page.waitForTimeout(1000); 
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Galeri resmine tıklandığında Lightbox (Büyük Ekran) açılmalı ve kapanmalı', async ({ page }) => {
    const firstGalleryImage = page.locator('.gallery-image').first();
    await firstGalleryImage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800); // DOM elementinin yerine oturmasını bekle
    
    // force: true kaldırıldı
    await firstGalleryImage.click();

    const lightboxOverlay = page.locator('.gallery-lightbox-overlay');
    await expect(lightboxOverlay).toBeVisible({ timeout: 10000 });

    const closeButton = page.locator('.lightbox-close');
    await closeButton.click(); 
    await expect(lightboxOverlay).toBeHidden();
  });

  test('Konuma Git butonuna tıklandığında Navigasyon Modalı açılmalı', async ({ page }) => {
    const goToMapButton = page.locator('button', { hasText: /Konuma Git|Go to Map/i }).first();
    await goToMapButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await goToMapButton.click();

    const locationModal = page.locator('.location-nav-modal');
    await expect(locationModal).toBeVisible({ timeout: 10000 });

    const closeBtn = locationModal.locator('.location-nav-close');
    await closeBtn.click();
    await expect(locationModal).toBeHidden();
  });

  test('IBAN kopyala butonuna basıldığında buton metni değişmeli', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const copyIbanButton = page.locator('.gift-copy-button, button').filter({ hasText: /Copy IBAN|Kopyala|Copy/i }).first();
    await copyIbanButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await copyIbanButton.click();
    await page.waitForTimeout(500);

    const clipboardText = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboardText).toContain("TR");
  });
});