import { test, expect } from '@playwright/test';

test.describe('Kullanıcı Arayüzü ve Bileşen Etkileşimleri', () => {

  test.beforeEach(async ({ page }) => {
    // Medya dosyalarını engelleyerek test hızını artırıyoruz
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Galeri resmine tıklandığında Lightbox (Büyük Ekran) açılmalı ve kapanmalı', async ({ page }) => {
    // Galeri bölümündeki ilk resmi bul
    const firstGalleryImage = page.locator('.gallery-image').first();
    await firstGalleryImage.scrollIntoViewIfNeeded();
    
    // Resme tıkla
    await firstGalleryImage.click({ force: true });

    // Lightbox overlay'inin görünür olduğunu onayla
    const lightboxOverlay = page.locator('.gallery-lightbox-overlay');
    await expect(lightboxOverlay).toBeVisible();

    // Kapatma butonuna (X) bas ve kapandığını onayla
    const closeButton = page.locator('.lightbox-close');
    await closeButton.click();
    await expect(lightboxOverlay).toBeHidden();
  });

  test('Konuma Git butonuna tıklandığında Navigasyon Modalı açılmalı', async ({ page }) => {
    // Harita/Konum bölümündeki 'Konuma Git' veya 'Go to Map' butonunu bul
    const goToMapButton = page.locator('button', { hasText: /Konuma Git|Go to Map/i }).first();
    await goToMapButton.scrollIntoViewIfNeeded();
    await goToMapButton.click({ force: true });

    // Modalın (Yol Tarifi Al ekranı) açıldığını doğrula
    const locationModal = page.locator('.location-nav-modal');
    await expect(locationModal).toBeVisible();

    // Modal içindeki Google Maps butonunun varlığını kontrol et
    const googleMapsBtn = locationModal.locator('a', { hasText: /Google Maps/i });
    await expect(googleMapsBtn).toBeVisible();

    // Modalı kapat
    const closeBtn = locationModal.locator('.location-nav-close');
    await closeBtn.click();
    await expect(locationModal).toBeHidden();
  });

  test('IBAN kopyala butonuna basıldığında buton metni değişmeli', async ({ page, context }) => {
    // Pano (Clipboard) iznini test ortamı için veriyoruz
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Hediye/IBAN kopyalama butonunu bul
    const copyIbanButton = page.locator('.gift-copy-button');
    await copyIbanButton.scrollIntoViewIfNeeded();
    
    // Tıklamadan önceki metni kontrol edebiliriz (Kopyala)
    await expect(copyIbanButton).not.toContainText(/Kopyalandı|Copied/i);

    // Butona tıkla
    await copyIbanButton.click({ force: true });

    // Tıklandıktan sonra metnin başarılı (Kopyalandı / Copied) durumuna geçtiğini doğrula
    await expect(copyIbanButton).toContainText(/Kopyalandı|Copied/i);
  });
});