/**
 * In-frame previews for the work carousel.
 *
 * THE RULE: the frame is a window into the running site, so the ONLY motion a
 * preview may paint is motion the live site's landing view actually has — and
 * it must paint it exactly where the site has it, at the site's own timing.
 * Nothing here decorates; everything is a port.
 *
 * Every mechanic below was read out of the sites' own shipped code on
 * 2026-08-07 (see capture/geometry.json for the measured element boxes, and
 * scripts/capture-references.mjs for how the captures were taken with these
 * elements hidden — a baked mid-animation frame under a live copy shows the
 * element twice):
 *
 *   lemur.legal          Home-*.js: the [data-glitch-text] loop (host jerk +
 *                        three screen-blended chromatic copies + tear bar,
 *                        60/40 big/small every 0.9–2.4s) and the
 *                        [data-anim="nd"] dot pulse (box-shadow 2→9→2px,
 *                        2s, i×400ms stagger).
 *   mercpeter            inline keyframes: pm-rise (28px, .7s, delays
 *                        50/240/440ms), pm-slide (badge, −20px, .6s @750ms),
 *                        pm-settle (portrait, scale 1.045→1, 2.4s). One-shot
 *                        entrance — replayed each time the plate activates.
 *   bloctopus.net        published override: .hero__scan-line, 2px,
 *                        linear-gradient(90deg,#0000,#1fc49a,#0000),
 *                        scanMove 3s linear infinite, top 0→100% of the hero
 *                        with 10% opacity ramps. No trail, no glow — the
 *                        earlier version's trail band was OUR invention and
 *                        read as a second line.
 *
 * Coordinates are percentages of the frame, derived from capture/geometry.json
 * (1440×900 viewport) mapped through each crop in build-reference-images.mjs.
 * Frame-relative type sizes use cqi — WorkCarousel makes .plate__frame an
 * inline-size container.
 *
 * House rules: injected ornament is aria-hidden, pointer-events:none,
 * re-entrancy guarded, and dies with the subtree. Reduced motion: the static
 * parts (lemur's intro line and status dots — blanked in the capture) still
 * render; only motion is skipped.
 */
import type { Fx } from './fx'
import { prefersReducedMotion } from './fx'

export interface SlideEffect {
  play(): void
  pause(): void
}

const noop: SlideEffect = { play() {}, pause() {} }

function make(frame: HTMLElement, key: string, css: string, tag = 'span'): HTMLElement | null {
  if (frame.querySelector(`:scope > [data-fx="${key}"]`)) return null
  const el = document.createElement(tag)
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('data-fx', key)
  el.style.cssText = `position:absolute;pointer-events:none;${css}`
  frame.appendChild(el)
  return el
}

