# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rsvp.spec.js >> Düğün Davetiyesi Temel Süreçleri >> Misafir LCV formunu başarıyla doldurabilmeli
- Location: tests\rsvp.spec.js:6:3

# Error details

```
Error: locator.click: Error: strict mode violation: locator('button.form-button[type="submit"]') resolved to 2 elements:
    1) <button disabled type="submit" class="main-button form-button">Send RSVP 🕊️</button> aka getByRole('button', { name: 'Send RSVP 🕊️' })
    2) <button disabled type="submit" class="main-button form-button">Send Message 💌</button> aka getByRole('button', { name: 'Send Message 💌' })

Call log:
  - waiting for locator('button.form-button[type="submit"]')

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
  - main [ref=e24]:
    - generic [ref=e25]:
      - generic [ref=e28]:
        - paragraph [ref=e29]: We Are Getting Married
        - heading "Handenur & Haluk Can" [level=1] [ref=e30]:
          - generic [ref=e31]: Handenur
          - emphasis [ref=e32]: "&"
          - generic [ref=e33]: Haluk Can
        - paragraph [ref=e34]: 07 Ağustos 2027
        - paragraph [ref=e35]: Time 19:00
        - generic [ref=e36] [cursor=pointer]: SCROLL
      - generic [ref=e41]:
        - paragraph [ref=e42]: Countdown
        - heading "Time Left Until Our Wedding" [level=2] [ref=e43]
        - generic [ref=e44]:
          - generic [ref=e45]:
            - strong [ref=e46]: "286"
            - generic [ref=e47]: Days
          - generic [ref=e48]:
            - strong [ref=e49]: "4"
            - generic [ref=e50]: Hours
          - generic [ref=e51]:
            - strong [ref=e52]: "52"
            - generic [ref=e53]: Mins
          - generic [ref=e54]:
            - strong [ref=e55]: "18"
            - generic [ref=e56]: Secs
      - generic [ref=e58]:
        - paragraph [ref=e59]: Invitation
        - heading "Will You Share Our Happiness?" [level=2] [ref=e60]
        - paragraph [ref=e61]: Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.
        - text: ❀
      - generic [ref=e63]:
        - paragraph [ref=e64]: Our Families
        - heading "With the Joy of Our Families" [level=2] [ref=e65]
        - paragraph [ref=e66]: Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]: Gelin Ailesi
            - strong [ref=e70]: Çeltik Ailesi
          - generic [ref=e71]:
            - generic [ref=e72]: Damat Ailesi
            - strong [ref=e73]: Sarıöz Ailesi
        - text: ❀
      - generic [ref=e75]:
        - paragraph [ref=e76]: invitation.storyLabel
        - heading "invitation.storyTitle" [level=2] [ref=e77]
        - generic [ref=e78]:
          - generic [ref=e82]:
            - generic [ref=e83]: İlkbahar 2024
            - heading "İlk Karşılaşma" [level=3] [ref=e84]
            - paragraph [ref=e85]: Hikayemizin başladığı o güzel tesadüf ve sihirli an...
          - generic [ref=e88]:
            - generic [ref=e89]: 22 Ağustos 2026
            - heading "Büyük Teklif" [level=3] [ref=e90]
            - paragraph [ref=e91]: Fenerbahçe Parkı'nın yeşillikleri arasında başlayan günümüz, Boğaz vapuru keyfi ve köprü manzaralı harika bir akşam yemeği eşliğinde 'Evet!' ile taçlandı.
        - text: ❀
      - generic [ref=e93]:
        - paragraph [ref=e94]: Ceremony & Celebration
        - heading "Details of the Day" [level=2] [ref=e95]
        - generic [ref=e96]: Saturday, August 22, 2026
        - generic [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]: Nikah Töreni
            - strong [ref=e100]: 19:00
            - paragraph [ref=e101]: Mutluluğumuza ilk imzayı atacağımız özel an.
            - emphasis [ref=e102]: Fenerbahçe Orduevi Plaj Düğün Salonu
          - generic [ref=e103]:
            - generic [ref=e104]: Düğün & Eğlence
            - strong [ref=e105]: 20:00
            - paragraph [ref=e106]: Yemek, kutlama ve eğlence ile devam edecek güzel akşam.
            - emphasis [ref=e107]: Fenerbahçe Orduevi Plaj Düğün Salonu
        - text: ❀
      - generic [ref=e109]:
        - paragraph [ref=e110]: Wedding Schedule
        - heading "07 Ağustos 2027" [level=2] [ref=e111]
        - generic [ref=e112]:
          - generic [ref=e113]:
            - strong [ref=e114]: 18:30
            - generic [ref=e115]:
              - generic [ref=e116]: Misafir Karşılama
              - paragraph [ref=e117]: Davetlilerimizin alana gelişi ve karşılama.
          - generic [ref=e118]:
            - strong [ref=e119]: 19:00
            - generic [ref=e120]:
              - generic [ref=e121]: Nikah Töreni
              - paragraph [ref=e122]: Nikah merasimimiz başlar.
          - generic [ref=e123]:
            - strong [ref=e124]: 20:00
            - generic [ref=e125]:
              - generic [ref=e126]: Yemek ve Kutlama
              - paragraph [ref=e127]: Yemek ikramı ve kutlama bölümü.
          - generic [ref=e128]:
            - strong [ref=e129]: 21:00
            - generic [ref=e130]:
              - generic [ref=e131]: Eğlence
              - paragraph [ref=e132]: Müzik ve eğlence ile geceye devam.
        - text: ❀
      - generic [ref=e134]:
        - paragraph [ref=e135]: Date & Location
        - heading "Wedding Details" [level=2] [ref=e136]
        - generic [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]: Date
            - strong [ref=e140]: 07 Ağustos 2027
          - generic [ref=e141]:
            - generic [ref=e142]: Time
            - strong [ref=e143]: 19:00
          - generic [ref=e144]:
            - generic [ref=e145]: Venue
            - strong [ref=e146]: Fenerbahçe Orduevi Plaj Düğün Salonu
          - generic [ref=e147]:
            - generic [ref=e148]: Address
            - strong [ref=e149]: Kadıköy / İstanbul
        - iframe [ref=e151]:
          - link "Open in Maps (opens in new tab)" [ref=f1e4] [cursor=pointer]:
            - /url: about:invalid#zClosurez
            - text: Open in Maps
        - generic [ref=e152]:
          - button "Go to Map 📍" [ref=e153] [cursor=pointer]
          - button "Add to Calendar 📅" [ref=e154] [cursor=pointer]
        - text: ❀
      - generic [ref=e156]:
        - paragraph [ref=e157]: Photos
        - heading "Outdoor Wedding Atmosphere" [level=2] [ref=e158]
        - generic [ref=e159]:
          - generic [ref=e160]:
            - img "Galeri 1"
          - generic [ref=e161]:
            - img "Galeri 2"
          - generic [ref=e162]:
            - img "Galeri 3"
          - generic [ref=e163]:
            - img "Galeri 4"
        - text: ❀
      - generic [ref=e165]:
        - paragraph [ref=e166]: RSVP
        - heading "RSVP Form" [level=2] [ref=e167]
        - paragraph [ref=e168]: Please let us know if you can attend to help us plan.
        - generic [ref=e169]:
          - textbox "Full Name" [ref=e171]: Otomatik Test Misafiri
          - generic [ref=e172]:
            - button "Attending" [ref=e173] [cursor=pointer]
            - button "Not Attending" [ref=e174] [cursor=pointer]
          - generic [ref=e175]:
            - textbox "Please Specify The Number Of People" [active] [ref=e176]: Bu Playwright tarafından atılmış otomatik bir test kaydıdır.
            - generic: 60/160
          - button "Send RSVP 🕊️" [disabled] [ref=e181] [cursor=pointer]
        - link "RSVP via WhatsApp 💬" [ref=e183] [cursor=pointer]:
          - /url: https://wa.me/905394933614?text=Merhaba%2C%20Handenur%20%26%20Haluk%20Can%20d%C3%BC%C4%9F%C3%BCn%20davetiyenizi%20ald%C4%B1m.%20Kat%C4%B1l%C4%B1m%20durumumu%20bildirmek%20istiyorum.
        - text: ❀
      - generic [ref=e185]:
        - paragraph [ref=e186]: Guests
        - heading "Guest List" [level=2] [ref=e187]
        - generic [ref=e188]:
          - generic [ref=e189]:
            - strong [ref=e190]: "0"
            - generic [ref=e191]: Total Responses
          - generic [ref=e192]:
            - strong [ref=e193]: "0"
            - generic [ref=e194]: Attending
          - generic [ref=e195]:
            - strong [ref=e196]: "0"
            - generic [ref=e197]: Not Attending
        - paragraph [ref=e199]:
          - generic [ref=e200]: 🔒
          - generic [ref=e201]: Guest list and RSVP details are kept private and can only be viewed by the bride and groom.
        - text: ❀
      - generic [ref=e203]:
        - paragraph [ref=e204]: Guestbook
        - heading "Your Best Wishes" [level=2] [ref=e205]
        - generic [ref=e206]:
          - textbox "Full Name" [ref=e208]
          - generic [ref=e209]:
            - textbox "Your Message" [ref=e210]
            - generic: 0/220
          - button "Send Message 💌" [disabled] [ref=e215] [cursor=pointer]
        - paragraph [ref=e217]: No wishes yet.
        - text: ❀
      - generic [ref=e219]:
        - paragraph [ref=e220]: Gift & Registry
        - heading "Gift & Registry" [level=2] [ref=e221]
        - paragraph [ref=e222]: "For those who wish to send a gift or contribute to our new life together:"
        - generic [ref=e223]:
          - strong [ref=e224]: Haluk Can Sarıöz
          - generic [ref=e225]: QNB Bankası
          - code [ref=e226]: TR53 0011 1000 0000 0145 4005 17
        - button "Copy IBAN 📋" [ref=e228] [cursor=pointer]
        - text: ❀
      - generic [ref=e230]:
        - paragraph [ref=e231]: Share
        - heading "Share the Invitation" [level=2] [ref=e232]
        - paragraph [ref=e233]: You can share our invitation with your loved ones.
        - generic [ref=e234]:
          - img "QR Code"
          - generic [ref=e235]: Share quickly via QR code.
        - generic [ref=e236]:
          - link "Share via WhatsApp 💬" [ref=e237] [cursor=pointer]:
            - /url: https://wa.me/?text=Handenur%20%26%20Haluk%20Can%20d%C3%BC%C4%9F%C3%BCn%20davetiyesi%20%F0%9F%92%8D%0Ahttps%3A%2F%2Fwedding-invitation-halook.vercel.app%2F
          - button "Copy Link 🔗" [ref=e238] [cursor=pointer]
        - text: ❀
      - generic [ref=e240]:
        - paragraph [ref=e241]: Handenur & Haluk Can
        - generic [ref=e242]: 07 Ağustos 2027
        - generic [ref=e243]: Having you with us on this special day is the greatest gift.
        - generic [ref=e244]: Made with love
```

