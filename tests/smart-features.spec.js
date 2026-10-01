import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Kamera ve Yapay Zeka Modülleri', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli', async ({ page }) => {
    const cameraSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
    await cameraSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const cameraButton = cameraSection.locator('button', { hasText: /Kamera \/ Galeri Aç|Open Camera/i });
    await expect(cameraButton).toBeVisible({ timeout: 10000 });

    const fileInput = cameraSection.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı', async ({ page }) => {
    const smartAlbumSection = page.locator('.smart-album-card');
    await smartAlbumSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const selfieButton = smartAlbumSection.locator('button', { hasText: /Selfie Çek|Take a Selfie/i });
    await expect(selfieButton).toBeVisible({ timeout: 10000 });
  });
});