<script setup lang="ts">
/**
 * Prerezna ravnina — the defining scene: the page cuts ITSELF open. Above the
 * red plane: a 1:1 fragment of this page's own visible surface (rendered from
 * the same content module as the hero — headline as a NON-heading element, the
 * single-h1 guard stays green). Below: the section — chambers whose mono
 * lines are REAL emitted bytes from machine-facts.ts; the postbuild guard
 * asserts every `data-fact` node byte-equals its artifact, bidirectionally.
 *
 * Drive model: scroll is the knife. The scene wrapper is ~240svh tall; a
 * sticky 100svh viewport interpolates one unitless var (--cut-n = the section
 * layer's share, 12..88) into two clip-paths and the plane's transform —
 * scroll-PROPORTIONAL (one compositor-async frame of lag on iOS is expected
 * and accepted; the instrument claim is proportionality, not zero-lag).
 * A real <input type="range"> is the same value's canonical, keyboard-first
 * control — the theatrical control IS the accessible control.
 *
 * Tiers: FULL = per-frame rAF + crosshair readout, self-downgrades if the
 * first measured frames blow the budget; STANDARD = five steps on a throttled
 * scroll listener (--t-step transitions); REDUCED/no-JS = the composed 45/55
 * static section drawing (stylesheet --cut-n: 55) with the grip still live.
 * With JS off the grip is hidden (never a dead control).
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { cut, hero } from '@/content/home'
import { factsById, chamberFacts } from '@/lib/machine-facts'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import { resolveTier } from '@/lib/tiers'

const fx = createFx()
const live = ref(false)
const sceneEl = ref<HTMLElement | null>(null)
const viewportEl = ref<HTMLElement | null>(null)
const gripEl = ref<HTMLInputElement | null>(null)
const xhairEl = ref<HTMLElement | null>(null)

const CUT_MIN = 12
const CUT_MAX = 88
const CUT_REST = 55
/** Manual grip input wins until the visitor scrolls this far past it. */
const MANUAL_SCROLL_TOLERANCE = 24
/** FULL self-downgrades to STANDARD when the first frames average over this. */
const FRAME_BUDGET_MS = 24
const STANDARD_STEPS = [12, 31, 50, 69, 88]
/** Grip affordance pulse: armed after the scene settles, killed on first touch. */
const PULSE_DELAY_MS = 600

/** Scene emblems — one checkable byte per chamber, the rest live in the ledger. */
const emblems: Record<string, string> = {
  head: 'head-title',
  'seo-foundation': 'robots-claudebot',
  compliance: 'header-nosniff',
  material: 'file-img-avif',
}

const chambersWithFacts = computed(() =>
  cut.chambers.map((c) => ({
    ...c,
    emblem: emblems[c.id] ? factsById.get(emblems[c.id]!) : undefined,
    lines: (chamberFacts[c.id] ?? []).map((id) => factsById.get(id)!).filter(Boolean),
  })),
)

// h1-guard discipline: the facade titles derive from the SAME strings as the
// real hero, rendered as non-headings.
const accentValid = hero.title.startsWith(hero.titleAccent)
const facadeAccent = accentValid ? hero.titleAccent : ''
const facadeRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

let cutValue = CUT_REST
let manualAtScrollY: number | null = null
let pulsed = false
let pulseAnims: Animation[] = []

let lastRounded = -1

function applyCut(v: number) {
  cutValue = Math.min(CUT_MAX, Math.max(CUT_MIN, v))
  const vp = viewportEl.value
  if (vp) vp.style.setProperty('--cut-n', String(cutValue))
  // Reflect into the grip/readout only when the visible integer changes —
  // no per-frame attribute churn while the fraction crawls.
  const rounded = Math.round(cutValue)
  if (rounded === lastRounded) return
  lastRounded = rounded
  const grip = gripEl.value
  if (grip) {
    grip.value = String(rounded)
    grip.setAttribute('aria-valuetext', `${rounded} ${cut.gripUnit}`)
  }
  const x = xhairEl.value?.querySelector('.cut__xhair-val')
  if (x) x.textContent = `${rounded} %`
}

function sceneProgress(): number {
  const scene = sceneEl.value
  const vp = viewportEl.value
  if (!scene || !vp) return 0.5
  const rect = scene.getBoundingClientRect()
  // The sticky travel is scene height minus the VIEWPORT ELEMENT's height
  // (100svh) — window.innerHeight drifts from svh while the iOS toolbar
  // retracts, which would silently rescale the knife.
  const span = rect.height - vp.offsetHeight
  if (span <= 0) return 0.5
  return Math.min(1, Math.max(0, -rect.top / span))
}

