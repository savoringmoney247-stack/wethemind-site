// Manaluz — service worker
// Works offline once opened, AND stays up to date by itself:
// - the app page is fetched fresh whenever you're online (falls back to the saved copy offline),
// - the app's own code (.js / .css / manifest) is also fetched fresh first, so a new build never
//   waits behind the browser's 4-hour HTTP cache (falls back to the saved copy offline),
// - big libraries and images are served instantly from the saved copy and re-checked in the background,
// - a new version installs straight from the server (never from the browser's own HTTP cache).
// So an installed copy (from a browser, or the Play Store app) picks up every update without
// being uninstalled. Bump CACHE_NAME whenever the cached files change.
const CACHE_NAME = "marginalia-v61";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pdf.min.js",
  "./pdf.worker.min.js",
  "./pdf-lib.min.js",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon.ico",
  "./favicon-32.png",
  "./favicon-16.png",
  "./wethemind-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

function isPage(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
}

function putInCache(req, res) {
  if (res && res.status === 200 && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // don't intercept Google Fonts etc.

  if (isPage(req)) {
    // Network first (with a short wait), so opening the app always shows the newest version.
    event.respondWith(
      new Promise((resolve) => {
        let done = false;
        const fallback = () =>
          caches.match(req, { ignoreSearch: true })
            .then((c) => c || caches.match("./index.html"))
            .then((c) => { if (!done && c) { done = true; resolve(c); } });
        const timer = setTimeout(fallback, 4000); // slow network: show the saved copy
        fetch(req, { cache: "no-cache" })
          .then((res) => {
            clearTimeout(timer);
            putInCache(req, res);
            if (!done) { done = true; resolve(res); }
          })
          .catch(() => {
            clearTimeout(timer);
            fallback().then(() => { if (!done) { done = true; resolve(Response.error()); } });
          });
      })
    );
    return;
  }

  // The app's own code: always check the server first ("no-cache" = ask before reusing the browser's
  // saved copy), so new builds show up straight away. Offline, the saved copy is used.
  const isVendor = /\/(pdf\.min|pdf\.worker\.min|pdf-lib\.min)\.js$/.test(url.pathname);
  if (!isVendor && /\.(js|css|webmanifest|json)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => putInCache(req, res))
        .catch(() => caches.match(req).then((c) => c || Response.error()))
    );
    return;
  }

  // Everything else (libraries, images): instant from the saved copy, re-checked with the server in
  // the background for next time - again bypassing the browser's saved copy.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req, { cache: "no-cache" }).then((res) => putInCache(req, res)).catch(() => cached);
      if (cached) { event.waitUntil(fresh.catch(() => {})); return cached; }
      return fresh;
    })
  );
});
