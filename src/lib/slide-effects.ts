/**
 * Signature effects for the work carousel — one per reference, each recreating
 * the motion that site actually ships. The mechanics are ported from our own
 * source repos (milosevic16/lemurlegal, milosevic16/petermercspletna); the
 * code here is a rewrite against this project's `fx` tracker and tokens.
 *
 * House rules that shape all three:
 *  - Effects READ what the template declares. None of them is the source of
 *    any text — every string is prerendered, so crawlers and JS-off readers
 *    see the complete slide.
 *  - Injected ornament is aria-hidden, pointer-events:none, born hidden via
 *    JS inline style (never CSS), and re-entrancy guarded.
 *  - Only the ACTIVE slide's effect runs. `play()` / `pause()` are driven by
 *    the carousel, so at most one loop is live at a time.
 *  - Everything routes through the caller's tracker and dies with `dispose()`.
 */
import type { Fx } from './fx'

export interface SlideEffect {
  play(): void
  pause(): void
}

const noop: SlideEffect = { play() {}, pause() {} }

/** Marks a host as already decorated, so a remount cannot stack ornament. */
function claim(host: HTMLElement, key: string): boolean {
  if (host.querySelector(`:scope > [data-fx="${key}"]`)) return false
  return true
}

/* ---------------------------------------------------------------------------
   1. lemur.legal — glitch + console
   Ported from Home.effects.ts "HERO TITLE GLITCH" (chromatic ghosts flashing
   through random clip slices in hard steps()) and the .console CRT treatment.
   The ghost colours are the client's OWN sampled inks, passed in from content.
--------------------------------------------------------------------------- */
export function glitchTerminal(
  host: HTMLElement,
  fx: Fx,
  opts: { inks: string[]; caret: HTMLElement | null },
): SlideEffect {
  const target = host.querySelector<HTMLElement>('[data-glitch]')
  if (!target || !claim(host, 'glitch')) return noop

  const text = target.textContent ?? ''
  // Three chromatic ghosts of the same word, screen-blended — decorative
  // duplicates of text that already exists in the markup.
  const ghosts = opts.inks.slice(2, 5).map((col) => {
    const g = document.createElement('span')
    g.setAttribute('aria-hidden', 'true')
    g.setAttribute('data-fx', 'glitch')
    g.textContent = text
    g.style.cssText =
      'position:absolute;top:0;left:0;width:100%;pointer-events:none;opacity:0;' +
      `font:inherit;letter-spacing:inherit;line-height:inherit;color:${col};mix-blend-mode:screen;`
    target.appendChild(g)
    return g
  })

  const rnd = (a: number, b: number) => a + Math.random() * (b - a)
  const pct = () => `${(Math.random() * 80 + 5) | 0}%`
  const slice = (s: string, e: string) => `polygon(0 ${s},100% ${s},100% ${e},0 ${e})`

  let running = false
  let caretOn = true

  function burst() {
    if (!running) return
    fx.anim(
      target!,
      [
        { transform: 'none' },
        { transform: `translateX(${rnd(-7, 7)}px) skewX(${rnd(-4, 4)}deg)`, offset: 0.08 },
        { transform: `translateX(${rnd(-9, 9)}px) skewX(${rnd(-5, 5)}deg)`, offset: 0.28 },
        { transform: `translateX(${rnd(-6, 6)}px) skewX(${rnd(-3, 3)}deg)`, offset: 0.56 },
        { transform: 'none' },
      ],
      { duration: 420, easing: 'steps(7,end)', fill: 'none' },
    )
    ghosts.forEach((g, i) => {
      const a = pct()
      const b = pct()
      fx.setTimeout(() => {
        if (!running) return
        fx.anim(
          g,
          [
            { opacity: 0, transform: 'none', clipPath: 'none' },
            {
              opacity: 1,
              transform: `translateX(${rnd(-11, -6)}px)`,
              clipPath: slice(a < b ? a : b, a < b ? b : a),
              offset: 0.05,
            },
            { opacity: 0, transform: 'none', clipPath: 'none', offset: 0.34 },
            {
              opacity: 0.9,
              transform: `translateX(${rnd(6, 11)}px)`,
              clipPath: slice('52%', '88%'),
              offset: 0.62,
            },
            { opacity: 0, transform: 'none', clipPath: 'none' },
          ],
          { duration: 420 - i * 10, easing: `steps(${6 - i},end)`, fill: 'none' },
        )
      }, i * 55)
    })
  }

  /** Recursive random scheduling — never an infinite loop. */
  function schedule() {
    if (!running) return
    fx.setTimeout(() => {
      if (!running) return
      burst()
      schedule()
    }, rnd(1400, 3200))
  }

  /** The console caret: one slow blink, only while this slide is live. */
  function blink() {
    if (!running || !opts.caret) return
    caretOn = !caretOn
    opts.caret.style.opacity = caretOn ? '1' : '0.15'
    fx.setTimeout(blink, 540)
  }

  return {
    play() {
      if (running) return
      running = true
      fx.setTimeout(burst, 420)
      schedule()
      blink()
    },
    pause() {
      running = false
      for (const g of ghosts) g.style.opacity = '0'
      if (opts.caret) opts.caret.style.opacity = '1'
    },
  }
}

