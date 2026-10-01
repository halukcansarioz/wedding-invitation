# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-live-projector.spec.js >> Canlı Barkovizyon (Live Projector) Testleri >> Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı
- Location: tests\admin-live-projector.spec.js:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:5173/live", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Canlı Barkovizyon (Live Projector) Testleri', () => {
  4  | 
  5  |   test('Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı', async ({ page }) => {
  6  |     // Media ve dış api isteklerini engelle (hız için)
  7  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  8  |     
  9  |     // Doğrudan Live sayfasına git
> 10 |     await page.goto('/live');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  11 | 
  12 |     // Live Projector'a özel "Canlı Anı Akışı" veya "Live Memories" yazısı var mı?
  13 |     const liveSubtitle = page.locator('text=/Canlı Anı Akışı|Live Memories/i');
  14 |     await expect(liveSubtitle).toBeVisible({ timeout: 10000 });
  15 | 
  16 |     // Gelin damat adının olduğu ana başlık (h1) ekranda mı?
  17 |     const titleElement = page.locator('h1');
  18 |     await expect(titleElement).toBeVisible();
  19 | 
  20 |     // Barkovizyon sayfasında body'nin dark theme'e geçirildiğini kontrol et (useEffect içindeki mantık)
  21 |     const isDarkTheme = await page.evaluate(() => document.documentElement.dataset.theme === 'dark');
  22 |     expect(isDarkTheme).toBeTruthy();
  23 | 
  24 |     // QR kod yönlendirme mesajı alt kısımda görünüyor mu?
  25 |     const footerText = page.locator('text=/Ekrana mesaj veya fotoğraf göndermek|Scan the QR code to send a message/i');
  26 |     await expect(footerText).toBeVisible();
  27 |   });
  28 | });
```