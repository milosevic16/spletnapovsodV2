/**
 * Pillar plate images — one composition per pillar of »Kaj vsebujejo vsi
 * paketi?«, drawn in the site's own drafting language (paper, hairline grid,
 * graphite, one red) and rendered to AVIF/WebP/JPEG variants.
 *
 *   node scripts/build-pillar-images.mjs
 *   → public/img/pillars/<id>-<w>.{avif,webp,jpg}   w ∈ 480/800/1200/1600
 *
 * These are drawn brand plates, not photographs: nothing here can generate
 * photographic imagery, and the section must not wait on assets. To swap in
 * real (e.g. AI-generated) images later: produce three 1600×1200 pictures and
 * re-run this script with SOURCES pointing at the files (or just overwrite the
 * outputs). POST-LAUNCH swaps must bump the filename version (pillar images
 * ship under /img/* with the immutable year-long cache header).
 *
 * One-shot pipeline, committed, NOT part of the host build. SVGs carry zero
 * text (text is never an image) and zero external refs, so resvg needs no
 * fonts.
 */
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const W = 1600
const H = 1200
const WIDTHS = [480, 800, 1200, 1600]

// The site's tokens, literal (tokens.css is the authority; re-check on retheme).
const PAPER = '#F5F2EB'
const PAPER2 = '#ECE8DE'
const MREZA = '#D9D3C6'
const MREZA_S = '#B3AC9C'
const GRAFIT = '#1A1C1E'
const GRAFIT_IN = '#24282C'
const REZ = '#B03B22'

/** Shared sheet: paper, faint drafting grid, frame + corner register marks. */
function sheet(inner) {
  const grid = []
  for (let x = 80; x < W; x += 80) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`)
  for (let y = 80; y < H; y += 80) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`)
  const c = 46
  const marks = [
    [c, c, 1, 1],
    [W - c, c, -1, 1],
    [c, H - c, 1, -1],
    [W - c, H - c, -1, -1],
  ]
    .map(
      ([x, y, dx, dy]) =>
        `<path d="M ${x + dx * 26} ${y} H ${x} V ${y + dy * 26}" fill="none" stroke="${GRAFIT}" stroke-width="3"/>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <g stroke="${MREZA}" stroke-width="1">${grid.join('')}</g>
  <rect x="${c}" y="${c}" width="${W - 2 * c}" height="${H - 2 * c}" fill="none" stroke="${MREZA_S}" stroke-width="2"/>
  ${marks}
  ${inner}
</svg>`
}

/** Unikaten dizajn — a plan being drawn: walls, a column, one red cut. */
const design = sheet(`
  <!-- the plan -->
  <rect x="440" y="300" width="800" height="600" fill="${PAPER2}" stroke="${GRAFIT}" stroke-width="7"/>
  <line x1="760" y1="300" x2="760" y2="640" stroke="${GRAFIT}" stroke-width="5"/>
  <line x1="760" y1="640" x2="1240" y2="640" stroke="${GRAFIT}" stroke-width="5"/>
  <line x1="1000" y1="640" x2="1000" y2="900" stroke="${GRAFIT}" stroke-width="5"/>
  <!-- door swing -->
  <path d="M 760 470 A 120 120 0 0 1 880 590" fill="none" stroke="${GRAFIT}" stroke-width="3"/>
  <line x1="760" y1="470" x2="760" y2="590" stroke="${PAPER2}" stroke-width="9"/>
  <!-- column -->
  <circle cx="1120" cy="450" r="34" fill="none" stroke="${GRAFIT}" stroke-width="6"/>
  <circle cx="1120" cy="450" r="6" fill="${GRAFIT}"/>
  <!-- poché: the cut wall band -->
  <rect x="440" y="860" width="800" height="40" fill="${GRAFIT}"/>
  <!-- dimension line -->
  <g stroke="${GRAFIT}" stroke-width="3">
    <line x1="440" y1="990" x2="1240" y2="990"/>
    <line x1="440" y1="975" x2="440" y2="1005"/>
    <line x1="760" y1="975" x2="760" y2="1005"/>
    <line x1="1240" y1="975" x2="1240" y2="1005"/>
  </g>
  <!-- THE cut -->
  <rect x="330" y="571" width="18" height="18" fill="${REZ}"/>
  <line x1="348" y1="580" x2="1332" y2="580" stroke="${REZ}" stroke-width="8"/>
  <rect x="1332" y="571" width="18" height="18" fill="${REZ}"/>
`)

