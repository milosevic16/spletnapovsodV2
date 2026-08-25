/* Visit note for the per-lead demo pages (/nastanitve/<hash>/): one
 * cookie-free, storage-free submission per page load, disclosed in each
 * page's footer small print (details at /zasebnost#piskotki).
 *
 * The note goes DIRECTLY from the visitor's browser to Web3Forms — the same
 * proven path the site's contact form uses. Web3Forms 403s submissions from
 * datacenter IPs, so a Netlify-function relay is impossible (measured,
 * avgust 2026; the relay was built, diagnosed and removed). The access key
 * is the public-by-design client key: the repo holds only the placeholder
 * below, and scripts/postbuild.mjs injects the real value from
 * VITE_WEB3FORMS_KEY into the dist copy at build time. A keyless build
 * ships a beacon that stays dark.
 *
 * Sent only after a real interaction (pointer, scroll, key, touch), or
 * after 12 s in a visible tab, so link-preview crawlers mostly fail the
 * gate; the rest is Web3Forms' own spam filtering. Skips localhost, file:
 * and framed views (the site's own preview overlay frames demo pages; a
 * framed view is not a prospect opening their link). */
(function () {
  'use strict';
  var KEY = '__VITE_WEB3FORMS_KEY__';
  if (KEY.indexOf('__') === 0) return;
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return;
  if (window.top !== window.self) return;
  if (!window.fetch) return;

  var EVENTS = ['pointerdown', 'pointermove', 'scroll', 'keydown', 'touchstart'];
  var sent = false;

  function send() {
    if (sent) return;
    sent = true;
    EVENTS.forEach(function (name) { removeEventListener(name, send, true); });
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          access_key: KEY,
          from_name: 'SpletnaPovsod demo',
          subject: 'Demo odprt: ' + document.title,
          Stran: document.title,
          Povezava: location.href,
          'Casovni pas': tz,
          Brskalnik: navigator.userAgent || '',
          Zaslon: screen.width + 'x' + screen.height,
          Jezik: navigator.language || '',
          Vir: document.referrer || 'neposredno'
        })
      }).catch(function () { /* a lost note must never break the page */ });
    } catch (err) { /* ditto */ }
  }

  EVENTS.forEach(function (name) { addEventListener(name, send, true); });
  setTimeout(function () {
    if (document.visibilityState === 'visible') send();
  }, 12000);
})();
