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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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

/**
 * Aim the leader at the probed stratum's MEASURED centre. Measured, not
 * derived from the index: the strata have different thicknesses, so any
 * (n + 0.5) / count arithmetic points at the wrong place on most of them.
 */
function placeLeader() {
  const stack = root.value?.querySelector<HTMLElement>('.asm__stack')
  const band = bandAt(probe.value)
  if (!stack || !band) return
  stack.style.setProperty('--lead-y', `${band.offsetTop + band.offsetHeight / 2}px`)
}

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
  nextTick(placeLeader)

  // The leader's target moves with any relayout (the strata are sized in fr)
  // and with the font swap. TWO independent paths on purpose: a missed
  // re-aim is silent and permanent, and a ResizeObserver notification can go
  // undelivered in a throttled or non-compositing context (measured here: the
  // leader kept a 12px stale offset across a width change until the plain
  // resize listener was added).
  if ('ResizeObserver' in window && root.value) {
    const stack = root.value.querySelector('.asm__stack')
    if (stack) fx.ro(placeLeader).observe(stack)
  }
  fx.on(window, 'resize', placeLeader, { passive: true })
  document.fonts?.ready.then(placeLeader)
  // A selection changes which callout is mounted, which can change the stack's
  // height — re-aim explicitly rather than leaning on observing our own effect.
  watch(probe, () => nextTick(placeLeader))

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
            <blockquote class="trad__quote">
              <p>{{ invisible.quote }}</p>
            </blockquote>
            <p class="trad__intro">{{ invisible.intro }}</p>

            <!-- THE INTERACTIVE LAYER: a section through the site's own
                 build-up. Four strata of unequal thickness, stepping darker
                 with depth; probing one fills it with ink and swings the
                 leader across to its callout. The article ids are real, so
                 the source layer's <article id="…"> depicts a tag we ship. -->
            <div class="asm">
              <div
                class="asm__stack"
                :role="live ? 'tablist' : undefined"
                :aria-label="live ? invisible.feedback.layersLabel : undefined"
                aria-orientation="vertical"
                @keydown="live && onProbeKeys($event)"
              >
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
                  <span class="asm__index" aria-hidden="true">00{{ n + 1 }}</span>
                  <span class="asm__band-label">{{ item.label }}</span>
                </component>

                <!-- Swung to the probed stratum's measured centre. -->
                <span v-if="live" class="asm__leader" aria-hidden="true"></span>
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

.trad__outro {
  margin-top: var(--space-8);
  color: var(--color-ink);
  font-weight: 500;
  max-width: 50ch;
}

/* --- the strata (the interactive layer) -------------------------------------
   A section through the build-up. Unequal thicknesses are the point: a
   membrane is thin, a substrate is thick — equal slabs would read as a bar
   chart. The grounds step darker with depth (paper family), the probed one
   fills with ink, which is a documented job of that token ("selected fills").
   Depth is DRAWN — steps, rules, a leader — never a shadow, and no hatches:
   the page already carries one texture (the grain), and a second would fight
   it. Every ink pairing here is measured in the step-1 verification. */
.asm {
  --asm-gap: clamp(1.5rem, 4vw, 3rem);
  margin-top: var(--space-8);
  display: grid;
  gap: var(--space-6);
}

.asm__stack {
  position: relative;
  display: grid;
  grid-template-rows: 1.4fr 0.72fr 0.95fr 1.95fr;
  min-height: clamp(13rem, 30vw, 16rem);
  border: var(--divider-width) solid var(--mreza-strong);
  /* The leader reaches out of this box. */
  overflow: visible;
}

.asm__band {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  margin: 0;
  border: 0;
  border-bottom: var(--divider-width) solid var(--mreza-strong);
  font: inherit;
  text-align: left;
  /* The fill SNAPS — deliberately no tween, and this is a measured decision,
     not a style preference. Probing inverts a ground (paper→ink) UNDER text
     that inverts with it (ink→paper); tweened, the two cross and the label's
     contrast collapses to 1.0:1 at the midpoint (measured), i.e. 200ms of
     invisible type on every hover. Snapping the text at the crossover does not
     save it either: the ground passes through mid-grey, where BOTH inks sit
     near 2.9:1 — under the 4.5 floor for 14px type. A ground tween is simply
     incompatible with small text on it. The reference snaps its own state
     colours for the same reason (its rule colour is excluded from the
     transition), so this is in character as well as correct. */
}

.asm__band:last-of-type {
  border-bottom: 0;
}

button.asm__band {
  cursor: pointer;
}

