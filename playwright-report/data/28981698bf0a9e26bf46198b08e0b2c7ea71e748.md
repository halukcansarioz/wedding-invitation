# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smart-features.spec.js >> Kamera ve Yapay Zeka Modülleri >> Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli
- Location: tests\smart-features.spec.js:17:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "TR" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e9]:
        - generic [ref=e10]: ❀
        - paragraph [ref=e11]: Wedding Invitation
        - heading "Handenur & Haluk Can" [level=1] [ref=e12]:
          - generic [ref=e13]: Handenur
          - emphasis [ref=e14]: "&"
          - generic [ref=e15]: Haluk Can
        - paragraph [ref=e16]: You are invited to the most special day of our love story.
      - button "Open Invitation" [ref=e19] [cursor=pointer]
    - link "Admin Panel" [ref=e22] [cursor=pointer]:
      - /url: /admin
    - generic [ref=e25]:
      - button "TR" [ref=e26] [cursor=pointer]
      - button "Play" [ref=e28] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Kamera ve Yapay Zeka Modülleri', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Medya dosyalarını engelleyerek testi hızlandırıyoruz
  7  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
> 8  |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  9  | 
  10 |     const envelopeSeal = page.locator('.envelope-seal');
  11 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  12 |     await envelopeSeal.click({ force: true });
  13 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  14 |     await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  15 |   });
  16 | 
  17 |   test('Dijital Fotoğraf Kabini (AR Photobooth) arayüzü eksiksiz yüklenmeli', async ({ page }) => {
  18 |     // Fotoğraf kabini kartını bul
  19 |     const cameraSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
  20 |     await cameraSection.scrollIntoViewIfNeeded();
  21 |     await expect(cameraSection).toBeVisible();
  22 | 
  23 |     // Kamera açma butonunun render edildiğini doğrula
  24 |     const cameraButton = cameraSection.locator('button', { hasText: /Kamera \/ Galeri Aç|Open Camera/i });
  25 |     await expect(cameraButton).toBeVisible();
  26 | 
  27 |     // Arka planda çalışan gizli "file" input'unun DOM'da mevcut olduğunu onayla
  28 |     const fileInput = cameraSection.locator('input[type="file"]');
  29 |     await expect(fileInput).toBeAttached();
  30 |   });
  31 | 
  32 |   test('Kendi Fotoğraflarını Bul (Smart Album) bileşeni kullanıcıdan selfie almaya hazır olmalı', async ({ page }) => {
  33 |     // Akıllı albüm (Yüz tanıma) kartını bul
  34 |     const smartAlbumSection = page.locator('.smart-album-card');
  35 |     await smartAlbumSection.scrollIntoViewIfNeeded();
  36 |     await expect(smartAlbumSection).toBeVisible();
  37 | 
  38 |     // Selfie çekme butonunun görünür olduğunu doğrula
  39 |     const selfieButton = smartAlbumSection.locator('button', { hasText: /Selfie Çek|Take a Selfie/i });
  40 |     await expect(selfieButton).toBeVisible();
  41 |     
  42 |     // Gizli dosya girişinin DOM'da bulunduğunu onayla
  43 |     const fileInput = smartAlbumSection.locator('input[type="file"]');
  44 |     await expect(fileInput).toBeAttached();
  45 |   });
  46 | });
```