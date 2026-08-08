<script setup lang="ts">
/**
 * Tradicija in izkušnje — the section that shows its own source, staged on the
 * design system's broadcast metaphor: a screen that RENDERS THE SITE as a
 * scanline passes across it.
 *
 * This section also carries the page's light→dark ground change: its top
 * crossing mid-viewport flips [data-ground] (src/lib/ground.ts), and the whole
 * page tweens around the instrument while the instrument itself stays put —
 * both of its surfaces are CONSTANT (paper screen, black bezel), so the body
 * copy inside never rides the flip and never dips below AA. The only text that
 * rides it is the display title, which snaps between its two inks mid-tween
 * (see --trad-snap below).
 *
 * THE INSTRUMENT. A framed set: a screen split by a vertical red beam — LEFT
 * of the beam the rendered page (paper world), RIGHT of it the source the
 * crawler receives (mono on black) — over a black bezel carrying the legend
 * and the dial (the two state labels and a real <input type="range">). One
 * number drives everything: --scan (0 = all source, 100 = fully rendered).
 *
 * THE SWEEP. On arrival the screen holds at 0 (raw source) and STAYS there
 * while the visitor reads: the pass only fires after the screen has been
 * continuously visible for SWEEP_HOLD_MS, and leaving the viewport disarms it
 * again. Then the beam makes ONE left→right pass (SWEEP_MS), rendering the
 * page and carrying the dial's handle to the right end. At any moment — during
 * the hold or the pass — the hand owns the control: dragging is direct,
 * nothing else is coupled to it, scroll never moves it.
 *
 * THE LAYERS (the interactive layer). Inside the rendered half, the four
 * things that live under the surface are drawn as a SECTION THROUGH THE SITE:
 * strata of unequal thickness, stepping darker with depth, probed one at a
 * time. Probing fills a stratum with ink and swings a leader across to its
 * callout. Real tablist semantics; with JS off the strata are an inert drawing
 * and all four callouts stand open in flow, so nobody meets a dead control.
 *
 * REST STATE (stylesheet, no JS): --scan falls back to 55 — the composed split
 * where BOTH worlds are legible, which is also what reduced-motion visitors
 * get (no sweep, dial fully operable). A crawler reads the rendered layer as
 * ordinary HTML; the source layer is its aria-hidden mono twin, derived from
 * the same content module so it cannot depict tags we do not ship, and it
 * opens with the guard-checked head emissions (data-fact).
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { invisible } from '@/content/home'
import { factLines } from '@/lib/machine-facts'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const root = ref<HTMLElement | null>(null)
const screen = ref<HTMLElement | null>(null)
const gripEl = ref<HTMLInputElement | null>(null)
const live = ref(false)

/** The composed rest: both worlds in view. PAIRS with every `var(--scan, 55)`
 *  fallback in the style block — change one, change all. */
const REST = 55
/** One pass of the beam across the screen. */
const SWEEP_MS = 1600
/**
 * How long the screen must stay continuously visible before the pass fires —
 * the reading beat. Long on purpose: the raw source is the point of the first
 * act, and rendering it early throws the argument away. Leaving the viewport
 * disarms the timer, so the sweep can only happen to someone who lingered.
 */
const SWEEP_HOLD_MS = 2600
/** Fires when this share of the screen is visible. Deliberately modest: a tall
 *  screen on a short phone viewport can never reach a high threshold. */
const SWEEP_VISIBLE = 0.35

/** 0 = all source, 100 = fully rendered. */
const scan = ref(REST)
/** The beam only exists while a split exists. */
const edge = computed(() => scan.value <= 0.5 || scan.value >= 99.5)

let sweeping = false
/** Sweep spent, or the hand took over — either way the pass never (re)fires. */
let done = false
/** The reading beat's pending timer, cleared when the screen leaves. */
let holdTimer = 0

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

/** A hand on the control always wins — cancels a pending hold or a running
 *  sweep and simply keeps the dragged position; there is no mapping waiting to
 *  snatch it back. */
function takeOver() {
  sweeping = false
  done = true
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = 0
  }
}

