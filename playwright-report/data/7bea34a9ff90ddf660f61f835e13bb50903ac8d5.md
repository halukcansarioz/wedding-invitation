# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payments-and-gifts.spec.js >> Hediye ve Ödeme İşlemleri Uçtan Uca (E2E) >> Kredi kartı modülü açıksa Supabase ödeme Edge Functionuna istek atılmalı
- Location: tests\payments-and-gifts.spec.js:41:3

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
  12 | test.describe('Hediye ve Ödeme İşlemleri Uçtan Uca (E2E)', () => {
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
  24 |   test('Misafir IBAN panosunu kopyalayabilmeli', async ({ page, context }) => {
  25 |     await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  26 | 
  27 |     const giftSection = page.locator('.gift-card').first();
  28 |     await giftSection.scrollIntoViewIfNeeded();
  29 |     await page.waitForTimeout(800);
  30 | 
  31 |     const copyIbanButton = page.locator('button', { hasText: /Kopyala|Copy/i }).first();
  32 |     await expect(copyIbanButton).toBeVisible({ timeout: 10000 });
  33 | 
  34 |     await copyIbanButton.click();
  35 |     await expect(copyIbanButton).toContainText(/Kopyalandı|Copied/i);
  36 | 
  37 |     const clipboardText = await page.evaluate("navigator.clipboard.readText()");
  38 |     expect(clipboardText).toContain("TR");
  39 |   });
  40 | 
  41 |   test('Kredi kartı modülü açıksa Supabase ödeme Edge Functionuna istek atılmalı', async ({ page }) => {
  42 |     await page.addInitScript(() => {
  43 |       window.prompt = () => "500"; 
  44 |     });
  45 | 
  46 |     await page.route('**/functions/v1/create-payment', async route => {
  47 |       await route.fulfill({
  48 |         status: 200,
  49 |         contentType: 'application/json',
  50 |         body: JSON.stringify({ success: true, paymentUrl: 'https://checkout.stripe.com/test-url' })
  51 |       });
  52 |     });
  53 | 
  54 |     const giftSection = page.locator('.gift-card').first();
  55 |     await giftSection.scrollIntoViewIfNeeded();
  56 |     await page.waitForTimeout(800);
  57 | 
  58 |     const creditCardButton = page.locator('button', { hasText: /Kredi Kartı/i });
  59 |     if (await creditCardButton.isVisible()) {
  60 |       await creditCardButton.click();
  61 |     }
  62 |   });
  63 | });
```