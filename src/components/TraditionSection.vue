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
const chromeEl = ref<HTMLElement | null>(null)

/**
 * THE CODE COLUMN PARTS AROUND THE DIAL. The source lines flow from the
 * section's top on their own rhythm, so whichever line happens to land in the
 * dial's band used to run straight under the control (measured: three lines
 * under it at 1440). The column now opens a gap exactly there — the line that
 * would first intrude is pushed below the band, plus clearance both sides —
 * so the slider rides on clean paper.
 *
 * TWO MOVES, NOT ONE, and the second is what makes the void CONSTANT. Pushing
 * the intruding line below the band leaves whatever space happened to remain
 * above it — up to a whole wrapped line of it, measured at 115px on a phone,
 * which read as a hole rather than as a parting. So the column is first
 * SHIFTED DOWN by the slack, landing the previous line's bottom exactly one
 * clearance above the band; the pushed line then needs a margin of exactly
 * band + 2 × clearance. Same number at every width, both sides equal, and the
 * shift only ever adds space at the column's top, where there is padding to
 * absorb it — never at the bottom, which is clipped anyway.
 *
 * MEASURED, NOT DERIVED, and re-measured on resize: the band's position
 * depends on how the title wraps, and the lines' own heights are not uniform
 * (overflow-wrap breaks the long ones on phones), so an arithmetic index over
 * one line-height would drift. The routine resets both moves, lets the column
 * relayout, reads the real boxes, and picks the first line whose BOTTOM would
 * enter the clearance — bottom, not top, precisely because of those wrapped
 * lines.
 *
 * Safe by construction: the source layer is absolute and aria-hidden, so the
 * shift moves no document flow (zero CLS) and changes nothing assistive; the
 * guards compare the fact nodes' text, which an inline margin does not touch.
 * It runs under reduced motion too — this is layout, not motion.
 */
const gapIndex = ref(-1)
const gapPx = ref(0)
/** How far the whole column drops so the parting lands square on the band. */
const gapShift = ref(0)
/** Clearance above and below the dial's band, px — the void is band + 2×this. */
const GAP_CLEARANCE = 16

function placeGap() {
  const host = root.value
  const dial = chromeEl.value
  if (!host || !dial) return
  gapIndex.value = -1
  gapPx.value = 0
  gapShift.value = 0
  nextTick(() => {
    const lines = host.querySelectorAll<HTMLElement>('.trad__line')
    if (!lines.length) return
    const band = dial.getBoundingClientRect()
    const ceiling = band.top - GAP_CLEARANCE
    let k = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].getBoundingClientRect().bottom > ceiling) {
        k = i
        break
      }
    }
    // Band above the first line or past the last: nothing to part.
    if (k <= 0) return
    // Take up the slack first, then the void is the same everywhere.
    gapShift.value = Math.max(0, Math.round(ceiling - lines[k - 1].getBoundingClientRect().bottom))
    gapIndex.value = k
    gapPx.value = Math.round(band.height + 2 * GAP_CLEARANCE)
  })
}
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
/** Fires when this share of the screen is visible. Deliberately modest — and
 *  CAPPED AT WIRE TIME against the real geometry: 0.35 of a screen taller than
 *  ~2.86 viewports can never be visible at once, so on the smallest phones the
 *  fixed share was unreachable and the sweep never fired at all (the house
 *  IO-threshold trap, found in review). The cap is 90% of the share that CAN
 *  be reached, so the beat still demands most of what the viewport can show. */
const SWEEP_VISIBLE = 0.35

/** Safety net for the ground fade: if the observer never delivers a callback,
 *  the section must not sit at its pre-entrance state forever. */
const GROUND_NET_MS = 2500

/** 0 = all source, 100 = fully rendered. */
const scan = ref(REST)
/** The beam only exists while a split exists. */
const edge = computed(() => scan.value <= 0.5 || scan.value >= 99.5)