function onGrip() {
  takeOver()
  if (gripEl.value) scan.value = Number(gripEl.value.value)
}

/**
 * The probed stratum. One integer drives the fill, the callout and the
 * leader's position, so the three can never disagree.
 */
const probe = ref(0)

/** Read the strata from the DOM: a v-for ref array goes stale on every update. */
function bandAt(i: number): HTMLElement | undefined {
  return root.value?.querySelectorAll<HTMLElement>('.asm__band')[i]
}

/* THE LEADER IS NOT MEASURED. Each stratum owns its own leader, centred on
 * itself in CSS, revealed when that stratum is probed — so it is exact at
 * every size by construction. The earlier version aimed ONE leader from JS at
 * the probed band's measured centre, and it went stale twice here (12px and
 * 15px offsets that survived width changes, because a re-measure depends on a
 * ResizeObserver notification or a font-load promise actually arriving). A
 * geometry that cannot be stale beats a measurement with two rescue paths;
 * the cost is that the leader appears at the new layer instead of sliding to
 * it, which suits the system's decisive temperament anyway. */

/** Vertical tablist: arrows move and select, Home/End jump to the ends. */
function onProbeKeys(e: KeyboardEvent) {
  const n = invisible.items.length
  let next = -1
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (probe.value + 1) % n
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (probe.value - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next < 0) return
  e.preventDefault()
  probe.value = next
  // Focus follows selection — the tablist contract. nextTick, not rAF: this
  // waits on Vue's DOM update, and rAF is throttled to a stop in a background
  // tab, where the focus must still land.
  nextTick(() => bandAt(next)?.focus())
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
  // dial and the strata fully operable, the ground flip lands instantly
  // (base.css kill-switch).
  if (prefersReducedMotion()) return
  // No IntersectionObserver → no sweep. Never park on 0 without a way to
  // render: the composed rest stays.
  if (!('IntersectionObserver' in window) || !screen.value) return
  scan.value = 0 // arrive as raw source; the pass renders it after the beat
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (!holdTimer && !done) {
            holdTimer = fx.setTimeout(() => {
              holdTimer = 0
              io.disconnect()
              sweep()
            }, SWEEP_HOLD_MS)
          }
        } else if (holdTimer) {
          // Left the screen mid-beat: disarm. Coming back re-arms it, so the
          // pass only ever happens to someone who stayed to read.
          clearTimeout(holdTimer)
          holdTimer = 0
        }
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
    ref="root"
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
        <!-- The screen. The rendered page is the geometry authority (in flow,
             real content); the source layer is absolute behind it, opaque
             black, clipped complementarily by the same --scan. -->
        <div ref="screen" class="trad__screen" :style="live ? { '--scan': String(scan) } : undefined">
          <div class="trad__made">
            <!-- The statement band: the argument, then a rule. Grouped so the
                 rule belongs to the band rather than to a paragraph. -->
            <div class="trad__argument">
              <blockquote class="trad__quote">
                <p>{{ invisible.quote }}</p>
              </blockquote>
              <p class="trad__intro">{{ invisible.intro }}</p>
            </div>

            <!-- THE INTERACTIVE LAYER: a section through the site's own
                 build-up. Four strata of unequal thickness, each in its own
                 drafting hatch, stepping darker with depth; probing one draws
                 the CUT PLANES at its two interfaces, fills its terminal and
                 swings the leader across to its callout. The article ids are
                 real, so the source layer's <article id="…"> depicts a tag we
                 actually ship. -->
            <div class="asm">
              <div
                class="asm__stack"
                :role="live ? 'tablist' : undefined"
                :aria-label="live ? invisible.feedback.layersLabel : undefined"
                aria-orientation="vertical"
                @keydown="live && onProbeKeys($event)"
              >
                <!-- Dimension rule down the left edge: extension ticks only,
                     never a figure — this drawing measures nothing we could
                     honestly put a number on. -->
                <span class="asm__dim" aria-hidden="true"></span>
                <component
                  :is="live ? 'button' : 'div'"
                  v-for="(item, n) in invisible.items"
                  :id="live ? `tab-${item.id}` : undefined"
                  :key="item.id"
                  class="asm__band"
                  :class="[`asm__band--${n}`, { 'asm__band--on': live && n === probe }]"
                  :type="live ? 'button' : undefined"
                  :role="live ? 'tab' : undefined"
                  :aria-selected="live ? String(n === probe) : undefined"
                  :aria-controls="live ? item.id : undefined"
                  :tabindex="live ? (n === probe ? 0 : -1) : undefined"
                  @click="live && (probe = n)"
                >
                  <!-- The material's own drafting hatch. Half-strength at
                       rest, full when probed — the drawing's way of saying
                       "this is the layer we are looking at". -->
                  <span class="asm__fill" aria-hidden="true"></span>
                  <!-- The cut planes BOUNDING the probed stratum: drawn at its
                       two interfaces with square end ticks, so they mark the
                       layer without ever crossing its name. -->
                  <span class="asm__plane" aria-hidden="true"></span>
                  <span class="asm__band-label">{{ item.label }}</span>
                  <!-- Leader terminal: hollow reads as available, filled as
                       taken — the drawing's own way of saying "press me". -->
                  <span class="asm__node" aria-hidden="true"></span>
                  <!-- Each stratum owns its leader, centred on ITSELF: exact at
                       every size, nothing to measure or re-measure. -->
                  <span v-if="live" class="asm__leader" aria-hidden="true"></span>
                </component>
              </div>

              <div class="asm__panels">
                <article
                  v-for="(item, n) in invisible.items"
                  :id="item.id"
                  :key="item.id"
                  class="asm__panel"
                  :role="live ? 'tabpanel' : undefined"
                  :aria-labelledby="live ? `tab-${item.id}` : undefined"
                  :hidden="live && n !== probe"
                >
                  <h3 class="asm__label">{{ item.label }}</h3>
                  <p class="asm__detail">{{ item.detail }}</p>
                </article>
              </div>
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

        <!-- The bezel, under the screen: why the source half matters, then the
             dial. A constant black strip, so nothing in it rides the flip. -->
        <div class="trad__bezel">
          <p class="trad__legend">{{ invisible.machineGloss }}</p>
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
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Transparent root: the section sits ON the flipping page ground — arriving
   here is what turns the page dark (ground.ts), and the tween is visible
   exactly where the visitor is looking. Both instrument surfaces are constant,
   so no body copy rides the flip. */
