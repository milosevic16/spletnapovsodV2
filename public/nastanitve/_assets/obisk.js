/* Visit summary for the per-lead demo pages (/nastanitve/<hash>/): how the
 * page was used, measured in memory only (cookie-free, storage-free),
 * disclosed in each page's footer small print (details at
 * /zasebnost#piskotki).
 *
 * One visit = one burst of attention: a pause of GAP_MS (tab hidden, or
 * visible with no input) ends it, and the next activity starts a new visit
 * with a fresh id. Per visit it measures wall / visible / active time
 * (active = visible with input in the last IDLE_MS), time per page section
 * (the section under the viewport's centre line; the photo lightbox counts
 * as its own section), max scroll depth, lightbox use, contact clicks and
 * copies (the kind only, never the copied text).
 *
 * Two destinations:
 *  1. The collector (/.netlify/functions/obisk, netlify/functions/obisk.mjs):
 *     cumulative snapshots at start, every HB_MS while active, on hide and
 *     on pagehide. Its answer to the start snapshot (visit number, a
 *     one-person-or-several verdict, the visitor's town) goes into 2.
 *  2. Web3Forms, directly from the browser (Web3Forms 403s datacenter IPs,
 *     so no server can relay it): the summary mail, sent when the page is
 *     hidden. At most MAX_MAILS per visit; the second only after
 *     CONT_ACTIVE_MS more active time. The subject keeps the »Demo odprt«
 *     prefix the inbox's forwarding filter keys on.
 *
 * The access key is the public-by-design client key: the repo holds only
 * the placeholder below, scripts/postbuild.mjs injects VITE_WEB3FORMS_KEY
 * into the dist copy. A keyless build mails nothing; the collector still
 * records.
 *
 * Starts only after a real interaction (pointer, scroll, key, touch), or
 * after GATE_MS in a visible tab, so link-preview crawlers mostly never
 * report. Skips file:, framed views (the site's preview overlay frames demo
 * pages) and localhost. ?obisk=test marks the visit as a test (kept apart
 * by the collector, »[TEST]« in the subject); ?obisk=debug also runs on
 * localhost, logs every payload to the console, and mails only with
 * &mail=1. */
