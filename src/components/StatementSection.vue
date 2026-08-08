<script setup lang="ts">
/**
 * The opening band — the site's thesis performed, in the site's own
 * vocabulary. Two layers occupy the same geometry:
 *
 *   THE WORLD — the rendered hero: the pd mark (the veil's landing target,
 *   top-left on the inset), the monument (SPLETNA flush left / POVSOD flush
 *   right — a staircase the scroll shears further apart), and the claim in
 *   the void bottom-left.
 *
 *   THE X-RAY — the same markup as a machine sees it: black world, every
 *   element reduced to its dashed bounding box, its tag in dim mono, the
 *   mark as a wireframe. A structural CLONE of the world (same classes, same
 *   drift bindings), so the two layers can never drift apart geometrically.
 *
 * ON ARRIVAL the x-ray covers the hero and ONE red beam passes left→right,
 * rendering it — timed so a hard load's pass runs while the intro veil's
 * ground is fading (the page is born rendering; constants pair with the
 * veil timeline in index.html). AFTERWARDS, on hover-capable devices only,
 * the cursor carries a narrow x-ray slit across the hero: the page under
 * your pointer shows what it stands on. The slit is pure ornament — it
 * gates nothing, reveals nothing unique (the beam pass already showed
 * everyone the machine world once), and glides on a lagged follow so it
 * reads as an instrument, not a mask glued to the mouse.
 *
 * Rest state (stylesheet, no JS, reduced motion): the rendered hero, whole.
 * The x-ray is clipped away and never blocks paint, reading, or scroll.
 *
 * THE DRIFT: the two monument lines leave at different speeds (Spletna
 * leads, Povsod lags) — with the left/right stagger the shear is felt, not
 * suspected. Bounded, compositor-only, never wired under reduced motion.
 * The mark does not move: it is the landing datum.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { hero } from '@/content/home'
import { canHover, createFx, prefersReducedMotion } from '@/lib/fx'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

/** The script splice on the second line: the »od« tail, one run, never the
 *  first glyph. Derived so a lettering change degrades to the plain word. */
const WORD_1 = 'Spletna'
const WORD_2 = 'Povsod'
const SPLICE_RUN = 'od'
const spliceAt = WORD_2.endsWith(SPLICE_RUN) ? WORD_2.length - SPLICE_RUN.length : -1
const word2Head = spliceAt > 0 ? WORD_2.slice(0, spliceAt) : WORD_2
const word2Run = spliceAt > 0 ? SPLICE_RUN : ''

/** The render pass. On a HARD load it starts while the veil's ground is
 *  fading (veil timeline: ground fades 2.4–2.85s, hidden 3.2s — index.html;
 *  change there, change here). On SPA return there is no veil — one beat. */
const SWEEP_MS = 1300
const SWEEP_DELAY_HARD_MS = 2450
const SWEEP_DELAY_SOFT_MS = 350

/** The slit: width, and the follow's per-frame convergence (0..1). */
const SLIT_REM = 9
const FOLLOW = 0.14

/**
 * The differential drift. Spletna leads, Povsod lags — the staircase shears
 * open as the page scrolls away. Bounded to the hero's own exit.
 */
const RATE_1 = -0.26
const RATE_2 = -0.07
const DRIFT_LIMIT_VH = 1.3

const fx = createFx()
const rootEl = ref<HTMLElement | null>(null)
const live = ref(false)
const scanning = ref(false)
const par1 = ref(0)
const par2 = ref(0)

let driftRaf = 0
let swept = false

function driftMeasure() {
  driftRaf = 0
  const y = Math.min(Math.max(window.scrollY, 0), window.innerHeight * DRIFT_LIMIT_VH)
  par1.value = y * RATE_1
  par2.value = y * RATE_2
}

function onScroll() {
  if (driftRaf) cancelAnimationFrame(driftRaf)
  driftRaf = fx.raf(driftMeasure)
}

