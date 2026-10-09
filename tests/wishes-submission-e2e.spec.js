import { test, expect } from '@playwright/test';
// import { setupE2EMocks } from './utils'; // Projenizde varsa yorum satırını kaldırabilirsiniz

test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {

  test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atmalı ve form sıfırlanmalı', async ({ page }) => {
    
    // 1. ÇÖZÜM: Supabase isteğini taklit (mock) ediyoruz.
    // Bu kod, form gönderildiğinde sahte bir "Başarılı" yanıtı dönmesini sağlar.
    // Böylece uygulamanız hata (catch) bloğuna düşmez ve formu başarıyla sıfırlar.
    await page.route('**/functions/v1/submit-form', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          data: { 
            id: 'mock-id', 
            name: 'Ahmet Yılmaz', 
            message: 'Tebrikler, çok mutlu olun!' 
          } 
        })
      });
    });

    // 2. Ana sayfaya git
    await page.goto('/');

    // 3. Karşılama zarfını bul ve tıkla (Bunu yapmazsak form ekranda görünmez)
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible();
    await envelopeSeal.click();

    // 4. Anı defteri formuna kaydır
    const wishForm = page.locator('.wish-form');
    await wishForm.scrollIntoViewIfNeeded();

    // 5. Input elementlerini tanımla
    const nameInput = wishForm.locator('input[name="name"]');
    const messageInput = wishForm.locator('textarea[name="message"]');
    const submitButton = wishForm.locator('button[type="submit"]');

    // 6. Form alanlarının görünürlüğünü bekle ve doldur
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Ahmet Yılmaz');
    await messageInput.fill('Tebrikler, çok mutlu olun!');

    // 7. Gönder butonuna tıkla
    await submitButton.click();

    // 8. İşlem sorunsuz bittiği için form inputlarının temizlendiğini onayla
    // (Daha önce Timeout aldığınız yer burasıydı, artık mock sayesinde başarılı olacak)
    await expect(nameInput).toHaveValue('', { timeout: 15000 });
    await expect(messageInput).toHaveValue('', { timeout: 15000 });
  });

});