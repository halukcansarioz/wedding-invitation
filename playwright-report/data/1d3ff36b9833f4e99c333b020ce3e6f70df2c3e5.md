# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-features.spec.js >> Kullanıcı Arayüzü ve Bileşen Etkileşimleri >> IBAN kopyala butonuna basıldığında buton metni değişmeli
- Location: tests\ui-features.spec.js:45:3

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
  3  | test.describe('Kullanıcı Arayüzü ve Bileşen Etkileşimleri', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  7  |     await page.goto('/');
  8  | 
  9  |     const envelopeSeal = page.locator('.envelope-seal');
> 10 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
     |                                    ^ Error: expect(locator).not.toContainText(expected) failed
  11 |     await envelopeSeal.click({ force: true });
  12 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  13 |   });
  14 | 
  15 |   test('Galeri resmine tıklandığında Lightbox (Büyük Ekran) açılmalı ve kapanmalı', async ({ page }) => {
  16 |     const firstGalleryImage = page.locator('.gallery-image').first();
  17 |     await firstGalleryImage.scrollIntoViewIfNeeded();
  18 |     await page.waitForTimeout(500);
  19 |     
  20 |     await firstGalleryImage.click({ force: true });
  21 | 
  22 |     const lightboxOverlay = page.locator('.gallery-lightbox-overlay');
  23 |     await expect(lightboxOverlay).toBeVisible({ timeout: 10000 });
  24 | 
  25 |     const closeButton = page.locator('.lightbox-close');
  26 |     await closeButton.click({ force: true });
  27 |     await expect(lightboxOverlay).toBeHidden();
  28 |   });
  29 | 
  30 |   test('Konuma Git butonuna tıklandığında Navigasyon Modalı açılmalı', async ({ page }) => {
  31 |     const goToMapButton = page.locator('button', { hasText: /Konuma Git|Go to Map/i }).first();
  32 |     await goToMapButton.scrollIntoViewIfNeeded();
  33 |     await page.waitForTimeout(500);
  34 |     
  35 |     await goToMapButton.click({ force: true });
  36 | 
  37 |     const locationModal = page.locator('.location-nav-modal');
  38 |     await expect(locationModal).toBeVisible({ timeout: 10000 });
  39 | 
  40 |     const closeBtn = locationModal.locator('.location-nav-close');
  41 |     await closeBtn.click({ force: true });
  42 |     await expect(locationModal).toBeHidden();
  43 |   });
  44 | 
  45 |   test('IBAN kopyala butonuna basıldığında buton metni değişmeli', async ({ page, context }) => {
  46 |     await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  47 | 
  48 |     const copyIbanButton = page.locator('.gift-copy-button, button:has-text("Kopyala"), button:has-text("Copy")').first();
  49 |     await copyIbanButton.scrollIntoViewIfNeeded();
  50 |     await page.waitForTimeout(500);
  51 |     
  52 |     await copyIbanButton.click({ force: true });
  53 |     await expect(copyIbanButton).toContainText(/Kopyalandı|Copied/i);
  54 |   });
  55 | });
```