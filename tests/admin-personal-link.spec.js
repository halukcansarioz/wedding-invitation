import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Admin Kişiye Özel Link Üretici (E2E)', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/admin');
    
    // Test sırasında Supabase bağlantısı eksikse girişi taklit et
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
       await emailInput.fill('test@admin.com');
       await page.locator('input[type="password"]').fill('123456');
       
       // Ağ seviyesinde Supabase oturum açma isteğini mockla
       await page.route('**/auth/v1/token?grant_type=password', async route => {
          await route.fulfill({ 
            status: 200, 
            contentType: 'application/json', 
            body: JSON.stringify({ access_token: 'fake', user: { id: '123' } }) 
          });
       });
       
       await page.locator('button[type="submit"]').click();
       await page.waitForTimeout(1000);
    }
  });

  test('Misafir adı girildiğinde doğru akıllı link oluşturulmalı', async ({ page }) => {
    const personalLinkTabBtn = page.locator('button', { hasText: /Özel Link|Personal Link/i });
    if (await personalLinkTabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await personalLinkTabBtn.click();
    }

    const nameInput = page.locator('input[placeholder*="Ahmet Yılmaz"], input[placeholder*="John Doe"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    await nameInput.fill('Zeynep Demir');

    const resultInput = page.locator('.admin-link-result-input');
    const generatedLink = await resultInput.inputValue();

    expect(generatedLink).toContain('guest=Zeynep%20Demir');
  });
});