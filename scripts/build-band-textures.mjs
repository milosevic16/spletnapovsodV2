/**
 * Band textures for the exploded assembly in TraditionSection.
 *
 *   node scripts/build-band-textures.mjs
 *
 * Each stratum carries a texture that means what the stratum means: a web that
 * finds you, a dense field of entries, a woven screen that filters, and the
 * blackened plate everything is published onto.
 *
 * THE TEXTURES ARE SHIPPED UNCHANGED — owner's call, and the whole point of
 * this revision. Earlier passes converted them to greyscale, thresholded them,
 * pushed a contrast curve through them and moved their luminance into an alpha
 * channel; every one of those was a translation, and two of these four are
 * COLOUR photographs (cold blue steel, warm oxidation) that any of it would
 * destroy. This script now does exactly two things: it takes a window out of
 * the source, and it encodes. No greyscale, no threshold, no curve, no alpha.
 *
 * THE WINDOW IS THE ONLY DECISION, and it is a SCALE decision before it is a
 * framing one. The file is stretched over the band with `cover`, so a source
 * pixel lands on screen at (bandWidth / cropWidth) of its size. The band is
 * 443 CSS px wide, i.e. 886 device px on a 2x phone — so a window of about
 * that width shows the texture at its own scale, and the full 3136px frame
 * would shrink it 3.5x. That is not neutral: a 4px screen downsampled to 0.65px
 * does not read as a fine screen, it reads as aliasing mush, which is precisely
 * how the first attempt at these failed. ONE window size for all four (1150 px,
 * a little wider than 1:1 so a bit more of each frame survives), which also
 * means the four are shown at the same magnification and read as one set.
 *
 * The window also clears the generator's watermark, baked into the bottom-right
 * of every source — the reason each `top` sits well above the frame's bottom.
 *
 * VERSION THE FILENAME on every refresh: /img/* ships an immutable year-long
 * cache header. These carry fresh names (layer-*) rather than a bump, because
 * the artwork changed completely and the old names described the old set.
 *
 * Deliberately NOT part of the host build — the outputs are committed.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'tex')
mkdirSync(outDir, { recursive: true })

/** Between the band's measured 2.49:1 on desktop and 2.19:1 on a phone, so
 *  `cover` trims a sliver at either end rather than distorting the texture. */
const BAND_RATIO = 2.3
/** The window, in source px. See the scale note in the header. */
const WINDOW_W = 1150
/** Desktop band width, measured — used only to report the on-screen scale. */
const BAND_W = 443

const TEXTURES = [
  {
    // VIDNOST NA GOOGLU — a node-and-link web. What finds you is a graph, and
    // crawlers walk links, so the texture states the claim rather than
    // decorating it.
    id: 'layer-seo-v1',
    file: 'capture/tex-seo-src.png',
    source: '2720x1536',
  },
  {
    // DELUJOČI OBRAZCI — a dense field of discrete entries, ruled across.
    id: 'layer-forms-v1',
    file: 'capture/tex-forms-src2.png',
    source: '2720x1536',
  },
  {
    // PIŠKOTKI IN ZASEBNOST — a woven screen: the thing that decides what
    // passes and what is stopped, which is what the law is about. The one
    // texture with a colour of its own (cold steel blue) and it keeps it.
    id: 'layer-compliance-v1',
    file: 'capture/tex-compliance-src.png',
    source: '3136x1344',
  },
  {
    // OBJAVA NA VAŠI DOMENI — the blackened plate the rest is published onto,
    // striated and slowly oxidising. The densest and darkest of the four.
    id: 'layer-hosting-v1',
    file: 'capture/tex-hosting-src.png',
    source: '3136x1344',
  },
]

for (const t of TEXTURES) {
  const meta = await sharp(join(root, t.file)).metadata()
  const w = Math.min(WINDOW_W, meta.width)
  const h = Math.round(w / BAND_RATIO)

  // Centred horizontally; vertically centred within the frame ABOVE the
  // watermark, which sits in the bottom-right of every source.
  const usableH = Math.round(meta.height * 0.9)
  const crop = {
    left: Math.round((meta.width - w) / 2),
    top: Math.max(0, Math.round((usableH - h) / 2)),
    width: w,
    height: h,
  }

  const out = join(outDir, `${t.id}.webp`)
  await sharp(join(root, t.file))
    .extract(crop)
    .webp({ quality: 90 })
    .toFile(out)

  // Report what was NOT done as much as what was: the encode must stay 3-channel
  // opaque colour, because an alpha channel here would mean something processed
  // it into a mask again.
  const om = await sharp(out).metadata()
  if (om.hasAlpha) throw new Error(`${t.id}: emitted with alpha — this set ships opaque`)
  const s = await sharp(out).stats()
  const [R, G, B] = s.channels
  const cast = R.mean - B.mean
  console.log(
    `tex: ${t.id.padEnd(22)} ${om.width}x${om.height}  ` +
      `RGB ${R.mean.toFixed(0).padStart(3)}/${G.mean.toFixed(0).padStart(3)}/${B.mean.toFixed(0).padStart(3)}  ` +
      `cast ${cast > 4 ? 'warm' : cast < -4 ? 'cool' : 'neutral'}  ` +
      `shown at ${((BAND_W / w) * 100).toFixed(0)}% of source scale`,
  )
}
