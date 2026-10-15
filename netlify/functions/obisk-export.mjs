/* Read side of the demo-visit store, for the call list in scrape_airbnb
 * (campaign/pull_visits.py). GET with `Authorization: Bearer
 * $OBISK_EXPORT_TOKEN`; `?since=<ms>` returns only visits that started at or
 * after that moment (the visit id carries its start, so no blob is read to
 * filter), `?test=1` returns the ?obisk=test visits instead. Without the
 * token env var every request is refused. */
import { createHash, timingSafeEqual } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import { VISIT_RE, visitStart } from '../lib/obisk-core.mjs'

const CHUNK = 50

const digest = (s) => createHash('sha256').update(s).digest()

export default async (req) => {
  if (req.method !== 'GET') return new Response(null, { status: 405 })
  const token = process.env.OBISK_EXPORT_TOKEN
  const auth = req.headers.get('authorization') || ''
  if (!token || !timingSafeEqual(digest(auth), digest(`Bearer ${token}`))) {
    return new Response('forbidden', { status: 403 })
  }

  const url = new URL(req.url)
  const since = Number(url.searchParams.get('since')) || 0
  const prefix = url.searchParams.get('test') === '1' ? 't/' : 'v/'
  const store = getStore({ name: 'obisk', consistency: 'strong' })

  const keys = []
  for await (const page of store.list({ prefix, paginate: true })) {
    for (const { key } of page.blobs) {
      const id = key.split('/')[2] || ''
      if (VISIT_RE.test(id) && visitStart(id) >= since) keys.push(key)
    }
  }
  const visits = []
  for (let i = 0; i < keys.length; i += CHUNK) {
    const got = await Promise.all(keys.slice(i, i + CHUNK)
      .map((k) => store.get(k, { type: 'json' })))
    visits.push(...got.filter(Boolean))
  }
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), visits }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
