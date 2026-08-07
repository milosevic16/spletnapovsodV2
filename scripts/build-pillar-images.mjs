/**
 * Pillar plate images — one composition per pillar of »Kaj vsebujejo vsi
 * paketi?«, drawn in the site's own drafting language (paper, hairline grid,
 * graphite, one red) and rendered to AVIF/WebP/JPEG variants.
 *
 *   node scripts/build-pillar-images.mjs
 *   → public/img/pillars/<id>-<w>.{avif,webp,jpg}   w ∈ 480/800/1200/1600
 *
 * Each plate must NAME ITS PILLAR at a glance while staying a technical
 * drawing rather than an icon (owner's call — the first set read as generic
 * architecture):
 *   design    a web page drawn as an elevation — chrome, hero, columns,
 *             footer — under column guides and dimension lines, cut by the
 *             red plane. The subject is a page being drawn to measure.
 *   security  a padlock in section (shackle, poché body, varying pin depths,
 *             keyway) inside a hatched perimeter, with a speed gauge and a
 *             compliance seal — the pillar's three words, one device each.
 *   seo       the page itself as the source, radiating through detection arcs
 *             to the engines that find it, one route in red.
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

/**
 * Unikaten dizajn — a WEB PAGE drawn as an elevation: chrome bar, hero frame,
 * copy, a two-card band, footer. Column guides and dimension lines say it is
 * being set out to measure, not picked off a shelf; the red plane cuts it.
 */
const design = (() => {
  // Six columns inside the page's own margin — the guides a layout is set on.
  const x0 = 550
  const col = 70
  const gut = 16
  const guides = [1, 2, 3, 4, 5]
    .map((i) => {
      const x = x0 + i * (col + gut) - gut / 2
      return `<line x1="${x}" y1="238" x2="${x}" y2="942"/>`
    })
    .join('')
  const rules = [
    [626, 500],
    [658, 460],
    [690, 300],
  ]
    .map(([y, w]) => `<line x1="550" y1="${y}" x2="${550 + w}" y2="${y}"/>`)
    .join('')
  const cards = [550, 815]
    .map(
      (x) =>
        `<rect x="${x}" y="730" width="235" height="140" fill="${PAPER}" stroke="${GRAFIT}" stroke-width="4"/>` +
        `<line x1="${x + 26}" y1="792" x2="${x + 183}" y2="792" stroke="${MREZA_S}" stroke-width="7"/>` +
        `<line x1="${x + 26}" y1="818" x2="${x + 140}" y2="818" stroke="${MREZA_S}" stroke-width="7"/>`,
    )
    .join('')
  return sheet(`
  <!-- the page -->
  <rect x="520" y="230" width="560" height="720" fill="${PAPER2}" stroke="${GRAFIT}" stroke-width="7"/>
  <g stroke="${MREZA_S}" stroke-width="2" stroke-dasharray="10 12">${guides}</g>
  <!-- chrome: brand block left, three nav ticks right -->
  <rect x="550" y="258" width="500" height="58" fill="${GRAFIT}"/>
  <rect x="570" y="276" width="76" height="22" fill="${PAPER}"/>
  <rect x="890" y="278" width="44" height="18" fill="${PAPER}"/>
  <rect x="944" y="278" width="44" height="18" fill="${PAPER}"/>
  <rect x="998" y="278" width="52" height="18" fill="${PAPER}"/>
  <!-- hero frame, drawn as an image placeholder -->
  <rect x="550" y="346" width="500" height="250" fill="none" stroke="${GRAFIT}" stroke-width="5"/>
  <line x1="550" y1="346" x2="1050" y2="596" stroke="${MREZA_S}" stroke-width="3"/>
  <line x1="1050" y1="346" x2="550" y2="596" stroke="${MREZA_S}" stroke-width="3"/>
  <!-- copy -->
  <g stroke="${MREZA_S}" stroke-width="9">${rules}</g>
  ${cards}
  <rect x="550" y="895" width="500" height="30" fill="${GRAFIT}"/>
  <!-- dimension lines: width below, height at the left -->
  <g stroke="${GRAFIT}" stroke-width="3">
    <line x1="520" y1="1010" x2="1080" y2="1010"/>
    <line x1="520" y1="995" x2="520" y2="1025"/>
    <line x1="800" y1="995" x2="800" y2="1025"/>
    <line x1="1080" y1="995" x2="1080" y2="1025"/>
    <line x1="450" y1="230" x2="450" y2="950"/>
    <line x1="435" y1="230" x2="465" y2="230"/>
    <line x1="435" y1="950" x2="465" y2="950"/>
  </g>
  <!-- THE cut -->
  <rect x="330" y="602" width="18" height="18" fill="${REZ}"/>
  <line x1="348" y1="611" x2="1332" y2="611" stroke="${REZ}" stroke-width="8"/>
  <rect x="1332" y="602" width="18" height="18" fill="${REZ}"/>
`)
})()

