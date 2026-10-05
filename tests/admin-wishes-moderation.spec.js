import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Admin Paneli: Anı Defteri (Wishes) Moderasyon Akışı', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    await page.route('**/auth/v1/token?grant_type=password', async route => {
      const now = Math.floor(Date.now() / 1000);
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600, expires_at: now + 3600,
          user: { id: '123', aud: 'authenticated', email: 'admin@test.com' },
        }),
      });
    });

    await page.route('**/rest/v1/wishes*', async route => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 'msg-1', name: 'Zeynep', message: 'Tebrikler!', approved: false, created_at: new Date().toISOString() },
          { id: 'msg-2', name: 'Ahmet', message: 'Mutluluklar.', approved: true, created_at: new Date().toISOString() }
        ])
      });
    });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').fill('123456');
      await page.locator('button[type="submit"]').click();
    }
    
    await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 15000 });
  });

  test('Admin onay bekleyen mesajları görebilmeli ve onaylayabilmeli', async ({ page }) => {
    const wishesTabBtn = page.locator('button, div').filter({ hasText: /Anı Defteri Formu|Guestbook/i }).first();
    await wishesTabBtn.waitFor({ state: 'visible', timeout: 10000 });
    await wishesTabBtn.click();

    await expect(page.locator('text=Zeynep')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tebrikler!')).toBeVisible();

    const updateRequestPromise = page.waitForRequest(req => 
      req.url().includes('/rest/v1/wishes') && req.method() === 'PATCH'
    );

    const approveBtn = page.locator('.admin-row').filter({ hasText: 'Zeynep' }).locator('button', { hasText: /Onayla|Approve/i });
    await approveBtn.click();

    const updateRequest = await updateRequestPromise;
    expect(updateRequest.postDataJSON()).toMatchObject({ approved: true });
  });
});