/* ---------------------------------------------------------------------------
   2. mercpeter.netlify.app — the rotating caption strip
   Ported from Home.effects.ts `_advDocket()` + the `pTick` progress loop:
   a line swaps on a fixed cycle, rising from under its own clip box, while a
   ring fills clockwise toward the next swap. Both read the SAME timestamp, so
   the ring and the rotation can never drift apart.
--------------------------------------------------------------------------- */
const TICKER_CYCLE_MS = 3400
/** 2π · 7.5 — the dasharray of the 15px progress ring. */
const RING_CIRCUMFERENCE = 47.12

export function captionTicker(host: HTMLElement, fx: Fx): SlideEffect {
  const item = host.querySelector<HTMLElement>('[data-ticker-item]')
  const ring = host.querySelector<SVGCircleElement>('[data-ticker-ring]')
  // The lines are declared in the markup; this reads them, never writes them.
  const lines = Array.from(host.querySelectorAll<HTMLElement>('[data-ticker-line]')).map(
    (n) => n.textContent ?? '',
  )
  if (!item || lines.length < 2) return noop

  let i = 0
  let at = 0
  let running = false
  let raf = 0

  function advance() {
    if (!running) return
    at = Date.now()
    i = (i + 1) % lines.length
    item!.textContent = lines[i]!
    fx.anim(
      item!,
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
    if (ring) {
      const p = Math.min(1, (Date.now() - at) / TICKER_CYCLE_MS)
      ring.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - p)).toFixed(2)
    }
    raf = fx.raf(tick)
  }

  return {
    play() {
      if (running) return
      running = true
      at = Date.now()
      fx.setTimeout(advance, TICKER_CYCLE_MS)
      tick()
    },
    pause() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      // Rest on the line the markup shipped, so the static and live states agree.
      if (i !== 0) {
        i = 0
        item!.textContent = lines[0]!
      }
      if (ring) ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE)
    },
  }
}

/* ---------------------------------------------------------------------------
   3. bloctopus.net — the scan sweep
   Ported from landingAnim.ts `sweepKeyframes()`. The pause lives INSIDE the
   keyframes: endDelay is inert with iterations:Infinity (active duration is
   Infinity, so the delay never arrives and sweeps repeat back-to-back).
   Every keyframe states every property — a property missing from a keyframe
   gets its own interval list with engine-ambiguous easing.
--------------------------------------------------------------------------- */
const SCAN_SWEEP_MS = 2600
const SCAN_GAP_MS = 1800

export function scanSweep(host: HTMLElement, fx: Fx, opts: { ink: string }): SlideEffect {
  if (!claim(host, 'scan')) return noop

  const bar = document.createElement('span')
  bar.setAttribute('aria-hidden', 'true')
  bar.setAttribute('data-fx', 'scan')
  // Born hidden via inline style, never CSS — nothing here can hide content.
  bar.style.cssText =
    'position:absolute;left:0;right:0;top:0;height:34%;opacity:0;pointer-events:none;z-index:2;' +
    `background:linear-gradient(180deg,transparent,${opts.ink},transparent);`
  host.appendChild(bar)

  const cycle = SCAN_SWEEP_MS + SCAN_GAP_MS
  const f = SCAN_SWEEP_MS / cycle
  const at = (p: number) => `translateY(${p}%)`
  const frames: Keyframe[] = [
    { offset: 0, transform: at(-120), opacity: 0, easing: 'ease-in' },
    { offset: f * 0.28, transform: at(-3), opacity: 0.22, easing: 'linear' },
    { offset: f * 0.72, transform: at(197), opacity: 0.22, easing: 'ease-out' },
    { offset: f, transform: at(320), opacity: 0, easing: 'linear' },
    { offset: 1, transform: at(320), opacity: 0 }, // the hold
  ]

  const anim = fx.anim(bar, frames, { duration: cycle, iterations: Infinity, fill: 'none' })
  anim.pause()

  return {
    play() {
      anim.play()
    },
    pause() {
      anim.pause()
    },
  }
}
