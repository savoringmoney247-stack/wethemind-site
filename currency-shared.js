/* ==========================================================================
   We the Mind — shared currency localization
   Detects the visitor's likely currency from their timezone / browser locale
   and converts any USD figure marked up with data-usd (or data-usd-inline)
   into that local currency. Falls back to USD if detection fails.
   Used on: index.html, act_prep.html, amc_archive.html, tifr_prep.html
   (pricing.html has its own, more detailed, region-specific pricing script.)
   ========================================================================== */
(function (global) {
  // Approximate rates (units per 1 USD) — for display conversion only, not billing.
  var RATES = {
    USD: 1, INR: 83, GBP: 0.79, EUR: 0.92, CAD: 1.36, AUD: 1.52, NZD: 1.64,
    AED: 3.67, SAR: 3.75, QAR: 3.64, SGD: 1.34, ZAR: 18.5, NGN: 1550, PHP: 56, MYR: 4.7
  };

  var SYMBOLS = {
    USD: '$', INR: '\u20B9', GBP: '\u00A3', EUR: '\u20AC', CAD: '$', AUD: '$', NZD: '$',
    AED: 'AED ', SAR: 'SAR ', QAR: 'QAR ', SGD: '$', ZAR: 'R', NGN: '\u20A6', PHP: '\u20B1', MYR: 'RM '
  };

  var COUNTRY_CURRENCY = {
    US: 'USD', IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
    AE: 'AED', SA: 'SAR', QA: 'QAR', SG: 'SGD', ZA: 'ZAR', NG: 'NGN', PH: 'PHP', MY: 'MYR',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR',
    FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR', HR: 'EUR'
  };

  var TZ_HINTS = {
    'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Europe/London': 'GBP', 'Australia/Sydney': 'AUD',
    'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD', 'Pacific/Auckland': 'NZD',
    'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR', 'Asia/Singapore': 'SGD',
    'Africa/Johannesburg': 'ZAR', 'Africa/Lagos': 'NGN', 'Asia/Manila': 'PHP',
    'Asia/Kuala_Lumpur': 'MYR', 'America/Toronto': 'CAD', 'America/Vancouver': 'CAD'
  };

  var STORAGE_KEY = 'wtm_currency';

  function detectCurrency() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && RATES[stored]) return stored;
    } catch (e) {}
    try {
      var lang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      var parts = lang.split('-');
      var region = parts.length > 1 ? parts[1].toUpperCase() : '';
      if (region && COUNTRY_CURRENCY[region]) return COUNTRY_CURRENCY[region];
    } catch (e) {}
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (TZ_HINTS[tz]) return TZ_HINTS[tz];
      if (tz.indexOf('Europe/') === 0) return 'EUR';
      if (tz.indexOf('America/') === 0) return 'USD';
    } catch (e) {}
    return 'USD';
  }

  function niceRound(amount) {
    if (amount >= 1000) return Math.round(amount / 10) * 10;
    if (amount >= 100) return Math.round(amount / 5) * 5;
    if (amount >= 20) return Math.round(amount);
    return Math.round(amount * 2) / 2;
  }

  function formatMoney(usdAmount, currency) {
    var rate = RATES[currency] || 1;
    var rounded = usdAmount === 0 ? 0 : niceRound(usdAmount * rate);
    try {
      return new Intl.NumberFormat('en', {
        style: 'currency', currency: currency,
        minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
        maximumFractionDigits: rounded % 1 === 0 ? 0 : 2
      }).format(rounded);
    } catch (e) {
      return (SYMBOLS[currency] || currency + ' ') + rounded;
    }
  }

  function localize() {
    var currency = detectCurrency();

    document.querySelectorAll('[data-usd]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (!isNaN(usd)) el.textContent = formatMoney(usd, currency);
    });

    document.querySelectorAll('[data-usd-inline]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd-inline'));
      if (isNaN(usd)) return;
      var label = el.getAttribute('data-usd-label') || '';
      el.textContent = label + ' (' + formatMoney(usd, currency) + ')';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', localize);
  } else {
    localize();
  }

  global.WTMCurrency = { detectCurrency: detectCurrency, formatMoney: formatMoney };
})(window);
