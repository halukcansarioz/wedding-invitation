# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-mobile.spec.js >> Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow) >> Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli
- Location: tests\responsive-mobile.spec.js:7:3

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
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({ ...devices['iPhone 12'] });
  4  | 
  5  | test.describe('Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow)', () => {
  6  | 
  7  |   test('Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli', async ({ page }) => {
  8  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  9  |     await page.goto('/');
  10 | 
  11 |     const envelopeSeal = page.locator('.envelope-seal');
> 12 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
     |                                    ^ Error: expect(locator).not.toContainText(expected) failed
  13 |     await envelopeSeal.click({ force: true });
  14 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  15 |     
  16 |     const slideshowContainer = page.locator('.slideshow-container');
  17 |     await expect(slideshowContainer).toBeVisible({ timeout: 15000 });
  18 |     
  19 |     const slideControls = page.locator('.slide-controls');
  20 |     await expect(slideControls).toBeVisible();
  21 |   });
  22 | });
```