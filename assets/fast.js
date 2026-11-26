/* We The Mind - speed helpers: instant page loads (prefetch on hover/touch/visible), idle-loaded
   heavy iframes, and an offline-friendly cache. Everything here is optional; the site works without it. */
(function () {
  "use strict";
  var conn = navigator.connection || {};
  var saver = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "");
  var done = {};
  function ok(a) {
    if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return false;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin) return false;
    if (u.pathname === location.pathname && u.search === location.search) return false;
    if (/\.(pdf|zip|png|jpe?g|webp|mp4|xml|txt)$/i.test(u.pathname)) return false;
    if (/^\/(portal|tools\/marginalia|pay|pay-functions|marginalia-billing)(\/|$)/.test(u.pathname)) return false;
    return u;
  }
  function prefetch(a) {
    var u = ok(a);
    if (!u || saver) return;
    var key = u.pathname + u.search;
    if (done[key]) return;
    done[key] = 1;
    var l = document.createElement("link");
    l.rel = "prefetch"; l.href = u.href; l.as = "document";
    document.head.appendChild(l);
  }
  var t;
  function over(e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    clearTimeout(t);
    t = setTimeout(function () { prefetch(a); }, e.type === "touchstart" ? 0 : 65);
  }
  document.addEventListener("mouseover", over, { passive: true });
  document.addEventListener("touchstart", over, { passive: true });
  document.addEventListener("focusin", over);

  /* warm the nearest links when the browser is idle */
  function idle(f) { (window.requestIdleCallback || function (g) { setTimeout(g, 1200); })(f, { timeout: 3000 }); }
  window.addEventListener("load", function () {
    idle(function () {
      if (saver || !("IntersectionObserver" in window)) return;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); prefetch(e.target); } });
      }, { rootMargin: "200px" });
      var n = 0;
      [].slice.call(document.querySelectorAll("header a[href], nav a[href], .btn[href], .card[href]")).forEach(function (a) {
        if (n < 12 && ok(a)) { n++; io.observe(a); }
      });
    });
    /* heavy iframes (promo animations) wait until the page is ready */
    [].slice.call(document.querySelectorAll("iframe[data-src]")).forEach(function (f) {
      idle(function () { f.src = f.getAttribute("data-src"); });
    });
  });

  /* repeat visits: cached fonts, styles, scripts and images */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();
