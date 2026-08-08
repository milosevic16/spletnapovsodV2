<script setup lang="ts">
/**
 * Tradicija in izkušnje — the section that shows its own source. THE WHOLE
 * SECTION is the screen: no frame, no inset panel, one dark field running the
 * full bleed, split by a vertical red beam. LEFT of the beam the rendered
 * page, RIGHT of it the source a crawler receives (mono). One number drives
 * both clips, the beam and the dial: --scan (0 = all source, 100 = rendered).
 *
 * THIS SECTION IS WHERE THE PAGE TURNS DARK, and it turns dark by FADING: the
 * section's own ground tweens transparent → black over --dur-ground with the
 * measured ease, and its content fades in behind that (the reference's own
 * mechanism — the ground interpolates, the text arrives on an opacity ramp).
 * The page canvas darkens with it (src/lib/ground.ts flips [data-ground] at the
 * same moment), so there is never a paper seam around or under the band.
 *
 * The earlier version framed a white panel inside the section, so the flip
 * darkened only the margins AROUND a box that stayed paper — and its inks
 * rode the page tween, which crosses mid-grey and needed a colour snap to stay
 * legible. Both are gone: the section carries dark-world inks throughout, the
 * ground fade is one-shot (it never reverses under settled dark-on-dark type),
 * and the content is simply absent until the ground is dark.
 *
 * THE SWEEP. The section arrives as raw source and stays there for
 * SWEEP_HOLD_MS of continuous visibility — leaving disarms it — then ONE
 * left→right pass (SWEEP_MS) renders the page and carries the dial's handle to
 * the right end. At any moment the hand owns the control: dragging is direct,
 * nothing else is coupled to it, scroll never moves it.
 *
 * THE STRATA (the interactive layer). The four things under the surface are a
 * SECTION THROUGH THE SITE: strata of unequal thickness in dark materials,
 * each with its own drafting hatch, probed one at a time. Probing brings its
 * hatch to full, draws the CUT PLANES at its two interfaces, fills its
 * terminal and lights the leader across to the callout. Real tablist
 * semantics; with JS off the strata are an inert drawing and all four callouts
 * stand open in flow, so nobody meets a dead control.
 *
 * REST STATE (stylesheet, no JS, reduced motion): the ground is dark, the
 * content is present, --scan falls back to 55 — the composed split where both
 * worlds are legible and the dial is fully operable. A crawler reads the
 * rendered layer as ordinary HTML; the source layer is its aria-hidden mono
 * twin, derived from the same content module so it cannot depict tags we do
 * not ship, and it opens with the guard-checked head emissions (data-fact).
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
 * the reading beat. Leaving the viewport disarms the timer, so the sweep can
 * only happen to someone who actually stopped here.
 *
 * TUNED TWICE, from both ends: 180ms rendered before the raw source had
 * registered at all; 2600ms read as a wait, because the clock starts at
 * SWEEP_VISIBLE — while the visitor is still scrolling the section into place
 * — so a second or more of it is already spent by the time they settle. At
 * 1100ms someone who lands on it gets a beat long enough to see that it is
 * source, and someone who scrolled in finds it already going.
 */
const SWEEP_HOLD_MS = 1100
/** Fires when this share of the screen is visible. Deliberately modest: a tall
 *  screen on a short phone viewport can never reach a high threshold. */
const SWEEP_VISIBLE = 0.35

/** Safety net for the ground fade: if the observer never delivers a callback,
 *  the section must not sit at its pre-entrance state forever. */
const GROUND_NET_MS = 2500

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

/* ONE FACE PER TITLE. The extracted register splices a script face into
 * display words; the owner cancelled that device outright, so titles are set
 * in the sans, whole. Removed here, in the hero, in the tokens and in the
 * font faces — nothing loads Inspiration any more. */

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

/**
 * The arrival: `pre` holds the section at its pre-entrance state — ground
 * transparent, content absent — and dropping it runs the fade. Applied from JS
 * and never from CSS alone, so with JS off (and under reduced motion, which
 * returns before this is ever set) the dark band and all of its content are
 * simply, fully there: the house rule is that a hidden state must always have
 * a reveal path.
 */
const pre = ref(false)