function killPulse() {
  for (const a of pulseAnims) a.cancel()
  pulseAnims = []
  pulsed = true
}

onMounted(() => {
  live.value = true

  // The grip is live in EVERY tier — it is the accessibility spine.
  const grip = gripEl.value
  if (grip) {
    fx.on(grip, 'input', () => {
      manualAtScrollY = window.scrollY
      killPulse()
      applyCut(Number(grip.value))
    })
    fx.on(grip, 'pointerdown', killPulse)
  }

  const tier = resolveTier()
  if (tier === 'reduced') return // the composed drawing IS the finished design

  const scene = sceneEl.value
  if (!scene) return

  let mode: 'full' | 'standard' = tier
  let inView = false
  let frameSamples = 0
  let frameAccum = 0
  let lastT = 0

  const drive = () => {
    if (manualAtScrollY !== null) {
      if (Math.abs(window.scrollY - manualAtScrollY) <= MANUAL_SCROLL_TOLERANCE) return
      manualAtScrollY = null
    }
    const p = sceneProgress()
    applyCut(CUT_MIN + p * (CUT_MAX - CUT_MIN))
  }

  // STANDARD: five steps, throttled passive scroll listener, CSS --t-step eases.
  let throttled = false
  const standardDrive = () => {
    if (throttled) return
    throttled = true
    fx.setTimeout(() => {
      throttled = false
      if (manualAtScrollY !== null) {
        if (Math.abs(window.scrollY - manualAtScrollY) <= MANUAL_SCROLL_TOLERANCE) return
        manualAtScrollY = null
      }
      const p = sceneProgress()
      const step = STANDARD_STEPS[Math.min(STANDARD_STEPS.length - 1, Math.floor(p * STANDARD_STEPS.length))]!
      if (step !== cutValue) applyCut(step)
    }, 150)
  }

  const startStandard = () => {
    mode = 'standard'
    viewportEl.value?.classList.add('cut__viewport--stepped')
    viewportEl.value?.classList.add('cut__viewport--drive')
    fx.on(window, 'scroll', standardDrive, { passive: true })
    standardDrive()
  }

  const loop = (t: number) => {
    if (!inView || mode !== 'full') return
    // Frame-budget self-check: the stepped tier is a tested path, not a promise.
    if (lastT && frameSamples < 30) {
      frameAccum += t - lastT
      frameSamples++
      if (frameSamples === 30 && frameAccum / 30 > FRAME_BUDGET_MS) {
        startStandard()
        return
      }
    }
    lastT = t
    drive()
    fx.raf(loop)
  }

  if (tier === 'full') viewportEl.value?.classList.add('cut__viewport--drive')

  const io = fx.io(
    (entries) => {
      const hit = entries.some((e) => e.isIntersecting)
      if (hit && !inView) {
        inView = true
        if (mode === 'full') {
          lastT = 0
          fx.raf(loop)
        }
        // One finite affordance pulse on the grip, after the arrival settles.
        if (!pulsed && grip && !prefersReducedMotion()) {
          pulsed = true
          fx.setTimeout(() => {
            pulseAnims = [
              fx.anim(
                grip,
                [
                  { transform: 'scale(1)', easing: 'ease-in-out' },
                  { transform: 'scale(1.012)', easing: 'ease-in-out', offset: 0.5 },
                  { transform: 'scale(1)' },
                ],
                { duration: 1800, iterations: 2, fill: 'none' },
              ),
            ]
          }, PULSE_DELAY_MS)
        }
      } else if (!hit) {
        inView = false
      }
    },
    { threshold: 0 },
  )
  io.observe(scene)

  if (mode === 'standard') startStandard()

  // Crosshair readout — FULL + fine pointer only; pure ornament (aria-hidden).
  if (tier === 'full' && matchMedia('(pointer: fine)').matches) {
    const vp = viewportEl.value
    const xh = xhairEl.value
    if (vp && xh) {
      vp.classList.add('cut__viewport--fine')
      // Rect cached on entry (the viewport is sticky — stable while hovered);
      // BOTH axes compensated: the sticky viewport is offset by the rail on X.
      let vpRect = { left: 0, top: 0 }
      fx.on(vp, 'pointerenter', () => {
        vpRect = vp.getBoundingClientRect()
        xh.style.setProperty('opacity', '1')
      })
      fx.on(vp, 'pointermove', ((e: PointerEvent) => {
        xh.style.transform = `translate(${e.clientX - vpRect.left}px, ${e.clientY - vpRect.top}px)`
      }) as EventListener)
      fx.on(vp, 'pointerleave', () => xh.style.setProperty('opacity', '0'))
    }
  }
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section class="cut" :class="{ 'cut--live': live }">
    <div class="container cut__head">
      <p class="datum">{{ cut.kicker }}</p>
      <h2 class="cut__title">{{ cut.title }}</h2>
      <blockquote class="cut__quote">{{ cut.quote }}</blockquote>
      <p class="cut__intro">{{ cut.intro }}</p>
    </div>

    <div ref="sceneEl" class="cut__scene">
      <div ref="viewportEl" class="cut__viewport">
        <!-- FACADE — what you see: this page's own surface, 1:1. A DRAWING of
             the hero, not a second hero: aria-hidden (screen readers already
             have the real one) and nothing focusable — focus must never land
             inside a layer the clip has visually removed. -->
        <div class="cut__facade">
          <p class="datum cut__layer-label">{{ cut.humanLabel }}</p>
          <div class="cut__facade-copy" aria-hidden="true">
            <p class="datum cut__facade-kicker">{{ hero.kicker }}</p>
            <!-- Non-heading by design: the real h1 lives in the hero. -->
            <p class="cut__facade-title">
              <span v-if="facadeAccent" class="cut__facade-hl">{{ facadeAccent }}</span
              >{{ facadeRest }}
            </p>
            <span class="cut__facade-btn">{{ hero.ctaPrimary.label }}</span>
          </div>
        </div>

        <!-- SECTION — what Google sees: chambers of real emitted bytes. -->
        <div class="cut__below">
          <p class="datum cut__layer-label cut__layer-label--below">{{ cut.machineLabel }}</p>
          <p class="cut__mgloss">{{ cut.machineGloss }}</p>
          <ul class="cut__chambers">
            <li v-for="c in chambersWithFacts" :key="c.id" class="cut__chamber">
              <p class="datum cut__chamber-label">{{ c.label }}</p>
              <p class="cut__chamber-gloss">{{ c.gloss }}</p>
              <code v-if="c.emblem" class="emisija cut__chamber-emblem" :data-fact="c.emblem.id">{{
                c.emblem.text
              }}</code>
            </li>
          </ul>
        </div>

        <!-- The plane — the red cut, with its square end ticks. -->
        <div class="cut__plane" aria-hidden="true"></div>

        <!-- The grip — the same value, as a real keyboard-first control. -->
        <div class="cut__grip-wrap">
          <label class="datum cut__grip-label" for="cut-grip">{{ cut.gripLabel }}</label>
          <input
            id="cut-grip"
            ref="gripEl"
            class="cut__grip"
            type="range"
            :min="CUT_MIN"
            :max="CUT_MAX"
            step="1"
            :value="CUT_REST"
            :aria-valuetext="`${CUT_REST} ${cut.gripUnit}`"
          />
        </div>

        <!-- Crosshair depth readout — FULL tier ornament. -->
        <div ref="xhairEl" class="cut__xhair" aria-hidden="true">
          <span class="emisija cut__xhair-val">{{ CUT_REST }} %</span>
        </div>
      </div>
    </div>

    <!-- ZAPISNIK — the excavation ledger: every machine line, copyable. -->
    <div class="cut__ledger">
      <div class="container">
        <p class="datum datum--on-dark">{{ cut.ledgerKicker }}</p>
        <h3 class="cut__ledger-title">{{ cut.ledgerTitle }}</h3>
        <ul class="cut__ledger-list">
          <li v-for="c in chambersWithFacts" :key="c.id" class="cut__ledger-chamber">
            <p class="datum cut__ledger-label">{{ c.label }}</p>
            <p class="cut__ledger-gloss">{{ c.gloss }}</p>
            <ul v-if="c.lines.length" class="cut__ledger-lines">
              <li v-for="f in c.lines" :key="f.id">
                <code class="emisija" :data-fact="f.id">{{ f.text }}</code>
              </li>
            </ul>
          </li>
        </ul>
        <p class="cut__outro">{{ cut.outro }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cut {
  padding-top: var(--section-y);
}

.cut__head {
  padding-bottom: 3rem;
}

.cut__title {
  margin-top: 1rem;
}

/* The founding line — the page's thesis, set as an epigraph. */
.cut__quote {
  margin-top: 1.5rem;
  font-size: var(--fs-lead);
  font-style: italic;
  line-height: 1.55;
  max-width: 46ch;
  border-left: 2px solid var(--rez);
  padding-left: 1.25rem;
}

.cut__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

/* --- the scene ------------------------------------------------------------ */
.cut__scene {
  height: 240svh;
  /* iOS toolbar-retracted: the visual viewport can exceed 100svh — the band
     below the pinned viewport must read as the excavation continuing (the
     ledger follows in the same ground), never as a flash of raw paper. */
  background: var(--grafit);
}

.cut__viewport {
  --cut-n: 55; /* the composed 45/55 rest drawing — no-JS/reduced state */
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
  border-top: 1px solid var(--grafit);
}

/* The sheet frame — the drawing's own edge, above both layers. */
.cut__viewport::after {
  content: '';
  position: absolute;
  inset: var(--frame);
  border: 1px solid var(--mreza);
  mix-blend-mode: normal;
  pointer-events: none;
  z-index: 3;
}

/* STANDARD tier: the cut moves in five eased steps — labels ride the plane,
   so they ease with it (a label snapping while the plane glides reads broken). */
.cut__viewport--stepped .cut__facade,
.cut__viewport--stepped .cut__below,
.cut__viewport--stepped .cut__plane,
.cut__viewport--stepped .cut__layer-label--below,
.cut__viewport--stepped .cut__mgloss {
  transition:
    clip-path var(--t-step) var(--ease-out),
    transform var(--t-step) var(--ease-out);
}

/* Layer promotion only while a drive is actually rewriting the clip. */
.cut__viewport--drive .cut__facade,
.cut__viewport--drive .cut__below {
  will-change: clip-path;
}
.cut__viewport--drive .cut__plane {
  will-change: transform;
}

.cut__viewport--fine {
  cursor: crosshair;
}

.cut__facade,
.cut__below {
  position: absolute;
  inset: 0;
}

/* Facade: clipped from the bottom as the section's share (--cut-n) grows. */
.cut__facade {
  background: var(--list);
  clip-path: inset(0 0 calc(var(--cut-n) * 1%) 0);
}

.cut__facade-copy {
  position: absolute;
  top: 11svh;
  left: var(--gutter);
  right: var(--gutter);
}

.cut__facade-kicker {
  margin-bottom: 1rem;
}

.cut__facade-title {
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 275;
  font-size: clamp(1.9rem, 1.2rem + 3.4vw, 4rem);
  line-height: 1.06;
  letter-spacing: -0.015em;
  max-width: 16ch;
}

.cut__facade-hl {
  color: var(--rez);
}

.cut__facade-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 1.5rem;
  min-height: 3rem;
  padding: 0.7rem 1.75rem;
  background: var(--rez);
  color: #fff;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
}

/* Section: revealed from the bottom; poché ground, drawn chambers. */
.cut__below {
  background: var(--grafit);
  color: var(--list);
  clip-path: inset(calc((100 - var(--cut-n)) * 1%) 0 0 0);
}

.cut__layer-label {
  position: absolute;
  top: 1.1rem;
  left: var(--gutter);
}

/* The machine label rides just under the plane, wherever the cut stands. */
.cut__layer-label--below {
  top: 0;
  transform: translateY(calc((100 - var(--cut-n)) * 1svh + 1.1rem));
  color: var(--papir-dim);
}

.cut__mgloss {
  position: absolute;
  top: 0;
  left: var(--gutter);
  right: var(--gutter);
  transform: translateY(calc((100 - var(--cut-n)) * 1svh + 2.6rem));
  font-style: italic;
  font-size: 0.9rem;
  color: var(--papir-dim);
  max-width: 52ch;
}

.cut__chambers {
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  bottom: 5.5rem;
  list-style: none;
  display: grid;
  gap: 1rem;
}

.cut__chamber {
  border: 1px solid var(--crta-na-temnem);
  border-left-width: 3px;
  padding: 0.6rem 0.8rem;
}

.cut__chamber-label {
  color: var(--papir-dim);
}

.cut__chamber-gloss {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--list);
  max-width: 44ch;
}

/* The emblem byte is the scene's payload — visible at EVERY width (the whole
   point is real bytes appearing as the page opens itself; phones included). */
.cut__chamber-emblem {
  display: block;
  margin-top: 0.45rem;
  color: var(--papir-dim);
  font-size: 0.68rem;
}

/* Short viewports: the in-scene chambers drop the GLOSS (paraphrase) and keep
   the EMBLEM (the byte is the payload worth the pixels) — the ledger right
   below remains the canonical, complete rendering of every gloss and byte. */
@media (max-height: 700px) {
  .cut__chamber-gloss {
    display: none;
  }
  .cut__chambers {
    gap: 0.5rem;
    bottom: 5rem;
  }
  .cut__chamber {
    padding: 0.45rem 0.7rem;
  }
}

/* The fixed phone strip owns the top of the viewport — the facade's layer
   label steps below it (the strip is opaque; top:1.1rem would vanish). The
   below-label is excluded: it rides the plane via transform from top:0. */
@media (max-width: 899px) {
  .cut__layer-label:not(.cut__layer-label--below) {
    top: calc(3.5rem + env(safe-area-inset-top, 0px) + 0.9rem);
  }
}

/* --- the plane ------------------------------------------------------------ */
/* Spans frame to frame — its end ticks bite into the sheet frame. */
.cut__plane {
  position: absolute;
  top: -1px;
  left: var(--frame);
  right: var(--frame);
  height: 2px;
  background: var(--rez);
  transform: translateY(calc((100 - var(--cut-n)) * 1svh));
  pointer-events: none;
  z-index: 2;
}

.cut__plane::before,
.cut__plane::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 8px;
  height: 8px;
  background: var(--rez);
}
.cut__plane::before {
  left: -4px;
}
.cut__plane::after {
  right: -4px;
}

