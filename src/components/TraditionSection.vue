<script setup lang="ts">
/**
 * Spletna pod površino — the section that shows its own source. THE WHOLE
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
 * THE STRATA (the interactive layer). The four things under the surface are an
 * EXPLODED ASSEMBLY: four sheets lying on a shallow axonometric, overlapping
 * like drawings on a table, each in its own hatch. Probing SLIDES one clear of
 * the stack and brings it forward — position is the state, which is why the
 * cut planes, the leader and the dimension rule that used to carry it are
 * gone: three redundant devices for something the geometry now says by itself.
 * Real tablist semantics; with JS off the sheets are an inert drawing at rest
 * and all four callouts stand open in flow, so nobody meets a dead control.
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

/* The strata's hatches are no longer drawn here. All four are raster textures
 * masked onto their band in the styles, generated by
 * scripts/build-band-textures.mjs — so there is no pattern table, no SVG defs
 * block, and nothing in this file to keep in step with the drawing. */

/* NOTHING HERE IS MEASURED. The slide, the rest ladder and the stagger are all
 * CSS geometry keyed off the stratum's index, so they are exact at every size
 * by construction. An earlier version aimed a leader from JS at the probed
 * band's measured centre and it went stale twice (12px and 15px offsets that
 * survived width changes, because a re-measure depends on a ResizeObserver
 * notification or a font-load promise actually arriving). A geometry that
 * cannot be stale beats a measurement with two rescue paths. */

/**
 * Bring the drawing and its callout into view together.
 *
 * On the stacked layout the callout sits BELOW the sheets, so choosing one can
 * select something whose description is off the bottom of the screen — the
 * reader taps and nothing appears to happen. This scrolls the pair into view,
 * and ONLY when it needs to:
 *
 *  · never when the two stand side by side (read from geometry, not a media
 *    query, so the two can never disagree),
 *  · never when both are already fully visible — a reader who is already
 *    looking at them should not have the page moved under them,
 *  · centred when the pair fits the viewport, otherwise its top parked just
 *    under the fixed masthead.
 *
 * Behaviour is stated explicitly on every call (house rule); reduced motion
 * gets the instant jump rather than a glide.
 */
function revealPair() {
  const host = root.value
  if (!host) return
  const stack = host.querySelector<HTMLElement>('.asm__stack')
  const panels = host.querySelector<HTMLElement>('.asm__panels')
  if (!stack || !panels) return

  const s = stack.getBoundingClientRect()
  const p = panels.getBoundingClientRect()
  // Side by side: the callout cannot be off-screen because of the selection.
  if (p.top < s.bottom - 1) return

  const top = Math.min(s.top, p.top)
  const bottom = Math.max(s.bottom, p.bottom)
  const vh = window.innerHeight
  const navH =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0
  const margin = navH + 12
  if (top >= margin && bottom <= vh) return // already both in view

  const pairH = bottom - top
  const delta = pairH <= vh - margin - 12 ? top - (margin + (vh - margin - pairH) / 2) : top - margin
  window.scrollBy({
    top: delta,
    behavior: (prefersReducedMotion() ? 'instant' : 'smooth') as ScrollBehavior,
  })
}

/** Choosing a stratum: set it, then make sure its callout is actually on
 *  screen. nextTick so the panel that just became visible is the one measured. */
