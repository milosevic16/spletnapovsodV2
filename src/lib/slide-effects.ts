/**
 * In-frame previews for the work carousel.
 *
 * THE RULE: the frame is a window into the running site. Every effect is
 * painted INSIDE the preview and displaces or overlays the REAL screenshot in
 * the place where that motion happens on the live site — so the plate reads as
 * the actual page running. Nothing here touches our own headings or chrome.
 *
 * The mechanics come from those sites' own repos (milosevic16/lemurlegal,
 * milosevic16/petermercspletna), rebuilt against this project's `fx` tracker.
 *
 * Coordinates are percentages of the frame, which shows each screenshot at its
 * native 2:1, so the overlays land on the real elements.
 *
 * House rules: injected ornament is aria-hidden, pointer-events:none, born
 * hidden via inline style (never CSS), re-entrancy guarded. Only the ACTIVE
 * plate's effect runs.
 */
import type { Fx } from './fx'

export interface SlideEffect {
  play(): void
  pause(): void
}

const noop: SlideEffect = { play() {}, pause() {} }

function make(frame: HTMLElement, key: string, css: string): HTMLElement | null {
  if (frame.querySelector(`:scope > [data-fx="${key}"]`)) return null
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('data-fx', key)
  el.style.cssText = `position:absolute;pointer-events:none;${css}`
  frame.appendChild(el)
  return el
}

