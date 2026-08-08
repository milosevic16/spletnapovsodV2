<script setup lang="ts">
/**
 * Tradicija in izkušnje — the section that shows its own source, restaged on
 * the design system's broadcast metaphor: a screen that RENDERS THE SITE as a
 * scanline passes across it.
 *
 * This section also carries the page's light→dark ground change: its top
 * crossing mid-viewport flips [data-ground] (src/lib/ground.ts), and the
 * whole page tweens around the instrument while the instrument itself stays
 * put — both of its panels are CONSTANT surfaces (paper and black), so the
 * body copy inside never rides the flip and never dips below AA. The only
 * text that rides the flip is the display title, which snaps between its two
 * inks mid-tween (see --trad-snap below).
 *
 * THE INSTRUMENT. A framed set: a black dial strip (the two state labels and
 * a real <input type="range">), a screen split by a vertical red beam —
 * LEFT of the beam the rendered page (paper world), RIGHT of it the source
 * the crawler receives (mono on black) — and a black legend strip. One
 * number drives everything: --scan (0 = all source, 100 = fully rendered).
 *
 * THE SWEEP. On arrival the screen holds at 0 (raw source); when it is ~30%
 * visible the beam makes ONE left→right pass (SWEEP_MS), rendering the page
 * and carrying the slider's handle to the right end. After that — and at any
 * moment during it — the hand owns the control: dragging is direct, nothing
 * else is coupled to it, scroll never moves it.
 *
 * REST STATE (stylesheet, no JS): --scan falls back to 55 — the composed
 * split where BOTH worlds are legible, which is also what reduced-motion
 * visitors get (no sweep, dial fully operable). A crawler reads the rendered
 * layer as ordinary HTML; the source layer is its aria-hidden mono twin,
 * derived from the same content module so it cannot depict tags we do not
 * ship, and it opens with the guard-checked head emissions (data-fact).
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { invisible } from '@/content/home'
import { factLines } from '@/lib/machine-facts'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const screen = ref<HTMLElement | null>(null)
const gripEl = ref<HTMLInputElement | null>(null)
const live = ref(false)

/** The composed rest: both worlds in view. PAIRS with every `var(--scan, 55)`
 *  fallback in the style block — change one, change all. */
const REST = 55
/** One pass of the beam across the screen. */
const SWEEP_MS = 1600
/** A beat after the screen lands before the pass starts. */
const SWEEP_DELAY_MS = 180
/** Fires when this share of the screen is visible — 0.5 can be unreachable
 *  for a tall screen on a short phone viewport, so it sits lower. */
const SWEEP_VISIBLE = 0.3

/** 0 = all source, 100 = fully rendered. */
const scan = ref(REST)
/** The beam only exists while a split exists. */
const edge = computed(() => scan.value <= 0.5 || scan.value >= 99.5)

let sweeping = false
/** Sweep spent, or the hand took over — either way the pass never (re)fires. */
let done = false

/** Decisive and damped, zero overshoot — the system's temperament. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function sweep() {
  if (done) return
  sweeping = true
  const t0 = performance.now()
  const step = (now: number) => {
    if (!sweeping) return
    const t = Math.min(1, (now - t0) / SWEEP_MS)
    scan.value = easeOutCubic(t) * 100
    if (t < 1) fx.raf(step)
    else {
      sweeping = false
      done = true
    }
  }
  fx.raf(step)
}

/** A hand on the control always wins — cancels a running sweep and simply
 *  keeps the dragged position; there is no mapping waiting to snatch it. */
function takeOver() {
  sweeping = false
  done = true
}

function onGrip() {
  takeOver()
  if (gripEl.value) scan.value = Number(gripEl.value.value)
}

/** The title splice: ONE script run inside the display word, set by eye
 *  (art direction: never the first glyph, one run per word, tail runs read
 *  best). Derived from the real title so a copy edit degrades to the plain
 *  word rather than mis-slicing it. */
const SPLICE_RUN = 'nje'
const title = computed(() => {
  const t = invisible.title
  const at = t.lastIndexOf(SPLICE_RUN)
  if (at <= 0) return { before: t, run: '', after: '' }
  return { before: t.slice(0, at), run: SPLICE_RUN, after: t.slice(at + SPLICE_RUN.length) }
})

/** The source the crawler receives — derived from the content module and the
 *  guard-checked fact lines, so the depiction cannot drift from the shipped
 *  bytes. Facts first: they are what a crawler reads before anything else. */
