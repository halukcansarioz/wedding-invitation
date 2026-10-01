# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-and-interactions.spec.js >> Sesli Mesaj ve Etkileşim Testleri >> Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı
- Location: tests\audio-and-interactions.spec.js:25:3

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
  12 | test.describe('Sesli Mesaj ve Etkileşim Testleri', () => {
  13 | 
  14 |   test.beforeEach(async ({ page, context }) => {
  15 |     await context.grantPermissions(['microphone']);
  16 |     await mockMedia(page);
  17 |     await page.goto('/');
  18 | 
  19 |     const envelopeSeal = page.locator('.envelope-seal');
> 20 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
     |                                    ^ Error: expect(locator).not.toContainText(expected) failed
  21 |     await envelopeSeal.click();
  22 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  23 |   });
  24 | 
  25 |   test('Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı', async ({ page }) => {
  26 |     const wishesSection = page.locator('.wish-form');
  27 |     await wishesSection.scrollIntoViewIfNeeded();
  28 |     await page.waitForTimeout(800);
  29 |     
  30 |     const recordButton = wishesSection.locator('button', { hasText: /Kaydet|Record/i }).first();
  31 |     await expect(recordButton).toBeVisible({ timeout: 10000 });
  32 | 
  33 |     await recordButton.click();
  34 | 
  35 |     const stopButton = wishesSection.locator('button', { hasText: /Durdur|Stop/i });
  36 |     await expect(stopButton).toBeVisible({ timeout: 10000 });
  37 | 
  38 |     await stopButton.click();
  39 | 
  40 |     const deleteAudioButton = wishesSection.locator('button', { hasText: '🗑️' });
  41 |     await expect(deleteAudioButton).toBeVisible();
  42 |   });
  43 | });
```