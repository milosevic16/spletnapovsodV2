/**
 * Performance tiers — the concrete gate (redesign review condition: the gate
 * is defined, not vibes). Client-only; call from onMounted.
 *
 *   REDUCED  — prefers-reduced-motion, or no IntersectionObserver: the
 *              art-directed static edition. No veil (CSS handles that), the
 *              cut resting at its composed 45/55, all strokes pre-drawn.
 *   STANDARD — the complete concept with stepped interpolation: the cut moves
 *              in five IO-thresholded steps (--t-step transitions), SVG
 *              stroke draws become fades, no crosshair readout.
 *   FULL     — fine pointer + no save-data + enough device memory: per-frame
 *              scroll-proportional cut (one rAF write per frame), crosshair
 *              with live depth readout.
 *
 * The cut scene additionally self-downgrades FULL→STANDARD if its first
 * measured frames blow the budget (see CutSection) — the stepped tier is a
 * tested path, not a paper promise.
 */
import { prefersReducedMotion } from './fx'

export type Tier = 'reduced' | 'standard' | 'full'

interface NavigatorPerf extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

export function resolveTier(): Tier {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return 'reduced'
  const nav = navigator as NavigatorPerf
  const fine = matchMedia('(pointer: fine)').matches
  const saveData = nav.connection?.saveData === true
  const memory = nav.deviceMemory ?? 8 // absent (Safari/Firefox) → assume capable
  if (fine && !saveData && memory >= 4) return 'full'
  return 'standard'
}