const sweeping = ref(false)
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
  sweeping.value = true
  const t0 = performance.now()
  const step = (now: number) => {
    if (!sweeping.value) return
    const t = Math.min(1, (now - t0) / SWEEP_MS)
    scan.value = easeOutCubic(t) * 100
    if (t < 1) fx.raf(step)
    else {
      sweeping.value = false
      done = true
    }
  }
  fx.raf(step)
}

/** A hand on the control always wins — cancels a pending hold or a running
 *  sweep and simply keeps the dragged position; there is no mapping waiting to
 *  snatch it back. */
function takeOver() {
  sweeping.value = false
  done = true
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = 0
  }
}

/**
 * THE THUMB IS THE ONLY HANDLE. A native range JUMPS to wherever the track is
 * clicked, which on this control is not a shortcut but a mis-click: the whole
 * band is a scene the reader is looking at, and brushing it should not throw
 * the seam across the section. A press away from the thumb has its default
 * prevented, so the browser neither jumps nor starts a drag; a press ON the
 * thumb passes through untouched and drags exactly as it always did. The
 * keyboard is unaffected — arrows, Home/End and PageUp/Down still step it,
 * which is what keeps the control operable without a pointer at all.
 *
 * The geometry is the browser's own: the thumb's centre travels the track
 * inset by half its width at each end, so at value v its centre sits at
 * left + T/2 + (v/100)(width − T). T is paired with the 20px thumb in the
 * styles below — change one, change the other.
 */
const GRIP_THUMB = 20
/** How far off the thumb still counts as grabbing it, px. Generous on purpose:
 *  a finger is not a cursor. */
const GRIP_GRAB = 10

/**
 * THE REFUSAL IS A GESTURE-SCOPED FLAG, and it is the layer that actually
 * holds: any `input` event that arrives while the gesture stands refused is
 * treated as noise and the value is put back. Whatever low-level path an
 * engine drives its slider from, the value cannot move without a gesture this
 * code said yes to. Cleared on every gesture end, and by the keyboard handler,
 * so a missed `up` can never wedge the control.
 *
 * THE TOUCH PATH MUST NEVER preventDefault — that is a bug this control
 * shipped once (reported): killing touchstart kills the WHOLE gesture, and
 * since the dial's band spans the full measure, the strip became a dead zone
 * the page could not be scrolled from. The refusal never needed the kill —
 * the value belt above is what holds — so a refused touch is now left alive
 * for the browser to spend on scrolling. Which it can: the control carries
 * `touch-action: pan-y` (see .trad__grip), so a gesture that moves vertically
 * becomes the page's scroll even when it starts on the thumb, and only a
 * horizontal drag on the thumb operates the dial. The mouse keeps its
 * preventDefault — a mouse has a wheel, there is nothing to protect.
 */
let refused = false

function gripGrabAllowed(clientX: number): boolean {
  const el = gripEl.value
  if (!el) return false
  const r = el.getBoundingClientRect()
  const travel = Math.max(0, r.width - GRIP_THUMB)
  const centre = r.left + GRIP_THUMB / 2 + (Number(el.value) / 100) * travel
  return Math.abs(clientX - centre) <= GRIP_THUMB / 2 + GRIP_GRAB
}

function onGripDown(e: PointerEvent) {
  // Inert while the pass runs — see onGripKeys for the same guard.
  if (sweeping.value || !gripGrabAllowed(e.clientX)) {
    // Mouse/pen only. On touch this default is the GESTURE — see the refusal
    // note above; the value belt refuses, the touch stays scrollable.
    if (e.pointerType !== 'touch') e.preventDefault()
    refused = true
    return
  }
  refused = false
  takeOver()
}

/** iOS and Android drive the native grab from here, not from pointerdown.
 *  Refuse by FLAG only — never preventDefault a touch (see the note above). */
function onGripTouch(e: TouchEvent) {
  const t = e.touches[0]
  if (!t) return
  if (sweeping.value || !gripGrabAllowed(t.clientX)) {
    refused = true
    return
  }
  refused = false
}

function onGripEnd() {
  refused = false
}

