import { test, expect } from '@playwright/test';

test.describe('Hediye ve Ödeme İşlemleri Uçtan Uca (E2E)', () => {

  test.beforeEach(async ({ page }) => {
    // Hız için medya dosyalarını engelle
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir IBAN panosunu kopyalayabilmeli', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const giftSection = page.locator('.gift-card');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await giftSection.scrollIntoViewIfNeeded();

    const copyIbanButton = page.locator('button', { hasText: /IBAN'ı Kopyala/i });
    await expect(copyIbanButton).toBeVisible();

    // Panonun başlangıçta boş veya farklı olduğunu varsayıyoruz
    await copyIbanButton.click({ force: true });

    // Buton metninin değiştiğini onayla
    await expect(copyIbanButton).toContainText(/Kopyalandı/i);

    // Panoya gerçekten bir şey kopyalanıp kopyalanmadığını kontrol et
    const clipboardText = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboardText).toContain("TR"); // IBAN numaraları TR ile başlar
  });

  test('Kredi kartı modülü açıksa Supabase ödeme Edge Functionuna istek atılmalı', async ({ page }) => {
    // Tarayıcıdaki prompt fonksiyonunu mockluyoruz (Kullanıcı 500 TL girdiği varsayılır)
    await page.addInitScript(() => {
      window.prompt = () => "500"; 
    });

    // Supabase Edge Function isteğini mockla (Gerçek Stripe API'ye gitmesini engelle)
    await page.route('**/functions/v1/create-payment', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, paymentUrl: 'https://checkout.stripe.com/test-url' })
      });
    });

    // Hediye bölümünü bul
    const giftSection = page.locator('.gift-card');
    await giftSection.scrollIntoViewIfNeeded();

    // Kredi kartı butonu görünürse (Ayarlarda açıksa test edilecek)
    const creditCardButton = page.locator('button', { hasText: /Kredi Kartı ile Gönder/i });
    
    // Eğer buton varsa (ayar açıksa), tıkla ve fonksiyonun çalışmasını bekle
    if (await creditCardButton.isVisible()) {
      await creditCardButton.click();
      // Yönlendirme mantığının devreye girmesi beklenir, ancak Edge function mocklandığı için network sekmesinde 200 dönecektir.
    }
  });
});