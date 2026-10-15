/* Demo-page visit collector. The beacon in public/nastanitve/_assets/obisk.js
 * POSTs cumulative snapshots of one visit here (start, every 30 s while the
 * visitor is active, on hide and on pagehide); each visit is one record in
 * the Netlify Blobs store "obisk":
 *
 *   v/<hash>/<visitId>   the latest snapshot plus server-side fields
 *   h/<hash>             the page's visit index ({id, at, dev, net, city}),
 *                        which numbers visits and drives the verdict
 *   t/…, th/…            the same for ?obisk=test visits, kept apart
 *
 * The start beacon gets a small answer (visit number, verdict code, people
 * range, the visitor's own town) that the browser folds into the summary it
 * mails through Web3Forms; that mail cannot go from here, Web3Forms 403s
 * datacenter IPs. The raw IP is never stored, only netHash() of its prefix.
 * Every other answer is 204: the page must never care whether a note landed.
 * Records are read by obisk-export.mjs and expire via obisk-purge.mjs. */
import { getStore } from '@netlify/blobs'
import { BOT_UA, annotate, answer, clean, indexEntry, merge, netHash, sanitize }
  from '../lib/obisk-core.mjs'

const MAX_BODY = 16384
/* A public endpoint: cap how many new visits one page can collect per day. */
const NEW_VISITS_PER_DAY = 50
const RETRIES = 3

const none = () => new Response(null, { status: 204 })
const json = (body) => new Response(JSON.stringify(body), {
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
})

export default async (req, context) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  const ua = clean(req.headers.get('user-agent') || '', 300)
  if (!ua || BOT_UA.test(ua)) return none()

  let inc = null
  try {
    // Bodies arrive as text/plain (no CORS preflight, sendBeacon-safe).
    const raw = await req.text()
    if (raw.length <= MAX_BODY) inc = sanitize(JSON.parse(raw), Date.now())
  } catch { /* malformed → dropped */ }
  if (!inc) return none()

  const geo = context?.geo ?? {}
  const meta = {
    at: new Date().toISOString(),
    ua,
    net: netHash(context?.ip, process.env.OBISK_SALT),
    city: clean(geo.city, 80),
    country: clean(geo.country?.code, 4),
  }
  const store = getStore({ name: 'obisk', consistency: 'strong' })
  const key = `${inc.test ? 't' : 'v'}/${inc.h}/${inc.id}`

  try {
    // Snapshots of one visit can race (start fetch + hide beacon); every
    // write is conditional, a lost race re-reads and merges again.
    for (let attempt = 0; attempt < RETRIES; attempt++) {
      const cur = await store.getWithMetadata(key, { type: 'json' })
      if (!cur) {
        const rec = await create(store, key, inc, meta)
        if (rec === false) continue
        return rec && inc.kind === 'start' ? json(answer(rec)) : none()
      }
      const next = merge(cur.data, inc, meta)
      if (next) {
        const { modified } = await store.setJSON(key, next, { onlyIfMatch: cur.etag })
        if (!modified) continue
      }
      return inc.kind === 'start' ? json(answer(next ?? cur.data)) : none()
    }
  } catch (err) {
    console.error('obisk: store failed', err)
  }
  return none()
}

/** First write of a visit: the record (only if still new) and its index
 *  entry. false = another request created it first; null = daily cap. */
async function create(store, key, inc, meta) {
  const idxKey = `${inc.test ? 'th' : 'h'}/${inc.h}`
  const index = (await store.get(idxKey, { type: 'json' })) ?? []
  const today = meta.at.slice(0, 10)
  if (index.filter((e) => String(e.at).slice(0, 10) === today).length >= NEW_VISITS_PER_DAY) {
    return null
  }
  const rec = annotate(merge(null, inc, meta), index)
  const { modified } = await store.setJSON(key, rec, { onlyIfNew: true })
  if (!modified) return false

  const entry = indexEntry(rec)
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const cur = await store.getWithMetadata(idxKey, { type: 'json' })
    const list = (cur?.data ?? []).filter((e) => e.id !== entry.id)
    const { modified: done } = await store.setJSON(idxKey, [...list, entry],
      cur ? { onlyIfMatch: cur.etag } : { onlyIfNew: true })
    if (done) break
  }
  return rec
}