/** The screenshot currently painted in this frame, for pixel-copy slices. */
function shotUrl(frame: HTMLElement): string {
  const img = frame.querySelector('img')
  return img?.currentSrc || img?.getAttribute('src') || ''
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/* ---------------------------------------------------------------------------
   lemur.legal — the glitching intro line and the pulsing status dots.

   The capture blanks `.hero-title-glitch` and `.node-dot`; both are rebuilt
   here as live elements in the blanked spots, so they exist exactly once.
   The intro line's text, size, color and tracking mirror the measured
   computed style (25px on the 1240px-wide crop, rgb(159,159,159), −0.0525em);
   the site sets it in IBM Plex Mono — our mono face stands in, the closest
   face this project ships.
--------------------------------------------------------------------------- */
const LEMUR_TEXT = 'Your terminal to the legal world:'
/** Chromatic overlay colors + tear bar, verbatim from their glitch init. */
const LEMUR_CHROMA = ['#7F59F5', '#C4823A', '#5FC27A']
const LEMUR_DOTS = [
  // left%, from geometry.json dots (y 69.88% shared): x 194 / 320.3 / 426.06
  { left: 13.71, color: '#5FC27A' },
  { left: 23.9, color: '#7F59F5' },
  { left: 32.42, color: '#5FC27A' },
]

export function lemurPreview(frame: HTMLElement, fx: Fx): SlideEffect {
  // --- static DOM: present even at rest and under reduced motion ----------
  const line = make(
    frame,
    'glitchline',
    // Box: glitch span x194 y284.3 w451.7 h26 in the 24/250/1240×620 crop.
    'left:13.71%;top:5.53%;width:36.5%;z-index:3;' +
      'font-family:var(--font-mono);font-size:2.016cqi;font-weight:500;' +
      'letter-spacing:-0.0525em;line-height:1.04;white-space:nowrap;' +
      'color:rgb(159,159,159);',
  )
  if (!line) return noop
  line.textContent = LEMUR_TEXT

  // Three screen-blended copies, born invisible — flashed in clip bands.
  const overlays = LEMUR_CHROMA.map((col) => {
    const o = document.createElement('span')
    o.setAttribute('aria-hidden', 'true')
    o.style.cssText =
      'position:absolute;top:0;left:0;width:100%;pointer-events:none;opacity:0;' +
      `font:inherit;letter-spacing:inherit;line-height:inherit;color:${col};mix-blend-mode:screen;`
    o.textContent = LEMUR_TEXT
    line.appendChild(o)
    return o
  })
  // The tear bar (their 6px violet @ .6 alpha, random top per burst).
  const tear = document.createElement('span')
  tear.setAttribute('aria-hidden', 'true')
  tear.style.cssText =
    'position:absolute;left:0;width:100%;height:23%;background:rgba(127,89,245,.6);' +
    'pointer-events:none;opacity:0;mix-blend-mode:screen;'
  line.appendChild(tear)

  const dots = LEMUR_DOTS.map((d, i) =>
    make(
      frame,
      `dot${i}`,
      `left:${d.left}%;top:69.88%;width:0.42cqi;aspect-ratio:1;border-radius:50%;` +
        `background:${d.color};z-index:3;box-shadow:0 0 2px ${d.color};`,
    ),
  )

  let running = false

  /** Their u(): a horizontal clip band across the line. */
  const band = (a: string | number, b: string | number) =>
    `polygon(0 ${a}, 100% ${a}, 100% ${b}, 0 ${b})`
  const pct = () => `${(Math.random() * 80 + 5) | 0}%`

  /** The big burst — host jerk, three staggered chroma flashes, one tear. */
  function big() {
    if (!running || !line) return
    fx.anim(
      line,
      [
        { transform: 'none' },
        { transform: `translateX(${rnd(-2, 2)}%) skewX(${rnd(-5, 5)}deg)`, offset: 0.08 },
        { transform: `translateX(${rnd(-1.3, 1.3)}%)`, offset: 0.18 },
        { transform: `translateX(${rnd(-2.65, 2.65)}%) skewX(${rnd(-7, 7)}deg)`, offset: 0.28 },
        { transform: `translateX(${rnd(-0.9, 0.9)}%)`, offset: 0.42 },
        { transform: `translateX(${rnd(-2, 2)}%) skewX(${rnd(-4, 4)}deg)`, offset: 0.56 },
        { transform: `translateX(${rnd(-0.7, 0.7)}%)`, offset: 0.72 },
        { transform: 'none' },
      ],
      { duration: 450, easing: 'steps(7,end)', fill: 'none' },
    )
    const flash = (o: HTMLElement, dur: number, steps: number) =>
      fx.anim(
        o,
        [
          { opacity: 0, transform: 'none', clipPath: 'none' },
          { opacity: 1, transform: 'translateX(-2.6%)', clipPath: band(pct(), pct()), offset: 0.05 },
          { opacity: 0.9, transform: 'translateX(2%)', clipPath: band(pct(), pct()), offset: 0.18 },
          { opacity: 0, offset: 0.3 },
          { opacity: 0.95, transform: 'translateX(-1.8%)', clipPath: band('5%', '42%'), offset: 0.4 },
          { opacity: 0, offset: 0.52 },
          { opacity: 0.85, transform: 'translateX(2.4%)', clipPath: band('55%', '87%'), offset: 0.64 },
          { opacity: 0, offset: 0.77 },
          { opacity: 0.75, transform: 'translateX(-1.3%)', clipPath: band('18%', '62%'), offset: 0.87 },
          { opacity: 0, transform: 'none', clipPath: 'none' },
        ],
        { duration: dur, easing: `steps(${steps},end)`, fill: 'none' },
      )
    flash(overlays[0]!, 450, 6)
    fx.setTimeout(() => running && flash(overlays[1]!, 420, 6), 55)
    fx.setTimeout(() => running && flash(overlays[2]!, 430, 5), 110)
    fx.setTimeout(() => {
      if (!running) return
      tear.style.top = `${(Math.random() * 80) | 0}%`
      fx.anim(
        tear,
        [
          { opacity: 0, height: '8%' },
          { opacity: 1, height: '46%', offset: 0.1 },
          { opacity: 0.85, height: '15%', offset: 0.55 },
          { opacity: 0, height: '8%' },
        ],
        { duration: 220, easing: 'ease', fill: 'none' },
      )
    }, 75)
  }

  /** The small burst. */
  function small() {
    if (!running || !line) return
    const p = rnd(-1.3, 1.3)
    fx.anim(
      overlays[0]!,
      [
        { opacity: 0, transform: 'none', clipPath: 'none' },
        { opacity: 0.9, transform: `translateX(${p}%)`, clipPath: band('20%', '58%'), offset: 0.15 },
        { opacity: 0, offset: 0.5 },
        { opacity: 0.75, transform: `translateX(${-p}%)`, clipPath: band('62%', '82%'), offset: 0.76 },
        { opacity: 0, transform: 'none', clipPath: 'none' },
      ],
      { duration: 200, easing: 'steps(4,end)', fill: 'none' },
    )
    fx.anim(
      line,
      [
        { transform: 'none' },
        { transform: `translateX(${rnd(-1.1, 1.1)}%) skewX(${rnd(-3, 3)}deg)`, offset: 0.3 },
        { transform: 'none' },
      ],
      { duration: 200, easing: 'steps(4,end)', fill: 'none' },
    )
  }

  /** Their scheduler: every 0.9–2.4s, 60% big / 40% small, 50% echo. */
  function schedule() {
    if (!running) return
    fx.setTimeout(() => {
      if (!running) return
      Math.random() < 0.6 ? big() : small()
      if (Math.random() < 0.5) fx.setTimeout(() => running && small(), rnd(110, 300))
      schedule()
    }, rnd(900, 2400))
  }

  const dotAnims: Animation[] = []

  return {
    play() {
      if (running || prefersReducedMotion()) return
      running = true
      fx.setTimeout(() => running && big(), 500)
      fx.setTimeout(() => running && small(), 900)
      schedule()
      for (const [i, d] of dots.entries()) {
        if (!d) continue
        const col = LEMUR_DOTS[i]!.color
        dotAnims.push(
          fx.anim(
            d,
            [
              { boxShadow: `0 0 2px ${col}` },
              { boxShadow: `0 0 9px ${col}` },
              { boxShadow: `0 0 2px ${col}` },
            ],
            { duration: 2000, delay: i * 400, iterations: Infinity, easing: 'ease' },
          ),
        )
      }
    },
    pause() {
      running = false
      for (const a of dotAnims) a.cancel()
      dotAnims.length = 0
      // The line and dots stay visible — they are page content, not ornament.
      line.style.transform = ''
      for (const o of overlays) o.style.opacity = '0'
      tear.style.opacity = '0'
    },
  }
}

/* ---------------------------------------------------------------------------
   mercpeter — the hero assembling itself, replayed on each activation.

   The site's only landing motion is its entrance. The capture is the settled
   end state, so the replay is built from pixel-copies of the screenshot
   itself: each rising line is the full-frame shot clipped to that line's band,
   over a flat patch of the hero's own #6e6e6e ground; the portrait settles
   from scale 1.045 inside a clipped wrapper. Every overlay's final frame is
   pixel-identical to the screenshot beneath, so removing them is invisible.

   Band/box percentages from geometry.json through the 64/100/1184×592 crop.
--------------------------------------------------------------------------- */
const MERC_EASE = 'cubic-bezier(0.2,0.7,0.2,1)'
/** clip-path inset rows: [top%, bottom%] per rising band (6px pad). */
const MERC_BANDS: Array<{ top: number; bottom: number; delay: number; dur: number }> = [
  { top: 45.06, bottom: 44.6, delay: 50, dur: 700 }, // Technology moves fast.
  { top: 57.15, bottom: 32.51, delay: 240, dur: 700 }, // Law & capital must keep up.
  { top: 68.64, bottom: 21.02, delay: 440, dur: 700 }, // I help close the gap.
  { top: 83.04, bottom: 8.51, delay: 750, dur: 600 }, // the badge (slides, not rises)
]
/** pm-rise travel: 28px of the 592px-tall crop, as % of the full-frame element. */
const MERC_RISE = 4.73
/** pm-slide travel: −20px of the 1184px-wide crop. */
const MERC_SLIDE = -1.69
const MERC_SETTLE_MS = 2400
const MERC_GROUND = '#6e6e6e'

export function mercPreview(frame: HTMLElement, fx: Fx): SlideEffect {
  let nodes: HTMLElement[] = []
  let running = false

  function cleanup() {
    for (const n of nodes) n.remove()
    nodes = []
    running = false
  }

  return {
    play() {
      if (running || prefersReducedMotion()) return
      const url = shotUrl(frame)
      if (!url) return
      running = true

      // The flat ground the lines rise out of — the hero's own left-column ink.
      const patch = make(
        frame,
        'merc-patch',
        `inset:0;z-index:3;background:${MERC_GROUND};` +
          'clip-path:inset(43.4% 46% 7.4% 0);',
      )
      if (!patch) {
        running = false
        return
      }
      nodes.push(patch)

      const slice = (clip: string, z: number) => {
        const s = document.createElement('span')
        s.setAttribute('aria-hidden', 'true')
        s.style.cssText =
          `position:absolute;inset:0;pointer-events:none;z-index:${z};opacity:0;` +
          `background-image:url("${url}");background-size:100% 100%;clip-path:${clip};`
        frame.appendChild(s)
        nodes.push(s)
        return s
      }

      // The portrait, settling from 1.045 — clipped to the photo column.
      const wrap = make(frame, 'merc-photo', 'top:0;left:55.41%;width:44.59%;height:100%;overflow:hidden;z-index:2;')
      if (wrap) {
        nodes.push(wrap)
        const inner = document.createElement('span')
        inner.setAttribute('aria-hidden', 'true')
        inner.style.cssText =
          'position:absolute;top:0;left:-124.27%;width:224.27%;height:100%;' +
          `background-image:url("${url}");background-size:100% 100%;` +
          'transform-origin:77.71% 0%;transform:scale(1.045);'
        wrap.appendChild(inner)
        const settle = fx.anim(inner, [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }], {
          duration: MERC_SETTLE_MS,
          easing: 'cubic-bezier(0.22,0.61,0.36,1)',
          fill: 'none',
        })
        settle.finished
          .then(() => {
            inner.style.transform = 'scale(1)'
          })
          .catch(() => {})
      }

      for (const [i, b] of MERC_BANDS.entries()) {
        const s = slice(`inset(${b.top}% 47% ${b.bottom}% 0)`, 4)
        const move =
          i === 3 ? `translateX(${MERC_SLIDE}%)` : `translateY(${MERC_RISE}%)`
        const a = fx.anim(
          s,
          [
            { opacity: 0, transform: move },
            { opacity: 1, transform: 'none' },
          ],
          { duration: b.dur, delay: b.delay, easing: MERC_EASE, fill: 'none' },
        )
        a.finished
          .then(() => {
            // Rest inline state = the copy sitting exactly on its own pixels.
            s.style.opacity = '1'
            s.style.transform = 'none'
          })
          .catch(() => {})
      }

      // Everything has settled pixel-identical — drop the apparatus.
      fx.setTimeout(() => running && cleanup(), MERC_SETTLE_MS + 150)
    },
    pause: cleanup,
  }
}