function onGrip() {
  const el = gripEl.value
  if (!el) return
  // The pass owns the value while it runs, and a refused gesture never owns
  // it at all: in both cases put back what the section holds rather than
  // letting the stray event through.
  if (sweeping.value || refused) {
    el.value = String(Math.round(scan.value))
    return
  }
  takeOver()
  scan.value = Number(el.value)
}

/** Only keys that OPERATE a range are a hand on the control. A keyboard user
 *  tabbing through the page lands here on the way past, and Tab must not
 *  count — it disarmed the sweep permanently for exactly the visitors who
 *  never touched the value (found in review). */
const GRIP_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
])

function onGripKeys(e: KeyboardEvent) {
  if (!GRIP_KEYS.has(e.key)) return
  // The first pass is a one-shot statement; let it finish, then the control is
  // the reader's. Preventing the default keeps the value from moving under it.
  if (sweeping.value) {
    e.preventDefault()
    return
  }
  // The keyboard is always a legitimate hand, so it also clears a refusal a
  // missed gesture-end might have left standing.
  refused = false
  takeOver()
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
  { id: '', text: `<p>${invisible.quoteRest}</p>` },
  { id: '', text: `<p>${invisible.lead}</p>` },
  /* No leading indentation on the nested lines: .trad__line renders with
     default white-space, so leading spaces never displayed anyway (CSS
     collapses them) — but the emitted HTML's minifier STRIPS them while the
     client render keeps them, and hydration flags every such line as a text
     mismatch (measured: 8 warnings per load). The nesting reads from the
     article wrapper lines. */
  ...invisible.items.flatMap((item) => [
    { id: '', text: `<article id="${item.id}">` },
    { id: '', text: `<h3>${item.label}</h3>` },
    { id: '', text: `<p>${item.detail}</p>` },
    { id: '', text: `</article>` },
  ]),
  { id: '', text: `<p>${invisible.outro}</p>` },
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

  // The code column's gap is layout, not motion: it is placed before the
  // reduced-motion return, re-placed when the viewport changes, and once more
  // when the mono face lands (the swap moves every line's box).
  nextTick(placeGap)
  fx.on(window, 'resize', () => {
    fx.raf(() => placeGap())
  })
  if (document.fonts?.ready) void document.fonts.ready.then(() => placeGap())

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
    {
      threshold: Math.min(
        SWEEP_VISIBLE,
        screen.value.offsetHeight > 0
          ? (window.innerHeight / screen.value.offsetHeight) * 0.9
          : SWEEP_VISIBLE,
      ),
    },
  )
  io.observe(screen.value)
})

