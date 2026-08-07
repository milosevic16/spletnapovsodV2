/**
 * Reference capture — step 1 of the image pipeline (step 2: build-reference-images.mjs).
 *
 * Drives the installed Edge via puppeteer-core (no bundled browser) and, per
 * site, HIDES ITS ANIMATED HERO ELEMENTS before the screenshot. The rule this
 * serves: a capture must be the site AT REST, because every animated element
 * is re-implemented LIVE in the carousel preview (src/lib/slide-effects.ts) —
 * a baked mid-animation frame plus a live copy shows the element twice
 * (shipped once: the bloctopus scan line baked mid-sweep under a second
 * animated one).
 *
 * What is hidden where, and which live effect replaces it:
 *   lemur.legal        .hero-title-glitch (glitch intro line), .caret,
 *                      .node-dot (pulsing status dots)  → lemurPreview
 *   mercpeter          nothing — its hero animates only on ENTRANCE and the
 *                      capture is the settled end state    → mercPreview
 *                      replays the entrance over screenshot slices
 *   bloctopus.net      .hero__scan-line                    → bloctopusPreview
 *
 * The same run MEASURES the geometry (getBoundingClientRect of every element
 * the previews rebuild) and writes capture/geometry.json. slide-effects.ts
 * hard-codes percentages derived from that file; re-run this script and
 * re-derive when a reference site redesigns.
 *
 * Usage:  node scripts/capture-references.mjs
 * Then:   node scripts/build-reference-images.mjs
 *
 * Deliberately NOT part of the host build: a build must never depend on three
 * live third-party sites being up.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
mkdirSync(join(root, 'capture'), { recursive: true })

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p))

const SITES = [
  {
    id: 'lemur',
    url: 'https://lemur.legal',
    // Blank the glitch line's SPACE (visibility, not display — the headline
    // below must not move up), kill its chromatic overlays, hide the pulsing
    // dots and the blinking carets. All four return as live elements.
    hideCss: `
      .hero-title-glitch { visibility: hidden !important; }
      [data-glitch-overlay] { display: none !important; }
      .node-dot { visibility: hidden !important; }
      .caret { visibility: hidden !important; }
    `,
    measure: () => {
      const r = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const b = el.getBoundingClientRect()
        return { x: b.x, y: b.y, w: b.width, h: b.height }
      }
      const dots = [...document.querySelectorAll('.node-dot')].map((el) => {
        const b = el.getBoundingClientRect()
        return {
          x: b.x, y: b.y, w: b.width, h: b.height,
          color: el.getAttribute('data-nd-color'),
          radius: getComputedStyle(el).borderRadius,
        }
      })
      const glitch = document.querySelector('.hero-title-glitch')
      const gcs = glitch ? getComputedStyle(glitch) : null
      return {
        kicker: r('.hero .kicker'),
        hexrow: r('.hexrow'),
        glitchLine: r('.hero-title-glitch'),
        glitchStyle: gcs
          ? { fontSize: gcs.fontSize, letterSpacing: gcs.letterSpacing, fontWeight: gcs.fontWeight, color: gcs.color, fontFamily: gcs.fontFamily }
          : null,
        h1: r('#hero-h'),
        actions: r('.hero__actions'),
        nodeRow: r('.node-row'),
        dots,
        console: r('.console'),
        hero: r('.hero'),
      }
    },
  },
  {
    id: 'mercpeter',
    url: 'https://mercpeter.netlify.app',
    hideCss: '',
    measure: () => {
      const r = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const b = el.getBoundingClientRect()
        return { x: b.x, y: b.y, w: b.width, h: b.height }
      }
      const badge = document.querySelector('#hero h1 + p')
      const badgeB = badge ? badge.getBoundingClientRect() : null
      return {
        hero: r('#hero'),
        line1: r('#mline-1'),
        line2: r('#mline-2'),
        line3: r('#mline-3'),
        badge: badgeB ? { x: badgeB.x, y: badgeB.y, w: badgeB.width, h: badgeB.height } : null,
        photoCol: r('#hero .pm-desktop-only'),
        leftBg: getComputedStyle(document.querySelector('#hero')).backgroundColor,
      }
    },
  },
  {
    id: 'bloctopus',
    url: 'https://bloctopus.net',
    hideCss: `.hero__scan-line { display: none !important; }`,
    measure: () => {
      const r = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const b = el.getBoundingClientRect()
        return { x: b.x, y: b.y, w: b.width, h: b.height }
      }
      return { hero: r('.hero.is-desktop') ?? r('.hero'), h1: r('.hero__title'), inner: r('.hero__inner') }
    },
  },
]

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  args: ['--hide-scrollbars'],
})

const geometry = {}
try {
  for (const site of SITES) {
    const page = await browser.newPage()
    await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 60000 })
    // Let entrance one-shots finish and fonts land; loops are hidden by CSS.
    await page.evaluate(() => document.fonts?.ready)
    await new Promise((res) => setTimeout(res, 4000))
    if (site.hideCss) await page.addStyleTag({ content: site.hideCss })
    await new Promise((res) => setTimeout(res, 250))
    geometry[site.id] = await page.evaluate(site.measure)
    await page.screenshot({ path: join(root, 'capture', `${site.id}-desktop.png`) })
    console.log(`capture: ${site.id} done`)
    await page.close()
  }
} finally {
  await browser.close()
}

geometry._meta = {
  viewport: '1440x900 @2x — rects in CSS px; capture device px = 2x these',
  capturedAt: new Date().toISOString().slice(0, 10),
}
writeFileSync(join(root, 'capture', 'geometry.json'), JSON.stringify(geometry, null, 2))
console.log('geometry.json written')
