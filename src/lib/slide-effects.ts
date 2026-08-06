/**
 * In-frame previews for the work carousel.
 *
 * THE RULE THAT SHAPES ALL OF THESE: the frame is a window into the running
 * site. Every effect is painted INSIDE the preview, positioned over the region
 * of the screenshot where that motion actually happens on the live site — so
 * the plate reads as the real page running, not as our page decorating itself.
 * Nothing here ever touches our own headings or chrome.
 *
 * The mechanics are ported from the sites' own source repos
 * (milosevic16/lemurlegal, milosevic16/petermercspletna) and rebuilt against
 * this project's `fx` tracker.
 *
 * Coordinates are percentages of the frame, which shows each screenshot at its
 * native 2:1 with no cropping — so the overlays land on the real elements.
 *
 * House rules held throughout: injected ornament is aria-hidden,
 * pointer-events:none, born hidden via inline style (never CSS), and
 * re-entrancy guarded. Only the ACTIVE plate's effect runs.
 */
import type { Fx } from './fx'

export interface SlideEffect {
  play(): void
  pause(): void
}

const noop: SlideEffect = { play() {}, pause() {} }

/** One ornament layer inside the frame; refuses to stack on remount. */
function layer(frame: HTMLElement, key: string, css: string): HTMLElement | null {
  if (frame.querySelector(`:scope > [data-fx="${key}"]`)) return null
  const el = document.createElement('span')
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('data-fx', key)
  el.style.cssText = `position:absolute;pointer-events:none;${css}`
  frame.appendChild(el)
  return el
}

/* ---------------------------------------------------------------------------
   lemur.legal — the site glitches its own headline and runs a console.
   Ported from Home.effects.ts "HERO TITLE GLITCH" + the .console CRT panel.
   Placement: the headline band sits in the upper ~62% of the crop; the status
   line runs along the bottom.
--------------------------------------------------------------------------- */
export function lemurPreview(
  frame: HTMLElement,
  fx: Fx,
  opts: { inks: string[] },
): SlideEffect {
  // CRT scanlines over the whole frame — the console's own texture.
  layer(
    frame,
    'crt',
    'inset:0;opacity:0;z-index:2;mix-blend-mode:overlay;' +
      'background:repeating-linear-gradient(0deg,transparent 0 3px,rgb(168 139 255 / 0.5) 3px 4px);',
  )
  // Two chromatic split bands that flash across the headline region, in the
  // site's own violet and mint.
  const bands = [opts.inks[2] ?? '#7F59F5', opts.inks[3] ?? '#1FC49A'].map((col, i) =>
    layer(
      frame,
      `band${i}`,
      `left:0;right:0;top:6%;height:56%;opacity:0;z-index:3;mix-blend-mode:screen;background:${col};`,
    ),
  )
  // The tear bar — a hard horizontal slip, as on the live site.
  const tear = layer(
    frame,
    'tear',
    'left:0;right:0;top:30%;height:2px;opacity:0;z-index:4;background:#D2DDD7;',
  )
  // The console caret, where the site's status line runs.
  const caret = layer(
    frame,
    'caret',
    'left:2.5%;bottom:4%;width:7px;height:14px;opacity:0;z-index:4;background:#A88BFF;',
  )

  const crt = frame.querySelector<HTMLElement>('[data-fx="crt"]')
  if (!crt) return noop

  const rnd = (a: number, b: number) => a + Math.random() * (b - a)
  let running = false
  let caretOn = true

  function burst() {
    if (!running) return
    for (const [i, b] of bands.entries()) {
      if (!b) continue
      const y = rnd(4, 48)
      b.style.top = `${y}%`
      b.style.height = `${rnd(6, 22)}%`
      fx.anim(
        b,
        [
          { opacity: 0, transform: 'translateX(0)' },
          { opacity: 0.5, transform: `translateX(${rnd(-2.5, -1)}%)`, offset: 0.2 },
          { opacity: 0, transform: 'translateX(0)', offset: 0.45 },
          { opacity: 0.4, transform: `translateX(${rnd(1, 2.5)}%)`, offset: 0.7 },
          { opacity: 0, transform: 'translateX(0)' },
        ],
        { duration: 360 - i * 40, easing: `steps(${5 - i},end)`, fill: 'none' },
      )
    }
    if (tear) {
      tear.style.top = `${rnd(8, 62)}%`
      fx.anim(
        tear,
        [
          { opacity: 0, height: '1px' },
          { opacity: 0.9, height: '6px', offset: 0.15 },
          { opacity: 0.5, height: '2px', offset: 0.6 },
          { opacity: 0, height: '1px' },
        ],
        { duration: 220, easing: 'steps(4,end)', fill: 'none' },
      )
    }
  }

  function schedule() {
    if (!running) return
    fx.setTimeout(() => {
      if (!running) return
      burst()
      schedule()
    }, rnd(1600, 3600))
  }

  function blink() {
    if (!running || !caret) return
    caretOn = !caretOn
    caret.style.opacity = caretOn ? '1' : '0'
    fx.setTimeout(blink, 560)
  }

  return {
    play() {
      if (running) return
      running = true
      crt.style.opacity = '0.35'
      if (caret) caret.style.opacity = '1'
      fx.setTimeout(burst, 500)
      schedule()
      blink()
    },
    pause() {
      running = false
      crt.style.opacity = '0'
      for (const b of bands) if (b) b.style.opacity = '0'
      if (tear) tear.style.opacity = '0'
      if (caret) caret.style.opacity = '0'
    },
  }
}

