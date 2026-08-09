/**
 * Band textures for the exploded assembly in TraditionSection.
 *
 *   node scripts/build-band-textures.mjs
 *
 * Each stratum in that drawing carries a texture that means what the stratum
 * means: a web that finds you, a field waiting for an answer, a sampling
 * lattice, and the near-solid plate everything is published onto.
 *
 * THE OUTPUT IS THE ARTWORK ITSELF, carried as white marks over a TRANSPARENT
 * ground. The component shows the files as plain background images on a black
 * band, which renders exactly what the generator produced (the owner's call,
 * after two rounds of translating the textures — an SVG restatement, then ink
 * masks — read as nothing). The transparency means the same files still work
 * as alpha masks should a future band want to tint them; nothing about the
 * emit would change.
 *
 * THE TEXTURE MUST LIVE IN THE ALPHA CHANNEL, and this is the second lesson
 * this script has had to learn the hard way. CSS `mask-image` with a raster
 * file reads ALPHA by default (`mask-mode: match-source`) — luminance is only
 * consulted if you opt in, and the prefixed -webkit-mask path never consults it
 * at all. The first wiring shipped opaque grayscale files: alpha 1 everywhere,
 * so every mask revealed its entire fill and all four bands rendered as flat
 * washes of paper — "textured" only in the source file nobody was reading. Each
 * emit below therefore converts the source's luminance INTO the alpha channel:
 * white marks opaque, black ground transparent, RGB flat white (the mask never
 * reads it; flat compresses best).
 *
 * THE CROP IS A SCALE DECISION, and it is the one that actually decides whether
 * a texture is visible. The mask is stretched over the band with `cover`, so
 * the ON-SCREEN size of a motif is  sourceRepeat x (bandWidth / cropWidth).
 * The band was measured at 443px wide on desktop and 273px on a phone. The
 * first mesh shipped at the full 2720px source width, which put ~30 nodes
 * across the band and its hairlines at 0.44px — sub-pixel, i.e. invisible. Each
 * crop below is sized so its motif lands in the range the drawn SVG patterns it
 * replaces used (11-34px), and `target` records what that works out to.
 *
 * VERSION THE FILENAME on every refresh: /img/* ships an immutable year-long
 * cache header, so a regenerated texture under the same name never reaches a
 * repeat visitor. mesh is at v3: v1 shipped at the wrong scale, v2 (with the
 * other three at v1) shipped without the alpha channel.
 *
 * Deliberately NOT part of the host build — the outputs are committed.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'tex')
mkdirSync(outDir, { recursive: true })

/** Every crop is cut to this, between the band's measured 2.49:1 on desktop and
 *  2.19:1 on a phone, so `cover` trims a sliver at either end rather than a
 *  quarter of the frame. */
const BAND_RATIO = 2.3
const BAND_W = 443 // desktop, measured — only used to report the on-screen size

const TEXTURES = [
  {
    // VIDNOST NA GOOGLU — a node-and-link web. What finds you is a graph, and
    // crawlers walk links, so the texture states the claim rather than
    // decorating it. Zoomed hard: at full source width its lines were invisible.
    id: 'mesh-v3',
    file: 'capture/tex-mesh-src.png',
    crop: { left: 860, top: 550, width: 1000 },
    repeat: 90, // node spacing in the source, px
    width: 1200,
  },
  {
    // DELUJOČI OBRAZCI — the field itself, ruled, with a caret in it.
    id: 'forms-v2',
    file: 'capture/tex-forms-src.png',
    crop: { left: 0, top: 150, width: 2720 },
    repeat: 250, // one field
    width: 1600,
  },
  {
    // PIŠKOTKI IN ZASEBNOST — a sampling lattice: discrete points taken off a
    // continuous person, which is what the law is about.
    //
    // `threshold` is not a look, it is a repair. The source carries a stray pink
    // dashed diagonal — the only non-grey thing in the whole set — and grayscale
    // alone would leave it as a visible grey line across the band. It sits well
    // below the crosses in luminance, so a cut at 230 drops it and keeps them.
    // It cannot be cropped away instead: it spans y 61-1000 of a 1536 source,
    // and a 2.3:1 crop at full width needs 1183 of those rows.
    id: 'privacy-v2',
    file: 'capture/tex-privacy-src.png',
    crop: { left: 0, top: 150, width: 2720 },
    repeat: 113,
    width: 1600,
    threshold: 230,
  },
  {
    // OBJAVA NA VAŠI DOMENI — the near-solid plate the rest is published onto.
    // Its screen is so fine that at full source width it would land at 0.65px
    // and moiré rather than read; this is the deepest zoom of the four.
    id: 'domain-v2',
    file: 'capture/tex-domain-src.png',
    crop: { left: 400, top: 400, width: 400 },
    repeat: 4,
    width: 400,
  },
]

for (const t of TEXTURES) {
  const height = Math.round(t.crop.width / BAND_RATIO)
  // Single-channel luminance ('b-w'), because it is about to BECOME the alpha.
  let gray = sharp(join(root, t.file))
    .extract({ ...t.crop, height })
    .toColourspace('b-w')

  if (t.threshold) gray = gray.threshold(t.threshold)

  const { data, info } = await gray
    .resize({ width: t.width, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Flat white RGB + the luminance as alpha: what an alpha mask actually reads.
  const out = join(outDir, `${t.id}.webp`)
  await sharp(Buffer.alloc(info.width * info.height * 3, 255), {
    raw: { width: info.width, height: info.height, channels: 3 },
  })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(out)

  // The mask is its alpha now: the alpha mean is how much ink the band will
  // actually carry, which is what the density ladder down the stack is set
  // from. Assert the channel exists rather than trusting the encode.
  const meta = await sharp(out).metadata()
  if (!meta.hasAlpha) throw new Error(`${t.id}: emitted without an alpha channel`)
  const { channels } = await sharp(out).stats()
  const a = channels[3]
  const onScreen = (t.repeat * (BAND_W / t.crop.width)).toFixed(1)
  console.log(
    `tex: ${t.id.padEnd(11)} alpha mean ${a.mean.toFixed(1).padStart(5)}/255 (min ${a.min} max ${a.max})   motif ~${onScreen}px on a 443px band`,
  )
}