/** Clip state, written straight to the section (60fps ornament — no reactive
 *  churn). --xl/--xr are the x-ray's left/right cut; the beams read the same
 *  variables, so the rules and the clip can never disagree. */
function writeClip(el: HTMLElement, left: number, right: number) {
  el.style.setProperty('--xl', `${left.toFixed(1)}px`)
  el.style.setProperty('--xr', `${right.toFixed(1)}px`)
}

function sweep(el: HTMLElement) {
  const w = el.clientWidth
  // A hidden tab suspends rAF — land on the finished state instead of
  // blanking mid-pass (house rule for sweeps).
  if (document.hidden) {
    writeClip(el, w, 0)
    swept = true
    scanning.value = false
    armSlit(el)
    return
  }
  scanning.value = true
  const t0 = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / SWEEP_MS)
    const p = t * t * (3 - 2 * t) // smoothstep: decisive, no overshoot
    writeClip(el, p * w, 0)
    if (t < 1) {
      fx.raf(step)
    } else {
      swept = true
      scanning.value = false
      armSlit(el)
    }
  }
  fx.raf(step)
}

/** The cursor slit. A lagged follow loop that runs ONLY while it has work:
 *  it starts on pointer entry, converges each frame, and stops itself once
 *  settled shut after the pointer leaves. */
function armSlit(el: HTMLElement) {
  if (!canHover()) return
  let x = 0
  let width = 0
  let tx = 0
  let tw = 0
  let running = false

  const frame = () => {
    x += (tx - x) * FOLLOW
    width += (tw - width) * FOLLOW
    const w = el.clientWidth
    if (width < 1 && tw === 0) {
      // settled shut — rest state, loop ends
      writeClip(el, w, 0)
      scanning.value = false
      running = false
      return
    }
    writeClip(el, Math.max(0, x - width / 2), Math.max(0, w - (x + width / 2)))
    fx.raf(frame)
  }
  const start = () => {
    if (!running) {
      running = true
      fx.raf(frame)
    }
  }

  fx.on(el, 'pointerenter', ((e: PointerEvent) => {
    if (!swept) return
    const slitPx = SLIT_REM * parseFloat(getComputedStyle(document.documentElement).fontSize)
    x = e.clientX - el.getBoundingClientRect().left
    tx = x
    tw = slitPx
    scanning.value = true
    start()
  }) as EventListener)
  fx.on(el, 'pointermove', ((e: PointerEvent) => {
    if (!swept) return
    tx = e.clientX - el.getBoundingClientRect().left
    start()
  }) as EventListener)
  fx.on(el, 'pointerleave', (() => {
    tw = 0
    start()
  }) as EventListener)
}

