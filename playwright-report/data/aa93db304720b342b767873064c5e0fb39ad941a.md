# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-live-projector.spec.js >> Canlı Barkovizyon (Live Projector) Testleri >> Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı
- Location: tests\admin-live-projector.spec.js:13:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/Canlı Anı Akışı|Live Memories/i')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('text=/Canlı Anı Akışı|Live Memories/i')

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
  12 | test.describe('Canlı Barkovizyon (Live Projector) Testleri', () => {
  13 |   test('Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı', async ({ page }) => {
  14 |     await mockMedia(page);
  15 |     await page.goto('/live');
  16 |     
  17 |     const liveSubtitle = page.locator('text=/Canlı Anı Akışı|Live Memories/i');
> 18 |     await expect(liveSubtitle).toBeVisible({ timeout: 15000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  19 |     
  20 |     const titleElement = page.locator('h1');
  21 |     await expect(titleElement).toBeVisible();
  22 |     
  23 |     const isDarkTheme = await page.evaluate(() => document.documentElement.dataset.theme === 'dark');
  24 |     expect(isDarkTheme).toBeTruthy();
  25 |   });
  26 | });
```