const sourceLines = computed(() => [
  ...factLines.map((f) => ({ id: f.id, text: f.text })),
  { id: '', text: `<h2>${invisible.title}</h2>` },
  { id: '', text: `<blockquote>${invisible.quote}</blockquote>` },
  { id: '', text: `<p>${invisible.intro}</p>` },
  ...invisible.items.flatMap((item) => [
    { id: '', text: `<article id="${item.id}">` },
    { id: '', text: `  <h3>${item.label}</h3>` },
    { id: '', text: `  <p>${item.detail}</p>` },
    { id: '', text: `</article>` },
  ]),
  { id: '', text: `<p>${invisible.outro}</p>` },
  { id: '', text: `<p>${invisible.machineGloss}</p>` },
])

onMounted(() => {
  live.value = true
  // Reduced motion: the composed rest IS the finished state — no sweep, the
  // dial fully operable, the ground flip lands instantly (base.css kill-switch).
  if (prefersReducedMotion()) return
  // No IntersectionObserver → no sweep. Never park on 0 without a way to
  // render: the composed rest stays.
  if (!('IntersectionObserver' in window) || !screen.value) return
  scan.value = 0 // arrive as raw source; the pass renders it
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.disconnect()
        fx.setTimeout(sweep, SWEEP_DELAY_MS)
      }
    },
    { threshold: SWEEP_VISIBLE },
  )
  io.observe(screen.value)
})

onUnmounted(() => {
  sweeping = false
  fx.dispose()
})
</script>

<template>
  <section
    id="nevidno"
    class="trad"
    :class="{ 'trad--live': live, 'trad--edge': edge }"
  >
    <div class="container">
      <header class="trad__head">
        <!-- The kicker rides the flipping page ground, so it lives on its own
             constant plate (the system's mono chip): AA on both grounds at
             every instant of the tween. -->
        <p class="trad__kicker">{{ invisible.kicker }}</p>
        <h2 class="trad__title">
          {{ title.before
          }}<span v-if="title.run" class="trad__script">{{ title.run }}</span
          >{{ title.after }}
        </h2>
      </header>

      <div class="trad__set">
        <!-- The dial: the two states name the slider's ends — machine left
             (0, all source), human right (100, rendered). -->
        <div class="trad__dial">
          <span class="trad__end">{{ invisible.machineLabel }}</span>
          <input
            v-if="live"
            ref="gripEl"
            class="trad__grip"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="Math.round(scan)"
            :aria-label="invisible.feedback.scanLabel"
            @input="onGrip"
            @pointerdown="takeOver"
            @keydown="takeOver"
          />
          <span v-else class="trad__grip-ghost" aria-hidden="true"></span>
          <span class="trad__end">{{ invisible.humanLabel }}</span>
        </div>

        <!-- The screen. The rendered page is the geometry authority (in flow,
             real content); the source layer is absolute behind it, opaque
             black, clipped complementarily by the same --scan. -->
        <div ref="screen" class="trad__screen" :style="live ? { '--scan': String(scan) } : undefined">
          <div class="trad__made">
            <blockquote class="trad__quote">
              <p>{{ invisible.quote }}</p>
            </blockquote>
            <p class="trad__intro">{{ invisible.intro }}</p>
            <div class="trad__rows">
              <article
                v-for="(item, n) in invisible.items"
                :id="item.id"
                :key="item.id"
                class="trad__row"
              >
                <span class="trad__index" aria-hidden="true">00{{ n + 1 }}</span>
                <h3 class="trad__row-label">{{ item.label }}</h3>
                <p class="trad__row-detail">{{ item.detail }}</p>
              </article>
            </div>
            <p class="trad__outro">{{ invisible.outro }}</p>
          </div>

          <div class="trad__source" aria-hidden="true">
            <code
              v-for="(line, n) in sourceLines"
              :key="n"
              class="emisija trad__line"
              :data-fact="line.id || undefined"
              >{{ line.text }}</code
            >
          </div>

          <span class="trad__beam" aria-hidden="true"></span>
        </div>

        <!-- The legend: why the source half matters. Constant dark strip. -->
        <p class="trad__legend">{{ invisible.machineGloss }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Transparent root: the section sits ON the flipping page ground — arriving
   here is what turns the page dark (ground.ts), and the tween is visible
   exactly where the visitor is looking. Both instrument panels are constant,
   so no body copy rides the flip. */
.trad {
  /* Tighter than the standard section frame: the settle wants the whole
     instrument inside one viewport, and the centre-snap crops padding first —
     so the padding is the sacrificial zone. */
  padding-block: var(--space-16);
}

/* The settle: a native proximity snap centres the instrument when the scroll
   comes to rest nearby — never a trap, scrolling straight through is free
   (scroll-snap-type on html lives in base.css, gated to wide viewports and
   no-preference; this is the only snap-align on the page). */
@media (min-width: 1200px) and (prefers-reduced-motion: no-preference) {
  .trad {
    scroll-snap-align: center;
  }
}

.trad__head {
  margin-bottom: var(--space-8);
}

/* The kicker chip: constant plate (ink fill, paper text 13.9:1) with the
   constant divider as its edge, so it reads on both page grounds at every
   instant of the tween. */
.trad__kicker {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  line-height: var(--type-label-lh);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-paper);
  background: var(--color-ink);
  border: 1px solid var(--divider);
  padding: var(--space-1) var(--space-2);
}

/* The one piece of text that rides the flip. Large display type (3:1 floor):
   its ink SNAPS between the two states mid-tween rather than tweening through
   the ground's own greys — any continuous ink path crosses the ground and
   dips below AA; a snap inside the window where BOTH inks clear 3:1 never
   does. The light ink is pure black (not the brand's #242424) because that
   DOUBLES the window: measured on the real tween by seeking the --surface
   transition, black holds ≥3:1 until ~400ms and paper from ~340ms
   (worst boundary 3.09), so the snap sits at the centre. #242424's window is
   only [340,360]. Re-measure if --dur-ground / --ease-ground change. */
.trad__title {
  /* Centre of the measured both-pass window on the 1000ms ground tween.
     PAIRED with tokens.css — change the tween, re-measure the window. */
  --trad-snap: 370ms;
  margin-top: var(--space-4);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--color-black);
  overflow-wrap: anywhere;
}

