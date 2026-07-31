/* =============================================================
   Nihongo N5  —  Service Worker  v2.0
   Caching strategy:
     • App shell (HTML / manifest / icons)  →  Cache-First
     • Google Fonts                         →  Stale-While-Revalidate
     • All other requests                   →  Network-First w/ cache fallback
   ============================================================= */

const CACHE_VERSION  = 'nihongo-n5-v2';
const SHELL_CACHE    = `${CACHE_VERSION}-shell`;
const FONT_CACHE     = `${CACHE_VERSION}-fonts`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;

const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL ───────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Nihongo N5 v2…');
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())          // activate immediately
      .catch(err => console.warn('[SW] Pre-cache failed:', err))
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Nihongo N5 v2…');
  const validCaches = [SHELL_CACHE, FONT_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !validCaches.includes(k))
          .map(k => { console.log('[SW] Deleting stale cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())        // take control of all tabs
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts → Stale-While-Revalidate
  if (url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(staleWhileRevalidate(FONT_CACHE, request));
    return;
  }

  // Shell assets → Cache-First
  const isShell = SHELL_ASSETS.some(a =>
    request.url.endsWith(a.replace('./', '/')) ||
    request.url.endsWith(a.replace('./', ''))
  );
  if (isShell) {
    event.respondWith(cacheFirst(SHELL_CACHE, request));
    return;
  }

  // Everything else → Network-First
  event.respondWith(networkFirst(DYNAMIC_CACHE, request));
});

// ── STRATEGIES ────────────────────────────────────────────────
async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const fallback = await caches.match('./index.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match('./index.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await fetchPromise);
}

// ── MESSAGE CHANNEL ───────────────────────────────────────────
// Allows the page to trigger skipWaiting when an update is ready
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING received — activating immediately.');
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});

// ── PUSH NOTIFICATIONS (stub — ready to wire up) ──────────────
self.addEventListener('push', event => {
  const data    = event.data?.json() ?? {};
  const title   = data.title ?? 'Nihongo N5';
  const options = {
    body:      data.body  ?? '🎌 Time for your daily Japanese practice!',
    icon:      './icon-192.png',
    badge:     './icon-192.png',
    tag:       'nihongo-n5-daily',
    renotify:  true,
    data:      { url: data.url ?? './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url ?? './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url === target && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(target);
    })
  );
});

// ── BACKGROUND SYNC (stub) ────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-study-progress') {
    console.log('[SW] Background sync: study-progress');
    // Extend here to POST progress to a backend when connectivity returns
  }
});
