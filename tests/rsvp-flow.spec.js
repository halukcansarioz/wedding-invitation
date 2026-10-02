import { test, expect } from '@playwright/test';

// Medyaları engelleyerek testin çok daha hızlı çalışmasını sağlar
const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('LCV (RSVP) Formu Uçtan Uca Etkileşimi', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    
    // Form submit edildiğinde gidecek Supabase Edge Function isteğini mockla (Gerçek veritabanına yazılmasın)
    await page.route('**/functions/v1/submit-form', async route => {
      // CORS Preflight (OPTIONS) isteklerine izin ver
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': '*'
          }
        });
        return;
      }
      
      // Gerçek POST isteğine CORS başlığı ile yanıt ver
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, data: { id: 'mock-id' } })
      });
    });

    await page.goto('/');
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir katılım formunu eksiksiz doldurup gönderebilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    // 1. Zod şemasıyla eşleşen kesin 'name' attributeleri üzerinden seçim yapıyoruz
    await page.locator('.rsvp-card input[name="name"]').fill('Playwright Test Misafiri');
    
    const phoneInput = page.locator('.rsvp-card input[name="phone"]');
    if (await phoneInput.count() > 0) {
        await phoneInput.fill('0555 555 5555');
    }

    // 2. Kişi sayısı, Yakınlık ve Çocuk Durumu (Sırayla 1., 2. ve 3. OptionGroup bileşenleri)
    const optionGroups = page.locator('.rsvp-card .option-group');
    if (await optionGroups.count() >= 3) {
        await optionGroups.nth(0).locator('button').nth(1).click(); // 2 Kişi
        await optionGroups.nth(1).locator('button').nth(0).click(); // Gelin Tarafı
        await optionGroups.nth(2).locator('button').nth(1).click(); // Çocuk: Hayır
    }

    // 3. İstek şarkı ve Not alanları
    const songInput = page.locator('.rsvp-card input[name="songRequest"]');
    if (await songInput.count() > 0) {
        await songInput.fill("Ankara'nın Bağları");
    }

    const noteInput = page.locator('.rsvp-card textarea[name="note"]');
    if (await noteInput.count() > 0) {
        await noteInput.fill('Heyecanla bekliyoruz!');
    }

    // 4. Cloudflare Turnstile "1x000" test anahtarıyla kendi kendine otomatik doğrulanır.
    // Bu yüzden sahte bir butona tıklamak yerine Gönder butonunun kilidinin açılmasını bekliyoruz.
    const submitButton = page.locator('.rsvp-card button[type="submit"]');
    await submitButton.scrollIntoViewIfNeeded();
    
    // Butonun tıklanabilir olmasını bekle (Turnstile onaylanana kadar disabled kalır)
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    
    // Formu gönder
    await submitButton.click();

    // 5. Playwright Best Practice: Ağ isteğini beklemek yerine sonucun UI'a yansımasını (Formun sıfırlanmasını) doğrula
    await expect(page.locator('.rsvp-card input[name="name"]')).toBeEmpty({ timeout: 10000 });
  });
});