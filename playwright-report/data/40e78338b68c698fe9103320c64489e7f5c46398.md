# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-and-wishes.spec.js >> Anı Defteri ve Admin Süreçleri >> Misafir anı defterine mesaj bırakabilmeli
- Location: tests\admin-and-wishes.spec.js:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.wish-form')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "TR" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - link "Admin Panel" [ref=e7] [cursor=pointer]:
      - /url: /admin
    - generic [ref=e10]:
      - button "TR" [ref=e11] [cursor=pointer]
      - button "Play" [ref=e13] [cursor=pointer]
      - button [ref=e19] [cursor=pointer]
    - generic [ref=e22]: Yükleniyor...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Anı Defteri ve Admin Süreçleri', () => {
  4  |   
  5  |   test('Misafir anı defterine mesaj bırakabilmeli', async ({ page }) => {
  6  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  7  |     await page.goto('/');
  8  | 
  9  |     const envelopeSeal = page.locator('.envelope-seal');
  10 |     
  11 |     // YENİ EKLENEN: Görselin yüklenmesini ve butonun aktifleşmesini bekle
  12 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  13 |     await envelopeSeal.click({ force: true });
  14 |     
  15 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  16 |     
  17 |     const wishesSection = page.locator('.wish-form');
> 18 |     await wishesSection.waitFor({ state: 'attached' });
     |                         ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  19 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  20 |     await wishesSection.scrollIntoViewIfNeeded();
  21 | 
  22 |     await page.fill('input[name="name"]', 'Playwright Bot');
  23 |     await page.fill('textarea[name="message"]', 'Harika bir düğün test mesajı!');
  24 |     
  25 |     // Not: Turnstile bot koruması aktifse, E2E testlerinde submit butonu disable kalabilir.
  26 |     // CI ortamlarında test için Turnstile'i bypass eden bir mock eklemek gerekebilir.
  27 |   });
  28 | 
  29 |   test('Kullanıcı admin paneline hatalı şifreyle girememeli', async ({ page }) => {
  30 |     // Admin URL parametresi veya doğrudan rota ile git
  31 |     await page.goto('/admin');
  32 | 
  33 |     const emailInput = page.locator('input[type="email"]');
  34 |     const passwordInput = page.locator('input[type="password"]');
  35 |     const loginButton = page.locator('button[type="submit"]');
  36 | 
  37 |     await emailInput.fill('testadmin@example.com');
  38 |     await passwordInput.fill('yanlis_sifre_123');
  39 |     
  40 |     // YENİ EKLENEN: Supabase uyarı katmanını (overlay) delerek tıklamak için force: true parametresi eklendi
  41 |     await loginButton.click({ force: true });
  42 | 
  43 |     // Hata mesajının çıkmasını bekle (Supabase auth mocklandığı için hata verecektir)
  44 |     const errorMessage = page.locator('.admin-login-message.error');
  45 |     await expect(errorMessage).toBeVisible();
  46 |   });
  47 | });
```