import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Güvenlik ve Yetkilendirme Testleri', () => {
  test('Giriş yapmamış kullanıcı admin paneline erişememeli ve login formunu görmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    
    const loginForm = page.locator('.admin-login-card, form');
    await expect(loginForm.first()).toBeVisible({ timeout: 15000 });
  });
});