export async function setupE2EMocks(page, mockApi = true) {
  // 1. Görsel ve Medyaları Engelle
  const emptyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => route.fulfill({ body: emptyImage, contentType: 'image/png' }));
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());

  // 2. Animasyonları Kapat
  await page.addStyleTag({ 
    content: `*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; scroll-behavior: auto !important; }` 
  });

  // 3. Turnstile Mock (Gönder butonunun açılmasını sağlar)
  await page.route('**/turnstile/v0/api.js*', async route => {
    const url = new URL(route.request().url());
    const onloadFn = url.searchParams.get('onload');
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.turnstile = {
          render: function(container, options) {
            if (options && typeof options.callback === 'function') {
              setTimeout(() => options.callback('mock-valid-token'), 10);
            } else if (options && typeof options.callback === 'string' && typeof window[options.callback] === 'function') {
              setTimeout(() => window[options.callback]('mock-valid-token'), 10);
            }
            return 'mock-widget-id';
          },
          reset: function() {}, remove: function() {}
        };
        if ('${onloadFn}' && typeof window['${onloadFn}'] === 'function') window['${onloadFn}']();
      `
    });
  });

  // 4. Supabase API Mock (Tüm form gönderimlerini her zaman başarılı sayar)
  if (mockApi) {
    await page.route('**/functions/v1/submit-form', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*' } });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, data: { id: 'mock-id' }, approved: true })
      });
    });
  }
}