# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-visibility.spec.js >> İçerik ve Bölüm Görünürlük Testleri >> Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli
- Location: tests\content-visibility.spec.js:37:3

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
  12 | test.describe('İçerik ve Bölüm Görünürlük Testleri', () => {
  13 | 
  14 |   test.beforeEach(async ({ page }) => {
  15 |     await mockMedia(page); 
  16 |     await page.goto('/');
  17 | 
  18 |     const envelopeSeal = page.locator('.envelope-seal');
> 19 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
     |                                    ^ Error: expect(locator).not.toContainText(expected) failed
  20 |     await envelopeSeal.click();
  21 |     
  22 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  23 |   });
  24 | 
  25 |   test('Geri sayım aracı (Countdown) ekranda görünür olmalı', async ({ page }) => {
  26 |     const countdownSection = page.locator('.countdown-section');
  27 |     await countdownSection.scrollIntoViewIfNeeded();
  28 |     await page.waitForTimeout(800);
  29 |     
  30 |     const countBoxes = countdownSection.locator('.count-box');
  31 |     const finishedBox = countdownSection.locator('.countdown-finished-box');
  32 |     
  33 |     const isVisible = (await countBoxes.count() > 0) || (await finishedBox.count() > 0);
  34 |     expect(isVisible).toBeTruthy();
  35 |   });
  36 | 
  37 |   test('Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli', async ({ page }) => {
  38 |     const storySection = page.locator('.story-card');
  39 |     await storySection.scrollIntoViewIfNeeded();
  40 |     await page.waitForTimeout(800);
  41 | 
  42 |     const storyTimeline = storySection.locator('.story-timeline-container');
  43 |     await expect(storyTimeline).toBeVisible({ timeout: 10000 });
  44 | 
  45 |     const storyNodes = storySection.locator('.story-node');
  46 |     expect(await storyNodes.count()).toBeGreaterThan(0);
  47 |   });
  48 | 
  49 |   test('Düğün Akışı (Schedule) ve Nikah (Ceremony) alanları yüklenmeli', async ({ page }) => {
  50 |     const ceremonySection = page.locator('.ceremony-card');
  51 |     await ceremonySection.scrollIntoViewIfNeeded();
  52 |     await page.waitForTimeout(800);
  53 |     await expect(ceremonySection).toBeVisible();
  54 | 
  55 |     const scheduleSection = page.locator('.schedule-card');
  56 |     await scheduleSection.scrollIntoViewIfNeeded();
  57 |     await expect(scheduleSection).toBeVisible();
  58 |   });
  59 | });
```