.trad {
  /* Tighter than the standard section frame: the settle wants the whole
     instrument inside one viewport (measured: 887px at 1440×900, so it fits
     with the head and both bezel strips), and the centre-snap crops padding
     first — so the padding is the sacrificial zone. */
  padding-block: var(--space-12);
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

/* --- the rendered page's own composition ------------------------------------
   Three bands, ruled apart, in the system's own archetypes: the STATEMENT
   BAND (a statement at the 65% measure with its intro under it, the right
   third deliberately empty — the reference's asymmetry spent as a void),
   then INDEX + PREVIEW (the drawing beside its callout), then a closing line.
   The rules are what hold it together at any clip width: whatever the beam
   leaves standing still reads as a composed page, not a fragment. */
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
  max-width: 26ch;
}

.trad__intro {
  margin-top: var(--space-6);
  color: var(--color-ink-2); /* 8.99:1 on paper */
  max-width: 54ch;
}

.trad__outro {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: var(--divider-width) solid var(--mreza-strong);
  color: var(--color-ink);
  font-weight: 500;
  max-width: 54ch;
}

/* --- the strata (the interactive layer) -------------------------------------
   A section through the build-up. Unequal thicknesses are the point: a
   membrane is thin, a substrate is thick — equal slabs would read as a bar
   chart. Grounds step darker with depth through the paper family; each
   material carries its OWN drafting hatch, at half strength until probed.

   Probing is signalled the way a section drawing signals it — and never by
   tone alone: the CUT PLANES appear at the layer's two interfaces with square
   end ticks, the terminal fills, the hatch comes up to full, the label
   brightens, and the leader swings across to the callout. The band's own
   GROUND never changes, which is what keeps the label's contrast constant
   through every state (a ground tween under 14px type crosses mid-grey and
   drops both possible inks under 4.5:1 — measured; that is why the earlier
   ink-fill version was replaced by this one). */