(function () {
  'use strict';
  var KEY = '__VITE_WEB3FORMS_KEY__';
  var ENDPOINT = '/.netlify/functions/obisk';
  var WEB3FORMS = 'https://api.web3forms.com/submit';

  var IDLE_MS = 30000;
  var GAP_MS = 20 * 60000;
  var HB_MS = 30000;
  var GATE_MS = 12000;
  var MAX_EVENTS = 40;
  var MAX_MAILS = 2;
  var CONT_ACTIVE_MS = 30000;

  var mode = '', mailParam = '';
  try {
    var q = new URLSearchParams(location.search);
    mode = q.get('obisk') || '';
    mailParam = q.get('mail') || '';
  } catch (e) { /* no URLSearchParams: plain mode */ }
  var debug = mode === 'debug';
  var test = debug || mode === 'test';

  var host = location.hostname;
  if (location.protocol === 'file:') return;
  if ((host === 'localhost' || host === '127.0.0.1') && !debug) return;
  if (window.top !== window.self) return;
  if (!window.fetch || !window.FormData || !document.querySelectorAll) return;
  var page = location.pathname.match(/^\/nastanitve\/([0-9a-f]{12})(?:\/|$)/);
  if (!page) return;
  var HASH = page[1];
  var mailOn = KEY.indexOf('__') !== 0 && (!debug || mailParam === '1');

  var LABEL = {
    top: 'Naslovnica', intro: 'Uvod', gallery: 'Galerija', amenities: 'Oprema',
    location: 'Lokacija', reviews: 'Mnenja', host: 'Gostitelj', map: 'Zemljevid',
    enquire: 'Povpraševanje', footer: 'Noga', lightbox: 'Povečava fotografij'
  };
  var VERDICT = {
    first: 'prvi obisk te strani',
    'same-device': 'ista naprava kot pri prejšnjem obisku, verjetno ista oseba',
    'same-type-elsewhere': 'enaka vrsta naprave, a drugo omrežje in kraj, morda druga oseba',
    'new-device-same-net': 'nova naprava v istem omrežju: ista oseba na drugi napravi ali kdo iz istega gospodinjstva ali pisarne',
    'new-device-same-city': 'nova naprava, drugo omrežje v istem kraju: mobilni podatki ali druga oseba',
    'new-device-elsewhere': 'nova naprava v drugem kraju, verjetno druga oseba (povezava posredovana)'
  };
  var CLICK = { email: 'e-pošta', phone: 'telefon', map: 'zemljevid', privacy: 'zasebnost', link: 'druga povezava' };

  var DEV = device();
  var sections = null;
  var v = null;
  var lastInput = Date.now();
  var lastTick = Date.now();
  var lastSent = 0;
  var hiddenAt = 0;
  var gateTimer = null;

  function rand() {
    return Math.random().toString(36).slice(2, 10) || 'x0000000';
  }

  function newVisit(now) {
    v = {
      id: now.toString(36) + '-' + rand(),
      t0: now, end: now, started: false,
      vis: 0, act: 0, sec: {}, maxScroll: 0, deep: -1,
      ph: { o: 0, n: 0, seen: {} },
      cl: { email: 0, phone: 0, map: 0, nav: 0, privacy: 0, link: 0 },
      cp: { email: 0, phone: 0, text: 0 },
      ev: [], seq: 0, mails: 0, actAtMail: 0, info: null
    };
  }

  function device() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var langs = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language || ''];
    return {
      ua: navigator.userAgent || '',
      sw: screen.width, sh: screen.height,
      dpr: window.devicePixelRatio || 1,
      vw: window.innerWidth, vh: window.innerHeight,
      tz: tz, lg: Array.prototype.slice.call(langs, 0, 3).join(','),
      pf: (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '',
      hc: navigator.hardwareConcurrency || 0,
      dm: navigator.deviceMemory || 0,
      tp: navigator.maxTouchPoints || 0
    };
  }

  /* Both packs share the section ids (top, gallery, amenities, location,
   * reviews, host, enquire), the id-less opener and the Map section. */
  function sectionList() {
    if (sections) return sections;
    sections = [];
    var els = document.querySelectorAll('header#top, section, footer');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.id || (el.getAttribute('aria-label') || '').toLowerCase() ||
        (el.tagName === 'FOOTER' ? 'footer' : 'intro');
      sections.push({ el: el, key: key });
    }
    return sections;
  }

  function sectionAtCentre() {
    var list = sectionList();
    var y = window.innerHeight / 2;
    for (var i = 0; i < list.length; i++) {
      var r = list[i].el.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return i;
    }
    return -1;
  }

  function lightboxOpen() {
    return !!document.body && document.body.classList.contains('lb-open');
  }

  function since(now) {
    return Math.round((now - v.t0) / 1000);
  }

  function log(kind, label) {
    if (v.ev.length < MAX_EVENTS) v.ev.push({ s: since(Date.now()), k: kind, l: label || '' });
  }

  /* ---- clock ---------------------------------------------------------- */

  function tick() {
    var now = Date.now();
    var dt = Math.min(now - lastTick, 2000);
    lastTick = now;
    if (document.visibilityState !== 'visible') return;
    if (now - lastInput >= GAP_MS) return;           // dormant: the visit is over
    var active = now - lastInput < IDLE_MS;
    v.vis += dt;
    if (active) v.act += dt;
    v.end = now;
    var key = '';
    if (lightboxOpen()) key = 'lightbox';
    else {
      var i = sectionAtCentre();
      if (i >= 0) {
        key = sections[i].key;
        if (i > v.deep) v.deep = i;
      }
    }
    if (key) {
      var s = v.sec[key] || (v.sec[key] = { v: 0, a: 0, f: since(now) });
      s.v += dt;
      if (active) s.a += dt;
    }
    if (v.started && active && now - lastSent >= HB_MS) send('hb');
  }

  function onScroll() {
    var de = document.documentElement;
    var h = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0);
    var p = h > 0 ? (window.pageYOffset + window.innerHeight) / h : 1;
    if (p > v.maxScroll) v.maxScroll = Math.min(p, 1);
  }

  /* ---- visit lifecycle ------------------------------------------------ */

  function activity() {
    var now = Date.now();
    if (v.started && now - lastInput >= GAP_MS) rollover(now);
    lastInput = now;
    if (!v.started) start();
  }

  /* Back to a visible page (tab switch, bfcache restore). Returning is
   * attention, so it counts as input; a visit that never started restarts
   * its clock, one that ended over a long pause becomes a new visit. */
  function resume(now) {
    lastTick = now;
    lastInput = now;
    if (!v.started) newVisit(now);
    else if (hiddenAt && now - hiddenAt >= GAP_MS) rollover(now);
    armGate();
  }

  function armGate() {
    if (v.started || gateTimer || document.visibilityState !== 'visible') return;
    gateTimer = setTimeout(function () {
      gateTimer = null;
      if (document.visibilityState === 'visible') start();
    }, GATE_MS);
  }

  function clearGate() {
    if (gateTimer) clearTimeout(gateTimer);
    gateTimer = null;
  }

  function start() {
    if (v.started) return;
    v.started = true;
    clearGate();
    var visit = v;
    var body = payload('start');
    lastSent = Date.now();
    if (debug) console.log('[obisk] start', JSON.parse(body));
    try {
      fetch(ENDPOINT, {
        method: 'POST', body: body, keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      }).then(function (r) {
        return r.status === 200 ? r.json() : null;
      }).then(function (info) {
        if (info && info.visit === visit.id) visit.info = info;
        if (debug) console.log('[obisk] collector answered', info);
      }).catch(function () { /* the summary just goes without history */ });
    } catch (e) { /* a lost note must never break the page */ }
  }

  function rollover(now) {
    flush('end');
    newVisit(now);
  }

  function flush(kind) {
    if (!v.started) return;
    mail();
    send(kind);
  }

  /* ---- transport ------------------------------------------------------ */

  function metrics() {
    var seen = 0;
    for (var k in v.ph.seen) if (v.ph.seen.hasOwnProperty(k)) seen++;
    return {
      w: v.end - v.t0, vis: v.vis, act: v.act,
      sc: Math.round(v.maxScroll * 100),
      dp: v.deep >= 0 ? sections[v.deep].key : '',
      sec: v.sec,
      ph: { o: v.ph.o, n: v.ph.n, u: seen },
      cl: v.cl, cp: v.cp, ev: v.ev,
      r: (document.referrer || '').slice(0, 200),
      ml: v.mails
    };
  }

  function payload(kind) {
    v.seq++;
    return JSON.stringify({
      h: HASH, id: v.id, seq: v.seq, k: kind, test: test ? 1 : 0,
      t: (document.title || '').slice(0, 160),
      d: DEV, m: metrics()
    });
  }

  /* Text bodies: no CORS preflight, and sendBeacon accepts them anywhere. */
  function send(kind) {
    if (!v.started) return;
    var body = payload(kind);
    lastSent = Date.now();
    if (debug) console.log('[obisk] ' + kind, JSON.parse(body));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return;
    } catch (e) {}
    try {
      fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  function mail() {
    if (v.mails >= MAX_MAILS) return;
    if (v.mails > 0 && v.act - v.actAtMail < CONT_ACTIVE_MS) return;
    var fields = summary();
    v.mails++;
    v.actAtMail = v.act;
    if (debug) console.log('[obisk] mail' + (mailOn ? '' : ' (not sent)'), fields);
    if (!mailOn) return;
    var fd = new FormData();
    fd.append('access_key', KEY);
    for (var i = 0; i < fields.length; i++) fd.append(fields[i][0], fields[i][1]);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(WEB3FORMS, fd)) return;
    } catch (e) {}
    try {
      fetch(WEB3FORMS, { method: 'POST', body: fd, keepalive: true }).catch(function () {});
    } catch (e) {}
  }

  /* ---- the mail ------------------------------------------------------- */

  function mmss(ms) {
    var s = Math.round(ms / 1000);
    var r = s % 60;
    return Math.floor(s / 60) + ':' + (r < 10 ? '0' : '') + r;
  }

  function when(t) {
    try {
      return new Date(t).toLocaleString('sl-SI', {
        timeZone: 'Europe/Ljubljana', dateStyle: 'medium', timeStyle: 'short'
      });
    } catch (e) {
      return new Date(t).toISOString();
    }
  }

  function describe(d) {
    var ua = d.ua, dev, br, m;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && d.tp > 1)) dev = 'iPad';
    else if (/iPhone/.test(ua)) dev = 'iPhone';
    else if (/Android/.test(ua)) {
      m = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build\/[^;)]*)?\)/);
      dev = 'Android' + (m && m[1] !== 'K' ? ' ' + m[1] : '') + (/Mobile/.test(ua) ? '' : ' (tablica)');
    }
    else if (/Windows/.test(ua)) dev = 'Windows';
    else if (/CrOS/.test(ua)) dev = 'Chromebook';
    else if (/Macintosh/.test(ua)) dev = 'Mac';
    else if (/Linux/.test(ua)) dev = 'Linux';
    else dev = 'neznana naprava';
    if (/FBAN|FBAV|FB_IAB/.test(ua)) br = 'Facebook (v aplikaciji)';
    else if (/Instagram/.test(ua)) br = 'Instagram (v aplikaciji)';
    else if (/GSA\//.test(ua)) br = 'aplikacija Google';
    else if (/Edg(?:A|iOS)?\//.test(ua)) br = 'Edge';
    else if (/OPR\/|Opera/.test(ua)) br = 'Opera';
    else if (/SamsungBrowser/.test(ua)) br = 'Samsung Internet';
    else if (/Firefox|FxiOS/.test(ua)) br = 'Firefox';
    else if (/CriOS|Chrome/.test(ua)) br = 'Chrome';
    else if (/Safari/.test(ua)) br = 'Safari';
    else if (/iPhone|iPad|Macintosh/.test(ua)) br = 'vgrajen brskalnik (npr. v aplikaciji Gmail ali Outlook)';
    else br = 'drug brskalnik';
    var dpr = d.dpr && d.dpr !== 1 ? ' @' + Math.round(d.dpr * 10) / 10 + 'x' : '';
    return dev + ' · ' + br + ' · zaslon ' + d.sw + '×' + d.sh + dpr;
  }

  function eventLabel(e) {
    if (e.k === 'photo') return 'fotografija ' + e.l;
    if (e.k === 'nav') return 'skok na #' + e.l;
    if (e.k === 'link') return 'povezava ' + e.l;
    if (e.k === 'copy-email') return 'kopiral e-naslov';
    if (e.k === 'copy-phone') return 'kopiral telefon';
    if (e.k === 'copy-text') return 'kopiral besedilo';
    return CLICK[e.k] || e.k;
  }

  function summary() {
    var mm = metrics();
    var info = v.info;
    var title = document.title || HASH;
    var first = v.mails === 0;

    var subject = 'Demo odprt: ' + (test ? '[TEST] ' : '') + title +
      (info ? ' · ' + info.n + '. obisk' : '') +
      ' · aktivno ' + mmss(mm.act) + ' · pomik ' + mm.sc + ' %' +
      (first ? '' : ' · nadaljevanje');

    var parts = [];
    var list = sectionList();
    for (var i = 0; i < list.length; i++) {
      var s = mm.sec[list[i].key];
      parts.push((LABEL[list[i].key] || list[i].key) + ' ' + (s ? mmss(s.v) : '–'));
    }
    if (mm.sec.lightbox) parts.push(LABEL.lightbox + ' ' + mmss(mm.sec.lightbox.v));

    var contact = [];
    for (var c in CLICK) if (CLICK.hasOwnProperty(c) && mm.cl[c]) contact.push(CLICK[c] + ' ' + mm.cl[c] + '×');
    var copies = [];
    if (mm.cp.email) copies.push('e-poštni naslov ' + mm.cp.email + '×');
    if (mm.cp.phone) copies.push('telefonska številka ' + mm.cp.phone + '×');
    if (mm.cp.text) copies.push('drugo besedilo ' + mm.cp.text + '×');

    var events = [];
    for (var j = 0; j < mm.ev.length; j++) {
      events.push(mmss(mm.ev[j].s * 1000) + ' ' + eventLabel(mm.ev[j]));
    }

    var people = '';
    if (info && info.people) {
      var lo = info.people[0], hi = info.people[1];
      people = (lo === hi ? lo : lo + ' do ' + hi) + ' (vseh obiskov ' + info.n +
        ', naprav ' + info.devices + ', omrežij ' + info.networks + ')';
    }

    var f = [
      ['subject', subject],
      ['from_name', 'SpletnaPovsod demo'],
      ['Stran', title],
      ['Povezava', location.origin + location.pathname],
      ['Zacetek', when(v.t0)],   // field NAMES stay ASCII: Web3Forms garbles č/š/ž in names (values are fine)
      ['Obisk', info ? info.n + '. obisk · ' + (VERDICT[info.verdict] || info.verdict)
        : 'ni podatka (zbiralnik ni odgovoril)'],
      ['Ocena oseb', people || 'ni podatka'],
      ['Trajanje', mmss(mm.w) + ' skupaj · vidno ' + mmss(mm.vis) + ' · aktivno ' +
        mmss(mm.act) + ' · nedejavno ' + mmss(Math.max(mm.vis - mm.act, 0))],
      ['Pomik', mm.sc + ' % strani · najgloblje ogledan razdelek: ' + (LABEL[mm.dp] || mm.dp || '–')],
      ['Razdelki', parts.join(' · ')],
      ['Fotografije', mm.ph.o
        ? 'povečava odprta ' + mm.ph.o + '× · različnih fotografij ' + mm.ph.u +
          ' · premikov ' + mm.ph.n
        : 'povečave ni odprl'],
      ['Kontakt', contact.length ? contact.join(' · ') : 'brez klikov']
    ];
    if (copies.length) f.push(['Kopirano', copies.join(' · ')]);
    if (events.length) f.push(['Dogodki', events.join(' · ')]);
    f.push(['Naprava', describe(DEV)]);
    f.push(['Jezik in pas', DEV.lg + ' · ' + DEV.tz]);
    f.push(['Kraj', (info && info.city) || 'neznan']);
    f.push(['Vir', mm.r || 'neposredno']);
    f.push(['Povzetek', first ? 'ob prvem skritju strani'
      : 'nadaljevanje istega obiska (stran je bila spet odprta)']);
    f.push(['ID obiska', v.id]);
    return f;
  }

  /* ---- listeners ------------------------------------------------------ */

  /* The lightbox shows "i / N" while open: the photo actually on screen. */
  function readCount() {
    var el = document.querySelector('.lb-overlay .lb-count');
    var m = el && (el.textContent || '').match(/^(\d+)\s*\/\s*\d+/);
    if (m) v.ph.seen[m[1]] = 1;
  }

  function classify(a) {
    var href = a.getAttribute('href') || '';
    if (/^mailto:/i.test(href)) return ['email', ''];
    if (/^tel:/i.test(href)) return ['phone', ''];
    if (/google\.[a-z.]+\/maps|maps\.google\.|maps\.apple\.|openstreetmap\./i.test(href)) return ['map', ''];
    if (href.charAt(0) === '#') return ['nav', href.slice(1, 40)];
    if (/^\/zasebnost/.test(href)) return ['privacy', ''];
    return ['link', (a.hostname || href).slice(0, 60)];
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var img = t.closest('img.lb-zoomable');
    if (img) {
      var all = document.querySelectorAll('img.lb-zoomable');
      var idx = Array.prototype.indexOf.call(all, img) + 1;
      v.ph.o++;
      v.ph.seen[idx] = 1;
      log('photo', String(idx));
      return;
    }
    if (t.closest('.lb-next, .lb-prev')) {
      v.ph.n++;
      setTimeout(readCount, 0);
      return;
    }
    var a = t.closest('a[href]');
    if (a) {
      var kind = classify(a);
      v.cl[kind[0]]++;
      log(kind[0], kind[1]);
    }
  }, true);

  document.addEventListener('keydown', function (e) {
    if (lightboxOpen() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      v.ph.n++;
      setTimeout(readCount, 0);
    }
  }, true);

  document.addEventListener('copy', function () {
    var s = '';
    try { s = String(window.getSelection ? window.getSelection() : '').trim(); } catch (e) {}
    var k = /\S+@\S+\.\S+/.test(s) ? 'email' : (/^\+?[\d\s()\/.-]{6,}$/.test(s) ? 'phone' : 'text');
    v.cp[k]++;
    log('copy-' + k, '');
  }, true);

  var INPUT = ['pointerdown', 'pointermove', 'scroll', 'wheel', 'keydown', 'touchstart', 'touchmove'];
  for (var i = 0; i < INPUT.length; i++) {
    addEventListener(INPUT[i], activity, { capture: true, passive: true });
  }
  addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('visibilitychange', function () {
    var now = Date.now();
    if (document.visibilityState === 'hidden') {
      hiddenAt = now;
      clearGate();
      flush('hide');
    } else {
      resume(now);
    }
  });
  addEventListener('pagehide', function () { flush('pagehide'); });
  addEventListener('pageshow', function (e) {
    if (e.persisted) resume(Date.now());
  });

  newVisit(Date.now());
  onScroll();
  setInterval(tick, 1000);
  armGate();
})();
