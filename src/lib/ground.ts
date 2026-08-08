/**
 * The page-wide ground switch — light → dark, the design system's signature
 * move ("the channel change"). Mechanism per the extracted background.md:
 * the incoming dark zone's top edge crossing a viewport fraction flips
 * [data-ground='dark'] on <html>; tokens.css transitions the registered role
 * tokens (--surface/--ink/…) on :root, so every consumer tweens together for
 * ~1s with no overshoot. Fully reversible: an interrupted CSS transition
 * reverses from its current value, which is exactly the reference's
 * hysteresis-free behaviour (measured ≤ 25px ≈ none).
 *
 * PROVISIONAL TRIGGER — retune BOTH constants once the sections above the
 * Tradicija section are rebuilt at their real heights (the brief expects
 * this). The Tradicija section (#nevidno) carries the site's light→dark
 * transition; provisionally the page darkens when its top crosses the
 * viewport's vertical centre (the reference's measured trigger line) and
 * re-lightens when it crosses back.
 *
 * With JS off the attribute never appears: the page stays on the light
 * ground, and legacy dark sections still paint their own dark bands.
 * Under prefers-reduced-motion the flip still HAPPENS (state is content,
 * not decoration) but base.css's kill-switch zeroes the transition — it
 * lands instantly, per the brief's "dark state applies immediately".
 */

/** The element whose top edge drives the flip. */
export const GROUND_TRIGGER_ID = 'nevidno'

/** Viewport fraction the trigger's top must cross (0 = top, 1 = bottom).
 *  0.5 = the reference's measured mid-viewport trigger line. */
export const GROUND_TRIGGER_FRACTION = 0.5

export interface GroundHandle {
  /** Re-measure now (route changes don't always scroll). */
  refresh(): void
  dispose(): void
}

export function wireGround(): GroundHandle {
  const root = document.documentElement
  let el: HTMLElement | null = null
  let raf = 0

  const measure = () => {
    raf = 0
    if (!el || !el.isConnected) el = document.getElementById(GROUND_TRIGGER_ID)
    const dark =
      el !== null &&
      el.getBoundingClientRect().top <= window.innerHeight * GROUND_TRIGGER_FRACTION
    if (dark) root.dataset.ground = 'dark'
    else delete root.dataset.ground
  }

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(measure)
  }

  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule, { passive: true })
  measure()

  return {
    refresh: schedule,
    dispose() {
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      delete root.dataset.ground
    },
  }
}