/* --- the grip ------------------------------------------------------------- */
.cut__grip-wrap {
  display: none;
  position: absolute;
  left: var(--gutter);
  right: var(--gutter);
  bottom: max(1.1rem, env(safe-area-inset-bottom));
  align-items: center;
  gap: 0.9rem;
}

/* Never a dead control: hidden until the app is live. */
.cut--live .cut__grip-wrap {
  display: flex;
}

.cut__grip-label {
  color: var(--papir-dim);
  white-space: nowrap;
}

.cut__grip {
  flex: 1;
  max-width: 22rem;
  height: 44px;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.cut__grip::-webkit-slider-runnable-track {
  height: 2px;
  background: var(--crta-na-temnem);
}
.cut__grip::-moz-range-track {
  height: 2px;
  background: var(--crta-na-temnem);
}
.cut__grip::-webkit-slider-thumb {
  appearance: none;
  margin-top: -10px;
  width: 22px;
  height: 22px;
  border-radius: 0;
  background: var(--rez);
  border: 2px solid var(--list);
}
.cut__grip::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 0;
  background: var(--rez);
  border: 2px solid var(--list);
}

.cut__grip:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 2px;
}

/* --- crosshair readout (FULL tier) ---------------------------------------- */
.cut__xhair {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--t-micro) var(--ease-out);
}

