/* Pure logic behind the demo-visit collector (netlify/functions/obisk.mjs):
 * payload sanitising, snapshot merging, device and network signatures, and
 * the one-person-or-several verdict. No I/O here, so obisk-core.test.mjs can
 * pin every rule with `node --test netlify/lib/`.
 *
 * Every beacon field is attacker-writable (the endpoint is public): numbers
 * are clamped, strings stripped of control characters and capped, keys
 * whitelisted. The raw IP never leaves this module: only a salted hash of
 * its network prefix (/24 for IPv4, /48 for IPv6) is stored. */
import { createHash } from 'node:crypto'

export const HASH_RE = /^[0-9a-f]{12}$/
/* Visit id = Date.now() in base36 + '-' + random base36 (see obisk.js). */
export const VISIT_RE = /^[0-9a-z]{8,9}-[0-9a-z]{6,12}$/
export const SECTION_KEYS = ['top', 'intro', 'gallery', 'amenities', 'location', 'reviews',
  'host', 'map', 'enquire', 'footer', 'lightbox']
const CLICK_KEYS = ['email', 'phone', 'map', 'nav', 'privacy', 'link']
const COPY_KEYS = ['email', 'phone', 'text']
const KINDS = ['start', 'hb', 'hide', 'pagehide', 'end']
const DAY_MS = 86400000
const MAX_EVENTS = 40

/* Crawlers and link-preview fetchers that execute JS: pasting the link into
 * a chat is not an open. (The beacon's interaction gate already filters the
 * ones that don't.) Carried over from the first relay (git e1fa3aa^). */
export const BOT_UA = /bot|crawler|spider|preview|scan|fetch|monitor|headless|facebookexternalhit|whatsapp|telegram|slack|discord|skype|twitter|linkedin|pinterest|embed|viber|snapchat|vkshare|curl|wget|python|java|axios|okhttp/i

export function clean(value, max) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
}

function int(x, max) {
  const n = Number(x)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.round(n), max) : 0
}

function counts(src, keys, max) {
  const out = {}
  for (const k of keys) out[k] = int(src?.[k], max)
  return out
}

export function visitStart(id) {
  return parseInt(id.split('-')[0], 36)
}

/** The beacon body → a trusted snapshot, or null if it is not a plausible
 *  visit of a demo page. `now` in ms. */
export function sanitize(body, now) {
  if (!body || typeof body !== 'object') return null
  const h = clean(body.h, 12)
  const id = clean(body.id, 24)
  if (!HASH_RE.test(h) || !VISIT_RE.test(id)) return null
  const t0 = visitStart(id)
  if (!(t0 > now - 2 * DAY_MS && t0 < now + 10 * 60000)) return null

  const d = body.d ?? {}
  const m = body.m ?? {}
  const sec = {}
  for (const k of SECTION_KEYS) {
    const s = m.sec?.[k]
    if (s && typeof s === 'object') {
      sec[k] = { v: int(s.v, DAY_MS), a: int(s.a, DAY_MS), f: int(s.f, DAY_MS / 1000) }
    }
  }
  const ev = Array.isArray(m.ev)
    ? m.ev.slice(0, MAX_EVENTS)
      .filter((e) => e && /^[a-z-]{1,20}$/.test(e.k))
      .map((e) => ({ s: int(e.s, DAY_MS / 1000), k: e.k, l: clean(e.l, 60) }))
    : []

  return {
    h,
    id,
    seq: int(body.seq, 1e6),
    kind: KINDS.includes(body.k) ? body.k : 'hb',
    test: body.test === 1 || body.test === true,
    title: clean(body.t, 160),
    dev: {
      sw: int(d.sw, 20000), sh: int(d.sh, 20000),
      dpr: Math.min(Math.max(Math.round((Number(d.dpr) || 0) * 100) / 100, 0), 10),
      vw: int(d.vw, 20000), vh: int(d.vh, 20000),
      tz: clean(d.tz, 64), lg: clean(d.lg, 64), pf: clean(d.pf, 40),
      hc: int(d.hc, 512), dm: Math.min(Math.max(Number(d.dm) || 0, 0), 1024), tp: int(d.tp, 32),
    },
    m: {
      w: int(m.w, DAY_MS), vis: int(m.vis, DAY_MS), act: int(m.act, DAY_MS),
      sc: int(m.sc, 100),
      dp: SECTION_KEYS.includes(m.dp) ? m.dp : '',
      sec,
      ph: { o: int(m.ph?.o, 1000), n: int(m.ph?.n, 10000), u: int(m.ph?.u, 500) },
      cl: counts(m.cl, CLICK_KEYS, 1000),
      cp: counts(m.cp, COPY_KEYS, 1000),
      ev,
      r: clean(m.r, 200),
      ml: int(m.ml, 10),
    },
  }
}

/** Version numbers churn with every browser update; the device does not.
 *  Dotted runs only, so Android model codes (SM-S911B) survive. */
