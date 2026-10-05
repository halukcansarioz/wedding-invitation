# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-wishes-moderation.spec.js >> Admin Paneli: Anı Defteri (Wishes) Moderasyon Akışı >> Admin onay bekleyen mesajları görebilmeli ve onaylayabilmeli
- Location: tests\admin-wishes-moderation.spec.js:45:3

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
  7  | test.describe('Admin Paneli: Anı Defteri (Wishes) Moderasyon Akışı', () => {
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
  23 |     await page.route('**/rest/v1/wishes*', async route => {
  24 |       await route.fulfill({
  25 |         status: 200, contentType: 'application/json',
  26 |         body: JSON.stringify([
  27 |           { id: 'msg-1', name: 'Zeynep', message: 'Tebrikler!', approved: false, created_at: new Date().toISOString() },
  28 |           { id: 'msg-2', name: 'Ahmet', message: 'Mutluluklar.', approved: true, created_at: new Date().toISOString() }
  29 |         ])
  30 |       });
  31 |     });
  32 | 
  33 |     await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  34 |     
  35 |     const emailInput = page.locator('input[type="email"]');
  36 |     if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
  37 |       await emailInput.fill('admin@test.com');
  38 |       await page.locator('input[type="password"]').fill('123456');
  39 |       await page.locator('button[type="submit"]').click();
  40 |     }
  41 |     
> 42 |     await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  43 |   });
  44 | 
  45 |   test('Admin onay bekleyen mesajları görebilmeli ve onaylayabilmeli', async ({ page }) => {
  46 |     const wishesTabBtn = page.locator('button, div').filter({ hasText: /Anı Defteri Formu|Guestbook/i }).first();
  47 |     await wishesTabBtn.waitFor({ state: 'visible', timeout: 10000 });
  48 |     await wishesTabBtn.click();
  49 | 
  50 |     await expect(page.locator('text=Zeynep')).toBeVisible({ timeout: 10000 });
  51 |     await expect(page.locator('text=Tebrikler!')).toBeVisible();
  52 | 
  53 |     const updateRequestPromise = page.waitForRequest(req => 
  54 |       req.url().includes('/rest/v1/wishes') && req.method() === 'PATCH'
  55 |     );
  56 | 
  57 |     const approveBtn = page.locator('.admin-row').filter({ hasText: 'Zeynep' }).locator('button', { hasText: /Onayla|Approve/i });
  58 |     await approveBtn.click();
  59 | 
  60 |     const updateRequest = await updateRequestPromise;
  61 |     expect(updateRequest.postDataJSON()).toMatchObject({ approved: true });
  62 |   });
  63 | });
```