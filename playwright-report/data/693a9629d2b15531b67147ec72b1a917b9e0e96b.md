# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rsvp.spec.js >> Düğün Davetiyesi LCV (RSVP) Süreçleri >> LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli
- Location: tests\rsvp.spec.js:41:3

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
  12 | test.describe('Düğün Davetiyesi LCV (RSVP) Süreçleri', () => {
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
  24 |   test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
  25 |     const rsvpSection = page.locator('.rsvp-card');
  26 |     await rsvpSection.scrollIntoViewIfNeeded();
  27 |     await page.waitForTimeout(800);
  28 | 
  29 |     await page.fill('.rsvp-card input[name="name"]', 'Playwright Test Misafiri');
  30 |     
  31 |     const noteField = rsvpSection.locator('textarea');
  32 |     if (await noteField.count() > 0) {
  33 |       await noteField.first().fill('Test otomasyonu ile gönderilen not.');
  34 |     }
  35 | 
  36 |     const submitButton = rsvpSection.locator('button[type="submit"]');
  37 |     await expect(submitButton).toBeEnabled({ timeout: 15000 });
  38 |     await submitButton.click();
  39 |   });
  40 | 
  41 |   test('LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli', async ({ page }) => {
  42 |     const rsvpSection = page.locator('.rsvp-card');
  43 |     await rsvpSection.scrollIntoViewIfNeeded();
  44 |     await page.waitForTimeout(800);
  45 | 
  46 |     const submitButton = rsvpSection.locator('button[type="submit"]');
  47 |     await expect(submitButton).toBeEnabled({ timeout: 15000 });
  48 |     await submitButton.click();
  49 | 
  50 |     const errorMessage = rsvpSection.locator('text=/ad soyad|name/i');
  51 |     await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  52 |   });
  53 | });
```