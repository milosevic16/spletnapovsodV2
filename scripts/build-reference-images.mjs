/**
 * Reference-card image pipeline. Re-run to REFRESH the portfolio screenshots:
 *
 *   1. capture fresh PNGs into capture/ (headless Edge):
 *      msedge --headless --disable-gpu --hide-scrollbars --screenshot=capture/<site>-desktop.png \
 *             --window-size=1440,900 --virtual-time-budget=20000 <url>
 *      (lemur.legal: use capture/lemur-c.png naming or update SOURCES below; its rotating
 *       intro line is mid-animation in every frame — the crop starts below it on purpose.)
 *   2. node scripts/build-reference-images.mjs
 *   3. commit the regenerated public/img/refs/ outputs.
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

/** Art-directed 2:1 crops from the 1440×900 captures. */
const SOURCES = [
  // lemur: right edge stops short of the terminal panel (left edge at x≈847)
  { id: 'lemur', file: 'capture/lemur-c.png', crop: { left: 64, top: 312, width: 776, height: 388 }, widths: [560, 776] },
  { id: 'mercpeter', file: 'capture/mercpeter-desktop.png', crop: { left: 64, top: 100, width: 1184, height: 592 }, widths: [560, 840, 1184] },
  { id: 'bloctopus', file: 'capture/bloctopus-desktop.png', crop: { left: 96, top: 200, width: 1184, height: 592 }, widths: [560, 840, 1184] },
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
// from the capture so the ink chips stay honest.
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
  bg: px(700, 150),
  headlineWhite: px(300, 325),
  headlineGreen: px(830, 325),
  ctaGreen: px(253, 627),
  deepPanel: px(100, 780),
})
