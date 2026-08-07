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
 *  (double the CSS-px framing of the original 1× crops). */
const SOURCES = [
  // lemur: the full landing composition — glitch intro line (blanked at
  // capture, re-typed live), headline, CTAs, status dots AND the terminal
  // console. Top sits 2px under the hexrow so the console's HUD corners stay
  // whole; geometry.json is the authority for these numbers.
  { id: 'lemur', file: 'capture/lemur-desktop.png', crop: { left: 48, top: 500, width: 2480, height: 1240 }, widths: [560, 776, 1104, 1552] },
  { id: 'mercpeter', file: 'capture/mercpeter-desktop.png', crop: { left: 128, top: 200, width: 2368, height: 1184 }, widths: [560, 840, 1184, 1792] },
  { id: 'bloctopus', file: 'capture/bloctopus-desktop.png', crop: { left: 192, top: 400, width: 2368, height: 1184 }, widths: [560, 840, 1184, 1792] },
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
