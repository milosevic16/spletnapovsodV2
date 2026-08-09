/**
 * Band textures for the exploded assembly in TraditionSection.
 *
 *   node scripts/build-band-textures.mjs
 *
 * Each stratum in that drawing carries a texture that means what the stratum
 * means. Three of the four are hand-authored SVG patterns living in the
 * component; this script is for the ones that are RASTER, generated outside the
 * repo and cropped in here.
 *
 * THE OUTPUT IS A MASK, NOT A PICTURE. It ships as a grayscale image and the
 * component paints the page's own paper ink through it, which is why the source
 * is generated white-on-black and why this script forces grayscale: the band's
 * colour stays in the tokens, so a texture survives the ground being re-picked
 * (it has been, twice) without being regenerated.
 *
 * The crop does two jobs. It takes the strip the band actually needs: the band
 * was MEASURED at 2.49:1 on desktop and 2.19:1 on a phone, so the crop sits
 * between them at ~2.30:1 and the runtime `cover` trims a sliver at either end
 * rather than a quarter of the width. (The first cut was made to a guessed
 * 3.3:1 and threw away 25% of the mesh at 1280.) And it cuts away the
 * generator's watermark, which sits in the bottom-right of the source — the
 * reason the crop stops well above the source's own bottom edge.
 *
 * VERSION THE FILENAME on every refresh: /img/* ships an immutable year-long
 * cache header, so a regenerated texture under the same name never reaches a
 * repeat visitor.
 *
 * Deliberately NOT part of the host build — the outputs are committed.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'tex')
mkdirSync(outDir, { recursive: true })

const TEXTURES = [
  {
    // VIDNOST NA GOOGLU — a node-and-link web. The stratum is about being found,
    // and what finds you is a graph: crawlers walk links, so a mesh states the
    // thing the band claims rather than decorating it.
    id: 'mesh-v1',
    file: 'capture/tex-mesh-src.png',
    // source is 2720x1536; 1183 tall keeps the full width at ~2.30:1, between
    // the band's measured extremes, and ends at y=1383 — clear of the watermark
    // baked into the bottom of the frame.
    crop: { left: 0, top: 200, width: 2720, height: 1183 },
    width: 1600,
  },
]

for (const t of TEXTURES) {
  const img = sharp(join(root, t.file))
    .extract(t.crop)
    .grayscale()
    .resize({ width: t.width, withoutEnlargement: true })

  const out = join(outDir, `${t.id}.webp`)
  await img.webp({ quality: 82 }).toFile(out)

  // Report what the mask will actually do: a mask is luminance, so its mean is
  // how much ink the band will carry and its max is the brightest mark in it.
  const { channels } = await sharp(out).stats()
  const [l] = channels
  console.log(
    `tex: ${t.id}.webp  mean ${l.mean.toFixed(1)}/255  max ${l.max}  min ${l.min}`,
  )
}
