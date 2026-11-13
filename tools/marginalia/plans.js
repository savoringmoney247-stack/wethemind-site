/* Manaluz on computers: free with ads, or "Remove ads" with a Lifetime or Monthly plan.
 *
 * - Off until window.MARGINALIA_PAY.enabled is true (set in index.html once Razorpay, Firebase
 *   and AdSense are ready). While off, this file does nothing at all.
 * - Never runs inside the Play Store app: Google Play handles that app's ads and plans.
 * - Sign-in is Google (the same Firebase project as the We The Mind portal), so a plan follows
 *   the person to every computer. Payments go through Razorpay Checkout; the server functions in
 *   /marginalia-billing check every payment before a plan is recorded. This page can only READ
 *   the person's own plan.
 */
(function () {
  "use strict";
  var CFG = window.MARGINALIA_PAY || {};
  if (!CFG.enabled) return;

  var inPlayApp = false;
  try { inPlayApp = sessionStorage.getItem("mg-in-app") === "1"; } catch (e) {}
  if ((document.referrer || "").indexOf("android-app://") === 0) inPlayApp = true;
  if (inPlayApp) return;

  var FB = "https://www.gstatic.com/firebasejs/10.14.1/";
  var PLAY = "https://play.google.com/store/apps/details?id=com.wethemind.marginalia";
  var CACHE_KEY = "mg-adfree-until";
  var fb = null, user = null, ent = null, unsubEnt = null, adsLoaded = false;

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".mg-adbar{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;min-height:64px;max-height:100px;overflow:hidden;padding:6px 12px;",
    ".mg-adbar .mg-adslot{max-height:90px;overflow:hidden}",
    "  border-top:1px solid var(--line);background:var(--surface-2,#f7f3ea);position:relative}",
    ".mg-adbar[hidden]{display:none}",
    ".mg-adbar .mg-adslot{flex:1 1 auto;max-width:728px;min-height:50px;display:block}",
    ".mg-adbar .mg-adtag{position:absolute;left:10px;top:4px;font:600 9px/1 'IBM Plex Sans',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-400)}",
    ".mg-adbar .mg-noads{flex:0 0 auto;border:1px solid var(--line);background:var(--surface);color:var(--ink-900);border-radius:999px;padding:8px 14px;",
    "  font:700 12px/1 'IBM Plex Sans',system-ui,sans-serif;cursor:pointer;white-space:nowrap}",
    ".mg-adbar .mg-noads:hover{border-color:var(--accent);color:var(--accent)}",
    ".mg-probtn{font-weight:700}",
    ".mg-probtn.on{color:var(--accent)}",
    ".mg-dlg{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:16px;background:rgba(20,12,10,.42);",
    "  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transition:opacity .3s ease}",
    ".mg-dlg.show{opacity:1}",
    ".mg-card{width:min(560px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:var(--surface);color:var(--ink-900);border-radius:22px;",
    "  border:1px solid var(--line);box-shadow:0 40px 80px -30px rgba(0,0,0,.5);padding:24px 22px 18px;transform:translateY(16px) scale(.98);",
    "  transition:transform .45s cubic-bezier(.22,1,.36,1)}",
    ".mg-dlg.show .mg-card{transform:none}",
    ".mg-card h2{margin:0 0 6px;font:700 22px/1.2 'Fraunces',serif}",
    ".mg-card p.mg-sub{margin:0 0 18px;color:var(--ink-600);font:400 13.5px/1.5 'IBM Plex Sans',system-ui,sans-serif}",
    ".mg-plans{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".mg-plans.mg-one{grid-template-columns:1fr}",
    "@media (max-width:520px){.mg-plans{grid-template-columns:1fr}}",
    ".mg-plan{border:1.5px solid var(--line);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:6px;background:var(--surface-2,#faf7f0)}",
    ".mg-plan.best{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 6%,var(--surface))}",
    ".mg-plan .mg-name{font:700 11px/1 'IBM Plex Sans',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-600)}",
    ".mg-plan .mg-price{font:700 26px/1.1 'Fraunces',serif}",
    ".mg-plan .mg-note{font:400 12.5px/1.4 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600);flex:1}",
    ".mg-plan button{margin-top:8px;border:none;border-radius:12px;padding:11px 14px;cursor:pointer;font:700 13.5px/1 'IBM Plex Sans',system-ui,sans-serif;",
    "  background:var(--ink-900);color:var(--paper,#fff)}",
    ".mg-plan.best button{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#f97316));color:#fff}",
    ".mg-plan button:disabled{opacity:.6;cursor:wait}",
    ".mg-foot{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;",
    "  font:500 12.5px/1.4 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600)}",
    ".mg-foot a,.mg-foot button.mg-link{color:var(--accent);background:none;border:none;padding:0;font:inherit;font-weight:700;cursor:pointer;text-decoration:none}",
    ".mg-x{position:absolute;right:14px;top:14px;width:32px;height:32px;border-radius:50%;border:none;background:transparent;color:var(--ink-400);font-size:20px;cursor:pointer}",
    ".mg-card{position:relative}",
    ".mg-status{border-radius:14px;padding:14px 16px;background:color-mix(in srgb,#16a34a 9%,var(--surface));border:1px solid color-mix(in srgb,#16a34a 35%,var(--line));",
    "  font:600 14px/1.45 'IBM Plex Sans',system-ui,sans-serif}",
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- small helpers ---------- */
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 3600);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function untilMs(d) { return d && d.until && d.until.toMillis ? d.until.toMillis() : 0; }
  function isAdFree(d) {
    if (!d || d.active === false) return false;
    return d.plan === "lifetime" || untilMs(d) > Date.now();
  }
  var TIERS = [
    { id: "ember",  level: 1, name: "Ember",  line: "Pen, eraser and cover-up. No ads." },
    { id: "beacon", level: 2, name: "Beacon", line: "Everything in Ember, plus shapes, insert images and page tools (rotate, reorder, layout)." },
    { id: "aurora", level: 3, name: "Aurora", line: "Everything in Beacon, plus download-all, and every new Pro feature as it arrives." },
  ];
  function tierOf(d) {
    if (!isAdFree(d)) return 0;
    if (d.plan === "lifetime") return 3;
    return +d.tier || 1;
  }
  function cachedAdFree() {
    try { var v = localStorage.getItem(CACHE_KEY); return v === "lifetime" || (+v > Date.now()); } catch (e) { return false; }
  }
  function remember(d) {
    try {
      localStorage.setItem("mg-tier", String(tierOf(d)));
      if (isAdFree(d)) localStorage.setItem(CACHE_KEY, d.plan === "lifetime" ? "lifetime" : String(untilMs(d)));
      else { localStorage.removeItem(CACHE_KEY); localStorage.removeItem("mg-tier"); }
    } catch (e) {}
  }
  function loadScript(src, attrs) {
    return new Promise(function (ok, fail) {
      var s = document.createElement("script"); s.src = src; s.async = true;
      for (var k in (attrs || {})) s.setAttribute(k, attrs[k]);
      s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });
  }

  /* ---------- Firebase (loaded on demand) ---------- */
  function firebase() {
    if (fb) return fb;
    fb = Promise.all([
      import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"),
      import(FB + "firebase-firestore.js"), import(FB + "firebase-functions.js"),
      import(new URL("../../portal/assets/firebase-config.js", location.href).href),
    ]).then(function (m) {
      var app = m[0].initializeApp(m[4].firebaseConfig, "marginalia");
      return {
        auth: m[1].getAuth(app), A: m[1], db: m[2].getFirestore(app), F: m[2],
        fn: m[3].getFunctions(app, CFG.functionsRegion || "asia-south1"), Fn: m[3],
      };
    });
    return fb;
  }
  function call(name, data) {
    return firebase().then(function (f) { return f.Fn.httpsCallable(f.fn, name)(data || {}); }).then(function (r) { return r.data; });
  }
  function signIn() {
    return firebase().then(function (f) {
      var p = new f.A.GoogleAuthProvider();
      return f.A.signInWithPopup(f.auth, p).catch(function (e) {
        if (e && /popup/.test(e.code || "")) return f.A.signInWithRedirect(f.auth, p);
        throw e;
      });
    });
  }

  /* ---------- ads ---------- */
  var bar = el("div", "mg-adbar");
  bar.hidden = true;
  bar.innerHTML = '<span class="mg-adtag">Ad</span><ins class="adsbygoogle mg-adslot"></ins><button type="button" class="mg-noads">Go Pro</button>';
  var app = document.querySelector(".app");
  if (app) app.appendChild(bar);
  // AdSense's responsive ads force "height:auto !important" onto the ad's parent elements, which
  // would stretch the whole editor past the screen. Undo that whenever it happens.
  function keepLayout(node) {
    if (!node || !window.MutationObserver) return;
    var fix = function () { if (/height\s*:\s*auto/i.test(node.getAttribute("style") || "")) { node.style.removeProperty("height"); node.style.removeProperty("min-height"); } };
    new MutationObserver(fix).observe(node, { attributes: true, attributeFilter: ["style"] });
    fix();
  }
  [app, document.body, document.documentElement].forEach(keepLayout);
  bar.querySelector(".mg-noads").addEventListener("click", openPlans);

  function showAds(wanted) {
    var on = wanted && !!CFG.adSlot && !!CFG.adClient;   // nothing to show until an ad unit is set
    bar.hidden = !on;
    if (on && !adsLoaded) {
      adsLoaded = true;
      var ins = bar.querySelector("ins");
      ins.setAttribute("data-ad-client", CFG.adClient);
      ins.setAttribute("data-ad-slot", CFG.adSlot);
      ins.setAttribute("data-ad-format", "horizontal");
      ins.setAttribute("data-full-width-responsive", "true");
      loadScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(CFG.adClient), { crossorigin: "anonymous" })
        .then(function () { (window.adsbygoogle = window.adsbygoogle || []).push({}); })
        .catch(function () { bar.hidden = true; });          // ad blocker: just leave the space empty
    }
    setPro(!wanted);
    proBtn.classList.toggle("on", !wanted);                // the button reflects the plan, not the ad
    proBtn.textContent = wanted ? "Go Pro" : "Pro ✓";
  }

  /* ---------- header button ---------- */
  var proBtn = el("button", "btn mg-probtn", "Go Pro");
  proBtn.type = "button"; proBtn.title = "Manaluz Pro";
  var actions = document.querySelector(".hdr-actions");
  if (actions) actions.insertBefore(proBtn, actions.firstChild);
  proBtn.addEventListener("click", openPlans);

  /* ---------- Pro state shared with pro.js, and the Sign in button ---------- */
  function setPro(on) {
    var t = 0;
    if (on) { t = ent ? tierOf(ent) : (+localStorage.getItem("mg-tier") || 1); }
    window.__mgTier = t;
    window.__mgPro = t > 0;
    try { window.dispatchEvent(new Event("mg-pro-change")); } catch (e) {}
  }
  var signBtn = el("button", "btn", "Sign in");
  signBtn.type = "button"; signBtn.title = "Sign in with Google to use your Pro plan on this device";
  if (actions) actions.insertBefore(signBtn, proBtn);
  /* owner-only "View as" menu in the header (hidden for everyone else) */
  var vcss = document.createElement("style");
  vcss.textContent = [
    ".mg-vw{position:relative;display:inline-flex}",
    ".mg-vw>button{display:inline-flex;align-items:center;gap:7px}",
    ".mg-vw .mg-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--dot,#16a34a);flex:none;transition:background .35s}",
    ".mg-vw.pulse>button .mg-dot{animation:mgRing .8s ease-out}",
    "@keyframes mgRing{0%{box-shadow:0 0 0 0 var(--dot)}100%{box-shadow:0 0 0 13px transparent}}",
    ".mg-vw .car{transition:transform .3s cubic-bezier(.2,.9,.3,1.3)}",
    ".mg-vw.open .car{transform:rotate(180deg)}",
    ".mg-vm{position:absolute;top:calc(100% + 8px);right:0;min-width:196px;padding:6px;border-radius:14px;background:var(--surface,#fff);border:1px solid var(--line,rgba(0,0,0,.12));box-shadow:0 22px 44px -18px rgba(0,0,0,.5);opacity:0;transform:translateY(-8px) scale(.94);transform-origin:top right;pointer-events:none;transition:opacity .16s ease,transform .26s cubic-bezier(.2,.95,.3,1.25);z-index:9999}",
    ".mg-vw.open .mg-vm{opacity:1;transform:none;pointer-events:auto}",
    ".mg-vm button{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:none;border:none;border-radius:9px;padding:9px 10px;font:600 13px/1.1 inherit;color:inherit;cursor:pointer;opacity:0;transform:translateX(10px)}",
    ".mg-vw.open .mg-vm button{opacity:1;transform:none;transition:opacity .22s ease,transform .28s cubic-bezier(.2,.9,.3,1.2),background .15s;transition-delay:calc(var(--i) * 40ms)}",
    ".mg-vm button:hover{background:color-mix(in srgb,var(--accent) 11%,transparent)}",
    ".mg-vm button.on{color:var(--accent)}",
    ".mg-vm button.on::after{content:'\\2713';margin-left:auto;font-weight:800}",
    ".mg-vm hr{border:none;border-top:1px solid var(--line,rgba(0,0,0,.1));margin:5px 4px}",
    "@keyframes mgFlip{0%{transform:perspective(300px) rotateX(0)}50%{transform:perspective(300px) rotateX(88deg);opacity:.4}100%{transform:perspective(300px) rotateX(0)}}",
    ".mg-flip{animation:mgFlip .55s ease}",
    "@media (prefers-reduced-motion:reduce){.mg-vm,.mg-vm button,.mg-vw .car{transition:none!important}.mg-vw.pulse>button .mg-dot,.mg-flip{animation:none!important}}"
  ].join("\n");
  document.head.appendChild(vcss);
  var VIEWS = [["admin", "Me (lifetime)", "#16a34a", "Me"], ["free", "Free user", "#94a3b8", "Free"], ["ember", "Ember", "#f97316", "Ember"], ["beacon", "Beacon", "#3b82f6", "Beacon"], ["aurora", "Aurora", "#a855f7", "Aurora"]];
  var viewWrap = el("div", "mg-vw", ""); viewWrap.style.display = "none";
  var viewBtn = el("button", "btn", '<i class="mg-dot"></i><span class="lbl"></span><svg class="car" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
  viewBtn.type = "button"; viewBtn.title = "Admin: view the tool as another kind of user"; viewBtn.setAttribute("aria-haspopup", "menu");
  var viewMenu = el("div", "mg-vm", ""); viewMenu.setAttribute("role", "menu");
  VIEWS.forEach(function (o, i) {
    if (i === 1) viewMenu.appendChild(document.createElement("hr"));
    var b = el("button", "", '<i class="mg-dot" style="--dot:' + o[2] + '"></i>' + o[1]);
    b.type = "button"; b.setAttribute("role", "menuitem"); b.setAttribute("data-v", o[0]); b.style.setProperty("--i", i);
    b.addEventListener("click", function () { setView(o[0]); });
    viewMenu.appendChild(b);
  });
  viewWrap.appendChild(viewBtn); viewWrap.appendChild(viewMenu);
  if (actions) actions.insertBefore(viewWrap, signBtn);
  function viewInfo() { var k = viewAs(); for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i][0] === k) return VIEWS[i]; return VIEWS[0]; }
  function syncView() {
    viewWrap.style.display = isOwner() ? "" : "none";
    var o = viewInfo();
    viewWrap.style.setProperty("--dot", o[2]);
    viewBtn.querySelector(".lbl").textContent = "View as: " + o[3];
    Array.prototype.forEach.call(viewMenu.querySelectorAll("button"), function (b) { b.classList.toggle("on", b.getAttribute("data-v") === o[0]); });
  }
  function setView(k) {
    if (!isOwner()) return;
    try { localStorage.setItem("mg-viewas", k); } catch (e) {}
    ent = applyView(realEnt); remember(ent); showAds(!isAdFree(ent)); renderPlans(); syncView();
    viewWrap.classList.remove("open");
    viewWrap.classList.remove("pulse"); void viewWrap.offsetWidth; viewWrap.classList.add("pulse");
    proBtn.classList.remove("mg-flip"); void proBtn.offsetWidth; proBtn.classList.add("mg-flip");
    toast("Viewing as: " + viewInfo()[1]);
  }
  viewBtn.addEventListener("click", function (e) { e.stopPropagation(); if (isOwner()) viewWrap.classList.toggle("open"); });
  document.addEventListener("click", function (e) { if (!viewWrap.contains(e.target)) viewWrap.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") viewWrap.classList.remove("open"); });
  signBtn.addEventListener("click", function () {
    if (user) return firebase().then(function (f) { return f.A.signOut(f.auth); });
    signIn().catch(function (e) {
      if (e && /popup-closed|cancelled-popup/.test(e.code || "")) return;
      toast("Couldn't sign in. Please try again.");
    });
  });
  window.addEventListener("mg-open-pro", openPlans);

  /* ---------- plans dialog ---------- */
  var dlg = null;
  function closePlans() { if (!dlg) return; var d = dlg; dlg = null; d.classList.remove("show"); setTimeout(function () { d.remove(); }, 320); }
  function openPlans() {
    if (dlg) return;
    dlg = el("div", "mg-dlg"); dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-label", "Manaluz plans");
    var card = el("div", "mg-card");
    dlg.appendChild(card);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closePlans(); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { closePlans(); document.removeEventListener("keydown", esc); } });
    document.body.appendChild(dlg);
    renderPlans();
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (dlg) dlg.classList.add("show"); }); });
    setTimeout(function () { if (dlg) dlg.classList.add("show"); }, 50);
  }
  var css2 = document.createElement("style");
  css2.textContent = [
    ".mg-card{width:min(680px,100%)}",
    "@keyframes mgUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}",
    "@keyframes mgShine{from{transform:translateX(-130%) skewX(-18deg)}to{transform:translateX(330%) skewX(-18deg)}}",
    "@keyframes mgFall{to{transform:translate3d(var(--dx),108vh,0) rotate(var(--rot));opacity:.9}}",
    "@keyframes mgGlow{0%,100%{box-shadow:0 10px 30px -14px rgba(229,24,28,.55)}50%{box-shadow:0 14px 38px -10px rgba(249,115,22,.7)}}",
    ".mg-first .mg-sec{animation:mgUp .6s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0)*80ms)}",
    ".mg-sec{margin-top:20px}",
    ".mg-sec>h3{margin:0 0 10px;font:700 11px/1 'IBM Plex Sans',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-600)}",
    ".mg-hero{position:relative;overflow:hidden;border-radius:18px;padding:18px 18px 16px;color:#fff;background:linear-gradient(135deg,#e5181c,#f97316);animation:mgGlow 3.6s ease-in-out infinite}",
    ".mg-hero::after{content:'';position:absolute;top:0;left:0;width:30%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);animation:mgShine 4.2s ease-in-out infinite}",
    ".mg-hero-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
    ".mg-hero-name{font:700 26px/1.1 'Fraunces',serif}",
    ".mg-pill{font:700 10px/1 'IBM Plex Sans',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;border-radius:999px;padding:5px 9px;background:rgba(255,255,255,.22)}",
    ".mg-hero p{margin:8px 0 12px;font:500 13.5px/1.45 'IBM Plex Sans',system-ui,sans-serif;color:rgba(255,255,255,.92)}",
    ".mg-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.28);overflow:hidden}",
    ".mg-bar i{display:block;height:100%;width:0;border-radius:inherit;background:#fff;transition:width 1.2s cubic-bezier(.22,1,.36,1) .25s}",
    ".mg-hero-foot{margin-top:7px;font:600 11.5px/1 'IBM Plex Sans',system-ui,sans-serif;color:rgba(255,255,255,.85)}",
    ".mg-feats{display:flex;flex-wrap:wrap;gap:8px}",
    ".mg-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;font:600 12.5px/1 'IBM Plex Sans',system-ui,sans-serif;border:1px solid var(--line);background:var(--surface-2,#faf7f0);color:var(--ink-600);transition:transform .2s ease,box-shadow .2s ease}",
    ".mg-chip:hover{transform:translateY(-2px);box-shadow:0 8px 16px -10px rgba(0,0,0,.4)}",
    ".mg-chip.on{color:#166534;background:color-mix(in srgb,#16a34a 10%,var(--surface));border-color:color-mix(in srgb,#16a34a 35%,var(--line))}",
    ".mg-chip em{font-style:normal;font-size:9px;letter-spacing:.07em;text-transform:uppercase;background:var(--accent);color:#fff;border-radius:5px;padding:2px 4px}",
    ".mg-plans.mg-grid{grid-template-columns:1fr 1fr}",
    "@media (max-width:560px){.mg-plans.mg-grid{grid-template-columns:1fr}}",
    ".mg-plan{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}",
    ".mg-plan:hover{transform:translateY(-3px);box-shadow:0 16px 30px -18px rgba(0,0,0,.45)}",
    ".mg-plan ul{list-style:none;margin:2px 0 4px;padding:0;display:grid;gap:6px;flex:1;align-content:start}",
    ".mg-plan li{font:500 12.5px/1.35 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600);padding-left:18px;position:relative}",
    ".mg-plan li::before{content:'\\2713';position:absolute;left:0;color:#16a34a;font-weight:800}",
    ".mg-plan button{position:relative;overflow:hidden;transition:transform .15s ease,filter .2s ease}",
    ".mg-plan button:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}",
    ".mg-plan button:active:not(:disabled){transform:scale(.98)}",
    ".mg-plan.best button::after{content:'';position:absolute;top:0;left:0;width:35%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);animation:mgShine 2.8s ease-in-out infinite}",
    ".mg-tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}",
    ".mg-tool{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border:1px solid var(--line);border-radius:14px;background:var(--surface-2,#faf7f0);text-decoration:none;color:inherit;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}",
    ".mg-tool:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:0 14px 26px -18px rgba(0,0,0,.5)}",
    ".mg-ti{font-size:21px;line-height:1.1}",
    ".mg-tool b{display:block;font:700 13px/1.2 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-900)}",
    ".mg-tool small{display:block;margin-top:3px;font:400 11.5px/1.35 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600)}",
    ".mg-all{display:inline-block;margin-top:10px;color:var(--accent);font:700 12.5px/1 'IBM Plex Sans',system-ui,sans-serif;text-decoration:none}",
    ".mg-conf{position:fixed;top:-14px;width:8px;height:14px;border-radius:2px;pointer-events:none;z-index:140;animation:mgFall 1.9s cubic-bezier(.3,.6,.4,1) forwards}",
    "@media (prefers-reduced-motion:reduce){.mg-first .mg-sec,.mg-hero,.mg-hero::after,.mg-plan.best button::after{animation:none!important}.mg-conf{display:none}.mg-bar i{transition:none}.mg-plan,.mg-chip,.mg-tool{transition:none}}",
  ].join("\n");
  document.head.appendChild(css2);

  var GRACE = 2 * 864e5;
  var FEATS = [
    { n: "Read & zoom", l: 0 }, { n: "Search", l: 0 }, { n: "Text box", l: 0 }, { n: "Highlighter", l: 0 }, { n: "Download a file", l: 0 },
    { n: "Pen", l: 1 }, { n: "Eraser", l: 1 }, { n: "Cover-up", l: 1 }, { n: "No ads", l: 1 },
    { n: "Shapes", l: 2 }, { n: "Insert image", l: 2 }, { n: "Page tools", l: 2 }, { n: "Merge PDFs", l: 2 }, { n: "Extract pages", l: 2 }, { n: "Images to PDF", l: 2 },
    { n: "Download all", l: 3 }, { n: "PDF to images", l: 3 }, { n: "Watermark", l: 3 }, { n: "Page numbers", l: 3 }, { n: "Every new feature", l: 3 },
  ];
  var PERKS = {
    ember: ["Pen, eraser and cover-up", "No ads"],
    beacon: ["Everything in Ember", "Shapes and insert images", "Page tools: rotate, reorder, layout", "Merge, split, images to PDF"],
    aurora: ["Everything in Beacon", "Download all at once", "Watermark and page numbers", "PDF to images", "Every new Pro feature"],
    lifetime: ["Everything in Aurora", "One payment, no renewals"],
  };
  var MORE = [
    { i: "✏️", n: "Whiteboard", d: "A clean digital whiteboard for working through problems", u: "/tools/whiteboard/" },
    { i: "🗂️", n: "Paper Workshop", d: "Merge, split and compress PDFs", u: "/tools/paper-workshop/" },
    { i: "✒️", n: "Quill & Proof", d: "Typed notes to handwriting, with LaTeX", u: "/tools/quill-and-proof/" },
    { i: "📖", n: "WordSpark", d: "English dictionary and daily words", u: "/tools/apps/english-dictionary/" },
    { i: "🇯🇵", n: "Nihongo N5", d: "JLPT N5 flashcards, kanji and quizzes", u: "/tools/apps/japanese-n5/" },
    { i: "💸", n: "Kharcha", d: "Daily earnings and expenses tracker", u: "/tools/apps/kharcha-tracker/" },
    { i: "🌿", n: "Leafy", d: "Plant-care schedules and notes", u: "/tools/apps/leafy/" },
  ];
  function fmt(ms) { return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  function chipsHtml(cur) {
    return FEATS.map(function (f) {
      var on = f.l <= cur;
      return '<span class="mg-chip ' + (on ? "on" : "off") + '">' + (on ? "✓" : "🔒") + " " + f.n + (on ? "" : " <em>" + TIERS[f.l - 1].name + "</em>") + "</span>";
    }).join("");
  }
  function toolsHtml() {
    return '<div class="mg-tools">' + MORE.map(function (t) {
      return '<a class="mg-tool" href="' + t.u + '" target="_blank" rel="noopener"><span class="mg-ti">' + t.i + "</span><span><b>" + t.n.replace(/&/g, "&amp;") + "</b><small>" + t.d + "</small></span></a>";
    }).join("") + '</div><a class="mg-all" href="/tools/" target="_blank" rel="noopener">See all tools →</a>';
  }
  function burst() {
    if (!dlg || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var cols = ["#e5181c", "#f97316", "#facc15", "#16a34a", "#2563eb", "#9333ea"];
    for (var k = 0; k < 36; k++) {
      var p = document.createElement("span"); p.className = "mg-conf";
      p.style.left = (Math.random() * 100) + "vw"; p.style.background = cols[k % cols.length];
      p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px"); p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.animationDelay = (Math.random() * 0.5) + "s"; p.style.animationDuration = (1.5 + Math.random() * 1.2) + "s";
      dlg.appendChild(p);
      (function (n) { setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 3600); })(p);
    }
  }
  function renderPlans() {
    if (!dlg) return;
    if (!dlg._r) { dlg._r = 1; dlg.classList.add("mg-first"); setTimeout(function () { if (dlg) dlg.classList.remove("mg-first"); }, 1600); }
    var card = dlg.querySelector(".mg-card");
    var P = CFG.prices || {};
    var who = user ? (user.email || user.displayName || "your Google account") : "";
    var cur = tierOf(ent), n = 0;
    function sec(html, h) { return '<div class="mg-sec" style="--i:' + (n++) + '">' + (h ? "<h3>" + h + "</h3>" : "") + html + "</div>"; }
    var cards = TIERS.filter(function (t) { return t.level > cur; }).map(function (t) {
      var best = t.id === "beacon";
      return '<div class="mg-plan' + (best ? " best" : "") + '"><span class="mg-name">' + t.name + (best ? " · most popular" : "") + "</span>"
        + '<span class="mg-price">' + ((P[t.id] || "") + (P[t.id] ? ' <small style="font:500 13px/1 system-ui,sans-serif">/ month</small>' : "")) + "</span>"
        + "<ul>" + PERKS[t.id].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"
        + '<button data-act="' + t.id + '">' + (cur ? "Upgrade to " : (ent && ent.trialUsed ? "Get " : "Try 7 days free · ")) + t.name + "</button></div>";
    }).join("");
    if (cur < 3) {
      cards += '<div class="mg-plan"><span class="mg-name">Aurora Lifetime · pay once</span>'
        + '<span class="mg-price">' + (P.lifetime || "") + (P.lifetime ? ' <small style="font:500 13px/1 system-ui,sans-serif">once</small>' : "") + "</span>"
        + "<ul>" + PERKS.lifetime.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul><button data-act="lifetime">Get Lifetime</button></div>';
    }
    var plansHtml = cards ? '<div class="mg-plans mg-grid">' + cards + "</div>" : "";
    var body;
    if (cur) {
      var life = ent.plan === "lifetime", curT = TIERS[cur - 1];
      var cancelled = ent.status === "cancelled";
      var untilM = untilMs(ent);
      var nextMs = Math.max(untilM - GRACE, Date.now());
      var days = Math.max(0, Math.ceil(((cancelled ? untilM : nextMs) - Date.now()) / 864e5));
      var pct = life ? 100 : Math.round(Math.min(1, Math.max(0.05, 1 - days / 30)) * 100);
      var pill = life ? "Lifetime" : (cancelled ? "Cancelled" : "Active");
      var sub = life ? "Every Pro feature, for good. Thank you for supporting Manaluz."
        : (cancelled ? "No more charges. You keep full access until " + fmt(untilM) + "."
          : "Next charge " + (P[curT.id] ? P[curT.id] + " " : "") + "on " + fmt(nextMs) + ". Cancel any time.");
      var foot = life ? "Yours forever" : (days + (days === 1 ? " day" : " days") + (cancelled ? " of access left" : " until your next charge"));
      var hero = '<div class="mg-hero"><div class="mg-hero-top"><span class="mg-pill">' + pill + '</span><span class="mg-hero-name">' + (life ? "Aurora Lifetime" : curT.name) + "</span></div>"
        + "<p>" + sub + '</p><div class="mg-bar"><i data-w="' + pct + '"></i></div><div class="mg-hero-foot">' + foot + "</div></div>";
      body = "<h2>Your plan</h2>"
        + sec(hero)
        + sec('<div class="mg-feats">' + chipsHtml(cur) + "</div>", "What’s included")
        + (plansHtml ? sec(plansHtml, "Upgrade") : "")
        + (ent.plan === "monthly" && !cancelled ? sec('<p class="mg-sub" style="margin:0"><button class="mg-link" data-act="cancel" style="color:var(--ink-600);background:none;border:none;padding:0;font:inherit;text-decoration:underline;cursor:pointer">Cancel plan</button> (stays active until the end of the month you paid for)</p>') : "");
    } else {
      body = "<h2>Go Pro</h2>"
        + '<p class="mg-sub" style="margin:0">Manaluz is free for reading, highlighting and adding text. Pick a level to unlock more' + (ent && ent.trialUsed ? "" : ", with 7 days free on every monthly plan (one trial per account)") + ". Cancel any time. Payments are handled securely by Razorpay (UPI, cards, netbanking).</p>"
        + sec('<div class="mg-feats">' + chipsHtml(0) + "</div>", "Free today · what you can unlock")
        + sec(plansHtml, "Pick a plan");
    }
    body += sec(toolsHtml(), "More from We The Mind");
    card.innerHTML = '<button class="mg-x" aria-label="Close" data-act="close">×</button>' + body + ownerBar()
      + '<div class="mg-foot"><span>' + (user ? "Signed in as <b>" + who.replace(/</g, "&lt;") + '</b> · <button class="mg-link" data-act="signout">Sign out</button>'
        : "You’ll sign in with Google so your plan works on every computer.") + "</span>"
      + '<a href="' + PLAY + '" target="_blank" rel="noopener">On Android? Get the app on Google Play</a></div>';
    card.querySelectorAll("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem("mg-viewas", b.getAttribute("data-view")); } catch (e) {}
        ent = applyView(realEnt); remember(ent); showAds(!isAdFree(ent)); renderPlans();
        toast("Viewing as: " + b.textContent);
      });
    });
    card.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () { act(b.getAttribute("data-act"), b); });
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      card.querySelectorAll(".mg-bar i[data-w]").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; });
    }); });
  }
  function busy(b, on, label) { if (!b) return; b.disabled = on; if (label) b.textContent = label; }
  function act(what, btn) {
    if (what === "close") return closePlans();
    if (what === "signout") return firebase().then(function (f) { return f.A.signOut(f.auth); });
    if (what === "cancel") {
      if (!confirm("Cancel your plan? It stays active until the end of the month you paid for.")) return;
      return call("cancelMonthly").then(function () { toast("Monthly plan cancelled."); }).catch(function () { toast("Couldn't cancel right now. Please try again."); });
    }
    if (what !== "lifetime" && !TIERS.some(function (t) { return t.id === what; })) return;
    var label = btn.textContent;
    busy(btn, true, "One moment…");
    (user ? Promise.resolve() : (function () { try { sessionStorage.setItem("mg-pending", what); } catch (e) {} return signIn(); })())
      .then(function () { return firebase(); })
      .then(function (f) { if (!f.auth.currentUser) throw new Error("not signed in"); user = f.auth.currentUser; try { sessionStorage.removeItem("mg-pending"); } catch (e) {} })
      .then(function () { return Promise.all([call("createCheckout", { plan: what }), window.Razorpay ? null : loadScript("https://checkout.razorpay.com/v1/checkout.js")]); })
      .then(function (r) {
        var c = r[0];
        var opts = {
          key: c.keyId, name: "Manaluz", description: what === "lifetime" ? "Manaluz Aurora Lifetime" : "Manaluz " + what.charAt(0).toUpperCase() + what.slice(1) + " · monthly",
          image: new URL("icon-192.png", location.href).href,
          prefill: { email: user.email || "", name: user.displayName || "" },
          theme: { color: "#E5181C" },
          modal: { ondismiss: function () { busy(btn, false, label); } },
          handler: function (resp) {
            busy(btn, true, "Confirming…");
            call("confirmPayment", resp)
              .then(function () { toast("Thank you! Pro is unlocked."); burst(); setTimeout(closePlans, 1700); })
              .catch(function () { toast("Payment received - your plan will appear in a minute."); closePlans(); });
          },
        };
        if (c.orderId) { opts.order_id = c.orderId; opts.amount = c.amount; opts.currency = c.currency; }
        else opts.subscription_id = c.subscriptionId;
        new window.Razorpay(opts).open();
      })
      .catch(function (e) {
        busy(btn, false, label);
        try { sessionStorage.removeItem("mg-pending"); } catch (e2) {}
        if (e && /popup-closed|cancelled-popup|not signed in/.test((e.code || "") + e.message)) return;
        toast("Couldn't start the payment. Please try again.");
      });
  }

  /* ---------- owner-only "View as" switch (only ever lowers what the owner sees) ---------- */
  var OWNER = "king.kngr47@gmail.com", realEnt = null;
  function isOwner() { return !!(user && user.email && user.email.toLowerCase() === OWNER); }
  function viewAs() { try { return localStorage.getItem("mg-viewas") || "admin"; } catch (e) { return "admin"; } }
  function applyView(e) {
    if (!isOwner()) return e;
    var v = viewAs(); if (v === "admin") return e;
    if (v === "free") return null;
    var lv = { ember: 1, beacon: 2, aurora: 3 }[v]; if (!lv) return e;
    return { plan: "monthly", tier: lv, tierName: v, active: true, status: "active", trialUsed: true, until: { toMillis: function () { return Date.now() + 30 * 864e5; } } };
  }
  function ownerBar() {
    return "";
    var cur = viewAs(), h = '<div class="mg-foot" style="margin-top:14px;border-top:1px dashed var(--line,#ddd);padding-top:10px"><span><b>Admin: view as</b> </span><span style="display:flex;flex-wrap:wrap;gap:6px">';
    ["admin", "free", "ember", "beacon", "aurora"].forEach(function (k) {
      h += '<button class="mg-link" data-view="' + k + '" style="padding:4px 9px;border-radius:999px;border:1px solid var(--accent);' + (k === cur ? "background:var(--accent);color:#fff" : "") + '">' + (k === "admin" ? "Me (lifetime)" : k.charAt(0).toUpperCase() + k.slice(1)) + "</button>";
    });
    return h + "</span></div>";
  }

  /* ---------- "Spark": feedback from users, collected in the We The Mind response sheet ---------- */
  var FEEDBACK_ENDPOINT = "https://script.google.com/macros/s/AKfycbwoL_5dBwdtdA3F-ZfMZflSqM9JX5EbaOvc17rERA2s2NgthMooCYD4bDMPU4SvJBc/exec";
  var fbDlg = null, fbOpenedAt = 0;
  var fcss = document.createElement("style");
  fcss.textContent = [
    ".mg-spark{display:inline-flex;align-items:center;gap:6px;font-weight:700}",
    ".mg-spark i{font-style:normal;display:inline-block;color:#f59e0b;animation:mgTwinkle 2.8s ease-in-out infinite}",
    "@keyframes mgTwinkle{0%,100%{transform:scale(1) rotate(0)}45%{transform:scale(1.35) rotate(18deg)}60%{transform:scale(.95) rotate(-8deg)}}",
    ".mg-fb h2{display:flex;align-items:center;gap:8px}",
    ".mg-fb .mg-fbsub{margin:0 0 14px;color:var(--ink-600);font-size:13.5px;line-height:1.5}",
    ".mg-kinds{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}",
    ".mg-kind{border:1.5px solid var(--line);background:var(--surface);color:inherit;border-radius:999px;padding:8px 14px;font:700 13px/1 inherit;cursor:pointer;transition:transform .2s cubic-bezier(.2,.9,.3,1.4),border-color .2s,background .2s}",
    ".mg-kind:hover{transform:translateY(-2px);border-color:var(--accent)}",
    ".mg-kind.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--accent);transform:scale(1.05)}",
    ".mg-stars{display:flex;gap:4px;margin:0 0 14px}",
    ".mg-star{background:none;border:none;padding:2px;font-size:28px;line-height:1;cursor:pointer;color:var(--line);transition:transform .25s cubic-bezier(.2,.9,.3,1.6),color .2s}",
    ".mg-star.on{color:#f59e0b}",
    ".mg-star:hover{transform:scale(1.25) rotate(-8deg)}",
    ".mg-star.pop{animation:mgStarPop .4s cubic-bezier(.2,.9,.3,1.6)}",
    "@keyframes mgStarPop{0%{transform:scale(.6)}60%{transform:scale(1.4) rotate(12deg)}100%{transform:scale(1)}}",
    ".mg-fb label{display:block;font:700 12px/1 inherit;letter-spacing:.03em;color:var(--ink-600);margin:0 0 6px;text-transform:uppercase}",
    ".mg-fb textarea,.mg-fb input[type=text],.mg-fb input[type=email]{width:100%;box-sizing:border-box;border:1.5px solid var(--line);border-radius:12px;padding:11px 12px;background:var(--surface);color:inherit;font:inherit;transition:border-color .2s,box-shadow .2s}",
    ".mg-fb textarea{min-height:110px;resize:vertical}",
    ".mg-fb textarea:focus,.mg-fb input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 16%,transparent)}",
    ".mg-fbrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}",
    "@media (max-width:520px){.mg-fbrow{grid-template-columns:1fr}}",
    ".mg-fbchk{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-600);margin:0 0 14px;text-transform:none;letter-spacing:0;font-weight:500}",
    ".mg-fbsend{position:relative;overflow:hidden;width:100%;border:none;border-radius:14px;padding:13px 16px;font:800 15px/1 inherit;color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#f97316));transition:transform .2s,box-shadow .2s,opacity .2s}",
    ".mg-fbsend:hover{transform:translateY(-2px);box-shadow:0 14px 26px -14px var(--accent)}",
    ".mg-fbsend:disabled{opacity:.6;cursor:default;transform:none}",
    ".mg-fberr{color:#dc2626;font-size:13px;min-height:18px;margin:0 0 8px}",
    ".mg-fbdone{text-align:center;padding:26px 8px 12px;animation:mgUp .5s cubic-bezier(.22,1,.36,1) both}",
    ".mg-fbdone svg{width:74px;height:74px}",
    ".mg-fbdone circle{fill:none;stroke:#16a34a;stroke-width:4;stroke-dasharray:176;stroke-dashoffset:176;animation:mgDraw .7s ease forwards}",
    ".mg-fbdone path{fill:none;stroke:#16a34a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:mgDraw .45s .55s ease forwards}",
    "@keyframes mgDraw{to{stroke-dashoffset:0}}",
    "@media (prefers-reduced-motion:reduce){.mg-spark i,.mg-star.pop,.mg-fbdone,.mg-fbdone circle,.mg-fbdone path{animation:none!important;stroke-dashoffset:0!important}}"
  ].join("\n");
  document.head.appendChild(fcss);
  var sparkBtn = el("button", "btn mg-spark", "<i>✦</i><span>Spark</span>");
  sparkBtn.type = "button"; sparkBtn.title = "Share feedback, report a problem or suggest an idea";
  if (actions) actions.insertBefore(sparkBtn, signBtn);
  sparkBtn.addEventListener("click", openFeedback);
  function closeFeedback() { if (!fbDlg) return; var x = fbDlg; fbDlg = null; x.classList.remove("show"); setTimeout(function () { x.remove(); }, 320); }
  function planLabel() {
    var e = realEnt || ent; if (!e || !isAdFree(e)) return "Free";
    return e.plan === "lifetime" ? "Lifetime" : (e.tierName ? e.tierName.charAt(0).toUpperCase() + e.tierName.slice(1) : "Paid");
  }
  function openFeedback() {
    if (fbDlg) return;
    var kind = "Idea", rating = 0;
    fbDlg = el("div", "mg-dlg"); fbDlg.setAttribute("role", "dialog"); fbDlg.setAttribute("aria-modal", "true"); fbDlg.setAttribute("aria-label", "Send feedback");
    var card = el("div", "mg-card mg-fb"); fbDlg.appendChild(card);
    var nm = (user && user.displayName) || "", em = (user && user.email) || "";
    function esc2(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
    card.innerHTML = '<button class="mg-x" aria-label="Close" data-fb="close">×</button>'
      + '<h2><span style="color:#f59e0b">✦</span> Spark</h2>'
      + '<p class="mg-fbsub">Found a bug, missing a feature, or just want to say hi? Tell us. We read every message, and if you leave an email we will write back when it is sorted.</p>'
      + '<div class="mg-kinds" role="group" aria-label="What kind of feedback"></div>'
      + '<label>How is Manaluz working for you?</label><div class="mg-stars" role="group" aria-label="Rating"></div>'
      + '<label for="mg-fb-msg">Your message</label><textarea id="mg-fb-msg" maxlength="1500" placeholder="What happened, or what would make Manaluz better for you?"></textarea>'
      + '<div class="mg-fbrow"><div><label for="mg-fb-name">Name (optional)</label><input id="mg-fb-name" type="text" maxlength="80" value="' + esc2(nm) + '" autocomplete="name"></div>'
      + '<div><label for="mg-fb-mail">Email (to reply)</label><input id="mg-fb-mail" type="email" maxlength="120" value="' + esc2(em) + '" autocomplete="email" placeholder="you@example.com"></div></div>'
      + '<label class="mg-fbchk"><input type="checkbox" id="mg-fb-dev" checked> Include my browser and screen size, so we can reproduce problems</label>'
      + '<div style="position:absolute;left:-9999px" aria-hidden="true"><input type="text" id="mg-fb-hp" tabindex="-1" autocomplete="off"></div>'
      + '<p class="mg-fberr" id="mg-fb-err" role="alert"></p>'
      + '<button class="mg-fbsend" type="button" id="mg-fb-send">Send feedback</button>';
    var kinds = card.querySelector(".mg-kinds");
    [["Bug", "🐞 Problem"], ["Idea", "💡 Idea"], ["Love", "💛 Love it"], ["Question", "❓ Question"]].forEach(function (k) {
      var b = el("button", "mg-kind" + (k[0] === kind ? " on" : ""), k[1]); b.type = "button";
      b.addEventListener("click", function () { kind = k[0]; Array.prototype.forEach.call(kinds.children, function (c) { c.classList.remove("on"); }); b.classList.add("on"); });
      kinds.appendChild(b);
    });
    var stars = card.querySelector(".mg-stars");
    function paint(n) { Array.prototype.forEach.call(stars.children, function (s, i) { s.classList.toggle("on", i < n); }); }
    for (var s = 1; s <= 5; s++) (function (n) {
      var b = el("button", "mg-star", "★"); b.type = "button"; b.setAttribute("aria-label", n + " of 5");
      b.addEventListener("mouseenter", function () { paint(n); });
      b.addEventListener("mouseleave", function () { paint(rating); });
      b.addEventListener("click", function () { rating = rating === n ? 0 : n; paint(rating); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); });
      stars.appendChild(b);
    })(s);
    card.querySelector('[data-fb="close"]').addEventListener("click", closeFeedback);
    fbDlg.addEventListener("click", function (e) { if (e.target === fbDlg) closeFeedback(); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { closeFeedback(); document.removeEventListener("keydown", esc); } });
    document.body.appendChild(fbDlg);
    fbOpenedAt = Date.now();
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (fbDlg) fbDlg.classList.add("show"); }); });
    setTimeout(function () { if (fbDlg) fbDlg.classList.add("show"); }, 50);
    var send = card.querySelector("#mg-fb-send"), err = card.querySelector("#mg-fb-err");
    send.addEventListener("click", function () {
      var msg = card.querySelector("#mg-fb-msg").value.trim(), mail = card.querySelector("#mg-fb-mail").value.trim(), name = card.querySelector("#mg-fb-name").value.trim();
      err.textContent = "";
      if (msg.length < 8) { err.textContent = "Please write a little more so we can help."; card.querySelector("#mg-fb-msg").focus(); return; }
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { err.textContent = "That email looks off. Fix it, or leave it empty."; return; }
      try { var last = +localStorage.getItem("mg-fb-last") || 0; if (Date.now() - last < 30000) { err.textContent = "Thanks, that one just went through. Please wait a moment before sending another."; return; } } catch (e) {}
      var dev = card.querySelector("#mg-fb-dev").checked ? ("\n\nDevice: " + navigator.userAgent + " | screen " + screen.width + "x" + screen.height + " | build " + (document.documentElement.getAttribute("data-build") || "?")) : "";
      var head = "[Manaluz feedback · " + kind + (rating ? " · " + rating + "/5" : "") + " · Plan: " + planLabel() + "]\n";
      var fd = new FormData();
      fd.append("form_name", "Contact Messages");
      fd.append("source_page", "/tools/marginalia/ (Manaluz Spark feedback)");
      fd.append("form_started_at", String(fbOpenedAt));
      fd.append("company_website", card.querySelector("#mg-fb-hp").value);
      fd.append("student_name", name || "Manaluz user");
      fd.append("email", mail);
      fd.append("notes", head + msg + dev);
      send.disabled = true; send.textContent = "Sending…";
      var wait = Math.max(0, 3500 - (Date.now() - fbOpenedAt));
      setTimeout(function () {
        try { fetch(FEEDBACK_ENDPOINT, { method: "POST", mode: "no-cors", body: fd }); } catch (e) {}
        try { localStorage.setItem("mg-fb-last", String(Date.now())); } catch (e) {}
        card.innerHTML = '<button class="mg-x" aria-label="Close" data-fb="close">×</button><div class="mg-fbdone">'
          + '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><path d="M19 33l9 9 17-19"/></svg>'
          + '<h2 style="justify-content:center;margin-top:12px">Thank you!</h2>'
          + '<p class="mg-fbsub" style="margin:0">Your feedback is on its way to us.' + (mail ? " We will email you at <b>" + esc2(mail) + "</b> once it is resolved." : " Add an email next time if you would like a reply.") + '</p></div>';
        card.querySelector('[data-fb="close"]').addEventListener("click", closeFeedback);
        setTimeout(closeFeedback, 3600);
      }, wait);
    });
  }

  /* ---------- who's signed in, and their plan ---------- */
  showAds(!cachedAdFree());                                  // no flash of ads for people who paid
  firebase().then(function (f) {
    f.A.onAuthStateChanged(f.auth, function (u) {
      user = u; syncView();
      signBtn.textContent = u ? "Sign out" : "Sign in";
      if (unsubEnt) { unsubEnt(); unsubEnt = null; }
      if (!u) { ent = null; remember(null); showAds(true); renderPlans(); return; }
      var pend = null; try { pend = sessionStorage.getItem("mg-pending"); sessionStorage.removeItem("mg-pending"); } catch (e) {}
      if (pend) { openPlans(); setTimeout(function () { var b = dlg && dlg.querySelector('[data-act="' + pend + '"]'); if (b) act(pend, b); }, 700); }
      unsubEnt = f.F.onSnapshot(f.F.doc(f.db, "entitlements", u.uid), function (snap) {
        realEnt = snap.exists() ? snap.data() : null; ent = applyView(realEnt);
        remember(ent); showAds(!isAdFree(ent)); renderPlans();
      }, function () { showAds(!cachedAdFree()); });
    });
  }).catch(function () { /* offline or blocked: keep the cached state */ });
})();