function choose(n: number) {
  probe.value = n
  nextTick(revealPair)
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
  // tab, where the focus must still land. The reveal runs after the focus, so
  // it measures what focus's own scroll left behind — arrowing through the
  // strata has the same reach as tapping through them.
  nextTick(() => {
    bandAt(next)?.focus()
    revealPair()
  })
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
              <!-- The four hatches are RASTER now, one per stratum, each masked
                   onto its band in the styles (scripts/build-band-textures.mjs).
                   Each sheet is a different MATERIAL and its hatch says which: a
                   web that finds you, a field of form rules with a caret in it,
                   a sampling lattice, and a near-solid plate. Scale contrast is
                   deliberate — a 4px screen against a 40px form field is what
                   makes two fills read as two materials rather than one drawn
                   twice, and each crop is cut to land at that size on the band
                   rather than at whatever the source happened to be. -->
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
                  @click="live && choose(n)"
                >
                  <!-- The material's own hatch: paper ink painted through this
                       stratum's texture, which masks it (see the styles).
                       Half-strength at rest, full when probed — the drawing's
                       way of saying "this is the layer we are looking at". -->
                  <span class="asm__fill" aria-hidden="true"></span>
                  <!-- The name sits on a tab of the sheet's OWN ground, not on
                       the hatch: see the note on .asm__band-label. -->
                  <span class="asm__band-label">{{ item.label }}</span>
                  <!-- Leader terminal: hollow reads as available, filled as
                       taken — the drawing's own way of saying "press me". -->
                  <span class="asm__node" aria-hidden="true"></span>
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
  /* The band runs one step brighter than the closing band, and the page
     canvas is set to this same value (tokens.css) so the two never show a
     seam. Under a press-screen highlight dot — the worst case on a screened
     ground — paper 7.40:1, secondary 4.94:1, bone 6.31:1. That secondary
     figure is what caps it: the next step up (#52402c) falls to 4.37. */
  background-color: var(--color-bronze);
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
  /* PAPER, because the owner asked for BLACK code letters and black needs a
     light ground (on the old bronze it measured 1.37:1). The halves no longer
     differ by two brightnesses of one surface — the failing the previous
     values were tuned against — but by being two SURFACES: paper source
     against bronze band, 10.17:1 apart. Being an opaque child it covers the
     press screen, so it is measured flat. */
  background: var(--color-paper);
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
  /* The machine's own voice — see --color-code. Black on the paper source
     half: 13.88:1. */
  color: var(--color-code);
  font-size: 0.8125rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

/* The beam: 2px, standing on the seam and running the band's full height. Its
   own cut (--color-cut-seam) because the halves it divides are now a PAPER
   source and a bronze band, and it must clear the 3:1 UI floor against both —
   3.19:1 either side, where the on-dark cut managed only 2.93 on paper. No
   glow: depth is drawn. */
.trad__beam {
  position: absolute;
  z-index: 3;
  top: 0;
  bottom: 0;
  left: calc(var(--scan, 55) * 1%);
  width: 2px;
  margin-left: -1px;
  background: var(--color-cut-seam);
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
  --asm-gap: clamp(1.5rem, 4vw, 3.5rem);
  display: grid;
  gap: var(--space-8);
}

/* THE EXPLODED ASSEMBLY. The four sheets no longer stack as flush rows: they
   lie on a shallow axonometric, overlapping like drawings on a table, and the
   probed one SLIDES CLEAR of the stack and comes forward. That slide is the
   whole state signal — position, not tone — which is why the cut planes, the
   leader and the dimension rule that used to carry it are gone: three
   redundant devices for something the geometry now says by itself. */
/* The hatch definitions are a DEFINITION, not a cell. A 0×0 svg is still an
   in-flow grid item: left in the flow it took the first column, pushed the
   drawing into the second and wrapped the callout onto a row of its own —
   which is exactly what the layout looked like. Out of flow it defines its
   patterns and occupies nothing. */
.asm__stack {
  position: relative;
  height: clamp(20rem, 36vw, 27rem);
}

/* Sheets are absolute and equal: the stagger, not the thickness, is what
   separates them now. The slide rides TRANSFORM rather than `left` — same
   geometry, but a compositor property instead of a per-frame layout (house
   rule), which matters with four of them moving at once.

   TRANSLATE FIRST, SKEW SECOND. Transforms apply right-to-left, so this skews
   the sheet in its own space and then moves it horizontally; the other order
   feeds x into the skew's y and the sheets would drift vertically as they
   slide. */
.asm__band {
  position: absolute;
  left: 0;
  width: 82%;
  height: 29%;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  border: var(--divider-width) solid var(--crta-na-temnem);
  background: var(--band-ground);
  font: inherit;
  color: inherit;
  text-align: left;
  overflow: hidden;
  transform: translateX(var(--rest)) skewY(-7deg);
  transition:
    transform 420ms var(--ease-out),
    border-color var(--dur-tween) var(--ease-hover);
}

/* The rest ladder. The design states it in stack percentages (0/3/6/9, out at
   14); a translate percentage resolves against the ELEMENT, which is 82% of
   the stack, so each is divided by 0.82 to land on the same pixels. */
.asm__band--0 {
  --rest: 0%;
  top: 0;
  z-index: 1;
}
.asm__band--1 {
  --rest: 3.659%;
  top: 23.5%;
  z-index: 2;
}
.asm__band--2 {
  --rest: 7.317%;
  top: 47%;
  z-index: 3;
}
.asm__band--3 {
  --rest: 10.976%;
  top: 70.5%;
  z-index: 4;
}

/* Probed: clear of the stack and in front of it. */
.asm__band--on {
  transform: translateX(17.073%) skewY(-7deg);
  z-index: 9;
  border-color: var(--color-cut-dark);
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
/* THE FOUR HATCHES. Each stratum paints ONE flat sheet of the page's paper ink
   and lets its own texture mask it — the textures ship grayscale and carry no
   colour of their own, which is what keeps these bands' colour in the tokens.
   The ground under them has been re-picked twice; baked-in images would have
   had to be regenerated both times.

   `cover`, not `stretch`: each file is cut to 2.30:1 against a band measured at
   2.49:1 on desktop and 2.19:1 on a phone, so cover trims a sliver at either
   end rather than distorting the motif into ellipses.

   THE ALPHAS ARE A LADDER, and they are set from measurement rather than taste.
   A mask's mean luminance is how much ink its band actually carries, and the
   four means are 10.8, 25.5, 15.1 and 37.4 of 255 — not a sequence. Multiplied
   by the alphas below the effective coverage runs 3.6%, 4.5%, 5.0%, 13.2%,
   which is the light-to-heavy descent the drawing needs: surface, field,
   lattice, plate. Change a texture and re-read its mean before picking an alpha,
   or the stack stops reading as strata and becomes four unrelated swatches. */
.asm__fill {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity var(--dur-tween) var(--ease-hover);
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: cover;
  mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

/* VIDNOST — a node-and-link web. What finds you is a graph and crawlers walk
   links, so the texture states the claim rather than decorating it. Held at the
   owner's call at full saturation, which it needs: only a ninth of its frame
   carries any ink at all. */
.asm__band--0 .asm__fill {
  background-color: rgba(245, 242, 235, 0.85);
  -webkit-mask-image: url('/img/tex/mesh-v2.webp');
  mask-image: url('/img/tex/mesh-v2.webp');
}

/* OBRAZCI — the field itself, ruled, with a caret in it. */
.asm__band--1 .asm__fill {
  background-color: rgba(245, 242, 235, 0.45);
  -webkit-mask-image: url('/img/tex/forms-v1.webp');
  mask-image: url('/img/tex/forms-v1.webp');
}

/* PIŠKOTKI — a sampling lattice: discrete points taken off a continuous person,
   which is what the law is about. */
.asm__band--2 .asm__fill {
  background-color: rgba(245, 242, 235, 0.85);
  -webkit-mask-image: url('/img/tex/privacy-v1.webp');
  mask-image: url('/img/tex/privacy-v1.webp');
}

/* DOMENA — the near-solid plate the rest is published onto, and the densest of
   the four by design: it is the ground the other three stand on. */
.asm__band--3 .asm__fill {
  background-color: rgba(245, 242, 235, 0.9);
  -webkit-mask-image: url('/img/tex/domain-v1.webp');
  mask-image: url('/img/tex/domain-v1.webp');
}

/* The four grounds. `--band-ground` rather than `background` directly: the
   label's tab reads the same value, so a name can never end up on a ground
   the sheet does not actually have. */
.asm__band--0 {
  --band-ground: #5f4a33; /* the surface layer — the lightest step of the ramp */
}

.asm__band--1 {
  --band-ground: #55402b;
}

.asm__band--2 {
  --band-ground: #4b3724;
}

/* Substrate — the mass everything else is published onto, and the deepest
   ground of the four. THE RAMP DESCENDS THROUGH THE BAND: measured, 0 → 3,
   95,74,51 → 85,64,43 → 75,55,36 → 64,46,32. Each sheet is opaque, so it
   covers the press screen and is measured flat — secondary text runs 4.99:1
   on the lightest and 7.70:1 on this one. */
.asm__band--3 {
  --band-ground: var(--color-bronze-deep);
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
/* THE NAME SITS ON A TAB OF THE SHEET'S OWN GROUND, never on the hatch. The
   hatches run at the densities the drawing wants (a 0.6-alpha halftone dot,
   a 0.55 caret), and a 13px glyph stroke landing on one of those measures
   1.3:1 against the resting label — a quarter of the floor. Backing the name
   with the sheet's own ground is what a real section drawing does with a
   label over hatching, and it puts the contrast back on the ground itself:
   4.99:1 on the lightest sheet, 7.70:1 on the deepest, paper higher still.
   The inline-block box also keeps the tab off the terminal at the right. */
.asm__band-label {
  position: relative;
  z-index: 1;
  margin-left: var(--space-4);
  margin-right: 2.9rem;
  padding: 0.35em 0.6em;
  background: var(--band-ground);
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  color: var(--papir-dim);
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

  /* An even split now, not 5/7: the exploded stack needs the room the sliding
     sheet swings into, and the callout no longer has a leader reaching to it,
     so it stands as an equal half rather than as the drawing's annotation. */
  .asm {
    grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
    column-gap: var(--asm-gap);
    align-items: center;
  }
  /* The callout swaps content on selection; reserving the tallest keeps the
     drawing from shifting as the selection moves. */
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
