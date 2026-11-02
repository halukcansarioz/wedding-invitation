// public/custom-sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png', // public klasöründeki ikonunuz
      badge: '/badge.png', // Üst barda görünecek küçük ikon (isteğe bağlı)
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const requestedUrl = event.notification.data && event.notification.data.url;
  let targetUrl = self.location.origin + '/';

  try {
    const parsedUrl = new URL(requestedUrl || '/', self.location.origin);
    if (parsedUrl.origin === self.location.origin) {
      targetUrl = parsedUrl.href;
    }
  } catch {
    targetUrl = self.location.origin + '/';
  }

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});