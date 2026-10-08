# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guestbook-live-sync.spec.js >> Realtime Senkronizasyon: Anı Defteri ve Barkovizyon >> Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı
- Location: tests\guestbook-live-sync.spec.js:6:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")').first().locator('input[name="name"]')
Expected: ""
Received: "Canlı Test"
Timeout:  10000ms

Call log:
  - Expect "toHaveValue" with timeout 10000ms
  - waiting for locator('section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")').first().locator('input[name="name"]')
    23 × locator resolved to <input name="name" value="Canlı Test" placeholder="Full Name"/>
       - unexpected value "Canlı Test"

```

```yaml
- textbox "Full Name": Canlı Test
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupE2EMocks } from './utils';
  3  | 
  4  | test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {
  5  |   
  6  |   test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
  7  |     const context1 = await browser.newContext();
  8  |     const context2 = await browser.newContext();
  9  |     const pageForm = await context1.newPage();
  10 |     const pageLive = await context2.newPage();
  11 | 
  12 |     await setupE2EMocks(pageForm, true);
  13 |     await setupE2EMocks(pageLive, true);
  14 | 
  15 |     // Barkovizyonun (Live) Supabase'den mesaj beklemesini durdurup direkt mock verisi veriyoruz
  16 |     await pageLive.route('**/rest/v1/wishes*', async route => {
  17 |       await route.fulfill({
  18 |         status: 200,
  19 |         contentType: 'application/json',
  20 |         headers: { 'Access-Control-Allow-Origin': '*' },
  21 |         body: JSON.stringify([{ id: 'mock-1', name: 'Canlı Test', message: 'Ekranda belirecek canlı mesaj', approved: true }])
  22 |       });
  23 |     });
  24 | 
  25 |     // 1. Ziyaretçi Sayfası (Form)
  26 |     await pageForm.goto('/');
  27 |     const envelopeSeal = pageForm.locator('.envelope-seal');
  28 |     await envelopeSeal.waitFor({ state: 'visible', timeout: 10000 });
  29 |     await envelopeSeal.click();
  30 | 
  31 |     // 2. Barkovizyon Sayfası
  32 |     await pageLive.goto('/live'); 
  33 | 
  34 |     // Formu doldur
  35 |     const wishesSection = pageForm.locator('section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")').first();
  36 |     await wishesSection.scrollIntoViewIfNeeded();
  37 |     
  38 |     await wishesSection.locator('input[name="name"]').fill('Canlı Test');
  39 |     await wishesSection.locator('textarea[name="message"]').fill('Ekranda belirecek canlı mesaj');
  40 | 
  41 |     const submitBtn = wishesSection.locator('button[type="submit"]');
  42 |     
  43 |     // Bekle ve tıkla
  44 |     await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  45 |     await submitBtn.click();
  46 | 
  47 |     // Form sıfırlanmalı
> 48 |     await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
     |                                                               ^ Error: expect(locator).toHaveValue(expected) failed
  49 | 
  50 |     // Canlı ekranda mesajın göründüğünü doğrula (Yapay mock verisinden gelir)
  51 |     await expect(pageLive.locator('text=Ekranda belirecek canlı mesaj').first()).toBeVisible({ timeout: 10000 });
  52 | 
  53 |     await context1.close();
  54 |     await context2.close();
  55 |   });
  56 | });
```