export function normUA(ua) {
  return String(ua || '').replace(/\d+(?:[._]\d+)+/g, '#')
}

export function deviceSig(dev, ua) {
  const parts = [normUA(ua), `${dev.sw}x${dev.sh}`, dev.dpr, dev.tz, dev.lg, dev.pf,
    dev.hc, dev.dm, dev.tp]
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 12)
}

function expandV6(ip) {
  const [head, tail] = ip.split('::')
  const a = head ? head.split(':') : []
  const b = tail !== undefined && tail ? tail.split(':') : []
  const fill = tail !== undefined ? Array(Math.max(8 - a.length - b.length, 0)).fill('0') : []
  return [...a, ...fill, ...b].map((x) => x.toLowerCase().replace(/^0+(?=.)/, ''))
}

export function netPrefix(ip) {
  const s = String(ip || '').trim()
  const v4 = s.match(/(?:^|:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/)
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`
  if (s.includes(':')) return `${expandV6(s).slice(0, 3).join(':')}::/48`
  return ''
}

export function netHash(ip, salt) {
  const prefix = netPrefix(ip)
  if (!prefix) return ''
  return createHash('sha256').update(`${salt || ''}|${prefix}`).digest('hex').slice(0, 12)
}

/** The stored record after this snapshot, or null when it carries nothing
 *  newer (beacons can arrive out of order). Server-side fields are fixed by
 *  the first write. */
export function merge(stored, inc, meta) {
  if (!stored) {
    return {
      h: inc.h,
      id: inc.id,
      test: inc.test,
      title: inc.title,
      startedAt: new Date(visitStart(inc.id)).toISOString(),
      firstAt: meta.at,
      lastAt: meta.at,
      seq: inc.seq,
      kind: inc.kind,
      ua: meta.ua,
      dev: inc.dev,
      devSig: deviceSig(inc.dev, meta.ua),
      net: meta.net,
      city: meta.city,
      country: meta.country,
      m: inc.m,
    }
  }
  if (inc.seq <= stored.seq) return null
  return { ...stored, seq: inc.seq, kind: inc.kind, lastAt: meta.at, m: inc.m,
    title: stored.title || inc.title }
}

/** How this visit relates to the earlier ones of the same page.
 *  prior/cur entries: { dev, net, city }. */
export function verdict(prior, cur) {
  if (!prior.length) return 'first'
  const sameDev = prior.filter((p) => p.dev === cur.dev)
  if (sameDev.length) {
    // Identical iPhones collide on the signature: the same "device" on another
    // network AND in another town is more likely a second person.
    const near = sameDev.some((p) => (cur.net && p.net === cur.net) || (cur.city && p.city === cur.city))
    return near ? 'same-device' : 'same-type-elsewhere'
  }
  if (cur.net && prior.some((p) => p.net === cur.net)) return 'new-device-same-net'
  if (cur.city && prior.some((p) => p.city === cur.city)) return 'new-device-same-city'
  return 'new-device-elsewhere'
}

function components(entries, linked) {
  const parent = entries.map((_, i) => i)
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (linked(entries[i], entries[j])) parent[find(i)] = find(j)
    }
  }
  return new Set(entries.map((_, i) => find(i))).size
}

/** [low, high] estimate of how many people opened the page. High: one
 *  person per device, unless the "same device" sits on another network in
 *  another town. Low: also merges devices that shared a network (one person
 *  on phone and laptop, or two colleagues in one office). */
export function people(entries) {
  const sameDev = (a, b) => a.dev === b.dev
  const sameNet = (a, b) => !!a.net && a.net === b.net
  const sameCity = (a, b) => !!a.city && a.city === b.city
  const high = components(entries, (a, b) => sameDev(a, b) && (sameNet(a, b) || sameCity(a, b)))
  const low = components(entries, (a, b) => sameDev(a, b) || sameNet(a, b))
  return [Math.min(low, high), high]
}

/** What the visitor's own browser gets back on the start beacon: coarse
 *  counts and a verdict code, never another visitor's town or device. */
export function answer(rec) {
  return {
    visit: rec.id,
    n: rec.n,
    verdict: rec.verdict,
    people: rec.people,
    devices: rec.devices,
    networks: rec.networks,
    city: rec.city,
  }
}

/** Index entry for h/<hash>: the per-page visit list the verdict reads. */
export function indexEntry(rec) {
  return { id: rec.id, at: rec.startedAt, dev: rec.devSig, net: rec.net, city: rec.city }
}

/** Stamp a fresh record with its place among the page's visits. */
export function annotate(rec, index) {
  const prior = index.filter((e) => e.id !== rec.id)
  const cur = indexEntry(rec)
  const all = [...prior, cur]
  return {
    ...rec,
    n: prior.length + 1,
    verdict: verdict(prior, cur),
    people: people(all),
    devices: new Set(all.map((e) => e.dev)).size,
    networks: new Set(all.map((e) => e.net).filter(Boolean)).size,
  }
}
