import { test, expect } from '@playwright/test';

test.describe('Kamera ve Yapay Zeka Modülleri', () => {

  test.beforeEach(async ({ page }) => {
    // Medya dosyalarını engelleyerek testi hızlandırıyoruz
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  });

  test('Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli', async ({ page }) => {
    // Fotoğraf kabini kartını bul
    const cameraSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
    await cameraSection.scrollIntoViewIfNeeded();
    await expect(cameraSection).toBeVisible();

    // Kamera açma butonunun render edildiğini doğrula
    const cameraButton = cameraSection.locator('button', { hasText: /Kamera \/ Galeri Aç|Open Camera/i });
    await expect(cameraButton).toBeVisible();

    // Arka planda çalışan gizli "file" input'unun DOM'da mevcut olduğunu onayla
    const fileInput = cameraSection.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı', async ({ page }) => {
    // Akıllı albüm (Yüz tanıma) kartını bul
    const smartAlbumSection = page.locator('.smart-album-card');
    await smartAlbumSection.scrollIntoViewIfNeeded();
    await expect(smartAlbumSection).toBeVisible();

    // Selfie çekme butonunun görünür olduğunu doğrula
    const selfieButton = smartAlbumSection.locator('button', { hasText: /Selfie Çek|Take a Selfie/i });
    await expect(selfieButton).toBeVisible();
    
    // Gizli dosya girişinin DOM'da bulunduğunu onayla
    const fileInput = smartAlbumSection.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});