.cut__xhair-val {
  display: inline-block;
  transform: translate(14px, 10px);
  padding: 0.15rem 0.4rem;
  background: var(--list);
  border: 1px solid var(--grafit);
  color: var(--grafit);
}

/* --- the ledger ----------------------------------------------------------- */
.cut__ledger {
  background: var(--grafit);
  color: var(--list);
  padding-block: clamp(3rem, 2.5rem + 3vw, 5rem);
}

.cut__ledger-title {
  margin-top: 0.75rem;
  color: var(--list);
}

.cut__ledger-list {
  list-style: none;
  margin-top: 2rem;
  display: grid;
  gap: 1.75rem;
}

.cut__ledger-chamber {
  border-top: 1px solid var(--crta-na-temnem);
  padding-top: 1rem;
}

.cut__ledger-label {
  color: var(--papir-dim);
}

.cut__ledger-gloss {
  margin-top: 0.3rem;
  font-size: 0.95rem;
  color: var(--list);
  max-width: 52ch;
}

.cut__ledger-lines {
  list-style: none;
  margin-top: 0.6rem;
  display: grid;
  gap: 0.25rem;
}

.cut__ledger-lines .emisija {
  color: var(--papir-dim);
}

.cut__outro {
  margin-top: 2.5rem;
  font-size: var(--fs-lead);
  color: var(--list);
  max-width: 50ch;
}

/* --- desktop -------------------------------------------------------------- */
@media (min-width: 900px) {
  .cut__facade-copy {
    left: calc(var(--gutter) + 1rem);
  }

  .cut__chambers {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
    bottom: 6rem;
  }

  .cut__chamber-emblem {
    display: block;
  }

  .cut__grip-wrap {
    left: auto;
    right: var(--gutter);
    width: 30rem;
  }

  .cut__ledger-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem 3.5rem;
  }
}
</style>
