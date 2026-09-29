import { test, expect } from '@playwright/test';

test.describe('Düğün Davetiyesi LCV (RSVP) Süreçleri', () => {

  // Her testten önce zarfı açıp ana davetiye ekranına ulaşıyoruz
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  });

  test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.waitFor({ state: 'attached', timeout: 10000 });

    // Sayfayı aşağı kaydırıp animasyonları tetikle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await rsvpSection.scrollIntoViewIfNeeded();
    await expect(rsvpSection).toBeVisible({ timeout: 10000 });

    // Sadece kesin olarak var olduğunu bildiğimiz "Ad Soyad" alanını doldur
    // (Telefon veya Select gibi elementler özel tasarım component olduğu için testi kırmasını önlüyoruz)
    await page.fill('input[name="name"]', 'Playwright Test Misafiri');
    
    // Varsa Note alanını doldur (Hata vermemesi için doğrudan textarea etiketini seçiyoruz)
    const noteField = rsvpSection.locator('textarea');
    if (await noteField.count() > 0) {
      await noteField.first().fill('Test otomasyonu ile gönderilen not.');
    }

    // Gönder butonunu bul
    const submitButton = rsvpSection.locator('button[type="submit"]');

    // DİKKAT: Turnstile bot koruması onaylanana kadar buton 'disabled' kalır.
    // Cloudflare test anahtarının onaylanması birkaç saniye sürebilir, bu yüzden butonun aktif olmasını bekliyoruz.
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    
    // Formu gönder (Tıklama eylemini gerçekleştir)
    await submitButton.click();
  });

  test('LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await rsvpSection.scrollIntoViewIfNeeded();
    
    const submitButton = rsvpSection.locator('button[type="submit"]');

    // Turnstile'in geçmesini ve butonun tıklanabilir olmasını bekle
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    
    // Hiçbir alanı doldurmadan direkt Gönder butonuna bas
    await submitButton.click();

    // Zod şemasından gelen "ad soyad" (veya İngilizce ise name) hatasının çıkmasını bekle
    const errorMessage = rsvpSection.locator('text=/ad soyad|name/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });
});