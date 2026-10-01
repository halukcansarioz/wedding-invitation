# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-auth-ui.spec.js >> Admin Paneli Arayüz Etkileşimleri >> Kullanıcı Şifremi Unuttum formu ile Giriş formu arasında geçiş yapabilmeli
- Location: tests\admin-auth-ui.spec.js:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[type="submit"]').filter({ hasText: /Giriş Yap|Login/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button[type="submit"]').filter({ hasText: /Giriş Yap|Login/i })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Paneli Arayüz Etkileşimleri', () => {
  4  | 
  5  |   test('Kullanıcı Şifremi Unuttum formu ile Giriş formu arasında geçiş yapabilmeli', async ({ page }) => {
  6  |     // Admin URL parametresine git (Projenizdeki gerçek admin rotası `/admin` veya `/?admin=1` olabilir)
  7  |     await page.goto('/admin'); 
  8  | 
  9  |     // 1. Varsayılan giriş butonunu bul ve kontrol et
  10 |     const loginButton = page.locator('button[type="submit"]', { hasText: /Giriş Yap|Login/i });
> 11 |     await expect(loginButton).toBeVisible({ timeout: 10000 });
     |                               ^ Error: expect(locator).toBeVisible() failed
  12 | 
  13 |     // 2. Şifremi unuttum butonuna tıkla
  14 |     const forgotPasswordLink = page.locator('button', { hasText: /Şifremi unuttum|Forgot password/i });
  15 |     await forgotPasswordLink.click({ force: true });
  16 | 
  17 |     // 3. Şifre sıfırlama formunun geldiğini ve giriş butonunun gizlendiğini onayla
  18 |     const resetFormButton = page.locator('button[type="submit"]', { hasText: /Sıfırlama Linki|Send Reset Link/i });
  19 |     await expect(resetFormButton).toBeVisible();
  20 |     await expect(loginButton).toBeHidden();
  21 | 
  22 |     // 4. Tekrar giriş ekranına dön linkine tıkla
  23 |     const backToLoginLink = page.locator('button', { hasText: /Giriş ekranına dön|Back to login/i });
  24 |     await backToLoginLink.click({ force: true });
  25 | 
  26 |     // 5. Orijinal giriş formunun geri geldiğini onayla
  27 |     await expect(loginButton).toBeVisible();
  28 |     await expect(resetFormButton).toBeHidden();
  29 |   });
  30 | });
```