onUnmounted(() => {
  sweeping.value = false
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
    <!-- THE SOURCE — the whole section as a crawler receives it, absolute
         over the entire band, clipped to the RIGHT of the beam and
         complementary to the rendered layer by construction: the two read the
         same --scan, so the seam cannot disagree with itself. EVERYTHING the
         page renders dissolves into this as the beam passes it (owner's call —
         the earlier cut staged only the strata and kept the brief on the band).
         Decorative for assistive tech; the rendered layer carries every
         string. -->
    <div ref="screen" class="trad__source grain" aria-hidden="true">
      <!-- Zero stays unitless: the emitted HTML's minifier rewrites the
           SSR'd margin-top:0px to margin-top:0, and hydration compares
           values, so the client's initial render must produce the same
           form. Non-zero values only ever exist after mount. -->
      <div
        class="container trad__source-in"
        :style="{ marginTop: gapShift ? gapShift + 'px' : '0' }"
      >
        <code
          v-for="(line, n) in sourceLines"
          :key="n"
          class="emisija trad__line"
          :data-fact="line.id || undefined"
          :style="n === gapIndex ? { marginTop: gapPx + 'px' } : undefined"
          >{{ line.text }}</code
        >
      </div>
    </div>

    <!-- THE BEAM — the seam itself, spanning the section's full height. -->
    <span class="trad__beam" aria-hidden="true"></span>

    <!-- THE RENDERED PAGE, PART ONE — the argument, the instruction, and the
         dial's end labels. All of it page content, all of it clipped by the
         scan: the labels dissolve with the rest, which is the device made
         visible — at rest the right one already stands half in code, exactly
         as the title does. -->
    <div class="container trad__world trad__world--lead">
      <header class="trad__head">
        <p class="kicker kicker--on-dark">{{ invisible.kicker }}</p>
        <h2 class="trad__title">{{ invisible.title }}</h2>
      </header>

      <div class="trad__argument">
        <blockquote class="trad__quote">
          <p>{{ invisible.quote }}</p>
        </blockquote>
        <p class="trad__lead">{{ invisible.quoteRest }}</p>
        <p class="trad__lead">{{ invisible.lead }}</p>
      </div>

      <!-- The range's end labels, in the PAGE rather than in the chrome: they
           name the ends of the scale, and they dissolve like every other line
           (the input itself carries the full aria-label, so nothing assistive
           depends on them staying legible). -->
      <div class="trad__ends">
        <span class="trad__end">{{ invisible.machineLabel }}</span>
        <span class="trad__end">{{ invisible.humanLabel }}</span>
      </div>
    </div>

    <!-- THE DIAL — the one thing that never dissolves, because it is the hand
         on the instrument rather than the specimen. No labels, no rules, no
         ground: a bare range floating over both layers, inked in the seam's
         own red — the one colour measured to clear the 3:1 UI floor on BOTH
         grounds it travels across. -->
    <div ref="chromeEl" class="container trad__chrome">
      <div class="trad__dial">
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
          @pointerdown="onGripDown"
          @pointerup="onGripEnd"
          @pointercancel="onGripEnd"
          @touchstart="onGripTouch"
          @touchend="onGripEnd"
          @touchcancel="onGripEnd"
          @keydown="onGripKeys"
        />
        <span v-else class="trad__grip-ghost" aria-hidden="true"></span>
      </div>
    </div>

    <!-- THE RENDERED PAGE, PART TWO — the rest. Two boxes rather than one
         because the dial stands between them; the scan's clip is horizontal
         only, so two stacked boxes of the same width clip exactly as one box
         would and the seam is continuous through both. -->
    <div class="container trad__world trad__world--rest">
      <div class="trad__made">
        <div class="trad__argument">
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
                :aria-orientation="live ? 'vertical' : undefined"
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
     press screen, so it is measured flat.

     IT CARRIES THE STATIC (.grain), which is why this is background-COLOR and
     not the shorthand: the shorthand resets background-image and would erase
     the tile silently. The section root is a press band and therefore has no
     texture of its own, so there is no doubling — this half is a different
     SURFACE, the untreated paper the machine sees, and the static is what
     stops it reading as a blank plate. The texture sits UNDER the code, where
     the old full-page overlay used to sit over it, so the letters composite
     clean and the contrast can only improve. */
  background-color: var(--color-paper);
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
  /* The ceiling comes down with the section titles (30%, owner's call):
     2.25rem × 0.7. The floor and the slope are untouched, so phones are where
     they were and only the desktop end moves. This stays the largest type in
     the band, which is the point of it. */
  font-size: clamp(1.375rem, 1.05rem + 1.3vw, 1.575rem);
  font-weight: var(--type-statement-weight);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
  /* The system's statement runs lh 0.9; caps with carons need a shade more
     air to keep ascenders clear of the line above. */
  line-height: 1.02;
  color: var(--color-paper); /* 18.8:1 */
  max-width: 26ch;
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
   A section through the build-up: four BRIGHT sheets lying on the band's dark
   ground (owner's call — the artwork was inverted, see the pipeline header).
   Everything ON a sheet is therefore ink and everything on the BAND stays
   paper, which is the one rule to apply when touching this block; the two got
   swapped once already, in the other direction, when the sheets were black.
   Unequal thicknesses are the point — a membrane is thin, a substrate is
   thick; equal slabs would read as a bar chart.

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
/* THE SKEW NEEDS VERTICAL ROOM, and it had none. Every sheet is turned
   skewY(-7deg), which lifts its right end and drops its left by
   tan(7°) × width/2 — and the four sheets are laid out to fill the stack's
   height exactly (0 / 23.5 / 47 / 70.5 per cent plus a 29 per cent height
   is 99.5). So the FIRST sheet's raised corner leaves the box at the top and
   the LAST one's leaves it at the bottom, with nothing reserved for either.
   Measured at 1920: the first sheet reached 32px above the stack and ran into
   the paragraph above it, which is the reported "first layer is cut off".

   The overshoot is bounded because the stack's width is: the container caps at
   1312px and this column takes just under half of it, so a 628px stack skews
   0.1228 × 0.82 × 628 / 2 = 31.6px at the widest the layout can ever be. 48px
   covers that with 16px of air left over — 36px cleared the collision but left
   only 4, which reads as touching rather than as clearance. Margin rather than
   padding, because the bands are positioned against the padding box and their
   percentage tops would simply scale with it. */
.asm__stack {
  position: relative;
  height: clamp(20rem, 36vw, 27rem);
  margin-block: 3rem;
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
  /* A paper hairline, because the sheet it edges is paper-bright now: the
     dark-world line this replaced was drawn for black artwork. It is also the
     quiet half of the probe signal — see .asm__band--on, which takes the same
     edge to full ink. */
  border: var(--divider-width) solid var(--mreza-strong);
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

/* Probed: clear of the stack and in front of it. INK, flipped with the sheets
   — the paper ring that stood here was drawn for black artwork and would now
   be a bright line on a bright sheet. Against the resting edge (a paper
   hairline, see .asm__band) this is a weight change as well as a tone one, so
   the probed sheet is ringed rather than merely lit. The owner's no-orange
   rule for this drawing holds: graphite, never the accent. */
.asm__band--on {
  transform: translateX(17.073%) skewY(-7deg);
  z-index: 9;
  border-color: var(--grafit);
}

button.asm__band {
  cursor: pointer;
}

.asm__band:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: -4px;
}

/* THE SHEETS ARE THE SHIPPED ARTWORK, SHOWN UNCHANGED — owner's call, and the
   thing three earlier passes each got wrong in a different way. They were
   restated as SVG patterns, then converted to greyscale alpha masks tinted with
   the page's ink, then pushed through a contrast curve. Every one of those was a
   translation. The files are now taken as they are: opaque, in their own
   colours — two of the four are photographs, one cold steel blue and one
   blackened plate with warm oxidation — and the only thing the pipeline does is
   choose a window out of each source (scripts/build-band-textures.mjs).

   THE BAND CARRIES NO INK OF ITS OWN. No tint, no mask, no filter: the fill is
   simply the picture, and --band-ground shows only until it decodes. The window
   is cut at 2.30:1 against a band measured at 2.49:1 on desktop and 2.19:1 on a
   phone, so `cover` trims a sliver at either end rather than distorting it.

   0.85 at rest, full when probed. This is the ONE place the artwork is not at
   100%, and it is an interaction device rather than a treatment: three sheets
   stand back so the probed one comes forward, which is what position alone
   cannot say once every sheet carries a picture. Raise it to 1 and the
   distinction falls to the band's border and its label, which both already
   change on probe. */
.asm__fill {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.85;
  transition: opacity var(--dur-tween) var(--ease-hover);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* VIDNOST — a node-and-link web. What finds you is a graph and crawlers walk
   links, so the texture states the claim rather than decorating it. */
.asm__band--0 .asm__fill {
  background-image: url('/img/tex/layer-seo-v2.webp');
}

/* OBRAZCI — a dense field of discrete entries, ruled across. */
.asm__band--1 .asm__fill {
  background-image: url('/img/tex/layer-forms-v2.webp');
}

/* PIŠKOTKI — a woven screen: the thing that decides what passes and what is
   stopped, which is what the law is about. The one sheet with a colour of its
   own, and it keeps it. */
.asm__band--2 .asm__fill {
  background-image: url('/img/tex/layer-compliance-v2.webp');
}

/* DOMENA — the blackened plate the rest is published onto, striated and slowly
   oxidising: the ground the other three stand on. */
.asm__band--3 .asm__fill {
  background-image: url('/img/tex/layer-hosting-v2.webp');
}

/* ONE ground, and it is the ARTWORK'S — which is now PAPER, because the sheets
   are bright (owner's call; the inversion is argued in the pipeline's header).
   Black stood here while the files were white marks on black and it was the
   only value that showed them as generated; against the -v2 set it would ring
   every bright sheet in a dark edge the artwork does not have.

   `--band-ground` rather than `background` directly: the label's tab reads the
   same value, so a name can never end up on a ground the sheet does not
   actually have. */
.asm__band--0,
.asm__band--1,
.asm__band--2,
.asm__band--3 {
  --band-ground: var(--color-paper);
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
/* THE NAME SITS ON A TAB OF THE SHEET'S OWN GROUND, never on the artwork. A
   13px glyph stroke landing on a mark would measure a fraction of the floor;
   backing the name with the sheet's own ground is what a real section drawing
   does with a label over hatching, and it puts the contrast back on the ground
   itself. THE INK FLIPPED WITH THE SHEETS: on paper the dark-world pair read
   1.3:1 and 1.06:1 — invisible — so the resting ink is the secondary graphite
   and the probed one full ink, measured 8.99:1 and 13.88:1 on the tab. The
   inline-block box also keeps the tab off the terminal at the right. */
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
  color: var(--grafit-2);
  transition: color var(--dur-tween) var(--ease-hover);
}

.asm__band--on .asm__band-label {
  color: var(--grafit);
}
@media (hover: hover) {
  button.asm__band:hover .asm__band-label {
    color: var(--grafit);
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
  border: 1px solid var(--grafit-2);
  transition:
    background-color var(--dur-tween) var(--ease-hover),
    border-color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  button.asm__band:hover .asm__node {
    border-color: var(--grafit);
  }
}

/* Filled: ink, flipped with the sheets — a paper terminal on a bright sheet is
   an invisible one (owner's no-orange rule for this drawing still holds, so it
   is graphite rather than the accent). 13.88:1 on the sheets' own ground, and
   hollow-vs-filled stays the state signal. */
.asm__band--on .asm__node {
  background: var(--grafit);
  border-color: var(--grafit);
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

/* --- the dial ----------------------------------------------------------------
   THE ONE THING THAT NEVER DISSOLVES. Everything else in the section is
   specimen — clipped by the scan, replaced by its own source as the beam
   passes. The bare range is the hand on the instrument, so it floats above
   both layers with NO ground, no rules, no labels of its own (they live in
   the page above and dissolve with it; the input's aria-label carries the
   full instruction).

   THE TRACK WEARS EACH GROUND'S OPPOSITE (owner's call): paper over the
   bronze half, the seam's cut over the paper source half, split AT THE SEAM
   and moving with it as the hand slides. One gradient with a hard stop does
   it, and the stop is the seam's own x expressed in the track's coordinates:

     seam in the page:   var(--scan) * 1vw
     track's left edge:  max(var(--gutter), (100vw − var(--container)) / 2)
                         — the container's inset formula, since the dial hugs
                         the container's left edge (62ch, no centring)

   Both derive from the same --scan the beam and the clips read, so the split
   cannot disagree with the seam (the only drift is a classic desktop
   scrollbar's width inside 100vw, ~8px at mid-scan; phones have none). Stops
   past either end clamp, so fully-source is all cut and fully-rendered all
   paper — each half always wearing its opposite.

   Contrast is the same arithmetic as before, now per side instead of one ink
   for both: paper on the bronze half 10.17:1, the cut on the paper half 3.20:1
   — both clear the 3:1 UI floor with the split guaranteeing each colour only
   ever sits on its own ground. The THUMB stays the seam's cut on both: it
   rides the boundary itself, and 3.20 / 3.18 is measured against each. */
.trad__chrome {
  position: relative;
  z-index: 4;
  margin-top: var(--space-4);
  margin-bottom: var(--space-10);
}

/* The instruction, set as the intro is: the paragraph the dial belongs to. */
.trad__lead {
  margin-top: var(--space-6);
  color: var(--papir-dim);
  max-width: 62ch;
}

/* The scale's end labels: page content, in the page's own ink, clipped by the
   scan like every other line. Same measure as the dial under them. */
.trad__ends {
  display: flex;
  justify-content: space-between;
  max-width: 62ch;
  margin-top: var(--space-6);
}

/* The dial takes the MEASURE of the paragraph above it rather than the
   container's full width (owner's call): a control that runs wider than the
   sentence explaining it reads as belonging to the section rather than to the
   sentence. 62ch is .trad__lead's own max-width — change one, change the
   other. */
.trad__dial {
  max-width: 62ch;
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
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  background: transparent;
  cursor: ew-resize;
  /* THE DIAL YIELDS THE VERTICAL AXIS. pan-y hands gestures that move up or
     down to the browser as ordinary page scroll — even from the thumb — and
     keeps only horizontal drags for the slider. Without it the control's
     full-measure band was a strip the page could not be scrolled from
     (reported). Direction is decided once, at gesture start, by the engine:
     a drag that sets off sideways drives the dial and never scrolls, a drag
     that sets off downward scrolls and never moves the value. PAIRED with the
     no-preventDefault rule in the touch handlers — this declaration is dead
     if a handler kills the touch first. */
  touch-action: pan-y;
}
/* The split track — see THE TRACK WEARS EACH GROUND'S OPPOSITE above. The
   identical gradient is stated once per engine because range pseudo-elements
   cannot share a selector: a browser drops the whole rule when it meets the
   other engine's pseudo. Change one, change all three (both tracks + ghost). */
.trad__grip::-webkit-slider-runnable-track {
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-paper)
      calc(var(--scan, 55) * 1vw - max(var(--gutter), (100vw - var(--container)) / 2)),
    var(--color-cut-seam) 0
  );
}
.trad__grip::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -9px;
  border: 0;
  border-radius: 0;
  background: var(--color-cut-seam);
}
.trad__grip::-moz-range-track {
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-paper)
      calc(var(--scan, 55) * 1vw - max(var(--gutter), (100vw - var(--container)) / 2)),
    var(--color-cut-seam) 0
  );
}
.trad__grip::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 0;
  background: var(--color-cut-seam);
}
.trad__grip:focus-visible {
  outline: 2px solid var(--color-cut-seam);
  outline-offset: 4px;
}

