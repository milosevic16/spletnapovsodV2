/**
 * Band textures for the exploded assembly in TraditionSection.
 *
 *   node scripts/build-band-textures.mjs
 *
 * Each stratum carries a texture that means what the stratum means: a web that
 * finds you, a dense field of entries, a woven screen that filters, and the
 * blackened plate everything is published onto.
 *
 * THE SHEETS ARE BRIGHT NOW — owner's call, and it reverses the "ship them
 * unchanged" doctrine this script used to carry, so here is why the change is
 * an inversion rather than a brightening.
 *
 * MEASURED FIRST: the four sources run at mean luminance 7.5 / 20.9 / 67.6 /
 * 34.4 out of 255, with 94% and 96% of two of them below 51. They are bright
 * marks on black — the STRUCTURE is the marks, the black is only ground. A
 * gamma lift on that is grey mud and nothing else (tried, and it measured mean
 * luminance 24–67: still dark, now also flat). Inverting is the transform that
 * makes them bright while keeping every mark: the node-and-link web becomes
 * black lines on white, the field of entries becomes a ledger sheet, the woven
 * screen and the striated plate become light materials. It is also what the
 * page already is — a section drawing on drafting paper.
 *
 * AND THEN DESATURATED, deliberately. Inversion rotates hue: the cold steel
 * blue comes back as a warm orange-brown, which on this page would be a second
 * red arguing with --rez, the one accent. Pulling saturation to 0.3 leaves the
 * four as near-neutral materials that still differ from each other in weave and
 * density, which is what made the set read as a set. The final linear() lands
 * the ground on paper rather than clipping it to pure white, so the marks keep
 * their weight and the sheets sit in the page's own tonal family.
 *
 * What is still NOT done: no greyscale (they keep a trace of their own colour),
 * no threshold, no alpha channel. The window is unchanged.
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
 * cache header. The bright set is -v2 for exactly that reason — the -v1 files
 * are already on the preview deploys, and a same-name refresh would never reach
 * a repeat visitor.
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
/** How much of the inverted hue survives. 1 keeps the full rotation (warm
 *  orange weave), 0 is greyscale; 0.3 is the one knob for the whole set. */
const SATURATION = 0.3

const TEXTURES = [
  {
    // VIDNOST NA GOOGLU — a node-and-link web. What finds you is a graph, and
    // crawlers walk links, so the texture states the claim rather than
    // decorating it. Inverted, it is a line drawing of that graph.
    id: 'layer-seo-v2',
    file: 'capture/tex-seo-src.png',
    source: '2720x1536',
  },
  {
    // DELUJOČI OBRAZCI — a dense field of discrete entries, ruled across.
    // Inverted, it is a ledger sheet.
    id: 'layer-forms-v2',
    file: 'capture/tex-forms-src2.png',
    source: '2720x1536',
  },
  {
    // PIŠKOTKI IN ZASEBNOST — a woven screen: the thing that decides what
    // passes and what is stopped, which is what the law is about. Its cold
    // steel blue is the colour the desaturation is protecting the page from
    // (inverted it would come back warm orange — see the header).
    id: 'layer-compliance-v2',
    file: 'capture/tex-compliance-src.png',
    source: '3136x1344',
  },
  {
    // OBJAVA NA VAŠI DOMENI — the plate the rest is published onto, striated
    // and slowly oxidising. The densest of the four, and the one that keeps
    // most of its tonal range through the inversion.
    id: 'layer-hosting-v2',
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
    // The brightening, in the order the header argues for: invert, pull the
    // rotated hue back towards neutral, land the ground on paper.
    .negate({ alpha: false })
    .modulate({ saturation: SATURATION, brightness: 1.04 })
    .linear(0.92, 14)
    .webp({ quality: 90 })
    .toFile(out)

  // Report what was NOT done as much as what was: the encode must stay 3-channel
  // opaque colour, because an alpha channel here would mean something processed
  // it into a mask again.
  const om = await sharp(out).metadata()
  if (om.hasAlpha) throw new Error(`${t.id}: emitted with alpha — this set ships opaque`)
  const s = await sharp(out).stats()
  const [R, G, B] = s.channels
  const lum = 0.2126 * R.mean + 0.7152 * G.mean + 0.0722 * B.mean
  // The whole point of this revision is that these are BRIGHT. Assert it rather
  // than trusting the eye: anything under mid-grey means the pipeline silently
  // stopped inverting, which is exactly the class of failure the earlier mask
  // and greyscale passes shipped unnoticed.
  if (lum < 140) throw new Error(`${t.id}: mean luminance ${lum.toFixed(0)} — this set ships bright`)
  const cast = R.mean - B.mean
  console.log(
    `tex: ${t.id.padEnd(22)} ${om.width}x${om.height}  ` +
      `RGB ${R.mean.toFixed(0).padStart(3)}/${G.mean.toFixed(0).padStart(3)}/${B.mean.toFixed(0).padStart(3)}  ` +
      `lum ${lum.toFixed(0).padStart(3)}  ` +
      `cast ${cast > 4 ? 'warm' : cast < -4 ? 'cool' : 'neutral'}  ` +
      `shown at ${((BAND_W / w) * 100).toFixed(0)}% of source scale`,
  )
}
