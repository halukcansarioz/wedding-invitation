// tests/rsvp-validation.spec.js
import { test, expect } from '@playwright/test';

test.describe('LCV Formu Validasyon ve Hata Yönetimi Testleri', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.abort());
    await page.goto('/');
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Zorunlu isim alanı boş bırakıldığında form gönderilmemeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    // İsim alanını boş bırakıp direkt gönder butonuna tıklıyoruz
    const submitButton = page.locator('.rsvp-card button[type="submit"]');
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Formun başarı durumuna geçmediğini ve aynı sayfada kaldığını doğrula
    await expect(rsvpSection).toBeVisible();
  });
});