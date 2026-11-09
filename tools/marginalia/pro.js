/* Manaluz Pro: which features are free and which need Pro.
 *
 * Free:    open and read, zoom, search, select, text box, highlighter, undo/redo, download one file.
 * Ember:   + pen, eraser, cover-up, no ads.
 * Beacon:  + shapes, insert image, page tools (rotate, reorder, layout).
 * Aurora:  + download-all, and every new Pro feature as it arrives.
 *
 * Nothing is locked until window.MARGINALIA_PRO.enforce is true (index.html). Keep it false until
 * the sign-in and purchase flow works on the platform people are on, otherwise paying people
 * would be locked out. Pro status comes from window.__mgPro (set by plans.js after sign-in on the
 * web) or from the Android app, if it provides window.ManaluzNative.isPro() / openPro().
 */
(function () {
  "use strict";
  var CFG = window.MARGINALIA_PRO || {};
  /* The level each feature needs: 1 Ember, 2 Beacon, 3 Aurora. Free: read, search, select, text, highlighter. */
  var NEEDS = CFG.needs || { pen: 1, eraser: 1, cover: 1, shape: 2, image: 2, moreBtn: 2, dlAll: 3 };
  var LEVEL_NAME = ["", "Ember", "Beacon", "Aurora"];
  var PRO_TOOLS = ["pen", "eraser", "cover", "shape", "image"];
  var PRO_IDS = ["moreBtn", "dlAll"];
  var NAMES = { pen: "Pen", eraser: "Eraser", cover: "Cover-up", shape: "Shapes", image: "Insert image", moreBtn: "Page tools", dlAll: "Download all" };

  function isPro() {
    try { if (window.ManaluzNative && typeof window.ManaluzNative.isPro === "function") return !!window.ManaluzNative.isPro(); } catch (e) {}
    return window.__mgPro === true;
  }
  function tier() {
    try { if (window.ManaluzNative && typeof window.ManaluzNative.tier === "function") return +window.ManaluzNative.tier() || 0; } catch (e) {}
    return window.__mgTier || (window.__mgPro === true ? 1 : 0);
  }
  /* Locks apply on the web when enforce is true, and inside the Android app when enforceApp is true
     (the app tells the page which level the Google Play account owns). */
  function active() { return !!CFG.enforce || (!!CFG.enforceApp && !!window.ManaluzNative); }
  function lockedKey(key) { return active() && tier() < (NEEDS[key] || 0); }

  function toast(msg) {
    var t = document.getElementById("toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 3600);
  }
  function upsell(what) {
    var opened = false;
    try { if (window.ManaluzNative && typeof window.ManaluzNative.openPro === "function") { window.ManaluzNative.openPro(); opened = true; } } catch (e) {}
    if (!opened) {
      var before = !!document.querySelector(".mg-dlg");
      window.dispatchEvent(new Event("mg-open-pro"));
      opened = before || !!document.querySelector(".mg-dlg");
    }
    if (!opened) toast((NAMES[what] || "This") + " needs Manaluz " + LEVEL_NAME[NEEDS[what] || 1] + ".");
  }

  /* clicks on locked buttons never reach the editor */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b) return;
    var tool = b.getAttribute("data-tool");
    var key = (tool && PRO_TOOLS.indexOf(tool) >= 0) ? tool : (PRO_IDS.indexOf(b.id) >= 0 ? b.id : null);
    if (!key || !lockedKey(key)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    upsell(key);
  }, true);

  /* shortcuts and other routes: if a locked tool becomes active, go back to Select */
  function watchStage() {
    var w = document.querySelector(".stage-wrap");
    if (!w || w._mgWatch || !window.MutationObserver) return;
    w._mgWatch = true;
    new MutationObserver(function () {
      var t = w.getAttribute("data-tool");
      if (PRO_TOOLS.indexOf(t) >= 0 && lockedKey(t)) {
        var sel = document.querySelector('.tool-btn[data-tool="select"]');
        if (sel) sel.click();
        upsell(t);
      }
    }).observe(w, { attributes: true, attributeFilter: ["data-tool"] });
  }

  /* small "PRO" tag on locked buttons */
  var css = document.createElement("style");
  css.textContent = ".mg-lockedtag{position:relative}.mg-lockedtag::after{content:attr(data-pro);position:absolute;right:-2px;top:-4px;font:700 8px/1 system-ui,sans-serif;letter-spacing:.06em;"
    + "padding:2px 3px;border-radius:5px;background:var(--accent,#e5181c);color:#fff;pointer-events:none}";
  document.head.appendChild(css);
  function tags() {
    PRO_TOOLS.concat(PRO_IDS).forEach(function (k) {
      var b = PRO_TOOLS.indexOf(k) >= 0 ? document.querySelector('[data-tool="' + k + '"]') : document.getElementById(k);
      if (!b) return;
      b.classList.toggle("mg-lockedtag", lockedKey(k));
      b.setAttribute("data-pro", LEVEL_NAME[NEEDS[k]] || "");
    });
  }
  function refresh() { watchStage(); tags(); }
  window.addEventListener("mg-pro-change", refresh);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh); else refresh();
  setTimeout(refresh, 1500);                        // the download menu is built after load
})();