/** Varnost, hitrost, skladnost — the bastion: hatch field, solid block, seal. */
const security = (() => {
  const hatch = []
  for (let i = -900; i < 1700; i += 26)
    hatch.push(`<line x1="${i}" y1="920" x2="${i + 640}" y2="280"/>`)
  return sheet(`
  <clipPath id="hf"><rect x="360" y="280" width="880" height="640"/></clipPath>
  <g clip-path="url(#hf)" stroke="${MREZA_S}" stroke-width="3">${hatch.join('')}</g>
  <rect x="360" y="280" width="880" height="640" fill="none" stroke="${GRAFIT}" stroke-width="4"/>
  <!-- the vault -->
  <rect x="560" y="400" width="480" height="400" fill="${GRAFIT}"/>
  <rect x="620" y="460" width="360" height="280" fill="${GRAFIT_IN}"/>
  <rect x="620" y="460" width="360" height="280" fill="none" stroke="${PAPER}" stroke-width="2"/>
  <!-- keyway -->
  <circle cx="800" cy="580" r="34" fill="none" stroke="${PAPER}" stroke-width="6"/>
  <line x1="800" y1="614" x2="800" y2="668" stroke="${PAPER}" stroke-width="6"/>
  <!-- the seal -->
  <circle cx="1266" cy="316" r="86" fill="${PAPER}" stroke="${REZ}" stroke-width="8"/>
  <circle cx="1266" cy="316" r="52" fill="none" stroke="${REZ}" stroke-width="4"/>
  <circle cx="1266" cy="316" r="10" fill="${REZ}"/>
`)
})()

/** Google in AI vidnost — the network: hub, spokes, one red route, the sweep. */
const seo = (() => {
  const hub = [520, 660]
  const nodes = [
    [900, 330, 24, false],
    [1210, 420, 30, true], // the red route
    [1120, 700, 22, false],
    [860, 880, 26, false],
    [1330, 820, 20, false],
    [640, 420, 18, false],
  ]
  const spokes = nodes
    .map(
      ([x, y, , red]) =>
        `<line x1="${hub[0]}" y1="${hub[1]}" x2="${x}" y2="${y}" stroke="${red ? REZ : GRAFIT}" stroke-width="${red ? 7 : 4}"/>`,
    )
    .join('')
  const rings = nodes
    .map(
      ([x, y, r, red]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${red ? REZ : GRAFIT}" stroke-width="${red ? 7 : 5}"/>`,
    )
    .join('')
  return sheet(`
  <path d="M 520 140 A 520 520 0 0 1 1040 660" fill="none" stroke="${MREZA_S}"
    stroke-width="3" stroke-dasharray="14 18"/>
  <path d="M 520 260 A 400 400 0 0 1 920 660" fill="none" stroke="${MREZA_S}"
    stroke-width="3" stroke-dasharray="14 18"/>
  ${spokes}
  ${rings}
  <circle cx="${hub[0]}" cy="${hub[1]}" r="40" fill="${GRAFIT}"/>
  <circle cx="${hub[0]}" cy="${hub[1]}" r="58" fill="none" stroke="${GRAFIT}" stroke-width="3"/>
  <circle cx="1210" cy="420" r="10" fill="${REZ}"/>
`)
})()

const SOURCES = [
  { id: 'design', svg: design },
  { id: 'security', svg: security },
  { id: 'seo', svg: seo },
]

const outDir = join(process.cwd(), 'public', 'img', 'pillars')
mkdirSync(outDir, { recursive: true })

for (const s of SOURCES) {
  const png = new Resvg(s.svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
  const src = sharp(png)
  for (const w of WIDTHS) {
    const resized = src.clone().resize({ width: w, withoutEnlargement: true })
    await resized.avif({ quality: 55 }).toFile(join(outDir, `${s.id}-${w}.avif`))
    await resized.webp({ quality: 80 }).toFile(join(outDir, `${s.id}-${w}.webp`))
    await resized.jpeg({ quality: 82, mozjpeg: true }).toFile(join(outDir, `${s.id}-${w}.jpg`))
  }
  console.log(`pillars: ${s.id} done`)
}