/* ---------------------------------------------------------------------------
   mercpeter.netlify.app — the site rotates a caption in the bar under his
   name. Ported from Home.effects.ts `_advDocket()` + the `pTick` ring loop:
   the line rises from under its own clip box, and the ring reads the SAME
   timestamp as the rotation so the two can never drift apart.
   Placement: over the name bar, lower-left of the crop.
--------------------------------------------------------------------------- */
const TICKER_CYCLE_MS = 3400
/** 2π · 7.5 — the dasharray of the progress ring. */
const RING_CIRCUMFERENCE = 47.12

export function mercPreview(frame: HTMLElement, fx: Fx, lines: string[]): SlideEffect {
  if (lines.length < 2 || frame.querySelector(':scope > [data-fx="docket"]')) return noop

  const bar = document.createElement('span')
  bar.setAttribute('aria-hidden', 'true')
  bar.setAttribute('data-fx', 'docket')
  bar.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;z-index:3;pointer-events:none;opacity:0;' +
    'display:flex;align-items:center;gap:0.6rem;padding:0.45rem 0.9rem;' +
    'background:rgb(38 40 44 / 0.94);color:#ECE9E2;font-size:0.72rem;line-height:1.4;'

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
  svg.setAttribute('width', '13')
  svg.setAttribute('height', '13')
  svg.style.cssText = 'flex:0 0 auto;color:#D2453E;'
  const track = document.createElementNS(ns, 'circle')
  track.setAttribute('cx', '9')
  track.setAttribute('cy', '9')
  track.setAttribute('r', '7.5')
  track.setAttribute('fill', 'none')
  track.setAttribute('stroke', 'currentColor')
  track.setAttribute('stroke-opacity', '0.28')
  track.setAttribute('stroke-width', '1.6')
  const ring = document.createElementNS(ns, 'circle')
  ring.setAttribute('cx', '9')
  ring.setAttribute('cy', '9')
  ring.setAttribute('r', '7.5')
  ring.setAttribute('fill', 'none')
  ring.setAttribute('stroke', 'currentColor')
  ring.setAttribute('stroke-width', '1.6')
  ring.setAttribute('stroke-dasharray', String(RING_CIRCUMFERENCE))
  ring.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE))
  ring.setAttribute('transform', 'rotate(-90 9 9)')
  svg.append(track, ring)

  bar.append(clip, svg)
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
   bloctopus.net — a forensic scan sweeping the dark board, over its own grid.
   Ported from landingAnim.ts `sweepKeyframes()`. The pause lives INSIDE the
   keyframes: endDelay is inert with iterations:Infinity, so the active
   duration is Infinity and the delay never arrives. Every keyframe states
   every property — a property missing from one gets its own interval list
   with engine-ambiguous easing.
--------------------------------------------------------------------------- */
const SCAN_SWEEP_MS = 2600
const SCAN_GAP_MS = 1600

export function bloctopusPreview(frame: HTMLElement, fx: Fx, ink: string): SlideEffect {
  const grid = layer(
    frame,
    'grid',
    'inset:0;opacity:0;z-index:2;' +
      `background-image:linear-gradient(${ink} 1px,transparent 1px),` +
      `linear-gradient(90deg,${ink} 1px,transparent 1px);background-size:44px 44px;`,
  )
  const bar = layer(
    frame,
    'scan',
    'left:0;right:0;top:0;height:26%;opacity:0;z-index:3;' +
      `background:linear-gradient(180deg,transparent,${ink},transparent);`,
  )
  if (!bar) return noop

  const cycle = SCAN_SWEEP_MS + SCAN_GAP_MS
  const f = SCAN_SWEEP_MS / cycle
  const at = (p: number) => `translateY(${p}%)`
  const anim = fx.anim(
    bar,
    [
      { offset: 0, transform: at(-110), opacity: 0, easing: 'ease-in' },
      { offset: f * 0.28, transform: at(-3), opacity: 0.3, easing: 'linear' },
      { offset: f * 0.72, transform: at(300), opacity: 0.3, easing: 'ease-out' },
      { offset: f, transform: at(420), opacity: 0, easing: 'linear' },
      { offset: 1, transform: at(420), opacity: 0 }, // the hold
    ],
    { duration: cycle, iterations: Infinity, fill: 'none' },
  )
  anim.pause()

  return {
    play() {
      if (grid) grid.style.opacity = '0.16'
      anim.play()
    },
    pause() {
      if (grid) grid.style.opacity = '0'
      anim.pause()
    },
  }
}
