# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-personal-link.spec.js >> Admin Kişiye Özel Link Üretici (E2E) >> Misafir adı girildiğinde doğru akıllı link oluşturulmalı
- Location: tests\admin-personal-link.spec.js:38:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder*="Ahmet Yılmaz"], input[placeholder*="John Doe"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input[placeholder*="Ahmet Yılmaz"], input[placeholder*="John Doe"]')

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
  12 | test.describe('Admin Kişiye Özel Link Üretici (E2E)', () => {
  13 | 
  14 |   test.beforeEach(async ({ page }) => {
  15 |     await mockMedia(page);
  16 |     await page.goto('/admin');
  17 |     
  18 |     // Test sırasında Supabase bağlantısı eksikse girişi taklit et
  19 |     const emailInput = page.locator('input[type="email"]');
  20 |     if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
  21 |        await emailInput.fill('test@admin.com');
  22 |        await page.locator('input[type="password"]').fill('123456');
  23 |        
  24 |        // Ağ seviyesinde Supabase oturum açma isteğini mockla
  25 |        await page.route('**/auth/v1/token?grant_type=password', async route => {
  26 |           await route.fulfill({ 
  27 |             status: 200, 
  28 |             contentType: 'application/json', 
  29 |             body: JSON.stringify({ access_token: 'fake', user: { id: '123' } }) 
  30 |           });
  31 |        });
  32 |        
  33 |        await page.locator('button[type="submit"]').click();
  34 |        await page.waitForTimeout(1000);
  35 |     }
  36 |   });
  37 | 
  38 |   test('Misafir adı girildiğinde doğru akıllı link oluşturulmalı', async ({ page }) => {
  39 |     const personalLinkTabBtn = page.locator('button', { hasText: /Özel Link|Personal Link/i });
  40 |     if (await personalLinkTabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  41 |         await personalLinkTabBtn.click();
  42 |     }
  43 | 
  44 |     const nameInput = page.locator('input[placeholder*="Ahmet Yılmaz"], input[placeholder*="John Doe"]');
> 45 |     await expect(nameInput).toBeVisible({ timeout: 10000 });
     |                             ^ Error: expect(locator).toBeVisible() failed
  46 | 
  47 |     await nameInput.fill('Zeynep Demir');
  48 | 
  49 |     const resultInput = page.locator('.admin-link-result-input');
  50 |     const generatedLink = await resultInput.inputValue();
  51 | 
  52 |     expect(generatedLink).toContain('guest=Zeynep%20Demir');
  53 |   });
  54 | });
```