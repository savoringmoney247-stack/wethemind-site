// ── Kharcha Service Worker ──────────────────────────────
// Version bump here forces old caches to be replaced.
const CACHE_NAME   = 'kharcha-v1.0.0';
const STATIC_URLS  = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap',
];

// ── INSTALL: precache all static assets ────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: remove old caches ────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first for static, network-first for API ─
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Google Fonts — stale-while-revalidate
  if (request.url.includes('fonts.googleapis.com') ||
      request.url.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else — cache-first, fallback to network
  event.respondWith(cacheFirst(request));
});

// ── Strategies ─────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback — return cached index for navigation
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || await networkFetch;
}

// ── BACKGROUND SYNC (future-ready) ─────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    // Placeholder for future remote sync
    console.log('[SW] Background sync triggered');
  }
});
