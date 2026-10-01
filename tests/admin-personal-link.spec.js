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
    await page.route('**/auth/v1/token*', async route => {
      if (!route.request().url().includes('grant_type=password')) return route.continue();

      const now = Math.floor(Date.now() / 1000);
      const timestamp = new Date().toISOString();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: now + 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: '123',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'test@admin.com',
            email_confirmed_at: timestamp,
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            created_at: timestamp,
            updated_at: timestamp,
          },
        }),
      });
    });
    await page.goto('/admin');
    
    // Test sırasında Supabase bağlantısı eksikse girişi taklit et
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
       await emailInput.fill('test@admin.com');
       await page.locator('input[type="password"]').fill('123456');
       
       await page.locator('button[type="submit"]').click();
       await expect(page.locator('.admin-layout')).toBeVisible({ timeout: 15000 });
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

  test('Tüm admin sekmeleri hata vermeden açılmalı', async ({ page }) => {
    const tabs = page.locator('.admin-sidebar-menu .admin-nav-button');
    await expect(tabs).toHaveCount(22);

    for (let index = 0; index < await tabs.count(); index++) {
      const tab = tabs.nth(index);
      await tab.click();
      await expect(tab).toHaveClass(/active/);
      await expect(page.locator('.admin-editor .admin-editor-section')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.admin-editor .error-boundary-container')).toHaveCount(0);
    }
  });
});