.asm {
  --asm-gap: clamp(1.5rem, 4vw, 3rem);
  display: grid;
  gap: var(--space-8);
}

.asm__stack {
  position: relative;
  display: grid;
  grid-template-rows: 1.4fr 0.72fr 0.95fr 1.95fr;
  min-height: clamp(19rem, 34vw, 26rem);
  border: var(--divider-width) solid var(--mreza-strong);
  /* The leader and the dimension rule reach out of this box. */
  overflow: visible;
  margin-left: 1.25rem;
}

/* Dimension rule: extension ticks top and bottom, no figure. */
.asm__dim {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1.25rem;
  width: 1px;
  background: var(--mreza-strong);
  pointer-events: none;
}
.asm__dim::before,
.asm__dim::after {
  content: '';
  position: absolute;
  left: -3px;
  width: 7px;
  height: 1px;
  background: var(--mreza-strong);
}
.asm__dim::before {
  top: 0;
}
.asm__dim::after {
  bottom: 0;
}

.asm__band {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0;
  margin: 0;
  border: 0;
  border-bottom: var(--divider-width) solid var(--mreza-strong);
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  /* VISIBLE, deliberately: the band's own leader reaches out of it into the
     gap. Nothing inside can overflow — the hatch and the cut planes are both
     `inset: 0` — so there is nothing to clip. */
  overflow: visible;
}

.asm__band:last-of-type {
  border-bottom: 0;
}

button.asm__band {
  cursor: pointer;
}

.asm__band:focus-visible {
  outline: 2px solid var(--color-cut);
  outline-offset: -4px;
}

/* The hatch: half strength at rest, full when probed. Opacity only — the
   band's ground is constant, so the label's worst-case composite is the
   hatch LINE over that ground, and every alpha below is chosen against the
   4.5:1 floor for the 14px label (computed per band; the deepest ground takes
   the lightest hatch). SCALE contrast, not just pitch: a 3px lamination
   against a 22px poché is what makes two fills read as different MATERIALS
   rather than the same material drawn twice. */
.asm__fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity var(--dur-tween) var(--ease-hover);
}

/* Structure — 45° section hatch. */
.asm__band--0 {
  background: var(--color-paper);
}
.asm__band--0 .asm__fill {
  background: repeating-linear-gradient(
    45deg,
    transparent 0 10px,
    rgb(36 36 36 / 0.28) 10px 11px
  );
}

/* Membrane — a thin laminated sheet, ruled very fine. */
.asm__band--1 {
  background: var(--color-paper-2);
}
.asm__band--1 .asm__fill {
  background: repeating-linear-gradient(0deg, transparent 0 2px, rgb(36 36 36 / 0.26) 2px 3px);
}

/* Granular fill — stipple, the drafting convention for loose material. */
.asm__band--2 {
  background: var(--mreza);
}
.asm__band--2 .asm__fill {
  background-image: radial-gradient(rgb(36 36 36 / 0.4) 1px, transparent 1.3px);
  background-size: 8px 8px;
}

/* Substrate — coarse cross-hatched poché, the mass everything sits on. Its
   ground is already the darkest, so the hatch is the lightest of the four.

   The tone is a component-local material step, NOT --mreza-strong (#b3ac9c):
   the cut red measures 2.79:1 on that, so the cut planes — a state indicator —
   would have missed the 3:1 floor on this one stratum. Solved numerically
   against the HATCH-COMPOSITED ground (the hatch darkens it further, which a
   flat-ground calculation misses: #bdb6a6 reads 3.07 flat but 2.85 composited).
   #c5bfb0 is the first step that clears it composited (3.14:1) while keeping a
   real depth gradient (245 → 236 → 217 → 197) and ink at 8.11:1.

   ONE rule block for this selector, deliberately: the ground line below used to
   live in its own `.asm__band--3 { border-top }` block, and the CSS minifier
   merges duplicate selectors and can drop declarations while doing it (both
   blocks did survive this build — checked in dist — but the house rule is one
   block per selector for anything load-bearing). */