/** The screenshot currently painted in this frame, for pixel-displacement slices. */
function shotUrl(frame: HTMLElement): string {
  const img = frame.querySelector('img')
  return img?.currentSrc || img?.getAttribute('src') || ''
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/* ---------------------------------------------------------------------------
   lemur.legal — the real headline tears.

   The live site glitches its own hero title: hard steps(), chromatic ghosts,
   a tear bar, over a console with CRT scanlines and a blinking caret. Here the
   glitch DISPLACES THE ACTUAL SCREENSHOT: each slice is a copy of the shot,
   clipped to a horizontal band across the headline and shifted sideways, so
   the site's own type is what tears — not a coloured rectangle over it.
--------------------------------------------------------------------------- */
const LEMUR_SLICES = 4

export function lemurPreview(frame: HTMLElement, fx: Fx, opts: { inks: string[] }): SlideEffect {
  const url = shotUrl(frame)
  if (!url) return noop

  // Pixel-displacement slices: the screenshot itself, re-drawn and clipped.
  const slices: HTMLElement[] = []
  for (let i = 0; i < LEMUR_SLICES; i++) {
    const s = make(
      frame,
      `slice${i}`,
      'inset:0;opacity:0;z-index:3;background-repeat:no-repeat;' +
        `background-image:url("${url}");background-size:cover;background-position:top center;`,
    )
    if (s) slices.push(s)
  }
  // Two chromatic fringes in the site's own violet and mint, riding the tear.
  const fringes = [opts.inks[2] ?? '#7F59F5', opts.inks[3] ?? '#1FC49A'].map((col, i) =>
    make(
      frame,
      `fringe${i}`,
      `inset:0;opacity:0;z-index:4;mix-blend-mode:screen;background:${col};`,
    ),
  )
  // CRT scanlines over the whole console.
  const crt = make(
    frame,
    'crt',
    'inset:0;opacity:0;z-index:5;mix-blend-mode:overlay;' +
      'background:repeating-linear-gradient(0deg,transparent 0 3px,rgb(168 139 255 / 0.55) 3px 4px);',
  )
  // The caret on the site's status line.
  const caret = make(
    frame,
    'caret',
    'left:2.4%;bottom:3.5%;width:7px;height:13px;opacity:0;z-index:6;background:#A88BFF;',
  )
  if (!crt) return noop

  let running = false
  let caretOn = true

  /** One tear: N bands of the real shot, each shifted, held for a few frames. */
  function tear() {
    if (!running) return
    // The headline occupies roughly the upper two thirds of this crop.
    for (const [i, s] of slices.entries()) {
      const top = rnd(6, 62)
      const h = rnd(3, 11)
      const dx = rnd(-2.2, 2.2)
      s.style.clipPath = `inset(${top}% 0 ${100 - top - h}% 0)`
      fx.anim(
        s,
        [
          { opacity: 0, transform: 'translateX(0)' },
          { opacity: 1, transform: `translateX(${dx}%)`, offset: 0.15 },
          { opacity: 1, transform: `translateX(${dx * 0.6}%)`, offset: 0.55 },
          { opacity: 0, transform: 'translateX(0)' },
        ],
        { duration: 260 + i * 30, easing: `steps(${4 + i},end)`, fill: 'none' },
      )
    }
    // Fringes flash on the same bands, one frame apart.
    for (const [i, f] of fringes.entries()) {
      if (!f) continue
      const top = rnd(8, 58)
      f.style.clipPath = `inset(${top}% 0 ${100 - top - rnd(2, 6)}% 0)`
      fx.setTimeout(() => {
        if (!running) return
        fx.anim(
          f,
          [
            { opacity: 0, transform: 'translateX(0)' },
            { opacity: 0.55, transform: `translateX(${rnd(-2, 2)}%)`, offset: 0.3 },
            { opacity: 0, transform: 'translateX(0)' },
          ],
          { duration: 220, easing: 'steps(3,end)', fill: 'none' },
        )
      }, i * 60)
    }
  }

  function schedule() {
    if (!running) return
    fx.setTimeout(
      () => {
        if (!running) return
        tear()
        // Sometimes a second, smaller tear right after — the live site's rhythm.
        if (Math.random() < 0.45) fx.setTimeout(tear, rnd(120, 260))
        schedule()
      },
      rnd(1500, 3400),
    )
  }

  function blink() {
    if (!running || !caret) return
    caretOn = !caretOn
    caret.style.opacity = caretOn ? '1' : '0'
    fx.setTimeout(blink, 540)
  }

  return {
    play() {
      if (running) return
      running = true
      crt.style.opacity = '0.3'
      if (caret) caret.style.opacity = '1'
      fx.setTimeout(tear, 620)
      schedule()
      blink()
    },
    pause() {
      running = false
      crt.style.opacity = '0'
      for (const s of slices) s.style.opacity = '0'
      for (const f of fringes) if (f) f.style.opacity = '0'
      if (caret) caret.style.opacity = '0'
    },
  }
}

/* ---------------------------------------------------------------------------
   mercpeter.netlify.app — the docket bar under his name.

   Ported from Home.effects.ts `_advDocket()` + the `pTick` ring loop: the line
   rises from under its own clip box every 3400ms, and the ring reads the SAME
   timestamp as the rotation so the two can never drift. Positioned over the
   name strip in the lower left of the crop, styled as that bar is.
--------------------------------------------------------------------------- */
const TICKER_CYCLE_MS = 3400
/** 2π · 7.5 — the dasharray of the progress ring. */
const RING_CIRCUMFERENCE = 47.12

export function mercPreview(
  frame: HTMLElement,
  fx: Fx,
  opts: { name: string; lines: string[] },
): SlideEffect {
  const { name, lines } = opts
  if (lines.length < 2 || frame.querySelector(':scope > [data-fx="docket"]')) return noop

  const bar = document.createElement('span')
  bar.setAttribute('aria-hidden', 'true')
  bar.setAttribute('data-fx', 'docket')
  bar.style.cssText =
    'position:absolute;left:0;bottom:6%;z-index:4;pointer-events:none;opacity:0;' +
    'display:flex;align-items:center;gap:0.55rem;padding:0.4rem 0.8rem;max-width:64%;' +
    'background:#26282C;color:#ECE9E2;font-size:0.68rem;line-height:1.4;' +
    'border-left:3px solid #D2453E;'

  const who = document.createElement('span')
  who.textContent = name
  who.style.cssText =
    'flex:0 0 auto;text-transform:uppercase;letter-spacing:0.14em;font-size:0.6rem;color:#B4AEA1;'

  const clip = document.createElement('span')
  clip.style.cssText = 'flex:1;min-width:0;overflow:hidden;display:block;'
  const item = document.createElement('span')
  item.style.cssText =
    'display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic;'
  item.textContent = lines[0]!
  clip.appendChild(item)

  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 18 18')
  svg.setAttribute('width', '12')
  svg.setAttribute('height', '12')
  svg.style.cssText = 'flex:0 0 auto;color:#D2453E;'
  for (const [i, r] of [0.28, 1].entries()) {
    const c = document.createElementNS(ns, 'circle')
    c.setAttribute('cx', '9')
    c.setAttribute('cy', '9')
    c.setAttribute('r', '7.5')
    c.setAttribute('fill', 'none')
    c.setAttribute('stroke', 'currentColor')
    c.setAttribute('stroke-width', '1.6')
    if (i === 0) c.setAttribute('stroke-opacity', String(r))
    else {
      c.setAttribute('stroke-dasharray', String(RING_CIRCUMFERENCE))
      c.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE))
      c.setAttribute('transform', 'rotate(-90 9 9)')
    }
    svg.appendChild(c)
  }
  const ring = svg.lastElementChild as SVGCircleElement

  bar.append(who, clip, svg)
  frame.appendChild(bar)

  let i = 0
  let at = 0
  let running = false
  let raf = 0

  function advance() {
    if (!running) return
    at = Date.now()
    i = (i + 1) % lines.length
    item.textContent = lines[i]!
    fx.anim(
      item,
      [
        { transform: 'translateY(115%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      { duration: 320, easing: 'cubic-bezier(0.2,0.7,0.2,1)', fill: 'none' },
    )
    fx.setTimeout(advance, TICKER_CYCLE_MS)
  }

  function tick() {
    if (!running) return
    const p = Math.min(1, (Date.now() - at) / TICKER_CYCLE_MS)
    ring.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - p)).toFixed(2)
    raf = fx.raf(tick)
  }

  return {
    play() {
      if (running) return
      running = true
      bar.style.opacity = '1'
      at = Date.now()
      fx.setTimeout(advance, TICKER_CYCLE_MS)
      tick()
    },
    pause() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      bar.style.opacity = '0'
      i = 0
      item.textContent = lines[0]!
      ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE)
    },
  }
}

