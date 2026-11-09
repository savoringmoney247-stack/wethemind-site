/* Manaluz PDF Tools: merge, extract pages, images to PDF, PDF to images, watermark, page numbers.
 * Works on files you pick, separate from the document open in the editor. Everything runs on the
 * device; nothing is uploaded. Levels are checked through pro.js (window.MGPro). */
(function () {
  "use strict";
  var css = document.createElement("style");
  css.textContent = [
    ".tl-dlg{position:fixed;inset:0;z-index:118;display:grid;place-items:center;padding:16px;background:rgba(20,12,10,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}",
    ".tl-card{position:relative;width:min(560px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:var(--surface,#fff);color:var(--ink-900,#1d1a17);border-radius:22px;border:1px solid var(--line,#ddd);padding:22px 20px 18px;box-shadow:0 40px 80px -30px rgba(0,0,0,.5)}",
    ".tl-card h2{margin:0 0 4px;font:700 21px/1.2 'Fraunces',serif}",
    ".tl-card p.tl-sub{margin:0 0 14px;color:var(--ink-600,#666);font:400 13px/1.5 'IBM Plex Sans',system-ui,sans-serif}",
    ".tl-grid{display:grid;gap:10px;grid-template-columns:1fr 1fr}",
    "@media (max-width:520px){.tl-grid{grid-template-columns:1fr}}",
    ".tl-item{display:flex;flex-direction:column;gap:3px;text-align:left;border:1.5px solid var(--line,#ddd);background:var(--surface-2,#faf7f0);color:inherit;border-radius:14px;padding:12px 14px;cursor:pointer;font:inherit}",
    ".tl-item:hover{border-color:var(--accent,#e5181c)}",
    ".tl-item b{font:700 14px/1.2 'IBM Plex Sans',system-ui,sans-serif}",
    ".tl-item span{font:400 12px/1.4 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600,#666)}",
    ".tl-item i{font:700 9px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#e5181c);font-style:normal}",
    ".tl-x{position:absolute;right:12px;top:12px;width:32px;height:32px;border-radius:50%;border:none;background:transparent;color:var(--ink-400,#999);font-size:20px;cursor:pointer}",
    ".tl-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}",
    ".tl-row input[type=text]{flex:1 1 160px;border:1px solid var(--line,#ccc);border-radius:10px;padding:10px 12px;font:inherit;background:var(--surface,#fff);color:inherit}",
    ".tl-go{border:none;border-radius:12px;padding:11px 16px;cursor:pointer;font:700 13.5px/1 'IBM Plex Sans',system-ui,sans-serif;background:var(--ink-900,#222);color:var(--paper,#fff)}",
    ".tl-go:disabled{opacity:.55;cursor:wait}",
    ".tl-back{border:none;background:none;color:var(--accent,#e5181c);font:700 13px/1 system-ui,sans-serif;cursor:pointer;padding:0 0 10px}",
    ".tl-msg{margin-top:10px;font:500 12.5px/1.4 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink-600,#666)}",
  ].join("");
  document.head.appendChild(css);

  function toast(msg) {
    var t = document.getElementById("toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 4200);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function allow(key) { return !window.MGPro || window.MGPro.allow(key); }

  function lib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    return new Promise(function (ok, fail) {
      var s = document.createElement("script"); s.src = "pdf-lib.min.js";
      s.onload = function () { ok(window.PDFLib); }; s.onerror = fail; document.head.appendChild(s);
    });
  }
  function save(bytes, name, type) {
    var url = URL.createObjectURL(new Blob([bytes], { type: type || "application/pdf" }));
    var a = document.createElement("a"); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }
  function pick(accept, multiple) {
    return new Promise(function (ok) {
      var i = document.createElement("input"); i.type = "file"; i.accept = accept; i.multiple = !!multiple;
      i.style.display = "none"; document.body.appendChild(i);
      i.onchange = function () { var f = Array.prototype.slice.call(i.files || []); i.remove(); ok(f); };
      i.click();
    });
  }
  function buf(f) { return f.arrayBuffer(); }
  function base(f) { return (f.name || "document").replace(/\.[^.]+$/, ""); }
  function parseRange(text, total) {
    var out = [], seen = {};
    String(text || "").split(",").forEach(function (part) {
      part = part.trim(); if (!part) return;
      var m = /^(\d+)\s*-\s*(\d+)$/.exec(part), a, b;
      if (m) { a = +m[1]; b = +m[2]; } else if (/^\d+$/.test(part)) { a = b = +part; } else return;
      if (a > b) { var t = a; a = b; b = t; }
      for (var p = Math.max(1, a); p <= Math.min(total, b); p++) if (!seen[p]) { seen[p] = 1; out.push(p - 1); }
    });
    return out;
  }

  /* ---------- the tools ---------- */
  var TOOLS = [
    { id: "merge", need: "merge", name: "Merge PDFs", lvl: "Beacon", desc: "Join several PDFs into one.",
      run: function (ui) {
        return pick("application/pdf", true).then(function (files) {
          if (files.length < 2) { ui.msg("Pick at least two PDFs."); return; }
          ui.msg("Merging…");
          return lib().then(function (L) {
            return L.PDFDocument.create().then(function (out) {
              return files.reduce(function (p, f) {
                return p.then(function () { return buf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); })
                  .then(function (d) { return out.copyPages(d, d.getPageIndices()); })
                  .then(function (pgs) { pgs.forEach(function (pg) { out.addPage(pg); }); }); });
              }, Promise.resolve()).then(function () { return out.save(); });
            });
          }).then(function (bytes) { save(bytes, "merged.pdf"); ui.msg("Done: merged.pdf saved."); });
        });
      } },
    { id: "extract", need: "split", name: "Extract pages", lvl: "Beacon", desc: "Keep only the pages you choose, e.g. 1-3, 7.", input: "Pages, e.g. 1-3, 7",
      run: function (ui, text) {
        return pick("application/pdf", false).then(function (files) {
          var f = files[0]; if (!f) return;
          ui.msg("Working…");
          return lib().then(function (L) {
            return buf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); }).then(function (src) {
              var idx = parseRange(text, src.getPageCount());
              if (!idx.length) { ui.msg("No valid pages in that range (this file has " + src.getPageCount() + ")."); return; }
              return L.PDFDocument.create().then(function (out) {
                return out.copyPages(src, idx).then(function (pgs) { pgs.forEach(function (pg) { out.addPage(pg); }); return out.save(); });
              }).then(function (bytes) { save(bytes, base(f) + "-pages.pdf"); ui.msg("Done: " + idx.length + " page(s) saved."); });
            });
          });
        });
      } },
    { id: "img2pdf", need: "img2pdf", name: "Images to PDF", lvl: "Beacon", desc: "Turn photos or scans (JPG, PNG) into one PDF.",
      run: function (ui) {
        return pick("image/jpeg,image/png", true).then(function (files) {
          if (!files.length) return;
          ui.msg("Building the PDF…");
          return lib().then(function (L) {
            return L.PDFDocument.create().then(function (out) {
              return files.reduce(function (p, f) {
                return p.then(function () { return buf(f).then(function (b) { return /png/i.test(f.type) ? out.embedPng(b) : out.embedJpg(b); })
                  .then(function (img) {
                    var s = Math.min(1, 595 / img.width, 842 / img.height);
                    var w = img.width * s, h = img.height * s, pg = out.addPage([w, h]);
                    pg.drawImage(img, { x: 0, y: 0, width: w, height: h });
                  }); });
              }, Promise.resolve()).then(function () { return out.save(); });
            });
          }).then(function (bytes) { save(bytes, "images.pdf"); ui.msg("Done: images.pdf saved."); });
        });
      } },
    { id: "pdf2img", need: "pdf2img", name: "PDF to images", lvl: "Aurora", desc: "Save every page as a PNG picture (up to 30 pages).",
      run: function (ui) {
        return pick("application/pdf", false).then(function (files) {
          var f = files[0]; if (!f) return;
          ui.msg("Rendering…");
          return buf(f).then(function (b) { return window.pdfjsLib.getDocument({ data: new Uint8Array(b), isEvalSupported: false }).promise; }).then(function (doc) {
            var n = Math.min(doc.numPages, 30), i = 1;
            function next() {
              if (i > n) { ui.msg("Done: " + n + " image(s) saved."); return; }
              return doc.getPage(i).then(function (pg) {
                var vp = pg.getViewport({ scale: 2 }), c = document.createElement("canvas");
                c.width = vp.width; c.height = vp.height;
                return pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise.then(function () {
                  return new Promise(function (ok) { c.toBlob(function (bl) { bl.arrayBuffer().then(function (ab) { save(ab, base(f) + "-page" + i + ".png", "image/png"); ok(); }); }, "image/png"); });
                });
              }).then(function () { ui.msg("Saved page " + i + " of " + n + "…"); i++; return new Promise(function (r) { setTimeout(r, 350); }).then(next); });
            }
            return next();
          });
        });
      } },
    { id: "watermark", need: "watermark", name: "Add watermark", lvl: "Aurora", desc: "Stamp text across every page.", input: "Watermark text, e.g. CONFIDENTIAL",
      run: function (ui, text) {
        text = (text || "").trim(); if (!text) { ui.msg("Type the watermark text first."); return; }
        return pick("application/pdf", false).then(function (files) {
          var f = files[0]; if (!f) return;
          ui.msg("Working…");
          return lib().then(function (L) {
            return buf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); }).then(function (d) {
              return d.embedFont(L.StandardFonts.HelveticaBold).then(function (font) {
                d.getPages().forEach(function (pg) {
                  var w = pg.getWidth(), h = pg.getHeight(), size = Math.min(w, h) / Math.max(6, text.length * 0.6);
                  size = Math.max(24, Math.min(90, size));
                  var tw = font.widthOfTextAtSize(text, size);
                  pg.drawText(text, { x: w / 2 - tw / 2 * Math.cos(Math.PI / 4), y: h / 2 - tw / 2 * Math.sin(Math.PI / 4), size: size, font: font, color: L.rgb(0.6, 0.6, 0.6), opacity: 0.3, rotate: L.degrees(45) });
                });
                return d.save();
              });
            });
          }).then(function (bytes) { save(bytes, base(f) + "-watermarked.pdf"); ui.msg("Done: watermark added."); });
        });
      } },
    { id: "pagenum", need: "pagenum", name: "Page numbers", lvl: "Aurora", desc: "Add “1 / 12” at the bottom of every page.",
      run: function (ui) {
        return pick("application/pdf", false).then(function (files) {
          var f = files[0]; if (!f) return;
          ui.msg("Working…");
          return lib().then(function (L) {
            return buf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); }).then(function (d) {
              return d.embedFont(L.StandardFonts.Helvetica).then(function (font) {
                var pages = d.getPages(), n = pages.length;
                pages.forEach(function (pg, i) {
                  var label = (i + 1) + " / " + n, w = font.widthOfTextAtSize(label, 10);
                  pg.drawText(label, { x: pg.getWidth() / 2 - w / 2, y: 18, size: 10, font: font, color: L.rgb(0.3, 0.3, 0.3) });
                });
                return d.save();
              });
            });
          }).then(function (bytes) { save(bytes, base(f) + "-numbered.pdf"); ui.msg("Done: page numbers added."); });
        });
      } },
  ];

  /* ---------- dialog ---------- */
  var dlg = null;
  function close() { if (dlg) { dlg.remove(); dlg = null; } }
  function open() {
    if (dlg) return;
    dlg = el("div", "tl-dlg"); dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-label", "PDF tools");
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    document.addEventListener("keydown", function esc(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); } });
    document.body.appendChild(dlg);
    home();
  }
  function home() {
    var card = el("div", "tl-card");
    card.innerHTML = '<button class="tl-x" aria-label="Close">×</button><h2>PDF tools</h2><p class="tl-sub">Work on any PDF without opening it in the editor. Files stay on your device.</p>'
      + '<div class="tl-grid">' + TOOLS.map(function (t) { return '<button class="tl-item" data-id="' + t.id + '"><i>' + t.lvl + '</i><b>' + t.name + '</b><span>' + t.desc + '</span></button>'; }).join("") + '</div>';
    dlg.innerHTML = ""; dlg.appendChild(card);
    card.querySelector(".tl-x").onclick = close;
    card.querySelectorAll(".tl-item").forEach(function (b) { b.onclick = function () { detail(TOOLS.filter(function (t) { return t.id === b.getAttribute("data-id"); })[0]); }; });
  }
  function detail(t) {
    if (!allow(t.need)) return;
    var card = el("div", "tl-card");
    card.innerHTML = '<button class="tl-x" aria-label="Close">×</button><button class="tl-back">‹ All tools</button><h2>' + t.name + '</h2><p class="tl-sub">' + t.desc + '</p>'
      + '<div class="tl-row">' + (t.input ? '<input type="text" placeholder="' + t.input + '">' : "") + '<button class="tl-go">Choose file' + (t.id === "merge" || t.id === "img2pdf" ? "s" : "") + '</button></div><div class="tl-msg"></div>';
    dlg.innerHTML = ""; dlg.appendChild(card);
    var msg = card.querySelector(".tl-msg"), go = card.querySelector(".tl-go"), inp = card.querySelector("input");
    card.querySelector(".tl-x").onclick = close; card.querySelector(".tl-back").onclick = home;
    go.onclick = function () {
      if (!allow(t.need)) return;
      go.disabled = true;
      Promise.resolve(t.run({ msg: function (s) { msg.textContent = s; } }, inp ? inp.value : "")).catch(function (e) {
        msg.textContent = "Sorry, that file couldn't be processed. It may be damaged or locked.";
      }).then(function () { go.disabled = false; });
    };
  }

  /* header button */
  var actions = document.querySelector(".hdr-actions");
  if (actions) {
    var st = document.createElement("style");
    st.textContent = ".mg-toolsbtn svg{width:16px;height:16px;flex:none;transition:transform .5s cubic-bezier(.34,1.56,.64,1)}"
      + ".mg-toolsbtn:hover svg{transform:rotate(90deg) scale(1.12)}"
      + ".mg-toolsbtn:active svg{transform:rotate(180deg) scale(.9)}"
      + ".mg-toolsbtn{transition:transform .18s ease,box-shadow .25s ease}.mg-toolsbtn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(229,24,28,.18)}"
      + ".mg-toolsbtn:active{transform:scale(.94)}"
      + "@keyframes mgToolsHint{0%,88%,100%{transform:rotate(0)}92%{transform:rotate(-14deg)}96%{transform:rotate(12deg)}}"
      + ".mg-toolsbtn svg{animation:mgToolsHint 7s ease-in-out 3s infinite}"
      + "@media (prefers-reduced-motion:reduce){.mg-toolsbtn,.mg-toolsbtn svg{animation:none!important;transition:none!important}}";
    document.head.appendChild(st);
    var b = el("button", "btn mg-toolsbtn", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg><span>Tools</span>'); b.type = "button"; b.title = "Tools: merge, extract pages, images to PDF and more"; b.setAttribute("aria-label", "Tools");
    actions.insertBefore(b, actions.firstChild); b.addEventListener("click", open);
  }
})();
