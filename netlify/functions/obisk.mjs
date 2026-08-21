/* Demo-page visit notification. The beacon in
 * public/nastanitve/_assets/obisk.js POSTs here; this function emails the
 * open through Web3Forms, reusing the contact form's public client key from
 * the Netlify env (VITE_WEB3FORMS_KEY, read at RUNTIME — the var must exist
 * in the site env or every note is silently dropped). Web3Forms delivers to
 * the inbox its key is registered with; the recipient is not choosable here.
 *
 * Raw IP is deliberately NOT forwarded — only Netlify's city-level geo —
 * matching the /zasebnost#piskotki disclosure ("približna lokacija na ravni
 * kraja"). Always answers 204: the visitor's page must never care whether
 * the note was delivered. */

const DEMO_PATH = /^\/nastanitve\/[0-9a-f]{12}\/?(?:index\.html)?$/;

/* Crawlers and link-preview fetchers that execute JS: pasting the link into
 * a chat is not an open. (The beacon's interaction gate already filters the
 * ones that don't.) */
const BOT_UA = /bot|crawler|spider|preview|scan|fetch|monitor|headless|facebookexternalhit|whatsapp|telegram|slack|discord|skype|twitter|linkedin|pinterest|embed|viber|snapchat|vkshare|curl|wget|python|java|axios|okhttp/i;

/** Every beacon field is attacker-writable (the endpoint is public): coerce
 *  to string, strip control characters, cap the length. */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export default async (req, context) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });

  const key = process.env.WEB3FORMS_KEY || process.env.VITE_WEB3FORMS_KEY;
  const ua = clean(req.headers.get('user-agent') || '', 300);

  let note = {};
  try {
    note = await req.json();
  } catch { /* malformed body → dropped below */ }
  const page = clean(note?.p, 120);

  if (key && ua && !BOT_UA.test(ua) && DEMO_PATH.test(page)) {
    const geo = context?.geo ?? {};
    const place = [geo.city, geo.country?.name ?? geo.country?.code].filter(Boolean).join(', ');
    const when = new Date().toLocaleString('sl-SI', {
      timeZone: 'Europe/Ljubljana',
      dateStyle: 'full',
      timeStyle: 'medium'
    });
    const title = clean(note?.t, 120) || page;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          from_name: 'SpletnaPovsod demo',
          subject: `Demo odprt: ${title}`,
          Stran: title,
          Povezava: `https://${req.headers.get('host') ?? 'spletnapovsod.si'}${page}`,
          Cas: when,
          Kraj: place || 'neznan',
          Brskalnik: ua,
          Zaslon: clean(note?.s, 20),
          Jezik: clean(note?.l, 20),
          Vir: clean(note?.r, 200) || 'neposredno'
        })
      });
      if (!res.ok) console.error('obisk: Web3Forms answered', res.status);
    } catch (err) {
      console.error('obisk: delivery failed', err);
    }
  }

  return new Response(null, { status: 204 });
};
