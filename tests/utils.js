import { expect } from '@playwright/test';

export const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

export async function setupE2EMocks(page) {
  await page.route('**/*', route => {
    const type = route.request().resourceType();
    
    if (type === 'image' || type === 'media' || type === 'font') {
      return route.continue();
    }
    
    if (route.request().url().includes('supabase.co')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null })
      });
    }

    return route.continue();
  });
}

export const loginAdmin = async (page) => {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('admin@test.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  await expect(emailInput).toBeHidden({ timeout: 15000 });
};