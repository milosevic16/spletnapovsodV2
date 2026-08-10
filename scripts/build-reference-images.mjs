/**
 * Reference-plate image pipeline. Re-run to REFRESH the portfolio screenshots:
 *
 *   1. node scripts/capture-references.mjs
 *      (drives installed Edge via puppeteer-core; hides each site's animated
 *      hero elements so the capture is the site AT REST — the animations are
 *      re-implemented live in src/lib/slide-effects.ts — and writes
 *      capture/geometry.json with the measured element boxes the previews
 *      position themselves by. Expect 2880×1800 PNGs.)
 *   2. node scripts/build-reference-images.mjs
 *   3. commit the regenerated public/img/refs/ outputs; if geometry moved,
 *      re-derive the percentages in slide-effects.ts from geometry.json.
 *
 * POST-LAUNCH refreshes must BUMP the filename version (e.g. lemur-v2-560.avif,
 * updating the content module's widths/id wiring): /img/* ships with an
 * immutable year-long cache header, so a refresh under the same names would
 * never reach repeat visitors. Pre-launch, names are stable.
 *
 * Deliberately NOT part of the host build: a build must never depend on three
 * live third-party sites being up.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'refs')
mkdirSync(outDir, { recursive: true })

/** Art-directed 2:1 crops — coordinates in DEVICE px on the 2880×1800 captures
 *  (double the CSS-px framing of the original 1× crops). One crop per project:
 *  the desktop row and the phone belts both frame the work at 2:1.
 *
 *  A square variant existed briefly, for a phone grid of tiles that was tried
 *  and dropped. The `square` coordinates are kept below because they are the
 *  expensive part to re-derive, and emitting them is one loop away — but nothing
 *  references those files, so they are not generated. */
const SOURCES = [
  // lemur: the full landing composition — glitch intro line (blanked at
  // capture, re-typed live), headline, CTAs, status dots AND the terminal
  // console. Top sits 2px under the hexrow so the console's HUD corners stay
  // whole; geometry.json is the authority for these numbers.
  { id: 'lemur', file: 'capture/lemur-desktop.png', crop: { left: 48, top: 500, width: 2480, height: 1240 }, square: { left: 668, top: 500, width: 1240, height: 1240 }, widths: [560, 776, 1104, 1552] },
  { id: 'mercpeter', file: 'capture/mercpeter-desktop.png', crop: { left: 128, top: 200, width: 2368, height: 1184 }, square: { left: 720, top: 200, width: 1184, height: 1184 }, widths: [560, 840, 1184, 1792] },
  { id: 'bloctopus', file: 'capture/bloctopus-desktop.png', crop: { left: 192, top: 400, width: 2368, height: 1184 }, square: { left: 784, top: 400, width: 1184, height: 1184 }, widths: [560, 840, 1184, 1792] },
  // sile: the low-poly hero, nav through the »Včlani se« button. The crop stops
  // at the white card below (device y 850) so the plate is hero, not a seam.
  { id: 'sile', file: 'capture/sile-desktop.png', crop: { left: 590, top: 0, width: 1700, height: 850 }, square: { left: 1015, top: 0, width: 850, height: 850 }, widths: [560, 840, 1184, 1700] },
  // pravnapanda: nav, the wordmark in its oval, the CTA and the four counts —
  // the whole hero band, stopping where the white section starts.
  { id: 'pravnapanda', file: 'capture/pravnapanda-desktop.png', crop: { left: 374, top: 0, width: 2132, height: 1066 }, square: { left: 907, top: 0, width: 1066, height: 1066 }, widths: [560, 840, 1184, 1792] },
  // razprava: the whole hero — logo, headline, date, CTA — plus the strip of
  // dark band under it. The height is MEASURED, not chosen: the next section's
  // first ink sits at CSS y 582, so 578 (device 1156) is the tallest seam-free
  // window there is, and 2:1 makes the width 2312. Left 140 keeps the logo in
  // and lets the nav clip at the right, as sile's does.
  { id: 'razprava', file: 'capture/razprava-desktop.png', crop: { left: 140, top: 0, width: 2312, height: 1156 }, widths: [560, 840, 1184, 1792] },
]

for (const s of SOURCES) {
  const src = sharp(join(root, s.file)).extract(s.crop)
  for (const w of s.widths) {
    const resized = src.clone().resize({ width: w, withoutEnlargement: true })
    await resized.avif({ quality: 55 }).toFile(join(outDir, `${s.id}-${w}.avif`))
    await resized.webp({ quality: 78 }).toFile(join(outDir, `${s.id}-${w}.webp`))
    await resized.jpeg({ quality: 80, mozjpeg: true }).toFile(join(outDir, `${s.id}-${w}.jpg`))
  }
  console.log(`refs: ${s.id} done`)
}

// Bloctopus ships no CSS custom properties (Webflow) — sample its brand colors
// from the capture so the ink chips stay honest. Coordinates in device px (2×).
const probe = sharp(join(root, 'capture/bloctopus-desktop.png'))
const { data, info } = await probe.raw().toBuffer({ resolveWithObject: true })
const px = (x, y) => {
  const i = (y * info.width + x) * info.channels
  return (
    '#' +
    [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')
  )
}
console.log('bloctopus samples:', {
  bg: px(1400, 300),
  headlineWhite: px(600, 650),
  headlineGreen: px(1660, 650),
  ctaGreen: px(506, 1254),
  deepPanel: px(200, 1560),
})

/**
 * Ink chips for the projects that expose no brand custom properties.
 *
 * DOMINANT COLOURS OF THE PLATE CROP, not hand-picked pixels. The first attempt
 * here did pick pixels by eye off a scaled screenshot and every one of them
 * missed — two landed in a white card below the fold and the one aimed at a
 * black button came back near-white. Counting what the crop actually contains
 * cannot miss in that way, and it samples the same region the visitor sees.
 *
 * The crop is reduced to a small grid, each pixel quantised into coarse buckets,
 * and the most common buckets returned once they are far enough apart in RGB to
 * be different colours rather than neighbours of one.
 */
async function chips(file, crop, count = 4, minDistance = 60) {
  const { data, info } = await sharp(join(root, file))
    .extract(crop)
    .resize({ width: 64 })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const tally = new Map()
  for (let i = 0; i < data.length; i += info.channels) {
    const q = [data[i], data[i + 1], data[i + 2]].map((v) => Math.round(v / 24) * 24)
    const key = q.join(',')
    const seen = tally.get(key)
    if (seen) seen.n++
    else tally.set(key, { rgb: q, n: 1 })
  }
  const ranked = [...tally.values()].sort((a, b) => b.n - a.n)
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

  const out = []
  for (const c of ranked) {
    if (out.length === count) break
    if (out.every((o) => dist(o.rgb, c.rgb) >= minDistance)) out.push(c)
  }
  return out.map(
    (c) => '#' + c.rgb.map((v) => Math.min(255, v).toString(16).padStart(2, '0')).join(''),
  )
}

for (const s of SOURCES) {
  if (s.id === 'sile' || s.id === 'pravnapanda' || s.id === 'razprava') {
    console.log(`${s.id} ink chips:`, await chips(s.file, s.crop))
  }
}
