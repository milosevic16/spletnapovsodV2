/**
 * ONE-OFF asset generator — og.jpg (1200×630) + apple-touch-icon.png.
 * Re-run only when the brand or tagline changes; outputs are COMMITTED to
 * public/ and are NOT part of the host build (dev-machine script; expects
 * Edge at the standard Windows path).
 *
 * og.jpg: scripts/og.html rendered by headless Edge — real browser text
 * engine, the site's own variable Archivo. Icon: pure-rect SVG via resvg.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'

const root = process.cwd()
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

const tmpPng = join(root, 'scripts', 'og-capture.png')
execFileSync(EDGE, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--screenshot=${tmpPng}`,
  '--window-size=1200,630',
  '--virtual-time-budget=4000',
  pathToFileURL(join(root, 'scripts', 'og.html')).href,
])

const png = sharp(tmpPng)
const meta = await png.metadata()
if (meta.width !== 1200 || meta.height !== 630) {
  console.error(`og capture is ${meta.width}×${meta.height}, expected 1200×630 — check display scaling flags`)
  process.exit(1)
}
await png.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(join(root, 'public/og.jpg'))
await png.clone().png().toFile(join(root, 'public/og.png'))
rmSync(tmpPng)

// Apple touch icon: the pd mark on paper (180×180), the same 312.4 × 200
// drawing every other copy uses, scaled to 140 wide and centred.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="#F5F2EB"/>
  <g transform="translate(20 45.2) scale(0.4481)">
    <circle cx="100" cy="100" r="100" fill="#B03B22" />
    <circle cx="212.4" cy="100" r="100" fill="#B03B22" />
    <circle cx="110.8" cy="100" r="53.3" fill="none" stroke="#F5F2EB" stroke-width="24.5" />
    <rect x="36.6" y="70" width="24.5" height="95.5" rx="12.25" fill="#F5F2EB" />
    <g transform="rotate(180 156.2 100)">
      <circle cx="110.8" cy="100" r="53.3" fill="none" stroke="#F5F2EB" stroke-width="24.5" />
      <rect x="36.6" y="70" width="24.5" height="95.5" rx="12.25" fill="#F5F2EB" />
    </g>
  </g>
</svg>`
writeFileSync(
  join(root, 'public/apple-touch-icon.png'),
  new Resvg(icon, { fitTo: { mode: 'width', value: 180 } }).render().asPng(),
)

console.log('og: public/og.jpg + public/og.png + public/apple-touch-icon.png written')