.asm__band--3 {
  background: #c5bfb0;
  /* The interface onto the substrate is the drawing's ground line — heavier,
     the way a section marks the boundary you build on. */
  border-top: 2px solid var(--color-ink);
}
.asm__band--3 .asm__fill {
  background:
    repeating-linear-gradient(45deg, transparent 0 21px, rgb(36 36 36 / 0.16) 21px 23px),
    repeating-linear-gradient(-45deg, transparent 0 21px, rgb(36 36 36 / 0.16) 21px 23px);
}

.asm__band--on .asm__fill {
  opacity: 1;
}
/* Hover echoes the probe — GATED on a hovering pointer: on touch mouseleave
   never fires, so an ungated rule leaves the tapped stratum looking probed
   next to the one that actually is. */
@media (hover: hover) {
  button.asm__band:hover .asm__fill {
    opacity: 1;
  }
}

/* --- naming and the terminal ------------------------------------------------
   The band names its layer and the callout expands it; that shared word is the
   link between the drawing and the text. The terminal is the affordance —
   hollow means available, filled means probed. */
.asm__band-label {
  position: relative;
  z-index: 1;
  padding: var(--space-2) 2.9rem var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  color: var(--color-ink-2);
  transition: color var(--dur-tween) var(--ease-hover);
}

/* The two DEEPEST strata take full ink even at rest. Computed against the
   hatch composite rather than the flat ground: on band 3 the secondary ink
   over the coverage-weighted average (≈rgb(175)) measures 4.6:1 — inside the
   floor but with no margin, and 3.6:1 where a glyph crosses a hatch line. Full
   ink puts them at 7.1:1 and 5.6:1. Their selection is still unmistakable: the
   cut planes, the filled terminal, the leader and the hatch all change. */
.asm__band--2 .asm__band-label,
.asm__band--3 .asm__band-label {
  color: var(--color-ink);
}

.asm__band--on .asm__band-label {
  color: var(--color-ink);
}
@media (hover: hover) {
  button.asm__band:hover .asm__band-label {
    color: var(--color-ink);
  }
}

.asm__node {
  position: absolute;
  z-index: 1;
  right: var(--space-4);
  top: 50%;
  width: 9px;
  height: 9px;
  margin-top: -4.5px;
  border: 1px solid var(--color-ink-2);
  transition:
    background-color var(--dur-tween) var(--ease-hover),
    border-color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  button.asm__band:hover .asm__node {
    border-color: var(--color-ink);
  }
}

/* Filled, but the INK border stays: the ink delineates the terminal against
   every stratum ground (≥6.6:1) while the red says "taken". A red border on a
   red fill would leave the deepest stratum's terminal at 3.07:1 — passing, but
   with the outline doing no work; this way the shape never depends on the
   accent's own contrast. */
.asm__band--on .asm__node {
  background: var(--color-cut);
  border-color: var(--color-ink);
}

/* The cut planes BOUNDING the probed layer — drawn at its two interfaces, so
   they mark the layer without crossing its name. Square end ticks at the left,
   the site's own cut motif. */
.asm__plane {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-top: 2px solid var(--color-cut);
  border-bottom: 2px solid var(--color-cut);
  opacity: 0;
  transition: opacity var(--dur-tween) var(--ease-hover);
  pointer-events: none;
}
.asm__plane::before,
.asm__plane::after {
  content: '';
  position: absolute;
  left: 0;
  width: 8px;
  height: 8px;
  background: var(--color-cut);
}
.asm__plane::before {
  top: 0;
}
.asm__plane::after {
  bottom: 0;
}

.asm__band--on .asm__plane {
  opacity: 1;
}

/* The leader: a hairline in the cut red reaching from the probed stratum across
   the gap to its callout, with a terminal dot at the stratum's edge. One per
   band, centred on its own band — see the note in the script block on why this
   is CSS geometry rather than a measured position. Two columns only, where
   there is a gap to cross. */
.asm__leader {
  position: absolute;
  display: none;
  left: 100%;
  top: 50%;
  margin-top: -0.5px;
  width: var(--asm-gap);
  height: 1px;
  background: var(--color-cut);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-hover);
  pointer-events: none;
}
.asm__leader::before {
  content: '';
  position: absolute;
  left: -3px;
  top: -2.5px;
  width: 6px;
  height: 6px;
  background: var(--color-cut);
}

