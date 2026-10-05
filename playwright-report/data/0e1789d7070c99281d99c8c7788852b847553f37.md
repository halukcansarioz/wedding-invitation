# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-data-management.spec.js >> Admin Paneli: Veri Yedekleme (Data Export) İşlemleri >> JSON İndir butonuna basıldığında tarayıcı indirme işlemini başlatmalı
- Location: tests\admin-data-management.spec.js:43:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.admin-editor-section').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('.admin-editor-section').first()

```

```yaml
- main:
  - button "Back to Invitation 🏠"
  - button "Live Projector 🎬"
  - button "EN"
  - button "Play Music":
    - img
  - paragraph: Management
  - heading "Admin Panel" [level=2]
  - textbox "Admin email"
  - textbox "Admin password"
  - button "Login 🔐"
  - button "Forgot password? 🔑"
  - text: "Please log in to access the admin panel. Note: Use the email/password from your Supabase Authentication. ❀"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const mockMedia = async (page) => {
  4  |   await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
  5  | };
  6  | 
  7  | test.describe('Admin Paneli: Veri Yedekleme (Data Export) İşlemleri', () => {
  8  | 
  9  |   test.beforeEach(async ({ page }) => {
  10 |     await mockMedia(page);
  11 | 
  12 |     await page.route('**/auth/v1/token?grant_type=password', async route => {
  13 |       const now = Math.floor(Date.now() / 1000);
  14 |       await route.fulfill({
  15 |         status: 200, contentType: 'application/json',
  16 |         body: JSON.stringify({
  17 |           access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
  18 |           user: { id: '123', aud: 'authenticated', email: 'admin@test.com' },
  19 |         }),
  20 |       });
  21 |     });
  22 | 
  23 |     await page.route('**/rest/v1/**', async route => {
  24 |       await route.fulfill({
  25 |         status: 200, contentType: 'application/json',
  26 |         body: JSON.stringify({ invitation: { bride: 'A', groom: 'B' }, settings: {} })
  27 |       });
  28 |     });
  29 | 
  30 |     await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  31 |     
  32 |     const emailInput = page.locator('input[type="email"]');
  33 |     if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
  34 |       await emailInput.fill('admin@test.com');
  35 |       await page.locator('input[type="password"]').fill('123456');
  36 |       await page.locator('button[type="submit"]').click();
  37 |     }
  38 |     
  39 |     // DÜZELTME: Metin aramak yerine ana admin kapsayıcısının yüklenmesini bekliyoruz
> 40 |     await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  41 |   });
  42 | 
  43 |   test('JSON İndir butonuna basıldığında tarayıcı indirme işlemini başlatmalı', async ({ page }) => {
  44 |     const dataTabButton = page.locator('button, a, div').filter({ hasText: /Veri Yedeği|Data/i }).first();
  45 |     await dataTabButton.waitFor({ state: 'visible', timeout: 10000 });
  46 |     await dataTabButton.click();
  47 | 
  48 |     const downloadPromise = page.waitForEvent('download');
  49 |     
  50 |     const downloadBtn = page.locator('button', { hasText: /JSON İndir|Download JSON/i });
  51 |     await expect(downloadBtn).toBeVisible({ timeout: 10000 });
  52 |     await downloadBtn.click();
  53 | 
  54 |     const download = await downloadPromise;
  55 |     expect(download.suggestedFilename()).toContain('.json');
  56 |   });
  57 | });
```