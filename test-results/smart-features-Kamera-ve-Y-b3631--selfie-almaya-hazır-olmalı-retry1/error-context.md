# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smart-features.spec.js >> Kamera ve Yapay Zeka Modülleri >> Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı
- Location: tests\smart-features.spec.js:36:3

# Error details

```
Error: expect(locator).not.toContainText(expected) failed

Locator: locator('.envelope-seal')
Expected pattern: not /Yükleniyor|Loading/i
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "not toContainText" with timeout 15000ms
  - waiting for locator('.envelope-seal')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const mockMedia = async (page) => {
  4  |   await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
  5  |     route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  6  |   });
  7  |   await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
  8  |     route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  9  |   });
  10 | };
  11 | 
  12 | test.describe('Kamera ve Yapay Zeka Modülleri', () => {
  13 | 
  14 |   test.beforeEach(async ({ page }) => {
  15 |     await mockMedia(page);
  16 |     await page.goto('/');
  17 | 
  18 |     const envelopeSeal = page.locator('.envelope-seal');
> 19 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
     |                                    ^ Error: expect(locator).not.toContainText(expected) failed
  20 |     await envelopeSeal.click();
  21 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  22 |   });
  23 | 
  24 |   test('Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli', async ({ page }) => {
  25 |     const cameraSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
  26 |     await cameraSection.scrollIntoViewIfNeeded();
  27 |     await page.waitForTimeout(800);
  28 | 
  29 |     const cameraButton = cameraSection.locator('button', { hasText: /Kamera \/ Galeri Aç|Open Camera/i });
  30 |     await expect(cameraButton).toBeVisible({ timeout: 10000 });
  31 | 
  32 |     const fileInput = cameraSection.locator('input[type="file"]');
  33 |     await expect(fileInput).toBeAttached();
  34 |   });
  35 | 
  36 |   test('Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı', async ({ page }) => {
  37 |     const smartAlbumSection = page.locator('.smart-album-card');
  38 |     await smartAlbumSection.scrollIntoViewIfNeeded();
  39 |     await page.waitForTimeout(800);
  40 | 
  41 |     const selfieButton = smartAlbumSection.locator('button', { hasText: /Selfie Çek|Take a Selfie/i });
  42 |     await expect(selfieButton).toBeVisible({ timeout: 10000 });
  43 |   });
  44 | });
```