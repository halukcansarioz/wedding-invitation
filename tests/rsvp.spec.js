import { test, expect } from '@playwright/test';

test.describe('Düğün Davetiyesi Temel Süreçleri', () => {
  test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
    
    // 1. Dış medya dosyalarının yüklenmesini engelleyerek test hızını artır
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());

    // Davetiye adresine git
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    
    // 2. Butonun "Yükleniyor..." durumundan çıkmasını bekle
    await expect(envelopeSeal).not.toHaveText(/Yükleniyor\.\.\.|Loading\.\.\./i, { timeout: 15000 });

    // 3. Zarfı açmak için tıkla
    await envelopeSeal.click({ force: true });

    // 4. Zarf animasyonunun bitmesini bekle.
    // DİKKAT: Uygulamadaki 4000ms'lik (4 saniye) bekleme ve React.lazy() yüklemesi yüzünden 
    // Playwright'ın varsayılan 5 saniyelik limiti yetmez. Bu sebeple 15 saniye (15000ms) tanımlıyoruz.
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    // 5. Asıl davetiye içeriğinin yüklendiğini teyit et (Buna da özel süre tanıyoruz)
    await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });

    // 6. LCV formunu bul (10 saniye tolerans)
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.waitFor({ state: 'attached', timeout: 10000 });

    // 7. Framer Motion animasyonlarını tetiklemek için sayfayı önce en alta kaydır
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // 8. Elementin tam görünür olduğu konuma odaklan
    await rsvpSection.scrollIntoViewIfNeeded();

    // 9. Elementin animasyonlardan çıkıp gerçekten görünür hale geldiğini onayla
    await expect(rsvpSection).toBeVisible({ timeout: 10000 });

    // 10. Formu doldur
    await page.fill('input[name="name"]', 'Test Misafir');
    
    // Not: Formun geri kalan test adımlarınızı (dropdown seçimi, buton tıklaması vb.) buradan itibaren yazabilirsiniz.
    // await page.fill('textarea[name="note"]', 'Playwright test notu');
    // await page.click('button[type="submit"]');
  });
});