/* Daily retention sweep of the demo-visit store: visits older than 12 months
 * (the period /zasebnost#piskotki promises) and test visits older than 30
 * days are deleted, and the touched pages' visit indexes are pruned to
 * match. Runs only on the published production deploy. */
import { getStore } from '@netlify/blobs'
import { VISIT_RE, visitStart } from '../lib/obisk-core.mjs'

export const config = { schedule: '@daily' }

const DAY_MS = 86400000
const KEEP = [
  { visits: 'v', index: 'h', days: 365 },
  { visits: 't', index: 'th', days: 30 },
]

export default async () => {
  const store = getStore({ name: 'obisk', consistency: 'strong' })
  const now = Date.now()
  let removed = 0

  for (const { visits, index, days } of KEEP) {
    const cutoff = now - days * DAY_MS
    const touched = new Set()
    for await (const page of store.list({ prefix: `${visits}/`, paginate: true })) {
      for (const { key } of page.blobs) {
        const [, hash, id = ''] = key.split('/')
        if (VISIT_RE.test(id) && visitStart(id) >= cutoff) continue
        await store.delete(key)
        touched.add(hash)
        removed++
      }
    }
    for (const hash of touched) {
      const key = `${index}/${hash}`
      const cur = await store.getWithMetadata(key, { type: 'json' })
      if (!cur) continue
      const kept = cur.data.filter((e) => Date.parse(e.at) >= cutoff)
      if (!kept.length) await store.delete(key)
      else if (kept.length < cur.data.length) {
        await store.setJSON(key, kept, { onlyIfMatch: cur.etag })
      }
    }
  }
  console.log(`obisk-purge: removed ${removed} visit record(s)`)
}