/* The four materials, stepping darker with depth. Ink on each: 13.9 / 13.1 /
   10.7 / 7.1 — the deepest is the darkest ground a label sits on. */
.asm__band--0 {
  background: var(--color-paper);
}
.asm__band--1 {
  background: var(--color-paper-2);
}
.asm__band--2 {
  background: var(--mreza);
}
.asm__band--3 {
  background: var(--mreza-strong);
}

/* The interface onto the substrate is the drawing's ground line — heavier, the
   way a section marks the boundary you build on. */
.asm__band--3 {
  border-top: 2px solid var(--color-ink);
}

/* Probed: the stratum fills with ink and its type inverts to paper (13.9:1). */
.asm__band--on {
  background: var(--color-ink);
  color: var(--color-paper);
}

/* Hover is the same move at the reference's 200ms tween, so pointer and
   keyboard read identically — GATED on a hovering pointer: on touch,
   mouseleave never fires, so an ungated rule leaves the tapped stratum
   looking filled next to the one that is actually probed. */
@media (hover: hover) {
  button.asm__band:hover {
    background: var(--color-ink);
    color: var(--color-paper);
  }
}

.asm__band:focus-visible {
  outline: 2px solid var(--color-cut);
  outline-offset: -4px;
}

.asm__index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--color-ink-2);
  flex: 0 0 auto;
}

/* The deepest stratum is the darkest ground: the secondary ink measures
   4.45:1 there — a hair under the 4.5 floor for 13/14px type — so the index
   takes the full ink (6.87:1). The label/index hierarchy still reads, carried
   by weight and case rather than by tone. */
.asm__band--3 .asm__index {
  color: var(--color-ink);
}

.asm__band-label {
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  color: var(--color-ink);
}

/* Inverted together, so the whole row reads as one filled object. */
.asm__band--on .asm__index,
.asm__band--on .asm__band-label {
  color: var(--color-paper);
}
@media (hover: hover) {
  button.asm__band:hover .asm__index,
  button.asm__band:hover .asm__band-label {
    color: var(--color-paper);
  }
}

/* The leader: a hairline in the cut red from the probed stratum across to its
   callout, with a terminal dot at the stack's edge. Desktop only — where
   there is a gap to cross. */
.asm__leader {
  position: absolute;
  display: none;
  left: 100%;
  width: var(--asm-gap);
  height: 1px;
  top: var(--lead-y, 50%);
  background: var(--color-cut);
  transition: top 300ms var(--ease-spring);
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

.asm__label {
  font-family: var(--font-sans);
  font-size: clamp(1.25rem, 1rem + 1.1vw, 1.75rem);
  font-weight: 400;
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--color-ink);
  padding-bottom: var(--space-2);
  border-bottom: var(--divider-width) solid var(--mreza-strong);
}

.asm__detail {
  margin-top: var(--space-3);
  color: var(--color-ink-2);
  font-size: 0.9375rem;
  line-height: 1.5;
  max-width: 44ch;
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

/* --- desktop: the page under the beam is a real desktop composition ---------
   The system's dominant split: statement + intro on the left, the strata and
   their callout on the right, the closing line across both. This is also what
   keeps the whole instrument inside a ~900px viewport for the settle. */
@media (min-width: 1200px) {
  .trad__made {
    display: grid;
    grid-template-columns: minmax(0, 30fr) minmax(0, 68fr);
    /* Explicit areas — auto-placement would stagger the two columns. */
    grid-template-areas:
      'quote asm'
      'intro asm'
      'outro outro';
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
  .trad__made > .asm {
    grid-area: asm;
    margin-top: 0;
    /* The strata are a fixed-width instrument beside a fluid callout — the
       reference's own habit of holding decorative widths in pixels. */
    grid-template-columns: 13rem minmax(0, 1fr);
    column-gap: var(--asm-gap);
    align-items: start;
  }
  .trad__made > .trad__outro {
    grid-area: outro;
  }
  .asm__leader {
    display: block;
  }
  /* The callout swaps content on selection; reserving the tallest keeps the
     strata from jumping as the leader swings. */
  .asm__panels {
    min-height: 10rem;
  }
}

/* --- phone (system breakpoint) ----------------------------------------------
   The section exceeds the viewport here by design: normal flow, no settle,
   the sweep still fires after the reading beat. The dial re-stacks
   deterministically: labels row, then the full-width control. */
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
  /* Phones lose the leader, so the link between a stratum and its callout is
     proximity plus this rule, in the same red. */
  .asm__panels {
    border-top: 2px solid var(--color-cut);
    padding-top: var(--space-4);
  }
}
</style>
