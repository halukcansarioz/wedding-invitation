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
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli', async ({ page }) => {
    const cameraSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
    await cameraSection.scrollIntoViewIfNeeded();

    const cameraButton = cameraSection.locator('button', { hasText: /Kamera \/ Galeri Aç|Open Camera/i });
    // waitForTimeout yerine stabil state beklentisi
    await cameraButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(cameraButton).toBeVisible();

    const fileInput = cameraSection.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı', async ({ page }) => {
    const smartAlbumSection = page.locator('.smart-album-card');
    await smartAlbumSection.scrollIntoViewIfNeeded();

    const selfieButton = smartAlbumSection.locator('button', { hasText: /Selfie Çek|Take a Selfie/i });
    await selfieButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(selfieButton).toBeVisible();
  });
});