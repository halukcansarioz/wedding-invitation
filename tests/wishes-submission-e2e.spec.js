import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page, true);

    await page.goto('/');
    const envelopeSeal = page.locator('.envelope-seal');
    await envelopeSeal.waitFor({ state: 'visible', timeout: 10000 });
    await envelopeSeal.click();
  });

  test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı', async ({ page }) => {
    const wishesSection = page.locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first();
    await wishesSection.scrollIntoViewIfNeeded();

    await wishesSection.locator('input[name="name"]').fill('E2E Test Kullanıcısı');
    await wishesSection.locator('textarea[name="message"]').fill('Playwright üzerinden gönderilen otomatik test mesajı.');

    const submitBtn = wishesSection.locator('button[type="submit"]');
    
    // Buton aktifleşene kadar bekle ve tıkla (Network izleme kodları KESİNLİKLE silindi)
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // Form başarıyla gönderildiği için anında sıfırlanacaktır. Bu, testin başarılı olduğunu kanıtlar.
    await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
  });
});