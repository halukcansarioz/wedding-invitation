# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-and-interactions.spec.js >> Sesli Mesaj ve Etkileşim Testleri >> Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı
- Location: tests\audio-and-interactions.spec.js:18:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.wish-form')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "TR" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - link "Admin Panel" [ref=e7] [cursor=pointer]:
      - /url: /admin
    - generic [ref=e10]:
      - button "TR" [ref=e11] [cursor=pointer]
      - button "Play" [ref=e13] [cursor=pointer]
      - button [ref=e19] [cursor=pointer]
    - generic [ref=e22]: Yükleniyor...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sesli Mesaj ve Etkileşim Testleri', () => {
  4  | 
  5  |   test.beforeEach(async ({ page, context }) => {
  6  |     // Mikrofon erişim iznini test ortamında otomatik olarak veriyoruz
  7  |     await context.grantPermissions(['microphone']);
  8  |     
  9  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  10 |     await page.goto('/');
  11 | 
  12 |     const envelopeSeal = page.locator('.envelope-seal');
  13 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  14 |     await envelopeSeal.click({ force: true });
  15 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  16 |   });
  17 | 
  18 |   test('Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı', async ({ page }) => {
  19 |     const wishesSection = page.locator('.wish-form');
  20 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
> 21 |     await wishesSection.scrollIntoViewIfNeeded();
     |                         ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 30000ms exceeded.
  22 | 
  23 |     // "Kaydet" veya "Record" butonunu bul
  24 |     const recordButton = wishesSection.locator('button', { hasText: /Kaydet|Record/i }).first();
  25 |     await expect(recordButton).toBeVisible({ timeout: 10000 });
  26 | 
  27 |     // Kaydı başlat
  28 |     await recordButton.click({ force: true });
  29 | 
  30 |     // Butonun kaydı durdurma "Durdur" veya "Stop" formuna dönüştüğünü doğrula
  31 |     const stopButton = wishesSection.locator('button', { hasText: /Durdur|Stop/i });
  32 |     await expect(stopButton).toBeVisible({ timeout: 5000 });
  33 | 
  34 |     // Kaydı durdur
  35 |     await stopButton.click({ force: true });
  36 | 
  37 |     // Kayıt bittikten sonra silme butonunun (Çöp Kutusu Emojisi 🗑️) geldiğini doğrula
  38 |     const deleteAudioButton = wishesSection.locator('button', { hasText: '🗑️' });
  39 |     await expect(deleteAudioButton).toBeVisible();
  40 | 
  41 |     // Sesi silip başa döndüğünü doğrula
  42 |     await deleteAudioButton.click({ force: true });
  43 |     await expect(recordButton).toBeVisible();
  44 |   });
  45 | });
```