/**
 * Varnost, hitrost, skladnost — one device per word: a padlock in SECTION
 * (shackle, poché body, real pin tumblers at varying depths, keyway) inside a
 * hatched perimeter; a gauge with its needle high; a stamped seal.
 */
const security = (() => {
  const hatch = []
  for (let i = -700; i < 1500; i += 26)
    hatch.push(`<line x1="${i}" y1="930" x2="${i + 570}" y2="360"/>`)

  // Five pins, each bottoming out at its own depth — the detail that makes a
  // lock section read as a lock section rather than a box with a hole.
  const pins = [46, 30, 52, 34, 42]
    .map((d, i) => {
      const x = 466 + i * 62
      return `<line x1="${x}" y1="586" x2="${x}" y2="${586 + d}"/>`
    })
    .join('')

  // Gauge ticks, 180° swept in 30° steps.
  const gx = 1200
  const gy = 430
  const ticks = [0, 1, 2, 3, 4, 5, 6]
    .map((i) => {
      const a = ((180 - i * 30) * Math.PI) / 180
      const p = (r) => [(gx + r * Math.cos(a)).toFixed(1), (gy - r * Math.sin(a)).toFixed(1)]
      const [x1, y1] = p(160)
      const [x2, y2] = p(128)
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`
    })
    .join('')

  // Seal: twelve radial marks around the rim.
  const sx = 1200
  const sy = 850
  const marks = Array.from({ length: 12 }, (_, k) => {
    const a = (k * 30 * Math.PI) / 180
    const p = (r) => [(sx + r * Math.cos(a)).toFixed(1), (sy + r * Math.sin(a)).toFixed(1)]
    const [x1, y1] = p(64)
    const [x2, y2] = p(84)
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`
  }).join('')

  return sheet(`
  <!-- the protected perimeter -->
  <clipPath id="hf"><rect x="350" y="360" width="530" height="570"/></clipPath>
  <g clip-path="url(#hf)" stroke="${MREZA_S}" stroke-width="3">${hatch.join('')}</g>
  <rect x="350" y="360" width="530" height="570" fill="none" stroke="${GRAFIT}" stroke-width="4"/>
  <!-- padlock, in section -->
  <path d="M 525 566 V 496 A 90 90 0 0 1 705 496 V 566" fill="none" stroke="${GRAFIT}" stroke-width="26"/>
  <rect x="450" y="566" width="330" height="292" fill="${GRAFIT}"/>
  <g stroke="${PAPER}" stroke-width="8">${pins}</g>
  <circle cx="615" cy="712" r="34" fill="${PAPER}"/>
  <rect x="603" y="712" width="24" height="82" fill="${PAPER}"/>
  <!-- gauge: the needle sits high -->
  <path d="M 1040 430 A 160 160 0 0 1 1360 430" fill="none" stroke="${GRAFIT}" stroke-width="6"/>
  <g stroke="${GRAFIT}" stroke-width="5">${ticks}</g>
  <line x1="1200" y1="430" x2="1299" y2="331" stroke="${REZ}" stroke-width="9"/>
  <circle cx="1200" cy="430" r="14" fill="${GRAFIT}"/>
  <!-- the seal -->
  <circle cx="1200" cy="850" r="96" fill="${PAPER}" stroke="${REZ}" stroke-width="9"/>
  <g stroke="${REZ}" stroke-width="4">${marks}</g>
  <circle cx="1200" cy="850" r="52" fill="none" stroke="${REZ}" stroke-width="4"/>
  <circle cx="1200" cy="850" r="12" fill="${REZ}"/>
`)
})()

