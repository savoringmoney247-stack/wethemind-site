/* We The Mind — soft "click" sound for buttons and clickable cards.
   Synthesized on the fly (no audio file to host/load) and played on the
   first pointerdown/click of any button, .btn-style link, or clickable
   card/tab. Silently does nothing if the browser blocks audio before a
   user gesture, or has no Web Audio support. */
(function () {
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  var ctx = null;

  function play() {
    try {
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) { /* audio is a nice-to-have, never block the click */ }
  }

  var SELECTOR = 'button, a.btn, [class*="btn"], .tab-btn, .offer-card, ' +
    '.vertical-card, .board-card, .price-card, .sat-card, .topic-chip, ' +
    '.cta-btn, .whatsapp-channel-cta, .whatsapp-fab';

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest(SELECTOR) : null;
    if (el) play();
  }, true);
})();
