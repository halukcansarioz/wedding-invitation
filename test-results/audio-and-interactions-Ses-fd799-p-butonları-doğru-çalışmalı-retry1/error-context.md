# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-and-interactions.spec.js >> Sesli Mesaj ve Etkileşim Testleri >> Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı
- Location: tests\audio-and-interactions.spec.js:25:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.wish-form').locator('button').filter({ hasText: /Durdur|Stop/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.wish-form').locator('button').filter({ hasText: /Durdur|Stop/i })

```

```yaml
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
- strong: "4"
- text: Hours
- strong: "6"
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
  3  | const mockMedia = async (page) => {
  4  |   await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
  5  |     route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  6  |   });
  7  |   await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
  8  |     route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  9  |   });
  10 | };
  11 | 
  12 | test.describe('Sesli Mesaj ve Etkileşim Testleri', () => {
  13 | 
  14 |   test.beforeEach(async ({ page, context }) => {
  15 |     await context.grantPermissions(['microphone']);
  16 |     await mockMedia(page);
  17 |     await page.goto('/');
  18 | 
  19 |     const envelopeSeal = page.locator('.envelope-seal');
  20 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  21 |     await envelopeSeal.click();
  22 |     await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  23 |   });
  24 | 
  25 |   test('Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı', async ({ page }) => {
  26 |     const wishesSection = page.locator('.wish-form');
  27 |     await wishesSection.scrollIntoViewIfNeeded();
  28 |     await page.waitForTimeout(800);
  29 |     
  30 |     const recordButton = wishesSection.locator('button', { hasText: /Kaydet|Record/i }).first();
  31 |     await expect(recordButton).toBeVisible({ timeout: 10000 });
  32 | 
  33 |     await recordButton.click();
  34 | 
  35 |     const stopButton = wishesSection.locator('button', { hasText: /Durdur|Stop/i });
> 36 |     await expect(stopButton).toBeVisible({ timeout: 10000 });
     |                              ^ Error: expect(locator).toBeVisible() failed
  37 | 
  38 |     await stopButton.click();
  39 | 
  40 |     const deleteAudioButton = wishesSection.locator('button', { hasText: '🗑️' });
  41 |     await expect(deleteAudioButton).toBeVisible();
  42 |   });
  43 | });
```