/**
 * Google in AI vidnost — THE PAGE is the source. It sits at the left as a
 * drawn document and radiates out through detection arcs to the engines that
 * find it, one route in red. The old plate was an anonymous hub-and-spokes;
 * making the hub a page is what says the subject is this page being found.
 */
const seo = (() => {
  const sx = 680
  const sy = 660
  const nodes = [
    [1010, 430, 28, false],
    [1270, 560, 32, true], // the red route
    [1180, 800, 26, false],
    [930, 930, 22, false],
    [1370, 340, 20, false],
  ]
  const rays = nodes
    .map(
      ([x, y, , red]) =>
        `<line x1="${sx}" y1="${sy}" x2="${x}" y2="${y}" stroke="${red ? REZ : GRAFIT}" stroke-width="${red ? 7 : 4}"/>`,
    )
    .join('')
  const rings = nodes
    .map(
      ([x, y, r, red]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${red ? REZ : GRAFIT}" stroke-width="${red ? 7 : 5}"/>`,
    )
    .join('')
  // Arcs open to the RIGHT: sweep-flag 0, because flag 1 is clockwise on
  // screen and would bulge them back over the page.
  const arcs = [240, 380, 520]
    .map((r) => {
      const c = Math.cos((55 * Math.PI) / 180) * r
      const s = Math.sin((55 * Math.PI) / 180) * r
      return `<path d="M ${(sx + c).toFixed(1)} ${(sy + s).toFixed(1)} A ${r} ${r} 0 0 0 ${(sx + c).toFixed(1)} ${(sy - s).toFixed(1)}" fill="none" stroke="${MREZA_S}" stroke-width="3" stroke-dasharray="14 18"/>`
    })
    .join('')
  const copy = [
    [548, 260],
    [580, 230],
    [612, 260],
    [644, 190],
  ]
    .map(([y, w]) => `<line x1="390" y1="${y}" x2="${390 + w}" y2="${y}"/>`)
    .join('')
  return sheet(`
  ${arcs}
  ${rays}
  <!-- the page: the thing being found -->
  <rect x="360" y="420" width="320" height="480" fill="${PAPER2}" stroke="${GRAFIT}" stroke-width="7"/>
  <rect x="390" y="450" width="260" height="52" fill="${GRAFIT}"/>
  <g stroke="${MREZA_S}" stroke-width="9">${copy}</g>
  <rect x="390" y="700" width="120" height="90" fill="none" stroke="${GRAFIT}" stroke-width="4"/>
  <line x1="390" y1="700" x2="510" y2="790" stroke="${MREZA_S}" stroke-width="3"/>
  <line x1="510" y1="700" x2="390" y2="790" stroke="${MREZA_S}" stroke-width="3"/>
  <g stroke="${MREZA_S}" stroke-width="8">
    <line x1="540" y1="722" x2="650" y2="722"/>
    <line x1="540" y1="750" x2="650" y2="750"/>
    <line x1="540" y1="778" x2="620" y2="778"/>
  </g>
  ${rings}
  <!-- the emitting edge -->
  <circle cx="${sx}" cy="${sy}" r="20" fill="${GRAFIT}"/>
  <circle cx="${sx}" cy="${sy}" r="34" fill="none" stroke="${GRAFIT}" stroke-width="3"/>
  <circle cx="1270" cy="560" r="11" fill="${REZ}"/>
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