.asm__band--on .asm__leader {
  opacity: 1;
}

/* --- the callouts ----------------------------------------------------------- */
.asm__panel[hidden] {
  display: none;
}

/* Only genuinely adjacent VISIBLE callouts are spaced — the JS-off case where
   all four stand open. `+` still matches across `display:none` siblings, so a
   plain sibling selector gives the one visible panel a phantom top margin. */
.asm__panel:not([hidden]) + .asm__panel:not([hidden]) {
  margin-top: var(--space-6);
}

/* The swap is a fade-in on the panel that appears — the reference's 150ms
   crossfade. One-shot by construction (the element is created on selection),
   so there is no state to defend; the kill-switch zeroes it under reduced
   motion. */
@media (prefers-reduced-motion: no-preference) {
  .trad--live .asm__panel:not([hidden]) {
    animation: asm-in var(--dur-fast) var(--ease-hover) both;
  }
}

@keyframes asm-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* The callout answers the drawing at display scale — the reference's violent
   scale jump (a 14px mono name in the drawing, the same word at 40px+ here) is
   what makes the pairing read as one gesture rather than two labels. */
.asm__label {
  font-family: var(--font-sans);
  font-size: clamp(1.5rem, 1.05rem + 1.9vw, 2.75rem);
  font-weight: 400;
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--color-ink);
  padding-bottom: var(--space-3);
  border-bottom: var(--divider-width) solid var(--mreza-strong);
}

.asm__detail {
  margin-top: var(--space-4);
  color: var(--color-ink-2);
  font-size: 1.0625rem;
  line-height: 1.5;
  max-width: 38ch;
}

/* --- the bezel: legend, then the dial --------------------------------------- */
.trad__bezel {
  background: var(--color-black);
  border-top: var(--divider-width) solid var(--divider);
}

.trad__legend {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  color: var(--papir-dim); /* 12.5:1 on black */
  font-size: 0.875rem;
  max-width: none;
}

/* The dial strip, at the bottom of the instrument. */
.trad__dial {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: var(--space-4);
  row-gap: var(--space-2);
  padding: var(--space-2) var(--space-4) var(--space-3);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
}

.trad__end {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  text-transform: uppercase;
  color: var(--papir-dim);
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

/* --- the statement band's own asymmetry --------------------------------------
   The argument sits in the left two-thirds and the right third is EMPTY — the
   reference achieves its off-centre composition with voids rather than
   alignment, and that void is also where the beam's first work is visible. */
@media (min-width: 810px) {
  .trad__argument {
    max-width: var(--measure-statement);
    padding-bottom: var(--space-8);
    border-bottom: var(--divider-width) solid var(--mreza-strong);
    margin-bottom: var(--space-8);
  }

  /* Index + preview: the drawing at 5fr against its callout at 7fr, the
     callout CENTRED on the drawing's height so the tall strata read as the
     section's subject rather than as a list with dead air beside it. */
  .asm {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: var(--asm-gap);
    align-items: center;
  }
  .asm__leader {
    display: block;
  }
  /* The callout swaps content on selection; reserving the tallest keeps the
     drawing from shifting as the leader swings. */
  .asm__panels {
    min-height: 12rem;
  }
}

/* --- phone / narrow (system breakpoint) -------------------------------------
   One column, the drawing full width above its callout. The section exceeds
   the viewport here by design: normal flow, no settle, and the sweep still
   fires after the reading beat. The dial re-stacks deterministically: labels
   row, then the full-width control. */
@media (max-width: 809px) {
  .trad__argument {
    padding-bottom: var(--space-6);
    border-bottom: var(--divider-width) solid var(--mreza-strong);
    margin-bottom: var(--space-6);
  }
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
  /* Phones lose the leader, so the link between a stratum and its callout is
     proximity plus this rule, in the same red. */
  .asm__panels {
    border-top: 2px solid var(--color-cut);
    padding-top: var(--space-4);
  }
}
</style>
