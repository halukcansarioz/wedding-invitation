# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wishes-submission-e2e.spec.js >> Anı Defteri (Wishes) Gönderim Akışı >> Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı
- Location: tests\wishes-submission-e2e.spec.js:15:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first().locator('input[name="name"]')
Expected: ""
Received: "E2E Test Kullanıcısı"
Timeout:  10000ms

Call log:
  - Expect "toHaveValue" with timeout 10000ms
  - waiting for locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first().locator('input[name="name"]')
    23 × locator resolved to <input name="name" placeholder="Full Name" value="E2E Test Kullanıcısı"/>
       - unexpected value "E2E Test Kullanıcısı"

```

```yaml
- textbox "Full Name": E2E Test Kullanıcısı
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupE2EMocks } from './utils';
  3  | 
  4  | test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {
  5  |   
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await setupE2EMocks(page, true);
  8  | 
  9  |     await page.goto('/');
  10 |     const envelopeSeal = page.locator('.envelope-seal');
  11 |     await envelopeSeal.waitFor({ state: 'visible', timeout: 10000 });
  12 |     await envelopeSeal.click();
  13 |   });
  14 | 
  15 |   test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı', async ({ page }) => {
  16 |     const wishesSection = page.locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first();
  17 |     await wishesSection.scrollIntoViewIfNeeded();
  18 | 
  19 |     await wishesSection.locator('input[name="name"]').fill('E2E Test Kullanıcısı');
  20 |     await wishesSection.locator('textarea[name="message"]').fill('Playwright üzerinden gönderilen otomatik test mesajı.');
  21 | 
  22 |     const submitBtn = wishesSection.locator('button[type="submit"]');
  23 |     
  24 |     // Buton aktifleşene kadar bekle ve tıkla (Network izleme kodları KESİNLİKLE silindi)
  25 |     await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  26 |     await submitBtn.click();
  27 | 
  28 |     // Form başarıyla gönderildiği için anında sıfırlanacaktır. Bu, testin başarılı olduğunu kanıtlar.
> 29 |     await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
     |                                                               ^ Error: expect(locator).toHaveValue(expected) failed
  30 |   });
  31 | });
```