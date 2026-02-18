// ============================================
// FaOnSisT - Service Worker
// PWA offline desteği + push notification
// ============================================

const CACHE_NAME = 'faonsist-v1';
const STATIC_ASSETS = [
  '/app',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ---- Install: statik asset'leri cache'le ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Statik asset\'ler cache\'leniyor');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ---- Activate: eski cache'leri temizle ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Eski cache siliniyor:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// ---- Fetch: strateji bazlı cache ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Socket.IO isteklerini bypass et
  if (url.pathname.startsWith('/socket.io')) return;

  // API istekleri: NetworkFirst
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CDN ve statik dosyalar: CacheFirst
  if (
    url.hostname !== location.hostname ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML sayfalar: NetworkFirst
  event.respondWith(networkFirst(request));
});

// ---- Cache Strategies ----

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // HTML istekleri icin offline sayfasi goster
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }

    return new Response('Offline', { status: 503 });
  }
}

// ---- Push Notification ----
self.addEventListener('push', (event) => {
  let data = { title: 'FaOnSisT', body: 'Yeni bildirim', icon: '/icons/icon-192.png' };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'faonsist-notification',
    data: {
      url: data.url || '/app',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ---- Notification Click ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/app';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Acik tab varsa ona focus ol
      for (const client of clients) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }
      // Yoksa yeni tab ac
      return self.clients.openWindow(url);
    })
  );
});