onMounted(() => {
  live.value = true

  // Reduced motion: the settled dark band IS the finished state — no ground
  // fade, no entrance, no sweep; the dial and the strata stay fully operable.
  if (prefersReducedMotion()) return
  // No IntersectionObserver → nothing to arm: never hold the section at a
  // pre-entrance state we cannot leave, and never park --scan on 0 with no way
  // to render. The composed rest stays.
  if (!('IntersectionObserver' in window) || !root.value || !screen.value) return

  pre.value = true // ground transparent, content absent — until it arrives
  scan.value = 0 // and it arrives as raw source; the pass renders it

  // The ground fade fires the moment the section appears from below, so it is
  // settled before any of the content is in the reading zone. Own observer,
  // own threshold (0): the sweep's beat is a different question with a
  // different threshold, and one shared observer would couple them.
  const groundIo = fx.io(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        groundIo.disconnect()
        pre.value = false
      }
    },
    { threshold: 0 },
  )
  groundIo.observe(root.value)
  // Safety net: if the observer never delivers, drop the pre-state anyway —
  // disconnect FIRST so a later scroll cannot re-fire it onto visible content.
  fx.setTimeout(() => {
    groundIo.disconnect()
    pre.value = false
  }, GROUND_NET_MS)

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
    class="trad press"
    :class="{ 'trad--live': live, 'trad--edge': edge, 'trad--pre': pre }"
    :style="live ? { '--scan': String(scan) } : undefined"
  >
    <!-- THE SOURCE — the whole section as a crawler receives it. Absolute over
         the entire band (padding included), clipped to the RIGHT of the beam,
         complementary to the rendered layer by construction: the two read the
         same --scan, so the seam cannot disagree with itself. Decorative for
         assistive tech; the rendered layer carries every string. -->
    <div ref="screen" class="trad__source" aria-hidden="true">
      <div class="container trad__source-in">
        <code
          v-for="(line, n) in sourceLines"
          :key="n"
          class="emisija trad__line"
          :data-fact="line.id || undefined"
          >{{ line.text }}</code
        >
      </div>
    </div>

    <!-- THE BEAM — the seam itself, spanning the section's full height. -->
    <span class="trad__beam" aria-hidden="true"></span>

    <!-- THE RENDERED PAGE — in flow, so it defines the section's height and is
         the complete, real content for crawlers and JS-off readers. -->
    <div class="container trad__world">
      <header class="trad__head">
        <p class="kicker kicker--on-dark">{{ invisible.kicker }}</p>
        <h2 class="trad__title">{{ invisible.title }}</h2>
      </header>

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
    </div>

    <!-- THE CHROME — the legend and the dial. Above BOTH layers and never
         clipped, so the control is operable whichever side of the beam it
         happens to sit over. It is the instrument's own furniture, not part of
         the page being rendered. -->
    <div class="container trad__chrome">
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
  </section>
</template>

<style scoped>
/* THE SECTION IS THE SCREEN — full bleed, no frame, no inset panel. Its own
   ground is the dark world, and it ARRIVES BY FADING: transparent → black over
   the measured ground tween. `.trad--pre` is applied from JS on mount and
   dropped when the section appears, so with JS off (and under reduced motion,
   which never sets it) the band is simply, fully dark.

   The pre-state kills its own transitions, so ENTERING it snaps (no visible
   reverse fade on mount) while LEAVING it tweens — the whole arrival is two
   classes and two plain transitions, nothing per-frame. */
.trad {
  position: relative;
  isolation: isolate;
  /* Nothing may escape the band: the source layer covers the full bleed and
     the beam runs the full height. */
  overflow: hidden;
  padding-block: var(--space-16);
  background-color: var(--color-bronze-deep);
  transition: background-color var(--dur-ground) var(--ease-ground);
  color: var(--color-paper); /* 18.8:1 on the settled ground */
}

.trad--pre {
  background: transparent;
  transition: none;
}

/* The content arrives BEHIND the ground, on an opacity ramp — the reference's
   own mechanism (its text crossfades by alpha while the ground interpolates).
   The delay is what keeps it honest: by the time any of this is visible the
   ground is already most of the way to black, so paper-coloured type is never
   shown on a paper-coloured ground. */
.trad__world,
.trad__source,
.trad__beam,
.trad__chrome {
  opacity: 1;
  transition: opacity 520ms var(--ease-spring) 380ms;
}

.trad--pre .trad__world,
.trad--pre .trad__source,
.trad--pre .trad__beam,
.trad--pre .trad__chrome {
  opacity: 0;
  transition: none;
}

/* The settle: a native proximity snap centres the band when the scroll comes
   to rest nearby — never a trap, scrolling straight through is free
   (scroll-snap-type on html lives in base.css, gated to wide viewports and
   no-preference; this is the only snap-align on the page). Where the band is
   taller than the viewport the spec relaxes the snap by itself. */
@media (min-width: 1200px) and (prefers-reduced-motion: no-preference) {
  .trad {
    scroll-snap-align: center;
  }
}

.trad__head {
  margin-bottom: var(--space-10);
}

/* No colour snap, no flip: the section carries its own dark world, so the
   title is paper throughout and simply is not there until the ground is. */
.trad__title {
  margin-top: var(--space-4);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--color-paper);
  overflow-wrap: anywhere;
}

