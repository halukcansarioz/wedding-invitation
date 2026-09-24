// tests/rsvp.spec.js
import { test, expect } from '@playwright/test';

test.describe('Düğün Davetiyesi Temel Süreçleri', () => {
  
  test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
    // 1. Geliştirme ortamına git
    await page.goto('http://localhost:5173/');

    // 2. Zarfın üzerindeki "Daveti Aç" butonunun yüklenmesini bekle ve tıkla
    const openButton = page.locator('.envelope-seal');
    await expect(openButton).toBeVisible({ timeout: 15000 }); 
    await openButton.click();

    // 3. Davetiye açıldıktan sonra LCV formuna kadar kaydır
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();
    await expect(rsvpSection).toBeVisible();

    // 4. Formu Doldur (Ad Soyad)
    await page.fill('input[placeholder="Ad Soyad"], input[placeholder="Full Name"]', 'Otomatik Test Misafiri');
    
    // 5. Formu Doldur (Not)
    await page.fill('textarea[placeholder="Kişi Sayısını Belirtiniz"], textarea[placeholder="Please Specify The Number Of People"]', 'Bu Playwright tarafından atılmış otomatik bir test kaydıdır.');

    // 6. Formu Gönder
    const submitButton = page.locator('button.form-button[type="submit"]');
    await submitButton.click();

    // 7. Başarı uyarısının (Toast/Alert) çıkmasını bekle
    await expect(page.getByText(/Bilgileriniz Alındı|Katılım formunuz|Success|Saved/i).first()).toBeVisible({ timeout: 10000 });
  });

});