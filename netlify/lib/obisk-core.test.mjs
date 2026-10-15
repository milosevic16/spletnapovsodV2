import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sanitize, merge, deviceSig, normUA, netPrefix, netHash, verdict, people,
  annotate, visitStart } from './obisk-core.mjs'

const NOW = Date.UTC(2026, 9, 10, 12, 0, 0)
const ID = `${NOW.toString(36)}-abc123xy`
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'

function beacon(over = {}) {
  return {
    h: '0123456789ab', id: ID, seq: 1, k: 'start', t: 'Apartma Test',
    d: { sw: 390, sh: 844, dpr: 3, vw: 390, vh: 664, tz: 'Europe/Ljubljana', lg: 'sl-SI,en', pf: 'iPhone', hc: 4, dm: 0, tp: 5 },
    m: { w: 5000, vis: 5000, act: 4000, sc: 40, dp: 'gallery',
      sec: { top: { v: 3000, a: 2000, f: 0 }, gallery: { v: 2000, a: 2000, f: 3 }, bogus: { v: 9 } },
      ph: { o: 1, n: 2, u: 3 }, cl: { email: 1, evil: 5 }, cp: { email: 1 },
      ev: [{ s: 3, k: 'photo', l: '3' }, { s: 4, k: 'BAD KEY', l: 'x' }], r: '', ml: 0 },
    ...over,
  }
}

test('sanitize accepts a well-formed beacon and drops unknown keys', () => {
  const s = sanitize(beacon(), NOW)
  assert.equal(s.h, '0123456789ab')
  assert.equal(s.kind, 'start')
  assert.deepEqual(Object.keys(s.m.sec), ['top', 'gallery'])
  assert.equal(s.m.cl.email, 1)
  assert.equal(s.m.cl.evil, undefined)
  assert.deepEqual(s.m.ev, [{ s: 3, k: 'photo', l: '3' }])
})

test('sanitize rejects bad hashes, ids and implausible start times', () => {
  assert.equal(sanitize(beacon({ h: '../../etc' }), NOW), null)
  assert.equal(sanitize(beacon({ id: 'x' }), NOW), null)
  const old = `${(NOW - 3 * 86400000).toString(36)}-abc123xy`
  assert.equal(sanitize(beacon({ id: old }), NOW), null)
  assert.equal(sanitize(null, NOW), null)
})

test('sanitize clamps numbers and strings', () => {
  const s = sanitize(beacon({ m: { w: -5, vis: 1e15, sc: 400, r: 'x'.repeat(500) } }), NOW)
  assert.equal(s.m.w, 0)
  assert.equal(s.m.vis, 86400000)
  assert.equal(s.m.sc, 100)
  assert.equal(s.m.r.length, 200)
})

test('visit id carries its start time', () => {
  assert.equal(visitStart(ID), NOW)
})

test('merge keeps server fields from the first write and ignores stale seq', () => {
  const meta = { at: 'A', ua: IPHONE, net: 'n1', city: 'Koper', country: 'SI' }
  const first = merge(null, sanitize(beacon(), NOW), meta)
  assert.equal(first.city, 'Koper')
  const later = merge(first, sanitize(beacon({ seq: 3, k: 'hide' }), NOW),
    { ...meta, at: 'B', city: 'Elsewhere' })
  assert.equal(later.city, 'Koper')
  assert.equal(later.lastAt, 'B')
  assert.equal(later.kind, 'hide')
  assert.equal(merge(later, sanitize(beacon({ seq: 2 }), NOW), meta), null)
})

test('device signature survives a browser update but not another screen', () => {
  const dev = sanitize(beacon(), NOW).dev
  const updated = IPHONE.replace(/18_5/g, '18_6').replace(/18\.5/g, '18.6')
  assert.equal(deviceSig(dev, IPHONE), deviceSig(dev, updated))
  assert.notEqual(deviceSig(dev, IPHONE), deviceSig({ ...dev, sw: 430 }, IPHONE))
  assert.equal(normUA('Linux; Android 14; SM-S911B'), 'Linux; Android 14; SM-S911B')
})

test('network prefix: /24 for IPv4, /48 for IPv6, mapped v4 as v4', () => {
  assert.equal(netPrefix('93.103.12.200'), '93.103.12.0/24')
  assert.equal(netPrefix('::ffff:93.103.12.200'), '93.103.12.0/24')
  assert.equal(netPrefix('2a00:ee2:1d00:4a::1'), '2a00:ee2:1d00::/48')
  assert.equal(netPrefix('2a00:0ee2:1d00:004a:0:0:0:1'), '2a00:ee2:1d00::/48')
  assert.equal(netPrefix(''), '')
  assert.equal(netHash('93.103.12.1', 's'), netHash('93.103.12.254', 's'))
  assert.notEqual(netHash('93.103.12.1', 's'), netHash('93.103.12.1', 't'))
  assert.equal(netHash('', 's'), '')
})

test('verdict matrix', () => {
  const p = [{ dev: 'd1', net: 'n1', city: 'Koper' }]
  assert.equal(verdict([], { dev: 'd1', net: 'n1', city: 'Koper' }), 'first')
  assert.equal(verdict(p, { dev: 'd1', net: 'n1', city: 'Koper' }), 'same-device')
  assert.equal(verdict(p, { dev: 'd1', net: 'n2', city: 'Koper' }), 'same-device')
  assert.equal(verdict(p, { dev: 'd1', net: 'n2', city: 'Maribor' }), 'same-type-elsewhere')
  assert.equal(verdict(p, { dev: 'd2', net: 'n1', city: 'Koper' }), 'new-device-same-net')
  assert.equal(verdict(p, { dev: 'd2', net: 'n2', city: 'Koper' }), 'new-device-same-city')
  assert.equal(verdict(p, { dev: 'd2', net: 'n2', city: 'Maribor' }), 'new-device-elsewhere')
  assert.equal(verdict(p, { dev: 'd2', net: '', city: '' }), 'new-device-elsewhere')
})

test('people estimate is a range', () => {
  const a = { dev: 'd1', net: 'n1', city: 'Koper' }
  assert.deepEqual(people([a]), [1, 1])
  assert.deepEqual(people([a, { ...a }]), [1, 1])
  // phone + laptop on the same Wi-Fi: one person or two colleagues
  assert.deepEqual(people([a, { dev: 'd2', net: 'n1', city: 'Koper' }]), [1, 2])
  // forwarded to someone in another town
  assert.deepEqual(people([a, { dev: 'd2', net: 'n2', city: 'Maribor' }]), [2, 2])
  // the same iPhone model in another town
  assert.deepEqual(people([a, { dev: 'd1', net: 'n9', city: 'Maribor' }]), [1, 2])
})

test('annotate numbers the visit and summarises the page history', () => {
  const rec = { id: 'v3', startedAt: 'T', devSig: 'd2', net: 'n2', city: 'Maribor' }
  const index = [
    { id: 'v1', dev: 'd1', net: 'n1', city: 'Koper' },
    { id: 'v2', dev: 'd1', net: 'n1', city: 'Koper' },
  ]
  const out = annotate(rec, index)
  assert.equal(out.n, 3)
  assert.equal(out.verdict, 'new-device-elsewhere')
  assert.deepEqual(out.people, [2, 2])
  assert.equal(out.devices, 2)
  assert.equal(out.networks, 2)
  // a retried first write must not count itself twice
  assert.equal(annotate(rec, [...index, { id: 'v3', dev: 'd2' }]).n, 3)
})
