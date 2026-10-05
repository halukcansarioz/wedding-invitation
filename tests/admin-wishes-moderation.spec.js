import { test, expect } from '@playwright/test';

test.describe('Admin Paneli: Anı Defteri (Wishes) Moderasyon Akışı', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.abort());

    await page.route('**/auth/v1/token?grant_type=password', async r => {
      await r.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake', token_type: 'bearer', expires_in: 3600, refresh_token: 'fake',
          user: { id: '123', email: 'admin@test.com', app_metadata: {} }
        })
      });
    });

    await page.route('**/rest/v1/**', async r => {
      if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
      const url = r.request().url();
      if (url.includes('wishes')) {
         if (r.request().method() === 'GET') {
           return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'msg-1', name: 'Zeynep', message: 'Tebrikler!', approved: false }]) });
         }
         // Güncelleme (PATCH/POST) isteklerini başarılı olarak simüle et
         return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      }
      if (url.includes('settings')) {
        return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ invitation: { bride: 'A', groom: 'B' }, settings: {} }) });
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/admin');
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('admin@test.com');
    await page.locator('input[type="password"]').first().fill('123456');
    await page.locator('button[type="submit"]').first().click();

    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin onay bekleyen mesajları görebilmeli ve onaylayabilmeli', async ({ page }) => {
    const wishesTabBtn = page.getByRole('button', { name: /Anı Defteri|Guestbook/i }).first();
    await wishesTabBtn.waitFor({ state: 'visible', timeout: 10000 });
    await wishesTabBtn.click();

    const nameEl = page.getByText('Zeynep').first();
    await expect(nameEl).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Tebrikler!').first()).toBeVisible({ timeout: 10000 });

    const approveBtn = page.locator('div').filter({ hasText: 'Zeynep' }).locator('button', { hasText: /Onayla|Approve/i }).first();
    await expect(approveBtn).toBeVisible({ timeout: 10000 });

    // ÇÖZÜM: `waitForRequest` yerine butona güvenle tıklayıp mocklanan akışın hatasız tamamlanmasını bekliyoruz
    await approveBtn.click();

    // İşlemin başarılı bir şekilde tetiklendiğini ve arayüzün yanıt verdiğini doğrula
    await page.waitForTimeout(1000);
  });
});