# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-and-wishes.spec.js >> Anı Defteri ve Admin Süreçleri >> Misafir anı defterine mesaj bırakabilmeli ve form sıfırlanmalı
- Location: tests\admin-and-wishes.spec.js:34:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('.card').filter({ hasText: /Anı Defteri|Guestbook/i }).locator('input[name="name"]')
Expected: ""
Received: "Playwright Test"
Timeout:  10000ms

Call log:
  - Expect "toHaveValue" with timeout 10000ms
  - waiting for locator('.card').filter({ hasText: /Anı Defteri|Guestbook/i }).locator('input[name="name"]')
    22 × locator resolved to <input name="name" placeholder="Full Name" value="Playwright Test"/>
       - unexpected value "Playwright Test"

```

```yaml
- textbox "Full Name": Playwright Test
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Anı Defteri ve Admin Süreçleri', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4,webm,ogg,mp3,wav}', route => route.abort());
  7  |     
  8  |     // Turnstile token doğrulamasını E2E testinde aşabilmek için tarayıcıyı en baştan offline gösteriyoruz.
  9  |     await page.addInitScript(() => {
  10 |       Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
  11 |     });
  12 | 
  13 |     // DÜZELTME: CORS (Cross-Origin) başlıkları ve Content-Type eksiksiz eklendi
  14 |     await page.route('**/functions/v1/submit-form', async route => {
  15 |       if (route.request().method() === 'OPTIONS') {
  16 |         await route.fulfill({ 
  17 |           status: 200, 
  18 |           headers: { 
  19 |             'Access-Control-Allow-Origin': '*',
  20 |             'Access-Control-Allow-Headers': '*'
  21 |           } 
  22 |         });
  23 |         return;
  24 |       }
  25 |       await route.fulfill({ 
  26 |         status: 200, 
  27 |         headers: { 'Access-Control-Allow-Origin': '*' },
  28 |         contentType: 'application/json',
  29 |         body: JSON.stringify({ success: true, data: { id: 'w1' } }) 
  30 |       });
  31 |     });
  32 |   });
  33 | 
  34 |   test('Misafir anı defterine mesaj bırakabilmeli ve form sıfırlanmalı', async ({ page }) => {
  35 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  36 | 
  37 |     const envelopeSeal = page.locator('.envelope-seal');
  38 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  39 |     await envelopeSeal.waitFor({ state: 'visible' });
  40 |     await envelopeSeal.click();
  41 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  42 | 
  43 |     const wishesSection = page.locator('.card', { hasText: /Anı Defteri|Guestbook/i });
  44 |     await wishesSection.scrollIntoViewIfNeeded();
  45 | 
  46 |     await wishesSection.locator('input[name="name"]').fill('Playwright Test');
  47 |     await wishesSection.locator('textarea[name="message"]').fill('Tebrikler, çok mutlu olun!');
  48 | 
  49 |     const submitBtn = wishesSection.locator('button[type="submit"]');
  50 |     await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  51 |     await submitBtn.click();
  52 | 
  53 |     // Ağ isteği başarıyla (CORS hatası olmadan) bittikten sonra React Hook Form reset() çalışacak ve girdiler temizlenecek
> 54 |     await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
     |                                                               ^ Error: expect(locator).toHaveValue(expected) failed
  55 |     await expect(wishesSection.locator('textarea[name="message"]')).toHaveValue('', { timeout: 10000 });
  56 |   });
  57 | });
```