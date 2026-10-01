import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    // Mock Supabase password sign-in endpoint to immediately succeed
    await page.route('**/auth/v1/token?grant_type=password', async route => {
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
            id: '123', aud: 'authenticated', role: 'authenticated',
            email: 'test@admin.com', email_confirmed_at: timestamp,
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {}, created_at: timestamp, updated_at: timestamp,
          },
        }),
      });
    });

    // Mock Supabase REST API queries
    await page.route('**/rest/v1/**', async route => {
      const url = route.request().url();
      if (url.includes('settings')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ invitation: { bride: 'Hande', groom: 'Haluk' }, settings: { visibility: {} } })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
       await emailInput.fill('test@admin.com');
       await page.locator('input[type="password"]').fill('123456');
       await page.locator('button[type="submit"]').click();
    }
    
    // Wait for the login form to disappear and admin layout elements to appear
    await expect(emailInput).not.toBeVisible({ timeout: 15000 });
  });