# Test source

```ts
  1  | // tests/rsvp.spec.js
  2  | import { test, expect } from '@playwright/test';
  3  | 
  4  | test.describe('Düğün Davetiyesi Temel Süreçleri', () => {
  5  |   
  6  |   test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
  7  |     // 1. Geliştirme ortamına git
  8  |     await page.goto('http://localhost:5173/');
  9  | 
  10 |     // 2. Zarfın üzerindeki "Daveti Aç" butonunun yüklenmesini bekle ve tıkla
  11 |     const openButton = page.locator('.envelope-seal');
  12 |     await expect(openButton).toBeVisible({ timeout: 15000 }); 
  13 |     await openButton.click();
  14 | 
  15 |     // 3. Davetiye açıldıktan sonra LCV formuna kadar kaydır
  16 |     const rsvpSection = page.locator('.rsvp-card');
  17 |     await rsvpSection.scrollIntoViewIfNeeded();
  18 |     await expect(rsvpSection).toBeVisible();
  19 | 
  20 |     // 4. Formu Doldur (Ad Soyad)
  21 |     await page.fill('input[placeholder="Ad Soyad"], input[placeholder="Full Name"]', 'Otomatik Test Misafiri');
  22 |     
  23 |     // 5. Formu Doldur (Not)
  24 |     await page.fill('textarea[placeholder="Kişi Sayısını Belirtiniz"], textarea[placeholder="Please Specify The Number Of People"]', 'Bu Playwright tarafından atılmış otomatik bir test kaydıdır.');
  25 | 
  26 |     // 6. Formu Gönder
  27 |     const submitButton = page.locator('button.form-button[type="submit"]');
> 28 |     await submitButton.click();
     |                        ^ Error: locator.click: Error: strict mode violation: locator('button.form-button[type="submit"]') resolved to 2 elements:
  29 | 
  30 |     // 7. Başarı uyarısının (Toast/Alert) çıkmasını bekle
  31 |     await expect(page.getByText(/Bilgileriniz Alındı|Katılım formunuz|Success|Saved/i).first()).toBeVisible({ timeout: 10000 });
  32 |   });
  33 | 
  34 | });
```