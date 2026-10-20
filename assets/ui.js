/* We The Mind - small shared UI helpers (loaded on every page).
   1. Floating buttons (Savoring Money / We The Mind badge, WhatsApp, Listen) slide out of the way
      while you scroll down on phones and tablets, and come back when you scroll up or stop.
   2. The Savoring Money free guide is shown page by page with pdf.js, so it reads the same on
      Android, iPhone, tablets and desktops (phones' browsers can't show a PDF inside a page). */
(function () {
  "use strict";
  var root = document.documentElement;
  var script = document.currentScript;
  var siteRoot = script ? new URL("../", script.src).href : "/";

  /* ---------- 1. floating buttons ---------- */
  var lastY = window.scrollY, idleT = 0;
  function onScroll() {
    if (window.innerWidth > 900) { root.classList.remove("fab-away"); return; }
    var y = window.scrollY, dy = y - lastY;
    if (Math.abs(dy) < 6) return;
    var nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
    root.classList.toggle("fab-away", dy > 0 && y > 120 && !nearEnd);
    lastY = y;
    clearTimeout(idleT);
    idleT = setTimeout(function () { root.classList.remove("fab-away"); }, 1400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. free guide viewer ---------- */
  var frame = document.querySelector(".guide-viewer-frame iframe");
  if (!frame) return;
  var pdfUrl = new URL(frame.getAttribute("src").split("#")[0], location.href).href;
  var box = frame.parentNode, started = false;

  function loadScript(src) {
    return new Promise(function (ok, fail) {
      if (window.pdfjsLib) return ok();
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    });
  }
  function start() {
    if (started) return; started = true;
    var pages = document.createElement("div");
    pages.className = "guide-pages";
    pages.setAttribute("role", "document");
    pages.setAttribute("aria-label", frame.getAttribute("title") || "Guide");
    pages.innerHTML = '<div class="guide-loading">Loading the guide…</div>';
    loadScript(siteRoot + "tools/marginalia/pdf.min.js").then(function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + "tools/marginalia/pdf.worker.min.js";
      return window.pdfjsLib.getDocument(pdfUrl).promise;
    }).then(function (pdf) {
      // swap the (blank on phones) iframe for the rendered pages only once the PDF has loaded
      box.replaceChild(pages, frame);
      pages.innerHTML = "";
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); render(e.target); } });
      }, { root: pages, rootMargin: "600px 0px" });
      for (var i = 1; i <= pdf.numPages; i++) {
        var c = document.createElement("canvas");
        c.dataset.page = i;
        c.setAttribute("aria-label", "Page " + i + " of " + pdf.numPages);
        c.style.aspectRatio = "1 / 1.414";
        pages.appendChild(c);
        io.observe(c);
      }
      // draw the first pages straight away; the rest follow as they scroll into view
      [].slice.call(pages.children, 0, 2).forEach(function (c) { io.unobserve(c); render(c); });
      function render(c) {
        pdf.getPage(+c.dataset.page).then(function (page) {
          var base = page.getViewport({ scale: 1 });
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var vp = page.getViewport({ scale: (pages.clientWidth - 16) * dpr / base.width });
          c.width = Math.round(vp.width); c.height = Math.round(vp.height);
          c.style.aspectRatio = base.width + " / " + base.height;
          return page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        }).catch(function () {});
      }
    }).catch(function () {
      // keep the original embed and offer to open the guide in a new tab
      started = false;
      var a = document.createElement("a");
      a.className = "guide-open"; a.href = pdfUrl; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "Open the guide";
      box.appendChild(a);
    });
  }
  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { near.disconnect(); start(); }
    }, { rootMargin: "800px 0px" });
    near.observe(box);
  } else { start(); }
  // also start shortly after the page has loaded, in case the observer never reports
  function later() { setTimeout(start, 3000); }
  if (document.readyState === "complete") later(); else window.addEventListener("load", later);
})();