onMounted(() => {
  live.value = true
  // Reduced motion: the rendered hero IS the finished design — no pass, no
  // slit, no drift, nothing created.
  if (prefersReducedMotion()) return

  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(window, 'resize', onScroll, { passive: true })
  driftMeasure()

  const el = rootEl.value
  if (!el) return
  // Arrive as the machine world; the pass renders it. Hard load waits for
  // the veil's ground-fade; SPA return takes a beat.
  writeClip(el, 0, 0)
  scanning.value = true
  const hard = 'intro' in document.documentElement.dataset
  fx.setTimeout(() => sweep(el), hard ? SWEEP_DELAY_HARD_MS : SWEEP_DELAY_SOFT_MS)
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section ref="rootEl" class="stmt" :class="{ 'stmt--live': live, 'stmt--scan': scanning }">
    <!-- THE WORLD — the rendered hero. In flow: it defines the height and is
         the complete page for crawlers, JS-off and reduced motion. -->
    <div class="stmt__world">
      <!-- data-brand-sentinel is a contract with SiteMasthead: the phone bar
           appears exactly when this element leaves the screen. -->
      <div class="stmt__brand" data-brand-sentinel>
        <!-- The pd mark: two overlapping discs carrying Povsod's first and
             last letters; the d is the p rotated 180°. Standalone above the
             lines: ink-top = ink-left = the inset, height 0.55em of
             --hero-display — THE VEIL'S LANDING FORMULA copies exactly this
             (index.html; change either, change both). -->
        <svg class="stmt__mark" viewBox="0 0 244 144" aria-hidden="true">
          <circle cx="72" cy="72" r="72" fill="var(--rez)" />
          <circle cx="172" cy="72" r="72" fill="var(--rez)" />
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round"
            transform="rotate(180 122 72)">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
        </svg>
        <span class="stmt__line stmt__line--1" :style="live ? { '--par': par1 + 'px' } : undefined">
          <span class="stmt__wordmark">{{ WORD_1 }}</span>
        </span>
        <span class="stmt__line stmt__line--2" :style="live ? { '--par': par2 + 'px' } : undefined">
          <span class="stmt__wordmark"
            >{{ word2Head }}<span v-if="word2Run" class="stmt__script">{{ word2Run }}</span></span
          >
        </span>
      </div>

      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>
    </div>

    <!-- THE X-RAY — the same hero as the machine sees it: a structural clone
         (same classes, same drift bindings, so the geometry can never lie),
         every element a dashed box with its tag in mono, the mark a
         wireframe. Decorative for assistive tech; clipped away at rest, so
         it costs nothing until the beam or the slit summons it. -->
    <div class="stmt__xray" aria-hidden="true">
      <div class="stmt__brand">
        <svg class="stmt__mark" data-tag="svg.stmt__mark 244×144" viewBox="0 0 244 144">
          <circle cx="72" cy="72" r="72" fill="var(--rez)" />
          <circle cx="172" cy="72" r="72" fill="var(--rez)" />
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round"
            transform="rotate(180 122 72)">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
        </svg>
        <span class="stmt__line stmt__line--1" data-tag='span "Spletna"'
          :style="live ? { '--par': par1 + 'px' } : undefined">
          <span class="stmt__wordmark">{{ WORD_1 }}</span>
        </span>
        <span class="stmt__line stmt__line--2" data-tag='span "Povsod"'
          :style="live ? { '--par': par2 + 'px' } : undefined">
          <span class="stmt__wordmark"
            >{{ word2Head }}<span v-if="word2Run" class="stmt__script">{{ word2Run }}</span></span
          >
        </span>
      </div>

      <p class="stmt__title" :data-tag="'h1 &quot;' + hero.title + '&quot;'">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </p>
    </div>

    <!-- The beams: the cut red standing on the clip's two edges. They read
         the SAME --xl/--xr the clip does, so line and boundary agree by
         construction. Outside the clipped element (a clip would cut them). -->
    <span class="stmt__beam stmt__beam--l" aria-hidden="true"></span>
    <span class="stmt__beam stmt__beam--r" aria-hidden="true"></span>
  </section>
</template>

<style scoped>
/* PINNED light: the page root flips with the ground switch and this
   section's inks are the paper world's — the pin comes off when the section
   joins the flip. overflow: clip so the drifting lines shear out of the
   band's own stage instead of bleeding over the next section. */
.stmt {
  position: relative;
  overflow: clip;
  background: var(--list);
}

/* Both layers carry the SAME frame, so the clone's geometry is the world's. */
.stmt__world,
.stmt__xray {
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 45px);
  padding: var(--hero-inset);
}

/* --- the monument ---------------------------------------------------------- */
.stmt__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  /* Clear the phone menu button standing in the top-right corner. */
  padding-right: 3rem;
}

/* The mark: standalone, its box IS its ink (SVG), so ink-top = inset by
   construction (veil pairing — see the template comment). */
.stmt__mark {
  height: 0.55em;
  width: auto;
  font-size: var(--hero-display);
  margin-bottom: 0.14em;
}

/* Display-XL, uppercase, lh 0.8 — monumentality is scale. Each line drifts
   on its own custom property (JS-fed); at rest and with JS off it is 0. */