/* --- the two layers --------------------------------------------------------
   The rendered page is in flow (it defines the height and is the real content);
   the source is absolute over the WHOLE band, padding included. Their clips are
   complementary reads of one --scan, so the seam can never disagree with
   itself. `var(--scan, 55)` PAIRS with REST in the script block. */
.trad__world {
  position: relative;
  z-index: 2;
  clip-path: inset(0 calc((100 - var(--scan, 55)) * 1%) 0 0);
}

.trad__source {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* One step off the section's own ground: the two halves read as different
     material even where the beam has passed off-screen. Paper-dim mono on it
     measures 11.9:1. */
  background: #14171a;
  clip-path: inset(0 0 0 calc(var(--scan, 55) * 1%));
  overflow: hidden;
}

/* Its own vertical frame, matching the band's, so the first source line sits
   on the same baseline as the rendered kicker. */
.trad__source-in {
  padding-block: var(--space-16);
}

.trad__line {
  display: block;
  color: var(--papir-dim); /* 11.9:1 on the source ground */
  font-size: 0.8125rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

/* The beam: the cut's on-dark voice, 2px, standing on the seam and running the
   band's full height — 6.4:1 on both grounds. No glow: depth is drawn. */
.trad__beam {
  position: absolute;
  z-index: 3;
  top: 0;
  bottom: 0;
  left: calc(var(--scan, 55) * 1%);
  width: 2px;
  margin-left: -1px;
  background: var(--color-cut-dark);
}

/* No split, no beam (fully source / fully rendered). Its own transition, so
   the edge fade never fights the arrival ramp above. */
.trad--edge .trad__beam {
  opacity: 0;
  transition: opacity 240ms var(--ease-spring);
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
  /* A miniature of the statement role — the full-size statement (3rem) would
     make the band taller than any viewport. */
  font-size: clamp(1.375rem, 1.05rem + 1.3vw, 2.25rem);
  font-weight: var(--type-statement-weight);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
  /* The system's statement runs lh 0.9; caps with carons need a shade more
     air to keep ascenders clear of the line above. */
  line-height: 1.02;
  color: var(--color-paper); /* 18.8:1 */
  max-width: 26ch;
}

.trad__intro {
  margin-top: var(--space-6);
  color: var(--papir-dim); /* 12.5:1 on the band's ground */
  max-width: 54ch;
}

.trad__outro {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
  color: var(--color-paper);
  font-weight: 500;
  max-width: 54ch;
}

/* --- the strata (the interactive layer) -------------------------------------
   A section through the build-up, drawn in the DARK world now that the band
   is dark throughout: grounds step darker with depth, hatches are drawn in
   paper, the cut is the accent's on-dark voice. Unequal thicknesses are the
   point — a membrane is thin, a substrate is thick; equal slabs would read as
   a bar chart.

   Probing is signalled the way a section drawing signals it — and never by
   tone alone: the CUT PLANES appear at the layer's two interfaces with square
   end ticks, the terminal fills, the hatch comes up to full, the label
   brightens, and the leader lights across to the callout. The band's own
   GROUND never changes, which is what keeps the label's contrast constant
   through every state (a ground tween under 14px type crosses mid-tone and
   drops every possible ink under 4.5:1 — measured). */
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
  border: var(--divider-width) solid var(--crta-na-temnem);
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
  background: var(--crta-na-temnem);
  pointer-events: none;
}
.asm__dim::before,
.asm__dim::after {
  content: '';
  position: absolute;
  left: -3px;
  width: 7px;
  height: 1px;
  background: var(--crta-na-temnem);
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
  border-bottom: var(--divider-width) solid var(--crta-na-temnem);
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
  outline: 2px solid var(--color-cut-dark);
  outline-offset: -4px;
}

/* The hatch: half strength at rest, full when probed. Opacity only — the
   band's ground is constant, so the label's worst-case composite is the
   hatch LINE over that ground, and every alpha below is chosen against the
   4.5:1 floor for the 14px label (computed per band; on dark the hatch
   LIGHTENS the ground, so the brightest hatches take the lowest alphas).
   SCALE contrast, not just pitch: a 3px lamination against a 22px poché is
   what makes two fills read as different MATERIALS rather than the same
   material drawn twice. */
.asm__fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity var(--dur-tween) var(--ease-hover);
}

/* Structure — 45° section hatch. */
.asm__band--0 {
  background: var(--grafit-inset); /* #24282c */
}
.asm__band--0 .asm__fill {
  background: repeating-linear-gradient(
    45deg,
    transparent 0 10px,
    rgb(245 242 235 / 0.3) 10px 11px
  );
}

/* Membrane — a thin laminated sheet, ruled very fine. */
.asm__band--1 {
  background: #1e2226;
}
.asm__band--1 .asm__fill {
  background: repeating-linear-gradient(0deg, transparent 0 2px, rgb(245 242 235 / 0.26) 2px 3px);
}

