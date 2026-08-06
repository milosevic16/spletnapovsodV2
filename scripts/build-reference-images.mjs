/**
 * Reference-plate image pipeline. Re-run to REFRESH the portfolio screenshots:
 *
 *   1. capture fresh PNGs into capture/ at 2× density (headless Edge):
 *      msedge --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
 *             --user-data-dir=scripts\edge-tmp --screenshot=capture/<site>-desktop.png \
 *             --window-size=1440,900 --virtual-time-budget=25000 <url>
 *      Expect 2880×1800 output; the DSF flag occasionally no-ops on a cold
 *      profile — re-run the capture until the PNG measures 2880×1800.
 *      (lemur.legal: use capture/lemur-c.png naming or update SOURCES below; its rotating
 *       intro line is mid-animation in every frame — the crop starts below it on purpose.)
 *   2. node scripts/build-reference-images.mjs
 *   3. commit the regenerated public/img/refs/ outputs.
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
  // lemur: right edge stops short of the terminal panel (left edge at x≈847 CSS)
  { id: 'lemur', file: 'capture/lemur-c.png', crop: { left: 128, top: 624, width: 1552, height: 776 }, widths: [560, 776, 1104, 1552] },
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
