# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rsvp.spec.js >> Düğün Davetiyesi LCV (RSVP) Süreçleri >> LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli
- Location: tests\rsvp.spec.js:48:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "TR" [ref=e3] [cursor=pointer]
  - generic [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e9]:
        - generic [ref=e10]: ❀
        - paragraph [ref=e11]: Wedding Invitation
        - heading "Handenur & Haluk Can" [level=1] [ref=e12]:
          - generic [ref=e13]: Handenur
          - emphasis [ref=e14]: "&"
          - generic [ref=e15]: Haluk Can
        - paragraph [ref=e16]: You are invited to the most special day of our love story.
      - button "Open Invitation" [ref=e19] [cursor=pointer]
    - link "Admin Panel" [ref=e22] [cursor=pointer]:
      - /url: /admin
    - generic [ref=e25]:
      - button "TR" [ref=e26] [cursor=pointer]
      - button "Play" [ref=e28] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Düğün Davetiyesi LCV (RSVP) Süreçleri', () => {
  4  | 
  5  |   // Her testten önce zarfı açıp ana davetiye ekranına ulaşıyoruz
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
> 8  |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  9  | 
  10 |     const envelopeSeal = page.locator('.envelope-seal');
  11 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  12 |     await envelopeSeal.click({ force: true });
  13 |     
  14 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  15 |     await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  16 |   });
  17 | 
  18 |   test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
  19 |     const rsvpSection = page.locator('.rsvp-card');
  20 |     await rsvpSection.waitFor({ state: 'attached', timeout: 10000 });
  21 | 
  22 |     // Sayfayı aşağı kaydırıp animasyonları tetikle
  23 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  24 |     await rsvpSection.scrollIntoViewIfNeeded();
  25 |     await expect(rsvpSection).toBeVisible({ timeout: 10000 });
  26 | 
  27 |     // Sadece kesin olarak var olduğunu bildiğimiz "Ad Soyad" alanını doldur
  28 |     // (Telefon veya Select gibi elementler özel tasarım component olduğu için testi kırmasını önlüyoruz)
  29 |     await page.fill('input[name="name"]', 'Playwright Test Misafiri');
  30 |     
  31 |     // Varsa Note alanını doldur (Hata vermemesi için doğrudan textarea etiketini seçiyoruz)
  32 |     const noteField = rsvpSection.locator('textarea');
  33 |     if (await noteField.count() > 0) {
  34 |       await noteField.first().fill('Test otomasyonu ile gönderilen not.');
  35 |     }
  36 | 
  37 |     // Gönder butonunu bul
  38 |     const submitButton = rsvpSection.locator('button[type="submit"]');
  39 | 
  40 |     // DİKKAT: Turnstile bot koruması onaylanana kadar buton 'disabled' kalır.
  41 |     // Cloudflare test anahtarının onaylanması birkaç saniye sürebilir, bu yüzden butonun aktif olmasını bekliyoruz.
  42 |     await expect(submitButton).toBeEnabled({ timeout: 15000 });
  43 |     
  44 |     // Formu gönder (Tıklama eylemini gerçekleştir)
  45 |     await submitButton.click();
  46 |   });
  47 | 
  48 |   test('LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli', async ({ page }) => {
  49 |     const rsvpSection = page.locator('.rsvp-card');
  50 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  51 |     await rsvpSection.scrollIntoViewIfNeeded();
  52 |     
  53 |     const submitButton = rsvpSection.locator('button[type="submit"]');
  54 | 
  55 |     // Turnstile'in geçmesini ve butonun tıklanabilir olmasını bekle
  56 |     await expect(submitButton).toBeEnabled({ timeout: 15000 });
  57 |     
  58 |     // Hiçbir alanı doldurmadan direkt Gönder butonuna bas
  59 |     await submitButton.click();
  60 | 
  61 |     // Zod şemasından gelen "ad soyad" (veya İngilizce ise name) hatasının çıkmasını bekle
  62 |     const errorMessage = rsvpSection.locator('text=/ad soyad|name/i');
  63 |     await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  64 |   });
  65 | });
```