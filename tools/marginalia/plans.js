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
  /* owner-only "View as" switch in the header (hidden for everyone else) */
  var viewSel = el("select", "btn", "");
  viewSel.title = "Admin: view the tool as another kind of user"; viewSel.style.display = "none";
  [["admin", "View as: Me"], ["free", "View as: Free"], ["ember", "View as: Ember"], ["beacon", "View as: Beacon"], ["aurora", "View as: Aurora"]].forEach(function (o) {
    var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; viewSel.appendChild(op);
  });
  if (actions) actions.insertBefore(viewSel, signBtn);
  function syncView() { viewSel.style.display = isOwner() ? "" : "none"; viewSel.value = viewAs(); }
  viewSel.addEventListener("change", function () {
    if (!isOwner()) return;
    try { localStorage.setItem("mg-viewas", viewSel.value); } catch (e) {}
    ent = applyView(realEnt); remember(ent); showAds(!isAdFree(ent)); renderPlans();
    toast("Viewing as: " + viewSel.options[viewSel.selectedIndex].text.replace("View as: ", ""));
  });
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
