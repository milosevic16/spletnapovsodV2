/**
 * Primeri image pipeline — the three fictional-demo template renders shown in
 * the /apartmaji »Primeri« section. Companion to build-reference-images.mjs,
 * same emit shape (2:1 art-directed crop of a 2880×1800 capture → AVIF/WebP/
 * JPEG at each width), separate script so the portfolio pipeline is never
 * re-run by accident.
 *
 * PROVENANCE, which is the whole point of these images: the captures are
 * renders of template packs from SpehKing/register_nastanitev (atelier,
 * veduta, mariven-stay) driven with a FICTIONAL apartment — invented name
 * (»Apartma Lipa«), invented copy and reviews. The photographs inside the
 * renders are CC0 (public-domain) images from Openverse; the id-by-id list
 * ships with the pages at public/primeri/photos/PROVENANCE.json. Nothing in
 * them belongs to a real operator; that is deliberate, because every page
 * the generator's own pipeline produces is built from scraped Airbnb/Booking
 * content of real owners, which must never appear on this site. The templates emit English UI today; the demo HTML was
 * post-translated to Slovenian to show what a delivered site looks like.
 * Driver + capture scripts: session scratchpad (render-demo.py,
 * capture-demo.mjs), one-shot by design.
 *
 * To REFRESH: re-render + re-capture (2880×1800 PNGs into capture/), then
 *   node scripts/build-primeri-images.mjs
 * POST-LAUNCH refreshes must BUMP the filename version (primer-*-v2-560.avif …)
 * — /img/* ships an immutable year-long cache header, so a refresh under the
 * same names never reaches a repeat visitor. Pre-launch, names are stable.
 *
 * Deliberately NOT part of the host build.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'primeri')
mkdirSync(outDir, { recursive: true })

const WIDTHS = [560, 840, 1104]

/** 2:1 crops in DEVICE px on the 2880×1800 captures — art-directed per pack:
 *  atelier's split editorial reads from the top; veduta's identity is the
 *  title plate over the hero's lower edge plus the stat strip, which live
 *  360px down; mariven's centred hero statement reads from the top. */
const SOURCES = [
  { id: 'primer-atelier', file: 'capture/primer-atelier.png', crop: { left: 0, top: 0, width: 2880, height: 1440 } },
  { id: 'primer-veduta', file: 'capture/primer-veduta.png', crop: { left: 0, top: 360, width: 2880, height: 1440 } },
  { id: 'primer-mariven', file: 'capture/primer-mariven-stay.png', crop: { left: 0, top: 0, width: 2880, height: 1440 } },
]

for (const s of SOURCES) {
  const src = sharp(join(root, s.file)).extract(s.crop)
  for (const w of WIDTHS) {
    const resized = src.clone().resize({ width: w, withoutEnlargement: true })
    await resized.avif({ quality: 55 }).toFile(join(outDir, `${s.id}-${w}.avif`))
    await resized.webp({ quality: 78 }).toFile(join(outDir, `${s.id}-${w}.webp`))
    await resized.jpeg({ quality: 80, mozjpeg: true }).toFile(join(outDir, `${s.id}-${w}.jpg`))
  }
  console.log(`primeri: ${s.id} done`)
}