:root[data-ground='dark'] .trad__title {
  color: var(--color-paper);
}

/* The snap is a zero-duration transition with a delay. Gated: under reduced
   motion the ground flip itself is instant (kill-switch), so the title must
   flip WITH the attribute — a leftover delay would strand dark-on-dark text
   for half a second. */
@media (prefers-reduced-motion: no-preference) {
  .trad__title {
    transition: color 0ms linear var(--trad-snap);
  }
}

/* The script splice: same size, its own face, lowercase against the machined
   caps, lh 1 / ls 0 (measured convention from the reference). */
.trad__script {
  font-family: var(--font-script);
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
  font-weight: 400;
}

/* --- the instrument --------------------------------------------------------
   One framed object on the changing page: the frame is the constant divider
   grey, legible on both grounds, exactly like the reference's unmoving
   hairlines. */
.trad__set {
  border: var(--divider-width) solid var(--divider);
}

/* The dial strip: constant black bezel. */
.trad__dial {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: var(--space-4);
  row-gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-black);
  border-bottom: var(--divider-width) solid var(--crta-na-temnem);
}

.trad__end {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  text-transform: uppercase;
  color: var(--papir-dim); /* 12.5:1 on black */
  white-space: nowrap;
}

/* A real range input: drag, keyboard (arrows / PgUp / Home / End) and touch
   all work with ZERO custom touch listeners. 44px hit target; the visible
   thumb is a 20px square riding a 2px track. */
.trad__grip {
  -webkit-appearance: none;
  appearance: none;
  height: 44px;
  min-width: 8rem;
  margin: 0;
  background: transparent;
  cursor: ew-resize;
}
.trad__grip::-webkit-slider-runnable-track {
  height: 2px;
  background: var(--crta-na-temnem);
}
.trad__grip::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -9px;
  border: 0;
  border-radius: 0;
  background: var(--color-cut-dark); /* 6.42:1 on the black bezel */
}
.trad__grip::-moz-range-track {
  height: 2px;
  background: var(--crta-na-temnem);
}
.trad__grip::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 0;
  background: var(--color-cut-dark);
}
.trad__grip:focus-visible {
  outline: 2px solid var(--color-cut-dark);
  outline-offset: 4px;
}

/* JS-off: the dial keeps its geometry, no dead control appears. */
.trad__grip-ghost {
  height: 44px;
}

/* --- the screen ------------------------------------------------------------ */
.trad__screen {
  position: relative;
  /* The source layer must never bleed past the frame. */
  overflow: hidden;
  background: var(--color-black);
}

/* The rendered page: real content, in flow — it defines the screen's height.
   Clipped from the RIGHT by the scan (0 = all source, 100 = all page).
   `var(--scan, 55)` PAIRS with REST in the script block. */
.trad__made {
  position: relative;
  z-index: 1;
  background: var(--color-paper);
  padding: clamp(1.25rem, 1rem + 2vw, 2.5rem);
  clip-path: inset(0 calc((100 - var(--scan, 55)) * 1%) 0 0);
}