/* ---------------------------------------------------------------------------
   bloctopus.net — the scan line, verbatim.

   One 2px line, transparent→#1fc49a→transparent, travelling the hero top to
   bottom in 3s, linear, infinite, fading over the first and last 10%. The
   hero (y 86–878 CSS) extends past the crop (y 200–792), so the line is wider
   than the frame and starts/ends outside it — exactly as the crop would see
   it. Implemented on a full-frame-height carrier so translateY percentages
   are of the frame, not of the 2px line.
--------------------------------------------------------------------------- */
export function bloctopusPreview(frame: HTMLElement, fx: Fx): SlideEffect {
  const carrier = make(frame, 'scan', 'inset:0;z-index:3;opacity:0;')
  if (!carrier) return noop
  const line = document.createElement('span')
  line.setAttribute('aria-hidden', 'true')
  line.style.cssText =
    'position:absolute;top:0;left:-8.11%;width:121.62%;height:2px;' +
    'background:linear-gradient(90deg,rgba(31,196,154,0),#1fc49a,rgba(31,196,154,0));'
  carrier.appendChild(line)

  // scanMove, mapped: hero top/bottom land at −19.26% / +114.53% of the frame.
  const anim = fx.anim(
    carrier,
    [
      { offset: 0, transform: 'translateY(-19.26%)', opacity: 0, easing: 'linear' },
      { offset: 0.1, transform: 'translateY(-5.88%)', opacity: 1, easing: 'linear' },
      { offset: 0.9, transform: 'translateY(101.14%)', opacity: 1, easing: 'linear' },
      { offset: 1, transform: 'translateY(114.53%)', opacity: 0 },
    ],
    { duration: 3000, iterations: Infinity, easing: 'linear' },
  )
  anim.pause()

  return {
    play() {
      if (prefersReducedMotion()) return
      anim.play()
    },
    pause() {
      anim.pause()
    },
  }
}
