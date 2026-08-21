/* Visit note for the per-lead demo pages (/nastanitve/<hash>/): one
 * cookie-free, storage-free POST per page load, disclosed in each page's
 * footer small print (details at /zasebnost#piskotki).
 *
 * The note is sent only after a real interaction (pointer, scroll, key,
 * touch), or after 12 s in a visible tab, so link-preview crawlers that
 * execute JS still mostly fail the gate; the function behind the endpoint
 * filters the rest by user agent. Skips localhost, file: and framed views
 * (the site's own preview overlay frames demo pages; a framed view is not a
 * prospect opening their link). */
(function () {
  'use strict';
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return;
  if (window.top !== window.self) return;

  var EVENTS = ['pointerdown', 'pointermove', 'scroll', 'keydown', 'touchstart'];
  var sent = false;

  function send() {
    if (sent) return;
    sent = true;
    EVENTS.forEach(function (name) { removeEventListener(name, send, true); });
    var body = JSON.stringify({
      p: location.pathname,
      t: document.title,
      r: document.referrer || '',
      s: screen.width + 'x' + screen.height,
      l: navigator.language || ''
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/.netlify/functions/obisk', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/.netlify/functions/obisk', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: body,
          keepalive: true
        });
      }
    } catch (err) { /* a lost note must never break the page */ }
  }

  EVENTS.forEach(function (name) { addEventListener(name, send, true); });
  setTimeout(function () {
    if (document.visibilityState === 'visible') send();
  }, 12000);
})();
