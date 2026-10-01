# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payments-and-gifts.spec.js >> Hediye ve Ödeme İşlemleri Uçtan Uca (E2E) >> Misafir IBAN panosunu kopyalayabilmeli
- Location: tests\payments-and-gifts.spec.js:16:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /IBAN'ı Kopyala/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button').filter({ hasText: /IBAN'ı Kopyala/i })

```

```yaml
- button "TR"
- link "Admin Panel":
  - /url: /admin
  - img
- button "TR"
- button "Play":
  - img
- button:
  - img
- button:
  - img
- paragraph: We Are Getting Married
- heading "Handenur & Haluk Can" [level=1]:
  - text: Handenur
  - emphasis: "&"
  - text: Haluk Can
- paragraph: 07 Ağustos 2027
- paragraph: Time 19:00
- text: SCROLL
- paragraph: Countdown
- heading "Time Left Until Our Wedding" [level=2]
- strong: "279"
- text: Days
- strong: "10"
- text: Hours
- strong: "25"
- text: Mins
- strong: "35"
- text: Secs
- paragraph: Invitation
- heading "Will You Share Our Happiness?" [level=2]
- paragraph: Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.
- text: ❀
- paragraph: Our Families
- heading "With the Joy of Our Families" [level=2]
- paragraph: Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.
- text: Gelin Ailesi
- strong: Çeltik Ailesi
- text: Damat Ailesi
- strong: Sarıöz Ailesi
- text: ❀
- paragraph: Ceremony & Celebration
- heading "Details of the Day" [level=2]
- text: Saturday, August 22, 2026 Nikah Töreni
- strong: 19:00
- paragraph: Mutluluğumuza ilk imzayı atacağımız özel an.
- emphasis: Fenerbahçe Orduevi Plaj Düğün Salonu
- text: Düğün & Eğlence
- strong: 20:00
- paragraph: Yemek, kutlama ve eğlence ile devam edecek güzel akşam.
- emphasis: Fenerbahçe Orduevi Plaj Düğün Salonu
- text: ❀
- paragraph: Wedding Schedule
- heading "07 Ağustos 2027" [level=2]
- strong: 18:30
- text: Misafir Karşılama
- paragraph: Davetlilerimizin alana gelişi ve karşılama.
- strong: 19:00
- text: Nikah Töreni
- paragraph: Nikah merasimimiz başlar.
- strong: 20:00
- text: Yemek ve Kutlama
- paragraph: Yemek ikramı ve kutlama bölümü.
- strong: 21:00
- text: Eğlence
- paragraph: Müzik ve eğlence ile geceye devam.
- text: ❀
- paragraph: Date & Location
- heading "Wedding Details" [level=2]
- text: Date
- strong: 07 Ağustos 2027
- text: Time
- strong: 19:00
- text: Venue
- strong: Fenerbahçe Orduevi Plaj Düğün Salonu
- text: Address
- strong: Kadıköy / İstanbul
- iframe
- button "Go to Map 📍"
- button "Add to Calendar 📅"
- text: ❀
- paragraph: Photos
- heading "Outdoor Wedding Atmosphere" [level=2]
- img "Galeri 1"
- img "Galeri 2"
- img "Galeri 3"
- img "Galeri 4"
- text: ❀
- paragraph: AR Photobooth
- heading "Share Your Memories" [level=2]
- paragraph: Take a photo right now! We will automatically add our wedding frame and put it in the shared album.
- button "📸 Open Camera"
- text: ❀ ✨
- heading "Find Your Photos" [level=2]
- paragraph: Take a quick selfie, and our AI will instantly find all professional photos you appear in from the wedding night!
- button "📷 Take a Selfie to Search"
- text: ❀
- paragraph: RSVP
- heading "RSVP Form" [level=2]
- paragraph: Please let us know if you can attend to help us plan.
- textbox "Full Name"
- button "Attending"
- button "Not Attending"
- textbox "Please Specify The Number Of People"
- text: 0/160
- button "Send RSVP 🕊️"
- link "RSVP via WhatsApp 💬":
  - /url: https://wa.me/905394933614?text=undefined
- text: ❀
- paragraph: Guestbook
- heading "Your Best Wishes" [level=2]
- textbox "Full Name"
- textbox "Your Message"
- text: 0/220 Or leave a voice message! 🎤
- button "🎙️ Record"
- button "Send Message 💌"
- paragraph: No wishes yet.
- text: ❀
- paragraph: Gift & Registry
- heading "Gift & Registry" [level=2]
- paragraph: "For those who wish to send a gift or contribute to our new life together:"
- strong: Haluk Can Sarıöz
- text: QNB Bankası
- code: TR53 0011 1000 0000 0145 4005 17
- button "Copy IBAN 📋"
- text: ❀
- paragraph: Share
- heading "Share the Invitation" [level=2]
- paragraph: You can share our invitation with your loved ones.
- img "QR Code"
- text: Share quickly via QR code.
- button "Share Invitation":
  - img
  - text: Share Invitation
- link "WhatsApp":
  - /url: https://wa.me/?text=undefined
  - img
  - text: WhatsApp
- button "Copy Link":
  - img
  - text: Copy Link
- text: ❀
- contentinfo:
  - paragraph: Handenur & Haluk Can
  - text: 07 Ağustos 2027 Having you with us on this special day is the greatest gift. Made with love
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Hediye ve Ödeme İşlemleri Uçtan Uca (E2E)', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Hız için medya dosyalarını engelle
  7  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  8  |     await page.goto('/');
  9  | 
  10 |     const envelopeSeal = page.locator('.envelope-seal');
  11 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  12 |     await envelopeSeal.click({ force: true });
  13 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  14 |   });
  15 | 
  16 |   test('Misafir IBAN panosunu kopyalayabilmeli', async ({ page, context }) => {
  17 |     await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  18 | 
  19 |     const giftSection = page.locator('.gift-card');
  20 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  21 |     await giftSection.scrollIntoViewIfNeeded();
  22 | 
  23 |     const copyIbanButton = page.locator('button', { hasText: /IBAN'ı Kopyala/i });
> 24 |     await expect(copyIbanButton).toBeVisible();
     |                                  ^ Error: expect(locator).toBeVisible() failed
  25 | 
  26 |     // Panonun başlangıçta boş veya farklı olduğunu varsayıyoruz
  27 |     await copyIbanButton.click({ force: true });
  28 | 
  29 |     // Buton metninin değiştiğini onayla
  30 |     await expect(copyIbanButton).toContainText(/Kopyalandı/i);
  31 | 
  32 |     // Panoya gerçekten bir şey kopyalanıp kopyalanmadığını kontrol et
  33 |     const clipboardText = await page.evaluate("navigator.clipboard.readText()");
  34 |     expect(clipboardText).toContain("TR"); // IBAN numaraları TR ile başlar
  35 |   });
  36 | 
  37 |   test('Kredi kartı modülü açıksa Supabase ödeme Edge Functionuna istek atılmalı', async ({ page }) => {
  38 |     // Tarayıcıdaki prompt fonksiyonunu mockluyoruz (Kullanıcı 500 TL girdiği varsayılır)
  39 |     await page.addInitScript(() => {
  40 |       window.prompt = () => "500"; 
  41 |     });
  42 | 
  43 |     // Supabase Edge Function isteğini mockla (Gerçek Stripe API'ye gitmesini engelle)
  44 |     await page.route('**/functions/v1/create-payment', async route => {
  45 |       await route.fulfill({
  46 |         status: 200,
  47 |         contentType: 'application/json',
  48 |         body: JSON.stringify({ success: true, paymentUrl: 'https://checkout.stripe.com/test-url' })
  49 |       });
  50 |     });
  51 | 
  52 |     // Hediye bölümünü bul
  53 |     const giftSection = page.locator('.gift-card');
  54 |     await giftSection.scrollIntoViewIfNeeded();
  55 | 
  56 |     // Kredi kartı butonu görünürse (Ayarlarda açıksa test edilecek)
  57 |     const creditCardButton = page.locator('button', { hasText: /Kredi Kartı ile Gönder/i });
  58 |     
  59 |     // Eğer buton varsa (ayar açıksa), tıkla ve fonksiyonun çalışmasını bekle
  60 |     if (await creditCardButton.isVisible()) {
  61 |       await creditCardButton.click();
  62 |       // Yönlendirme mantığının devreye girmesi beklenir, ancak Edge function mocklandığı için network sekmesinde 200 dönecektir.
  63 |     }
  64 |   });
  65 | });
```