.stmt__line {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--hero-display);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: translateY(var(--par, 0px));
}

/* The staircase: Spletna holds the left edge, Povsod the right — the void
   between them is the composition, and the scroll shears it open. */
.stmt__line--2 {
  align-self: flex-end;
  margin-top: 0.04em;
}

.stmt__wordmark {
  display: inline-block;
}

/* The splice: the script face at the same size, lowercase against the caps,
   lh 1 / ls 0 — the measured convention. */
.stmt__script {
  font-family: var(--font-script);
  font-weight: 400;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
}

/* --- the claim -------------------------------------------------------------- */
/* Statement register, in the void bottom-left. */
.stmt__title {
  margin-top: auto;
  padding-top: var(--space-8);
  font-size: clamp(1.4rem, 1.1rem + 1.2vw, 2.25rem);
  font-weight: 500;
  line-height: 0.98;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  max-width: 21ch;
}

.stmt__hl {
  /* Display-adjacent size, 3:1 floor applies — 5.37:1 on paper. */
  color: var(--rez);
}

/* --- the x-ray -------------------------------------------------------------- */
/* The machine world: black ground; every cloned element keeps its exact box
   (the type still lays out — it is merely not painted) and shows its dashed
   bounds and its tag instead. Clipped by --xl/--xr; at rest the left cut is
   at 100% and the layer costs nothing. */
.stmt__xray {
  position: absolute;
  inset: 0;
  background: var(--color-black);
  clip-path: inset(0 var(--xr, 0px) 0 var(--xl, 100%));
}

.stmt__xray .stmt__line,
.stmt__xray .stmt__title {
  color: transparent;
  outline: 1px dashed rgb(245 242 235 / 0.4);
  outline-offset: 2px;
  position: relative;
}

.stmt__xray .stmt__hl {
  color: transparent;
}

/* The wireframe mark: the drawing of the logo, not the logo. */
.stmt__xray .stmt__mark {
  position: relative;
  outline: 1px dashed rgb(245 242 235 / 0.4);
  outline-offset: 2px;
}
.stmt__xray .stmt__mark circle:nth-of-type(-n + 2) {
  fill: transparent;
  stroke: rgb(245 242 235 / 0.55);
  stroke-width: 2;
}
.stmt__xray .stmt__mark g {
  stroke: rgb(245 242 235 / 0.55);
  stroke-width: 2;
}

/* The tags: mono, dim paper (12.5:1 on black), hanging off each box's top
   edge — generated content on the aria-hidden layer, never module copy. */
.stmt__xray [data-tag]::before {
  content: attr(data-tag);
  position: absolute;
  left: 0;
  top: -1.4rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1;
  text-transform: none;
  color: var(--papir-dim);
  white-space: nowrap;
}

/* The claim's tag carries the whole h1 line — clamp it to its own box. */
.stmt__xray .stmt__title::before {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- the beams --------------------------------------------------------------
   2px cut red on the clip's edges; visible only while a pass or the slit is
   live (the .stmt--scan class), so the rest state carries no furniture. */
.stmt__beam {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-cut);
  opacity: 0;
  transition: opacity 200ms var(--ease-spring);
  pointer-events: none;
}

.stmt__beam--l {
  left: var(--xl, 100%);
  margin-left: -1px;
}

.stmt__beam--r {
  right: var(--xr, 0px);
  margin-right: -1px;
}

.stmt--scan .stmt__beam {
  opacity: 1;
}

/* --- phone ------------------------------------------------------------------ */
@media (max-width: 899.98px) {
  .stmt__world,
  .stmt__xray {
    min-height: 100svh;
  }
  /* The tag labels crowd a phone hero — the slit never exists there (no
     hover), only the entrance pass, and the boxes alone carry the idea. */
  .stmt__xray [data-tag]::before {
    display: none;
  }
}
</style>
