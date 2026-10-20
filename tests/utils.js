import { expect } from '@playwright/test';

export const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

export const setupE2EMocks = async (page) => {
  await mockMedia(page);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*'
  };

  await page.route('**/*', async (route, request) => {
    if (request.method() === 'OPTIONS') {
      return route.fulfill({ status: 200, headers: corsHeaders });
    }
    route.fallback();
  });

  await page.route('**/auth/v1/**', async route => {
    if (route.request().method() === 'OPTIONS') return; 
    const url = route.request().url();
    
    if (url.includes('/token') || url.includes('/recover') || url.includes('/verify')) {
      return route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-access-token', token_type: 'bearer', expires_in: 3600,
          user: { id: '123', aud: 'authenticated', role: 'authenticated', email: 'admin@test.com' }
        })
      });
    }
    
    if (url.includes('/user') || url.includes('/session')) {
      return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: JSON.stringify({ session: null }) });
    }

    return route.fulfill({ status: 200, headers: corsHeaders, body: '{}' });
  });

  await page.route('**/rest/v1/**', async route => {
    if (route.request().method() === 'OPTIONS') return;
    const url = route.request().url();

    if (url.includes('settings')) {
      return route.fulfill({
        status: 200, headers: corsHeaders, contentType: 'application/json',
        body: JSON.stringify({
          invitation: { bride: 'Hande', groom: 'Haluk' },
          settings: { visibility: { guests: true, wishes: true, countdown: true, location: true }, theme: 'lavanta' },
          copy: { heroLabel: "Evleniyoruz" }
        })
      });
    }
    return route.fulfill({ status: 200, headers: corsHeaders, contentType: 'application/json', body: '[]' });
  });

  await page.route('**/functions/v1/**', async route => {
    if (route.request().method() === 'OPTIONS') return;
    return route.fulfill({
      status: 200, headers: corsHeaders, contentType: 'application/json',
      body: JSON.stringify({ success: true, count: 1, data: { id: 'mocked-id' } })
    });
  });
};

export const loginAdmin = async (page) => {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('admin@test.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  await expect(emailInput).toBeHidden({ timeout: 15000 });
};