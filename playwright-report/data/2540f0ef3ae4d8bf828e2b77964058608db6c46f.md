# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rsvp-flow.spec.js >> LCV (RSVP) Formu Uçtan Uca Etkileşimi >> Misafir katılım formunu eksiksiz doldurup gönderebilmeli
- Location: tests\rsvp-flow.spec.js:48:3

# Error details

```
Error: expect(locator).toBeEmpty() failed

Locator:  locator('.rsvp-card input[name="name"]')
Expected: empty
Received: notEmpty
Timeout:  10000ms

Call log:
  - Expect "toBeEmpty" with timeout 10000ms
  - waiting for locator('.rsvp-card input[name="name"]')
    22 × locator resolved to <input name="name" placeholder="Full Name" value="Playwright Test Misafiri"/>
       - unexpected value "notEmpty"

```

```yaml
- textbox "Full Name": Playwright Test Misafiri
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Medyaları engelleyerek testin çok daha hızlı çalışmasını sağlar
  4  | const mockMedia = async (page) => {
  5  |   await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
  6  |     route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  7  |   });
  8  |   await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
  9  | };
  10 | 
  11 | test.describe('LCV (RSVP) Formu Uçtan Uca Etkileşimi', () => {
  12 | 
  13 |   test.beforeEach(async ({ page }) => {
  14 |     await mockMedia(page);
  15 |     
  16 |     // Form submit edildiğinde gidecek Supabase Edge Function isteğini mockla (Gerçek veritabanına yazılmasın)
  17 |     await page.route('**/functions/v1/submit-form', async route => {
  18 |       // CORS Preflight (OPTIONS) isteklerine izin ver
  19 |       if (route.request().method() === 'OPTIONS') {
  20 |         await route.fulfill({
  21 |           status: 200,
  22 |           headers: {
  23 |             'Access-Control-Allow-Origin': '*',
  24 |             'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  25 |             'Access-Control-Allow-Headers': '*'
  26 |           }
  27 |         });
  28 |         return;
  29 |       }
  30 |       
  31 |       // Gerçek POST isteğine CORS başlığı ile yanıt ver
  32 |       await route.fulfill({
  33 |         status: 200,
  34 |         contentType: 'application/json',
  35 |         headers: { 'Access-Control-Allow-Origin': '*' },
  36 |         body: JSON.stringify({ success: true, data: { id: 'mock-id' } })
  37 |       });
  38 |     });
  39 | 
  40 |     await page.goto('/');
  41 |     const envelopeSeal = page.locator('.envelope-seal');
  42 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
  43 |     await page.waitForTimeout(1000);
  44 |     await envelopeSeal.click();
  45 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  46 |   });
  47 | 
  48 |   test('Misafir katılım formunu eksiksiz doldurup gönderebilmeli', async ({ page }) => {
  49 |     const rsvpSection = page.locator('.rsvp-card');
  50 |     await rsvpSection.scrollIntoViewIfNeeded();
  51 | 
  52 |     // 1. Zod şemasıyla eşleşen kesin 'name' attributeleri üzerinden seçim yapıyoruz
  53 |     await page.locator('.rsvp-card input[name="name"]').fill('Playwright Test Misafiri');
  54 |     
  55 |     const phoneInput = page.locator('.rsvp-card input[name="phone"]');
  56 |     if (await phoneInput.count() > 0) {
  57 |         await phoneInput.fill('0555 555 5555');
  58 |     }
  59 | 
  60 |     // 2. Kişi sayısı, Yakınlık ve Çocuk Durumu (Sırayla 1., 2. ve 3. OptionGroup bileşenleri)
  61 |     const optionGroups = page.locator('.rsvp-card .option-group');
  62 |     if (await optionGroups.count() >= 3) {
  63 |         await optionGroups.nth(0).locator('button').nth(1).click(); // 2 Kişi
  64 |         await optionGroups.nth(1).locator('button').nth(0).click(); // Gelin Tarafı
  65 |         await optionGroups.nth(2).locator('button').nth(1).click(); // Çocuk: Hayır
  66 |     }
  67 | 
  68 |     // 3. İstek şarkı ve Not alanları
  69 |     const songInput = page.locator('.rsvp-card input[name="songRequest"]');
  70 |     if (await songInput.count() > 0) {
  71 |         await songInput.fill("Ankara'nın Bağları");
  72 |     }
  73 | 
  74 |     const noteInput = page.locator('.rsvp-card textarea[name="note"]');
  75 |     if (await noteInput.count() > 0) {
  76 |         await noteInput.fill('Heyecanla bekliyoruz!');
  77 |     }
  78 | 
  79 |     // 4. Cloudflare Turnstile "1x000" test anahtarıyla kendi kendine otomatik doğrulanır.
  80 |     // Bu yüzden sahte bir butona tıklamak yerine Gönder butonunun kilidinin açılmasını bekliyoruz.
  81 |     const submitButton = page.locator('.rsvp-card button[type="submit"]');
  82 |     await submitButton.scrollIntoViewIfNeeded();
  83 |     
  84 |     // Butonun tıklanabilir olmasını bekle (Turnstile onaylanana kadar disabled kalır)
  85 |     await expect(submitButton).toBeEnabled({ timeout: 15000 });
  86 |     
  87 |     // Formu gönder
  88 |     await submitButton.click();
  89 | 
  90 |     // 5. Playwright Best Practice: Ağ isteğini beklemek yerine sonucun UI'a yansımasını (Formun sıfırlanmasını) doğrula
> 91 |     await expect(page.locator('.rsvp-card input[name="name"]')).toBeEmpty({ timeout: 10000 });
     |                                                                 ^ Error: expect(locator).toBeEmpty() failed
  92 |   });
  93 | });
```