/* The source: the mono twin, opaque black, behind the page — visible exactly
   where the page is clipped away. Its own padding, its own flow; if the
   document runs longer than the screen the tail clips, which is why the
   guard-checked facts stand FIRST. */
.trad__source {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--color-black);
  padding: clamp(1.25rem, 1rem + 2vw, 2.5rem);
  overflow: hidden;
}

.trad__line {
  display: block;
  color: var(--papir-dim); /* 12.5:1 on black */
  font-size: 0.8125rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

/* The beam: the cut red, 2px, standing on the seam — legible on BOTH panels
   (5.37:1 on paper, 3.49:1 on black). No glow: depth is drawn, never cast. */
.trad__beam {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: calc(var(--scan, 55) * 1%);
  width: 2px;
  margin-left: -1px;
  background: var(--color-cut);
  opacity: 1;
  transition: opacity 240ms var(--ease-spring);
}

/* No split, no beam (fully source / fully rendered). */
.trad--edge .trad__beam {
  opacity: 0;
}

/* --- the rendered page's own composition ------------------------------------ */
.trad__quote {
  margin: 0;
}
.trad__quote p {
  /* A miniature of the statement role — the full-size statement (3rem) makes
     the screen taller than any viewport the settle could hold. */
  font-size: clamp(1.375rem, 1.05rem + 1.3vw, 2.25rem);
  font-weight: var(--type-statement-weight);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
  /* The system's statement runs lh 0.9; caps with carons need a shade more
     air to keep ascenders clear of the line above. */
  line-height: 1.02;
  color: var(--color-ink);
  max-width: 24ch;
}

.trad__intro {
  margin-top: var(--space-6);
  color: var(--color-ink-2); /* 8.99:1 on paper */
  max-width: 58ch;
}

.trad__rows {
  margin-top: var(--space-8);
  border-top: var(--divider-width) solid var(--mreza-strong);
}

.trad__row {
  display: grid;
  grid-template-columns: 2rem minmax(0, 14rem) minmax(0, 1fr);
  align-items: baseline;
  column-gap: var(--space-4);
  padding-block: var(--space-3);
  border-bottom: var(--divider-width) solid var(--mreza-strong);
}

.trad__index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--color-ink-2);
}

.trad__row-label {
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0;
  text-transform: none;
  color: var(--color-ink);
}

.trad__row-detail {
  color: var(--color-ink-2);
  font-size: 0.9375rem;
  line-height: 1.5;
  max-width: 44ch;
}

.trad__outro {
  margin-top: var(--space-8);
  color: var(--color-ink);
  font-weight: 500;
  max-width: 50ch;
}

/* --- the legend -------------------------------------------------------------- */
.trad__legend {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--color-black);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
  color: var(--papir-dim);
  font-size: 0.875rem;
  max-width: none;
}

/* --- desktop: the page under the beam is a real desktop composition ---------
   The system's dominant split: statement + intro on the left, the ruled rows
   on the right. This is also what lets the whole instrument fit a ~900px
   viewport for the settle. */
@media (min-width: 1200px) {
  .trad__made {
    display: grid;
    grid-template-columns: minmax(0, 30fr) minmax(0, 68fr);
    /* Explicit areas — auto-placement would stagger the two columns. */
    grid-template-areas:
      'quote rows'
      'intro rows'
      'intro outro';
    column-gap: var(--space-8);
    align-items: start;
    align-content: start;
  }
  .trad__made > .trad__quote {
    grid-area: quote;
  }
  .trad__made > .trad__intro {
    grid-area: intro;
    align-self: start;
  }
  .trad__made > .trad__rows {
    grid-area: rows;
  }
  .trad__made > .trad__outro {
    grid-area: outro;
  }
  .trad__rows {
    margin-top: 0;
  }
  .trad__row {
    grid-template-columns: 2rem minmax(0, 15rem) minmax(0, 1fr);
  }
}

/* --- phone (system breakpoint) ----------------------------------------------
   The section exceeds the viewport here by design: normal flow, no settle,
   the sweep still fires on intersection. The dial re-stacks deterministically:
   labels row, then the full-width control. */
@media (max-width: 809px) {
  .trad__dial {
    grid-template-columns: 1fr auto;
  }
  .trad__grip {
    grid-column: 1 / -1;
    grid-row: 2;
    min-width: 0;
  }
  .trad__end:last-of-type {
    justify-self: end;
  }
  .trad__row {
    grid-template-columns: 2rem minmax(0, 1fr);
    row-gap: var(--space-1);
  }
  .trad__row-detail {
    grid-column: 2;
  }
}
</style>