/* ---------------------------------------------------------------------------
   bloctopus.net — the forensic board being scanned.

   A hairline scanner with a soft trail sweeps the board over the site's own
   grid. Ported from landingAnim.ts `sweepKeyframes()`: the pause lives INSIDE
   the keyframes, because endDelay is inert with iterations:Infinity — the
   active duration is Infinity, so the delay never arrives. Every keyframe
   states every property, or the missing one gets an engine-ambiguous easing.
--------------------------------------------------------------------------- */
const SCAN_SWEEP_MS = 2800
const SCAN_GAP_MS = 1500

export function bloctopusPreview(frame: HTMLElement, fx: Fx, ink: string): SlideEffect {
  const grid = make(
    frame,
    'grid',
    'inset:0;opacity:0;z-index:2;' +
      `background-image:linear-gradient(${ink} 1px,transparent 1px),` +
      `linear-gradient(90deg,${ink} 1px,transparent 1px);background-size:48px 48px;`,
  )
  // The trail, then the scanner line itself riding its leading edge.
  const trail = make(
    frame,
    'trail',
    'left:0;right:0;top:0;height:22%;opacity:0;z-index:3;' +
      `background:linear-gradient(180deg,transparent,${ink});`,
  )
  const linePos = make(
    frame,
    'scan',
    'left:0;right:0;top:0;height:2px;opacity:0;z-index:4;' +
      `background:${ink};box-shadow:0 0 12px 1px ${ink};`,
  )
  if (!trail || !linePos) return noop

  const cycle = SCAN_SWEEP_MS + SCAN_GAP_MS
  const f = SCAN_SWEEP_MS / cycle

  /**
   * Travel is expressed in multiples of the element's OWN height, so the thin
   * line and the tall trail sweep the same distance at the same speed: the
   * line is 2px against a 22% trail, so its percentages are far larger.
   */
  const sweep = (el: HTMLElement, peak: number, from: number, to: number) =>
    fx.anim(
      el,
      [
        { offset: 0, transform: `translateY(${from}%)`, opacity: 0, easing: 'ease-in' },
        { offset: f * 0.25, transform: `translateY(${to * 0.1}%)`, opacity: peak, easing: 'linear' },
        { offset: f * 0.8, transform: `translateY(${to * 0.9}%)`, opacity: peak, easing: 'linear' },
        { offset: f, transform: `translateY(${to}%)`, opacity: 0, easing: 'linear' },
        { offset: 1, transform: `translateY(${to}%)`, opacity: 0 }, // the hold
      ],
      { duration: cycle, iterations: Infinity, fill: 'none' },
    )

  // Trail is 22% of the frame → 455% of itself clears the bottom.
  const aTrail = sweep(trail, 0.26, -120, 455)
  // Line is 2px in a ~468px frame → travel in the thousands of percent.
  const aLine = sweep(linePos, 0.85, -200, 23400)
  aTrail.pause()
  aLine.pause()

  return {
    play() {
      if (grid) grid.style.opacity = '0.14'
      aTrail.play()
      aLine.play()
    },
    pause() {
      if (grid) grid.style.opacity = '0'
      aTrail.pause()
      aLine.pause()
    },
  }
}
