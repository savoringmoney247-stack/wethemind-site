/* We The Mind — Google Analytics (GA4) loader.
   Centralized here so activating analytics site-wide is a ONE-LINE change,
   not an edit to every page.

   To activate:
   1. Go to https://analytics.google.com and create a free GA4 property
      (Admin -> Create Property -> add a Web data stream for wethemind.com).
   2. Copy the Measurement ID it gives you (looks like "G-XXXXXXXXXX").
   3. Paste it below, replacing the placeholder.
   Until you do that, this file intentionally loads nothing — no requests,
   no tracking, no console errors. */
(function () {
  var GA_MEASUREMENT_ID = 'G-P2NRMK4P7E';

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf('XXXX') !== -1) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();
