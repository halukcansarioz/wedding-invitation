# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wishes-submission-e2e.spec.js >> Anı Defteri (Wishes) Gönderim Akışı >> Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı
- Location: tests\wishes-submission-e2e.spec.js:71:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForRequest: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - link "Admin Panel" [ref=e6] [cursor=pointer]:
    - /url: /admin
  - generic [ref=e9]:
    - button "TR" [ref=e10] [cursor=pointer]
    - button "Play" [ref=e12] [cursor=pointer]
    - button [ref=e18] [cursor=pointer]
    - button [ref=e21] [cursor=pointer]
  - generic [ref=e24]:
    - generic [ref=e26]:
      - paragraph [ref=e27]: We Are Getting Married
      - heading "Handenur & Haluk Can" [level=1] [ref=e28]:
        - generic [ref=e29]: Handenur
        - emphasis [ref=e30]: "&"
        - generic [ref=e31]: Haluk Can
      - paragraph [ref=e32]: 07 Ağustos 2027
      - paragraph [ref=e33]: Time 19:00
      - generic [ref=e34] [cursor=pointer]: SCROLL
    - generic [ref=e38]:
      - paragraph [ref=e39]: Countdown
      - heading "Time Left Until Our Wedding" [level=2] [ref=e40]
      - generic [ref=e41]:
        - generic [ref=e42]:
          - strong [ref=e43]: "275"
          - generic [ref=e44]: Days
        - generic [ref=e45]:
          - strong [ref=e46]: "2"
          - generic [ref=e47]: Hours
        - generic [ref=e48]:
          - strong [ref=e49]: "37"
          - generic [ref=e50]: Mins
        - generic [ref=e51]:
          - strong [ref=e52]: "16"
          - generic [ref=e53]: Secs
    - generic [ref=e54]:
      - paragraph [ref=e55]: Invitation
      - heading "Will You Share Our Happiness?" [level=2] [ref=e56]
      - paragraph [ref=e57]: Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.
      - text: ❀
    - generic [ref=e58]:
      - paragraph [ref=e59]: Our Families
      - heading "With the Joy of Our Families" [level=2] [ref=e60]
      - paragraph [ref=e61]: Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]: Gelin Ailesi
          - strong [ref=e65]: Çeltik Ailesi
        - generic [ref=e66]:
          - generic [ref=e67]: Damat Ailesi
          - strong [ref=e68]: Sarıöz Ailesi
      - text: ❀
    - generic [ref=e69]:
      - paragraph [ref=e70]: Ceremony & Celebration
      - heading "Details of the Day" [level=2] [ref=e71]
      - generic [ref=e72]: Saturday, August 22, 2026
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]: Nikah Töreni
          - strong [ref=e76]: 19:00
          - paragraph [ref=e77]: Mutluluğumuza ilk imzayı atacağımız özel an.
          - emphasis [ref=e78]: Fenerbahçe Orduevi Plaj Düğün Salonu
        - generic [ref=e79]:
          - generic [ref=e80]: Düğün & Eğlence
          - strong [ref=e81]: 20:00
          - paragraph [ref=e82]: Yemek, kutlama ve eğlence ile devam edecek güzel akşam.
          - emphasis [ref=e83]: Fenerbahçe Orduevi Plaj Düğün Salonu
      - text: ❀
    - generic [ref=e84]:
      - paragraph [ref=e85]: Wedding Schedule
      - heading "07 Ağustos 2027" [level=2] [ref=e86]
      - generic [ref=e87]:
        - generic [ref=e88]:
          - strong [ref=e89]: 18:30
          - generic [ref=e90]:
            - generic [ref=e91]: Misafir Karşılama
            - paragraph [ref=e92]: Davetlilerimizin alana gelişi ve karşılama.
        - generic [ref=e93]:
          - strong [ref=e94]: 19:00
          - generic [ref=e95]:
            - generic [ref=e96]: Nikah Töreni
            - paragraph [ref=e97]: Nikah merasimimiz başlar.
        - generic [ref=e98]:
          - strong [ref=e99]: 20:00
          - generic [ref=e100]:
            - generic [ref=e101]: Yemek ve Kutlama
            - paragraph [ref=e102]: Yemek ikramı ve kutlama bölümü.
        - generic [ref=e103]:
          - strong [ref=e104]: 21:00
          - generic [ref=e105]:
            - generic [ref=e106]: Eğlence
            - paragraph [ref=e107]: Müzik ve eğlence ile geceye devam.
      - text: ❀
    - generic [ref=e108]:
      - paragraph [ref=e109]: Date & Location
      - heading "Wedding Details" [level=2] [ref=e110]
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic [ref=e113]: Date
          - strong [ref=e114]: 07 Ağustos 2027
        - generic [ref=e115]:
          - generic [ref=e116]: Time
          - strong [ref=e117]: 19:00
        - generic [ref=e118]:
          - generic [ref=e119]: Venue
          - strong [ref=e120]: Fenerbahçe Orduevi Plaj Düğün Salonu
        - generic [ref=e121]:
          - generic [ref=e122]: Address
          - strong [ref=e123]: Kadıköy / İstanbul
      - iframe [ref=e125]:
        - link "Open in Maps (opens in new tab)" [ref=f1e4] [cursor=pointer]:
          - /url: about:invalid#zClosurez
          - text: Open in Maps
      - generic [ref=e126]:
        - button "Go to Map 📍" [ref=e127] [cursor=pointer]
        - button "Add to Calendar 📅" [ref=e128] [cursor=pointer]
      - text: ❀
    - generic [ref=e129]:
      - paragraph [ref=e130]: Photos
      - heading "Outdoor Wedding Atmosphere" [level=2] [ref=e131]
      - generic [ref=e132]:
        - generic [ref=e133]:
          - img "Galeri 1"
        - generic [ref=e134]:
          - img "Galeri 2"
        - generic [ref=e135]:
          - img "Galeri 3"
        - generic [ref=e136]:
          - img "Galeri 4"
      - text: ❀
    - generic [ref=e137]:
      - paragraph [ref=e138]: AR Photobooth
      - heading "Share Your Memories" [level=2] [ref=e139]
      - paragraph [ref=e140]: Take a photo right now! We will automatically add our wedding frame and put it in the shared album.
      - button "📸 Open Camera" [ref=e142] [cursor=pointer]
      - text: ❀
    - generic [ref=e143]:
      - generic [ref=e144]:
        - generic [ref=e145]: ✨
        - heading "Find Your Photos" [level=2] [ref=e146]
        - paragraph [ref=e147]: Take a quick selfie, and our AI will instantly find all professional photos you appear in from the wedding night!
        - button "📷 Take a Selfie to Search" [ref=e148] [cursor=pointer]
      - text: ❀
    - generic [ref=e149]:
      - paragraph [ref=e150]: RSVP
      - heading "RSVP Form" [level=2] [ref=e151]
      - paragraph [ref=e152]: Please let us know if you can attend to help us plan.
      - generic [ref=e153]:
        - textbox "Full Name" [ref=e155]
        - radiogroup [ref=e156]:
          - radio "Attending" [checked] [ref=e157] [cursor=pointer]
          - radio "Not Attending" [ref=e158] [cursor=pointer]
        - generic [ref=e159]:
          - textbox "Please Specify The Number Of People" [ref=e160]
          - generic: 0/160
        - button "Send RSVP 🕊️" [ref=e161] [cursor=pointer]
      - link "RSVP via WhatsApp 💬" [ref=e163] [cursor=pointer]:
        - /url: https://wa.me/905394933614?text=undefined
      - text: ❀
    - generic [ref=e164]:
      - paragraph [ref=e165]: Guestbook
      - heading "Your Best Wishes" [level=2] [ref=e166]
      - generic [ref=e167]:
        - textbox "Full Name" [ref=e169]: E2E Test Kullanıcısı
        - generic [ref=e170]:
          - textbox "Your Message" [ref=e171]: Playwright üzerinden gönderilen otomatik test mesajı.
          - generic: 53/220
        - generic [ref=e172]:
          - generic [ref=e173]: Or leave a voice message! 🎤
          - button "🎙️ Record" [ref=e175] [cursor=pointer]
        - button "Send Message 💌" [ref=e176] [cursor=pointer]
      - paragraph [ref=e178]: No wishes yet.
      - text: ❀
    - generic [ref=e179]:
      - paragraph [ref=e180]: Gift & Registry
      - heading "Gift & Registry" [level=2] [ref=e181]
      - paragraph [ref=e182]: "For those who wish to send a gift or contribute to our new life together:"
      - generic [ref=e183]:
        - strong [ref=e184]: Haluk Can Sarıöz
        - generic [ref=e185]: QNB Bankası
        - code [ref=e186]: TR53 0011 1000 0000 0145 4005 17
      - button "Copy IBAN 📋" [ref=e188] [cursor=pointer]
      - text: ❀
    - generic [ref=e189]:
      - paragraph [ref=e190]: Share
      - heading "Share the Invitation" [level=2] [ref=e191]
      - paragraph [ref=e192]: You can share our invitation with your loved ones.
      - generic [ref=e193]:
        - img "QR Code"
        - text: Share quickly via QR code.
      - generic [ref=e194]:
        - button "Share Invitation" [ref=e195] [cursor=pointer]
        - generic [ref=e203]:
          - link "WhatsApp" [ref=e204] [cursor=pointer]:
            - /url: https://wa.me/?text=undefined
          - button "Copy Link" [ref=e208] [cursor=pointer]
      - text: ❀
    - contentinfo [ref=e213]:
      - paragraph [ref=e214]: Handenur & Haluk Can
      - generic [ref=e215]: 07 Ağustos 2027
      - generic [ref=e216]: Having you with us on this special day is the greatest gift.
      - generic [ref=e217]: Made with love
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const mockMedia = async (page) => {
  4  |   await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
  5  |     route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  6  |   });
  7  |   await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
  8  | };
  9  | 
  10 | test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {
  11 |   
  12 |   test.beforeEach(async ({ page }) => {
  13 |     await mockMedia(page);
  14 |     
  15 |     // Cloudflare Turnstile script ve callback mekanizmasını eksiksiz mock'luyoruz
  16 |     await page.route('**/turnstile/v0/api.js*', route => {
  17 |       const url = route.request().url();
  18 |       const match = url.match(/onload=([^&]+)/);
  19 |       let callbackExecution = '';
  20 |       if (match && match[1]) {
  21 |         callbackExecution = `window['${match[1]}']();`;
  22 |       }
  23 |       route.fulfill({
  24 |         status: 200,
  25 |         contentType: 'application/javascript',
  26 |         body: `
  27 |           window.turnstile = {
  28 |             render: function(container, options) {
  29 |               if (options && options.callback) {
  30 |                 setTimeout(() => options.callback('mock-turnstile-token-success'), 50);
  31 |               }
  32 |               return 'widget-id';
  33 |             },
  34 |             reset: function() {},
  35 |             remove: function() {}
  36 |           };
  37 |           ${callbackExecution}
  38 |         `
  39 |       });
  40 |     });
  41 | 
  42 |     // Supabase Edge Function (submit-form) mocklaması
  43 |     await page.route('**/*submit-form*', async route => {
  44 |       if (route.request().method() === 'OPTIONS') {
  45 |         await route.fulfill({
  46 |           status: 200,
  47 |           headers: {
  48 |             'Access-Control-Allow-Origin': '*',
  49 |             'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  50 |             'Access-Control-Allow-Headers': '*'
  51 |           }
  52 |         });
  53 |         return;
  54 |       }
  55 |       
  56 |       await route.fulfill({
  57 |         status: 200,
  58 |         contentType: 'application/json',
  59 |         headers: { 'Access-Control-Allow-Origin': '*' },
  60 |         body: JSON.stringify({ success: true, data: { id: 'mock-wish-1' } })
  61 |       });
  62 |     });
  63 | 
  64 |     await page.goto('/');
  65 |     const envelopeSeal = page.locator('.envelope-seal');
  66 |     await envelopeSeal.waitFor({ state: 'visible', timeout: 15000 });
  67 |     await envelopeSeal.click();
  68 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  69 |   });
  70 | 
  71 |   test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı', async ({ page }) => {
  72 |     const wishesSection = page.locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first();
  73 |     await wishesSection.scrollIntoViewIfNeeded();
  74 | 
  75 |     await wishesSection.locator('input[name="name"]').fill('E2E Test Kullanıcısı');
  76 |     await wishesSection.locator('textarea[name="message"]').fill('Playwright üzerinden gönderilen otomatik test mesajı.');
  77 | 
  78 |     const submitBtn = wishesSection.locator('button[type="submit"]');
  79 |     
  80 |     // Turnstile token otomatik üretileceği için buton anında aktifleşecektir
  81 |     await expect(submitBtn).toBeEnabled({ timeout: 15000 });
  82 | 
> 83 |     const requestPromise = page.waitForRequest(req => req.url().includes('submit-form') && req.method() === 'POST', { timeout: 15000 });
     |                                 ^ Error: page.waitForRequest: Test timeout of 30000ms exceeded.
  84 |     await submitBtn.click();
  85 |     const request = await requestPromise;
  86 | 
  87 |     const postData = JSON.parse(request.postData());
  88 |     expect(postData.type).toBe('wish');
  89 |     expect(postData.data.name).toBe('E2E Test Kullanıcısı');
  90 |     expect(postData.data.message).toBe('Playwright üzerinden gönderilen otomatik test mesajı.');
  91 | 
  92 |     await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
  93 |     await expect(wishesSection.locator('textarea[name="message"]')).toHaveValue('', { timeout: 10000 });
  94 |   });
  95 | });
```