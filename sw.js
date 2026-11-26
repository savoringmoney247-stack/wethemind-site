/* We The Mind cache. HTML: network first (always fresh), assets: stale-while-revalidate. */
var V = "wtm-v1";
var SKIP = /^\/(portal|tools\/marginalia|pay|pay-functions|marginalia-billing)(\/|$)/;
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.origin !== location.origin || SKIP.test(u.pathname) || /\.(pdf|mp4|zip)$/i.test(u.pathname) || r.headers.has("range")) return;
  var isDoc = r.mode === "navigate" || (r.headers.get("accept") || "").indexOf("text/html") > -1;
  if (isDoc) {
    e.respondWith(fetch(r).then(function (res) {
      if (res.ok) { var c = res.clone(); caches.open(V).then(function (x) { x.put(r, c); }); }
      return res;
    }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match("/404.html"); }); }));
    return;
  }
  e.respondWith(caches.open(V).then(function (cache) {
    return cache.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res.ok) cache.put(r, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