/* Granular fill — stipple, the drafting convention for loose material. */
.asm__band--2 {
  background: #191d21;
}
.asm__band--2 .asm__fill {
  background-image: radial-gradient(rgb(245 242 235 / 0.42) 1px, transparent 1.3px);
  background-size: 8px 8px;
}

/* Substrate — coarse cross-hatched poché, the mass everything sits on: the
   deepest ground of the four.

   ONE rule block for this selector, deliberately: the ground line used to live
   in its own `.asm__band--3 { border-top }` block, and the CSS minifier merges
   duplicate selectors and can drop declarations while doing it. */
.asm__band--3 {
  /* A literal, not --zemlja: the adapter maps that to pure black, which is the
     SECTION's own ground — the deepest stratum would have dissolved into the
     band around it. This keeps the four materials an even ramp that stays
     above the section ground: 36,40,44 → 30,34,38 → 25,29,33 → 20,23,26. */
  background: #14171a;
  /* The interface onto the substrate is the drawing's ground line — heavier,
     the way a section marks the boundary you build on. */
  border-top: 2px solid var(--papir-dim);
}
.asm__band--3 .asm__fill {
  background:
    repeating-linear-gradient(45deg, transparent 0 21px, rgb(245 242 235 / 0.22) 21px 23px),
    repeating-linear-gradient(-45deg, transparent 0 21px, rgb(245 242 235 / 0.22) 21px 23px);
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
  color: var(--papir-dim); /* ≥9.3:1 on every stratum's hatch composite */
  transition: color var(--dur-tween) var(--ease-hover);
}

.asm__band--on .asm__band-label {
  color: var(--color-paper);
}
@media (hover: hover) {
  button.asm__band:hover .asm__band-label {
    color: var(--color-paper);
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
  border: 1px solid var(--papir-dim);
  transition:
    background-color var(--dur-tween) var(--ease-hover),
    border-color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  button.asm__band:hover .asm__node {
    border-color: var(--color-paper);
  }
}

/* Filled: on dark the accent's own voice clears the 3:1 UI floor on every
   stratum ground (≥4.3:1 measured), so the terminal needs no borrowed
   outline — border and fill are both the cut. */
.asm__band--on .asm__node {
  background: var(--color-cut-dark);
  border-color: var(--color-cut-dark);
}

/* The cut planes BOUNDING the probed layer — drawn at its two interfaces, so
   they mark the layer without crossing its name. Square end ticks at the left,
   the site's own cut motif. */
.asm__plane {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-top: 2px solid var(--color-cut-dark);
  border-bottom: 2px solid var(--color-cut-dark);
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
  background: var(--color-cut-dark);
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
  background: var(--color-cut-dark);
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
  background: var(--color-cut-dark);
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
  color: var(--color-paper);
  padding-bottom: var(--space-3);
  border-bottom: var(--divider-width) solid var(--crta-na-temnem);
}

.asm__detail {
  margin-top: var(--space-4);
  color: var(--papir-dim);
  font-size: 1.0625rem;
  line-height: 1.5;
  max-width: 38ch;
}

/* --- the chrome: legend, then the dial ---------------------------------------
   Above BOTH layers and never clipped — the control has to work whichever side
   of the beam it is standing over, so it reads on the section's own ground
   rather than on a plate of its own. */
.trad__chrome {
  position: relative;
  z-index: 4;
  margin-top: var(--space-10);
}

.trad__legend {
  margin: 0;
  padding-bottom: var(--space-3);
  border-bottom: var(--divider-width) solid var(--crta-na-temnem);
  color: var(--papir-dim); /* 12.5:1 */
  font-size: 0.875rem;
  max-width: 62ch;
}

/* The dial, at the bottom of the section. */
.trad__dial {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: var(--space-4);
  row-gap: var(--space-2);
  padding-top: var(--space-2);
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
  /* The constant divider grey: 7.8:1 on the band's ground, so the track itself
     clears the 3:1 UI floor rather than leaning on the thumb to be findable. */
  background: var(--divider);
}
.trad__grip::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -9px;
  border: 0;
  border-radius: 0;
  background: var(--color-cut-dark); /* 6.42:1 on the band's ground */
}
.trad__grip::-moz-range-track {
  height: 2px;
  /* The constant divider grey: 7.8:1 on the band's ground, so the track itself
     clears the 3:1 UI floor rather than leaning on the thumb to be findable. */
  background: var(--divider);
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
    border-bottom: var(--divider-width) solid var(--crta-na-temnem);
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
    border-bottom: var(--divider-width) solid var(--crta-na-temnem);
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
    border-top: 2px solid var(--color-cut-dark);
    padding-top: var(--space-4);
  }
}
</style>
