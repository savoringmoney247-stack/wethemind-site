/* Marginalia on computers: free with ads, or "Remove ads" with a Lifetime or Monthly plan.
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
  function cachedAdFree() {
    try { var v = localStorage.getItem(CACHE_KEY); return v === "lifetime" || (+v > Date.now()); } catch (e) { return false; }
  }
  function remember(d) {
    try {
      if (isAdFree(d)) localStorage.setItem(CACHE_KEY, d.plan === "lifetime" ? "lifetime" : String(untilMs(d)));
      else localStorage.removeItem(CACHE_KEY);
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
  bar.innerHTML = '<span class="mg-adtag">Ad</span><ins class="adsbygoogle mg-adslot"></ins><button type="button" class="mg-noads">Remove ads</button>';
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
    proBtn.classList.toggle("on", !wanted);                // the button reflects the plan, not the ad
    proBtn.textContent = wanted ? "Remove ads" : "Ad-free ✓";
  }

  /* ---------- header button ---------- */
  var proBtn = el("button", "btn mg-probtn", "Remove ads");
  proBtn.type = "button"; proBtn.title = "Remove ads with a Lifetime or Monthly plan";
  var actions = document.querySelector(".hdr-actions");
  if (actions) actions.insertBefore(proBtn, actions.firstChild);
  proBtn.addEventListener("click", openPlans);

  /* ---------- plans dialog ---------- */
  var dlg = null;
  function closePlans() { if (!dlg) return; var d = dlg; dlg = null; d.classList.remove("show"); setTimeout(function () { d.remove(); }, 320); }
  function openPlans() {
    if (dlg) return;
    dlg = el("div", "mg-dlg"); dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-label", "Remove ads");
    var card = el("div", "mg-card");
    dlg.appendChild(card);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closePlans(); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { closePlans(); document.removeEventListener("keydown", esc); } });
    document.body.appendChild(dlg);
    renderPlans();
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (dlg) dlg.classList.add("show"); }); });
    setTimeout(function () { if (dlg) dlg.classList.add("show"); }, 50);
  }
  function renderPlans() {
    if (!dlg) return;
    var card = dlg.querySelector(".mg-card");
    var P = CFG.prices || {};
    var who = user ? (user.email || user.displayName || "your Google account") : "";
    var body;
    if (isAdFree(ent)) {
      var line = ent.plan === "lifetime" ? "Lifetime plan: ad-free for good."
        : (ent.status === "cancelled" ? "Monthly plan, cancelled: ad-free until " : "Monthly plan: renews on ")
          + new Date(untilMs(ent)).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) + ".";
      body = '<h2>You\'re ad-free</h2><p class="mg-sub">Thank you for supporting Marginalia.</p>'
        + '<div class="mg-status">✓ ' + line + '</div>'
        + (ent.plan === "monthly" && ent.status !== "cancelled" ? '<p class="mg-sub" style="margin-top:12px"><button class="mg-link" data-act="cancel" style="color:var(--ink-600);background:none;border:none;padding:0;font:inherit;text-decoration:underline;cursor:pointer">Cancel monthly plan</button> (stays ad-free until the end of the month you paid for)</p>' : "");
    } else {
      body = '<h2>Remove ads</h2>'
        + '<p class="mg-sub">Marginalia is free with ads. Choose a plan to use it ad-free on all your computers. Payments are handled securely by Razorpay (UPI, cards, netbanking).</p>'
        + '<div class="mg-plans">'
        + '<div class="mg-plan best"><span class="mg-name">Lifetime</span><span class="mg-price">' + (P.lifetime || "") + '</span><span class="mg-note">Pay once, ad-free forever.</span><button data-act="lifetime">Get lifetime</button></div>'
        + '<div class="mg-plan"><span class="mg-name">Monthly</span><span class="mg-price">' + (P.monthly || "") + '</span><span class="mg-note">Ad-free while subscribed. Cancel anytime.</span><button data-act="monthly">Start monthly</button></div>'
        + '</div>';
    }
    card.innerHTML = '<button class="mg-x" aria-label="Close" data-act="close">×</button>' + body
      + '<div class="mg-foot"><span>' + (user ? 'Signed in as <b>' + who.replace(/</g, "&lt;") + '</b> · <button class="mg-link" data-act="signout">Sign out</button>'
        : 'You\'ll sign in with Google so your plan works on every computer.') + '</span>'
      + '<a href="' + PLAY + '" target="_blank" rel="noopener">On Android? Get the app on Google Play</a></div>';
    card.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () { act(b.getAttribute("data-act"), b); });
    });
  }
  function busy(b, on, label) { if (!b) return; b.disabled = on; if (label) b.textContent = label; }
  function act(what, btn) {
    if (what === "close") return closePlans();
    if (what === "signout") return firebase().then(function (f) { return f.A.signOut(f.auth); });
    if (what === "cancel") {
      if (!confirm("Cancel your monthly plan? You stay ad-free until the end of the month you paid for.")) return;
      return call("cancelMonthly").then(function () { toast("Monthly plan cancelled."); }).catch(function () { toast("Couldn't cancel right now. Please try again."); });
    }
    if (what !== "lifetime" && what !== "monthly") return;
    var label = btn.textContent;
    busy(btn, true, "One moment…");
    (user ? Promise.resolve() : signIn())
      .then(function () { return firebase(); })
      .then(function (f) { if (!f.auth.currentUser) throw new Error("not signed in"); user = f.auth.currentUser; })
      .then(function () { return Promise.all([call("createCheckout", { plan: what }), window.Razorpay ? null : loadScript("https://checkout.razorpay.com/v1/checkout.js")]); })
      .then(function (r) {
        var c = r[0];
        var opts = {
          key: c.keyId, name: "Marginalia", description: what === "lifetime" ? "Lifetime · no ads" : "Monthly · no ads",
          image: new URL("icon-192.png", location.href).href,
          prefill: { email: user.email || "", name: user.displayName || "" },
          theme: { color: "#E5181C" },
          modal: { ondismiss: function () { busy(btn, false, label); } },
          handler: function (resp) {
            busy(btn, true, "Confirming…");
            call("confirmPayment", resp)
              .then(function () { toast("Thank you! Ads are gone."); closePlans(); })
              .catch(function () { toast("Payment received - your plan will appear in a minute."); closePlans(); });
          },
        };
        if (c.orderId) { opts.order_id = c.orderId; opts.amount = c.amount; opts.currency = c.currency; }
        else opts.subscription_id = c.subscriptionId;
        new window.Razorpay(opts).open();
      })
      .catch(function (e) {
        busy(btn, false, label);
        if (e && /popup-closed|cancelled-popup|not signed in/.test((e.code || "") + e.message)) return;
        toast("Couldn't start the payment. Please try again.");
      });
  }

  /* ---------- who's signed in, and their plan ---------- */
  showAds(!cachedAdFree());                                  // no flash of ads for people who paid
  firebase().then(function (f) {
    f.A.onAuthStateChanged(f.auth, function (u) {
      user = u;
      if (unsubEnt) { unsubEnt(); unsubEnt = null; }
      if (!u) { ent = null; remember(null); showAds(true); renderPlans(); return; }
      unsubEnt = f.F.onSnapshot(f.F.doc(f.db, "entitlements", u.uid), function (snap) {
        ent = snap.exists() ? snap.data() : null;
        remember(ent); showAds(!isAdFree(ent)); renderPlans();
      }, function () { showAds(!cachedAdFree()); });
    });
  }).catch(function () { /* offline or blocked: keep the cached state */ });
})();
