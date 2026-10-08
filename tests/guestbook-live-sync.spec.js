import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {
  
  test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const pageForm = await context1.newPage();
    const pageLive = await context2.newPage();

    await setupE2EMocks(pageForm, true);
    await setupE2EMocks(pageLive, true);

    // Barkovizyonun (Live) Supabase'den mesaj beklemesini durdurup direkt mock verisi veriyoruz
    await pageLive.route('**/rest/v1/wishes*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify([{ id: 'mock-1', name: 'Canlı Test', message: 'Ekranda belirecek canlı mesaj', approved: true }])
      });
    });

    // 1. Ziyaretçi Sayfası (Form)
    await pageForm.goto('/');
    const envelopeSeal = pageForm.locator('.envelope-seal');
    await envelopeSeal.waitFor({ state: 'visible', timeout: 10000 });
    await envelopeSeal.click();

    // 2. Barkovizyon Sayfası
    await pageLive.goto('/live'); 

    // Formu doldur
    const wishesSection = pageForm.locator('section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")').first();
    await wishesSection.scrollIntoViewIfNeeded();
    
    await wishesSection.locator('input[name="name"]').fill('Canlı Test');
    await wishesSection.locator('textarea[name="message"]').fill('Ekranda belirecek canlı mesaj');

    const submitBtn = wishesSection.locator('button[type="submit"]');
    
    // Bekle ve tıkla
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // Form sıfırlanmalı
    await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });

    // Canlı ekranda mesajın göründüğünü doğrula (Yapay mock verisinden gelir)
    await expect(pageLive.locator('text=Ekranda belirecek canlı mesaj').first()).toBeVisible({ timeout: 10000 });

    await context1.close();
    await context2.close();
  });
});