/* JS-OFF AND FIRST PAINT: the ghost DRAWS the resting control instead of just
   reserving its height, so the slider arrives with the rest of the page as
   pure HTML — the SAME split track as the live input (at the 55 rest the
   fallback resolves to), thumb standing at the rest. The live input replaces
   it in place at hydration, colours already agreeing. */
.trad__grip-ghost {
  display: block;
  height: 44px;
  background:
    linear-gradient(var(--color-cut-seam), var(--color-cut-seam)) 55% 50% / 20px 20px
      no-repeat,
    linear-gradient(
        90deg,
        var(--color-paper)
          calc(var(--scan, 55) * 1vw - max(var(--gutter), (100vw - var(--container)) / 2)),
        var(--color-cut-seam) 0
      )
      0 50% / 100% 2px no-repeat;
}

/* --- the statement band's own asymmetry --------------------------------------
   The argument sits in the left two-thirds and the right third is EMPTY — the
   reference achieves its off-centre composition with voids rather than
   alignment, and that void is also where the beam's first work is visible. */
@media (min-width: 810px) {
  .trad__argument {
    max-width: var(--measure-statement);
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
   fires after the reading beat. The dial needs nothing here: the ends row and
   the bare control already stack at every width. */
@media (max-width: 809px) {
  /* Tighter above the control here (owner's call): on a phone the instruction
     and the dial are a single gesture and the desktop's air read as a gap. */
  .trad__ends {
    margin-top: var(--space-4);
  }

  .trad__chrome {
    margin-top: var(--space-2);
    margin-bottom: var(--space-8);
  }

  /* Phones lose the leader, so the link between a stratum and its callout is
     proximity plus this rule — paper, like every other line in the drawing
     (the orange left with the rest of them). */
  .asm__panels {
    border-top: 2px solid var(--color-paper);
    padding-top: var(--space-4);
  }
}
</style>
