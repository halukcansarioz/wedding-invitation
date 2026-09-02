import { test, expect } from '@playwright/test';

test('Davetli LCV formunu başarıyla doldurabiliyor', async ({ page }) => {
  // 1. Siteye git
  await page.goto('/');

  // 2. Zarf animasyonu varsa açılış butonuna tıkla
  const openButton = page.locator('.envelope-seal');
  if (await openButton.isVisible()) {
    await openButton.click();
  }

  // 3. LCV (RSVP) formuna kaydır
  const rsvpSection = page.locator('.rsvp-form');
  await rsvpSection.scrollIntoViewIfNeeded();

  // 4. Form verilerini doldur
  await page.fill('input[name="name"]', 'Otomatik Test Misafiri');
  await page.fill('textarea[name="note"]', 'Bu kayıt Playwright tarafından test amacıyla oluşturulmuştur.');

  // 5. Gönder butonuna tıkla
  await page.click('button[type="submit"].form-button');

  // 6. Başarı mesajının (Toast Alert) ekrana geldiğini doğrula
  // Not: tr.json içindeki "alerts.saveTitle" değerini kontrol ediyoruz
  const successToast = page.locator('text=Bilgileriniz Alındı').first();
  await expect(successToast).toBeVisible({ timeout: 10000 });
});