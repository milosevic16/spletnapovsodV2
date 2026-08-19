/**
 * Hero backdrop for /apartmaji. Re-run to refresh:
 *
 *   node scripts/build-apartmaji-hero.mjs
 *   git add capture/apartmaji-hero-src.png public/img/apt/
 *
 * WHAT IT DOES: takes the owner-supplied interior photo and reduces it to ONE
 * colour — the page's own paper. It is greyscaled by luminance, then every
 * tone is mapped onto a narrow BEIGE ramp: pure black lands on --shadow, pure
 * white on --highlight (= --list, the page ground), everything between
 * interpolated. Nothing in the output is darker than --shadow, which is chosen
 * so graphite body text stays >= 4.5:1 over the WORST tone (see the numbers by
 * the constants). So the picture reads as a faint tonal texture in the page's
 * own family, never a pasted-in photograph, and it cannot pull any text below
 * AA wherever it happens to sit. The .press dot screen is laid OVER it in the
 * component, so the drafting texture survives.
 *
 * POST-LAUNCH refreshes must BUMP VER: /img/* ships an immutable year-long
 * cache header, so a same-name refresh never reaches a repeat visitor.
 *
 * Deliberately NOT part of the host build (one-off, like the reference plates).
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outDir = join(root, 'public', 'img', 'apt')
mkdirSync(outDir, { recursive: true })

const SRC = join(root, 'capture', 'apartmaji-hero-src.png')
const VER = 'v1'
const WIDTHS = [768, 1152, 1536, 2048, 2560, 3136]

/**
 * The beige ramp endpoints, as sRGB 0-255.
 *   highlight = --list  #F5F2EB (245,242,235) — bright areas melt into the page
 *   shadow             #C6BDAA (198,189,170) — the floor; nothing goes darker
 *
 * WHY THIS SHADOW: relative luminance of #C6BDAA is 0.514. Against it,
 *   --grafit-2 #424242 (L 0.0545): (0.514+0.05)/(0.0545+0.05) = 5.4:1
 *   --grafit   ~#1a (L 0.006):     (0.514+0.05)/(0.006+0.05)  = 10.0:1
 * both clear the 4.5:1 body floor, and since 0.514 is the DARKEST tone the
 * image can produce, every other tone is lighter and safer. Verified in-page
 * after wiring, against the real tokens.
 */
const HI = [245, 242, 235]
const SH = [198, 189, 170]

// A 256-entry beige LUT: grey g -> SH + g/255 * (HI - SH), per channel. Done on
// the raw buffer by hand because sharp's .linear cannot expand a greyscale band
// back to three channels ("Band expansion using linear is unsupported").
const LUT = Array.from({ length: 256 }, (_, g) =>
  SH.map((sh, i) => Math.round(sh + (g / 255) * (HI[i] - sh))),
)

// Read the source as greyscale, luminance stretched to the full range first
// (.normalise) so the bright interior's shapes spread across the beige ramp and
// actually read, instead of all crowding the top. The floor SH is unchanged, so
// the AA guarantee holds. All greyscale channels are equal; take the first.
const { data, info } = await sharp(SRC)
  .grayscale()
  .normalise()
  .raw()
  .toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const out = Buffer.allocUnsafe(W * H * 3)
for (let p = 0, q = 0; p < data.length; p += info.channels, q += 3) {
  const [r, gg, bb] = LUT[data[p]]
  out[q] = r
  out[q + 1] = gg
  out[q + 2] = bb
}
const base = sharp(out, { raw: { width: W, height: H, channels: 3 } })

for (const w of WIDTHS) {
  const r = base.clone().resize({ width: w, withoutEnlargement: true })
  await r.avif({ quality: 55 }).toFile(join(outDir, `apt-hero-${VER}-${w}.avif`))
  await r.webp({ quality: 78 }).toFile(join(outDir, `apt-hero-${VER}-${w}.webp`))
  await r.jpeg({ quality: 82, mozjpeg: true }).toFile(join(outDir, `apt-hero-${VER}-${w}.jpg`))
  console.log(`apt-hero ${VER} ${w}w -> avif/webp/jpg`)
}
console.log('done: public/img/apt/')
