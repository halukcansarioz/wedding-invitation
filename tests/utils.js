// tests/utils.js
export async function fastRouteMedia(page) {
  // 1x1 piksellik şeffaf bir PNG görselinin Base64 formatı
  const emptyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  // Resim isteklerini 1x1 piksel ile anında tamamla (onLoad anında tetiklenir)
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ body: emptyImage, contentType: 'image/png' });
  });
  
  // Video ve Ses isteklerini boş veriyle tamamla (onError veya onLoadedData anında tetiklenir)
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
}