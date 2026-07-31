/* Leafy Service Worker v3.0 */
const CACHE = 'leafy-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './plant-icon-192.png',
  './plant-icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('push', e => {
  const d = e.data?.json() ?? { title: 'Leafy 🌿', body: 'A plant needs watering!' };
  e.waitUntil(
    self.registration.showNotification(d.title, {
      body: d.body,
      icon: './plant-icon-192.png',
      badge: './plant-icon-192.png',
      tag: 'leafy-reminder',
      vibrate: [150, 80, 150],
      actions: [
        { action: 'watered', title: '💧 Mark watered' },
        { action: 'snooze',  title: '⏰ Remind later' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});
