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
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('textarea[name="message"]')

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
      - button [ref=e22] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e27]:
        - paragraph [ref=e28]: We Are Getting Married
        - heading "Handenur & Haluk Can" [level=1] [ref=e29]:
          - generic [ref=e30]: Handenur
          - emphasis [ref=e31]: "&"
          - generic [ref=e32]: Haluk Can
        - paragraph [ref=e33]: 07 Ağustos 2027
        - paragraph [ref=e34]: Time 19:00
        - generic [ref=e35] [cursor=pointer]: SCROLL
      - generic [ref=e39]:
        - paragraph [ref=e40]: Countdown
        - heading "Time Left Until Our Wedding" [level=2] [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e43]:
            - strong [ref=e44]: "280"
            - generic [ref=e45]: Days
          - generic [ref=e46]:
            - strong [ref=e47]: "23"
            - generic [ref=e48]: Hours
          - generic [ref=e49]:
            - strong [ref=e50]: "18"
            - generic [ref=e51]: Mins
          - generic [ref=e52]:
            - strong [ref=e53]: "30"
            - generic [ref=e54]: Secs
      - generic [ref=e55]:
        - paragraph [ref=e56]: Invitation
        - heading "Will You Share Our Happiness?" [level=2] [ref=e57]
        - paragraph [ref=e58]: Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.
        - text: ❀
      - generic [ref=e59]:
        - paragraph [ref=e60]: Our Families
        - heading "With the Joy of Our Families" [level=2] [ref=e61]
        - paragraph [ref=e62]: Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.
        - generic [ref=e63]:
          - generic [ref=e64]:
            - generic [ref=e65]: Gelin Ailesi
            - strong [ref=e66]: Çeltik Ailesi
          - generic [ref=e67]:
            - generic [ref=e68]: Damat Ailesi
            - strong [ref=e69]: Sarıöz Ailesi
        - text: ❀
      - generic [ref=e70]:
        - paragraph [ref=e71]: Ceremony & Celebration
        - heading "Details of the Day" [level=2] [ref=e72]
        - generic [ref=e73]: Saturday, August 22, 2026
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]: Nikah Töreni
            - strong [ref=e77]: 19:00
            - paragraph [ref=e78]: Mutluluğumuza ilk imzayı atacağımız özel an.
            - emphasis [ref=e79]: Fenerbahçe Orduevi Plaj Düğün Salonu
          - generic [ref=e80]:
            - generic [ref=e81]: Düğün & Eğlence
            - strong [ref=e82]: 20:00
            - paragraph [ref=e83]: Yemek, kutlama ve eğlence ile devam edecek güzel akşam.
            - emphasis [ref=e84]: Fenerbahçe Orduevi Plaj Düğün Salonu
        - text: ❀
      - generic [ref=e85]:
        - paragraph [ref=e86]: Wedding Schedule
        - heading "07 Ağustos 2027" [level=2] [ref=e87]
        - generic [ref=e88]:
          - generic [ref=e89]:
            - strong [ref=e90]: 18:30
            - generic [ref=e91]:
              - generic [ref=e92]: Misafir Karşılama
              - paragraph [ref=e93]: Davetlilerimizin alana gelişi ve karşılama.
          - generic [ref=e94]:
            - strong [ref=e95]: 19:00
            - generic [ref=e96]:
              - generic [ref=e97]: Nikah Töreni
              - paragraph [ref=e98]: Nikah merasimimiz başlar.
          - generic [ref=e99]:
            - strong [ref=e100]: 20:00
            - generic [ref=e101]:
              - generic [ref=e102]: Yemek ve Kutlama
              - paragraph [ref=e103]: Yemek ikramı ve kutlama bölümü.
          - generic [ref=e104]:
            - strong [ref=e105]: 21:00
            - generic [ref=e106]:
              - generic [ref=e107]: Eğlence
              - paragraph [ref=e108]: Müzik ve eğlence ile geceye devam.
        - text: ❀
      - generic [ref=e109]:
        - paragraph [ref=e110]: Date & Location
        - heading "Wedding Details" [level=2] [ref=e111]
        - generic [ref=e112]:
          - generic [ref=e113]:
            - generic [ref=e114]: Date
            - strong [ref=e115]: 07 Ağustos 2027
          - generic [ref=e116]:
            - generic [ref=e117]: Time
            - strong [ref=e118]: 19:00
          - generic [ref=e119]:
            - generic [ref=e120]: Venue
            - strong [ref=e121]: Fenerbahçe Orduevi Plaj Düğün Salonu
          - generic [ref=e122]:
            - generic [ref=e123]: Address
            - strong [ref=e124]: Kadıköy / İstanbul
        - iframe [ref=e126]:
          - link "Open in Maps (opens in new tab)" [ref=f1e4] [cursor=pointer]:
            - /url: about:invalid#zClosurez
            - text: Open in Maps
        - generic [ref=e127]:
          - button "Go to Map 📍" [ref=e128] [cursor=pointer]
          - button "Add to Calendar 📅" [ref=e129] [cursor=pointer]
        - text: ❀
      - generic [ref=e130]:
        - paragraph [ref=e131]: Photos
        - heading "Outdoor Wedding Atmosphere" [level=2] [ref=e132]
        - generic [ref=e133]:
          - generic [ref=e134]:
            - img "Galeri 1"
          - generic [ref=e136]:
            - img "Galeri 2"
          - generic [ref=e138]:
            - img "Galeri 3"
          - generic [ref=e140]:
            - img "Galeri 4"
        - text: ❀
      - generic [ref=e142]:
        - paragraph [ref=e143]: AR Photobooth
        - heading "Share Your Memories" [level=2] [ref=e144]
        - paragraph [ref=e145]: Take a photo right now! We will automatically add our wedding frame and put it in the shared album.
        - button "📸 Open Camera" [ref=e147] [cursor=pointer]
        - text: ❀
      - generic [ref=e148]:
        - generic [ref=e149]:
          - generic [ref=e150]: ✨
          - heading "Find Your Photos" [level=2] [ref=e151]
          - paragraph [ref=e152]: Take a quick selfie, and our AI will instantly find all professional photos you appear in from the wedding night!
          - button "📷 Take a Selfie to Search" [ref=e153] [cursor=pointer]
        - text: ❀
      - generic [ref=e154]:
        - paragraph [ref=e155]: RSVP
        - heading "RSVP Form" [level=2] [ref=e156]
        - paragraph [ref=e157]: Please let us know if you can attend to help us plan.
        - generic [ref=e158]:
          - textbox "Full Name" [ref=e160]
          - generic [ref=e161]:
            - button "Attending" [ref=e162] [cursor=pointer]
            - button "Not Attending" [ref=e163] [cursor=pointer]
          - generic [ref=e164]:
            - textbox "Please Specify The Number Of People" [ref=e165]
            - generic: 0/160
          - button "Send RSVP 🕊️" [disabled] [ref=e170] [cursor=pointer]
        - link "RSVP via WhatsApp 💬" [ref=e172] [cursor=pointer]:
          - /url: https://wa.me/905394933614?text=undefined
        - text: ❀
      - generic [ref=e173]:
        - paragraph [ref=e174]: Guestbook
        - heading "Your Best Wishes" [level=2] [ref=e175]
        - generic [ref=e176]:
          - textbox "Full Name" [ref=e178]
          - generic [ref=e179]:
            - textbox "Your Message" [ref=e180]
            - generic: 0/220
          - generic [ref=e181]:
            - generic [ref=e182]: Or leave a voice message! 🎤
            - button "🎙️ Record" [ref=e184] [cursor=pointer]
          - button "Send Message 💌" [disabled] [ref=e189] [cursor=pointer]
        - paragraph [ref=e191]: No wishes yet.
        - text: ❀
      - generic [ref=e192]:
        - paragraph [ref=e193]: Gift & Registry
        - heading "Gift & Registry" [level=2] [ref=e194]
        - paragraph [ref=e195]: "For those who wish to send a gift or contribute to our new life together:"
        - generic [ref=e196]:
          - strong [ref=e197]: Haluk Can Sarıöz
          - generic [ref=e198]: QNB Bankası
          - code [ref=e199]: TR53 0011 1000 0000 0145 4005 17
        - button "Copy IBAN 📋" [ref=e201] [cursor=pointer]
        - text: ❀
      - generic [ref=e202]:
        - paragraph [ref=e203]: Share
        - heading "Share the Invitation" [level=2] [ref=e204]
        - paragraph [ref=e205]: You can share our invitation with your loved ones.
        - generic [ref=e206]:
          - img "QR Code"
          - text: Share quickly via QR code.
        - generic [ref=e207]:
          - button "Share Invitation" [ref=e208] [cursor=pointer]
          - generic [ref=e216]:
            - link "WhatsApp" [ref=e217] [cursor=pointer]:
              - /url: https://wa.me/?text=undefined
            - button "Copy Link" [ref=e221] [cursor=pointer]
        - text: ❀
      - contentinfo [ref=e226]:
        - paragraph [ref=e227]: Handenur & Haluk Can
        - generic [ref=e228]: 07 Ağustos 2027
        - generic [ref=e229]: Having you with us on this special day is the greatest gift.
        - generic [ref=e230]: Made with love
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
  18 |     await wishesSection.waitFor({ state: 'attached' });
  19 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  20 |     await wishesSection.scrollIntoViewIfNeeded();
  21 | 
  22 |     await page.fill('input[name="name"]', 'Playwright Bot');
> 23 |     await page.fill('textarea[name="message"]', 'Harika bir düğün test mesajı!');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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