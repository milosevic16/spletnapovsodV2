<script setup lang="ts">
/**
 * Kje se ločimo — THE SPEC ROLL.
 *
 * The four claims are printed in the page as an ordinary, always-readable
 * register. Beside them stands an instrument: a slot with the site's red datum
 * across its head, and behind the slot a continuous roll carrying the four
 * measured values in monumental type. As you read, the roll ADVANCES — the
 * value in the slot is always the value of the claim you are level with, and
 * the frame counter, the sprocket ticks and the inked row all agree with it.
 *
 * WHY THIS AND NOT A LAYOUT: every other idea for this band either hid three
 * claims behind a control (the page already does that twice) or was a static
 * arrangement with an effect sprinkled on it. This is a display: it takes an
 * input the page has not used for a section — WHERE THE READER IS — and turns
 * it into one moving part. Nothing is gated, nothing is hidden, and the
 * instrument earns itself because it states a fact (this claim measures this).
 *
 * THE SAME INSTRUMENT ON A PHONE. The display does not become a stack: it
 * sticks to the head of the band (clearing the masthead) and the claims run
 * under it, so the big value rolls as you scroll. The phone gets the liveliest
 * version of the section rather than the flattest.
 *
 * HONEST BY CONSTRUCTION. Every value is ALSO printed in its own claim row, in
 * the register's mono, so the roll is a MIRROR — aria-hidden theatre — and
 * assistive tech, JS-off readers and crawlers get value and claim together in
 * the flow. With JS off the instrument is simply not assembled (it is the
 * duplicate, not the source); under reduced motion it tracks exactly as it
 * does otherwise and the roll lands without a tween, because which claim you
 * are reading is information, not decoration.
 *
 * NOT NUMBERED as an outline: the 01–04 by the datum is a live frame counter
 * that changes as the roll turns — an instrument reading, not an eyebrow.
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { differentiators } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const root = ref<HTMLElement | null>(null)
const slot = ref<HTMLElement | null>(null)
const display = ref<HTMLElement | null>(null)
const live = ref(false)

const items = differentiators.items
/** Which claim the reader is level with — drives the roll, the counter, the
 *  ticks and the inked row from ONE integer, so they cannot disagree. */
const active = ref(0)

const counter = computed(() => String(active.value + 1).padStart(2, '0'))
const total = String(items.length).padStart(2, '0')

let raf = 0

/** How far into the space below a stacked instrument the reading line sits.
 *  Only used when the display is ABOVE the register (phones). */
const READ_ZONE = 0.4

/**
 * The claim the instrument is reading: the last one whose head has passed the
 * reading line. Read-only measurement — no writes, so it can never fight the
 * layout it is measuring.
 *
 * THE LINE MOVES WITH THE LAYOUT, and it has to. Beside the register (desktop)
 * "current" means level with the slot, so the line IS the slot's edge. Stacked
 * above it (phones) nothing is ever level with the slot, and using its edge
 * made the instrument read the row that had just left the top of the screen —
 * measured, it lagged a full claim behind the one filling the viewport. There
 * the line drops into the reading zone below the pinned instrument instead.
 * Which case we are in is read from geometry, not from a media query, so the
 * two can never disagree.
 */
function measure() {
  raf = 0
  const host = root.value
  const s = slot.value
  if (!host || !s) return
  const register = host.querySelector<HTMLElement>('.dif__register')
  const slotBox = s.getBoundingClientRect()
  const beside = register !== null && slotBox.right <= register.getBoundingClientRect().left + 1
  const line = beside
    ? slotBox.bottom
    : slotBox.bottom + (window.innerHeight - slotBox.bottom) * READ_ZONE
  const rows = host.querySelectorAll<HTMLElement>('.dif__claim')
  let next = 0
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]!.getBoundingClientRect().top <= line) next = i
  }
  active.value = next
}

function onScroll() {
  if (raf) cancelAnimationFrame(raf)
  raf = fx.raf(measure)
}

/* --- pointer shortcuts on the instrument (owner's ask) ------------------------
 * Swiping the pinned display right-to-left advances to the next claim (and
 * left-to-right back); tapping a sprocket jumps to its claim.
 *
 * THE GESTURE WRITES SCROLL, NEVER `active`. goTo() scrolls the page to where
 * the target claim reads as current and the measurement above turns the roll
 * from the real scroll position — `active` keeps its single writer, so the
 * instrument still cannot disagree with the page, and the roll visibly turns
 * through the claims the page travels past, which IS the gesture's feedback.
 *
 * TOUCH WIRING IS PASSIVE-ONLY AND NEVER TOUCHMOVE: a non-passive touchmove
 * would mark the region non-fast-scrollable (the iOS trap in the house
 * rules). Start and end are enough to judge a swipe; when WebKit claims the
 * gesture as a scroll instead, it fires touchcancel and we correctly drop it.
 * touch-action: pan-y on the display keeps vertical reading native. */

/** Minimum travel for a swipe, and how decisively horizontal it must be. */
const SWIPE_MIN_PX = 48
const SWIPE_AXIS_RATIO = 1.2
/** How long a recognized swipe suppresses the synthesized click (house rule:
 *  one capture-phase consumer, timestamp not flag — stale reads "expired"). */
const CLICK_SUPPRESS_MS = 400
/** Where a jumped-to claim lands below the pinned instrument (stacked). Well
 *  inside measure()'s reading zone, so the landing always reads as current. */
const LAND_GAP_PX = 12

let touchLive = false
/** Compared with === only — iOS identifiers carry no sign guarantee. */
let touchId = 0
let touchX = 0
let touchY = 0
let swipedAt = 0

function goTo(i: number) {
  const host = root.value
  const s = slot.value
  const d = display.value
  if (!host || !s || !d) return
  const rows = host.querySelectorAll<HTMLElement>('.dif__claim')
  const row = rows[Math.max(0, Math.min(items.length - 1, i))]
  if (!row) return
  // Same geometry read as measure(), so the landing spot and the reading line
  // can never belong to different layouts.
  const register = host.querySelector<HTMLElement>('.dif__register')
  const slotBox = s.getBoundingClientRect()
  const beside = register !== null && slotBox.right <= register.getBoundingClientRect().left + 1
  const anchor = beside ? slotBox.top : d.getBoundingClientRect().bottom + LAND_GAP_PX
  const top = Math.max(0, window.scrollY + row.getBoundingClientRect().top - anchor)
  // A deliberate jump may glide; under reduced motion it lands in one step.
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

function onTouchStart(e: TouchEvent) {
  if (touchLive) return
  const t = e.changedTouches[0]
  if (!t) return
  touchLive = true
  touchId = t.identifier
  touchX = t.clientX
  touchY = t.clientY
}

function onTouchEnd(e: TouchEvent) {
  if (!touchLive) return
  for (const t of Array.from(e.changedTouches)) {
    if (t.identifier !== touchId) continue
    touchLive = false
    const dx = t.clientX - touchX
    const dy = t.clientY - touchY
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy) * SWIPE_AXIS_RATIO) return
    swipedAt = performance.now()
    goTo(active.value + (dx < 0 ? 1 : -1))
  }
}

function onTouchCancel(e: TouchEvent) {
  for (const t of Array.from(e.changedTouches)) {
    if (t.identifier === touchId) touchLive = false
  }
}

/** A swipe that ends over a sprocket must not also press it. */
function onDisplayClick(e: Event) {
  if (performance.now() - swipedAt < CLICK_SUPPRESS_MS) {
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  live.value = true
  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(window, 'resize', onScroll, { passive: true })
  measure()
  // The display assembles only once live — wire its gestures after this tick.
  nextTick(() => {
    const el = display.value
    if (!el) return
    fx.on(el, 'touchstart', onTouchStart as EventListener, { passive: true })
    fx.on(el, 'touchend', onTouchEnd as EventListener, { passive: true })
    fx.on(el, 'touchcancel', onTouchCancel as EventListener, { passive: true })
    fx.on(el, 'click', onDisplayClick, { capture: true })
  })
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section
    id="razlike"
    ref="root"
    class="dif press press--light"
    :class="{ 'dif--live': live }"
  >
    <div class="container dif__head">
      <p class="kicker kicker--on-dark">{{ differentiators.kicker }}</p>
      <h2 class="dif__title">{{ differentiators.title }}</h2>
    </div>

    <div class="container dif__stage">
      <!-- THE INSTRUMENT. A mirror of the register beside it: aria-hidden,
           assembled only once live. -->
      <div v-if="live" ref="display" class="dif__display" aria-hidden="true">
        <div class="dif__datum">
          <span class="dif__counter">{{ counter }} / {{ total }}</span>
        </div>

        <div ref="slot" class="dif__slot">
          <div class="dif__roll" :style="{ '--i': active }">
            <p v-for="d in items" :key="d.id" class="dif__value">{{ d.measure.annotation }}</p>
          </div>
        </div>

        <!-- Sprockets: one per frame, the running one filled. Each carries a
             pointer-only tap surface (owner's ask: touching a tick jumps to
             its claim). tabindex=-1 keeps the button out of the tab order —
             the whole instrument is aria-hidden theatre, and keyboard/AT
             readers navigate the register itself, so a focusable control in
             here would be a focus trap into silence. -->
        <ul class="dif__sprockets">
          <li
            v-for="(d, i) in items"
            :key="d.id"
            class="dif__sprocket"
            :class="{ 'dif__sprocket--on': i === active }"
          >
            <button
              type="button"
              tabindex="-1"
              class="dif__sprocket-hit"
              @click="goTo(i)"
            ></button>
          </li>
        </ul>
      </div>

      <!-- THE REGISTER: the canonical content, always readable, never gated. -->
      <ol class="dif__register">
        <li
          v-for="(d, i) in items"
          :key="d.id"
          class="dif__claim"
          :class="{ 'dif__claim--on': live && i === active }"
        >
          <p class="dif__mark annot">{{ d.measure.annotation }}</p>
          <h3 class="dif__claim-title">{{ d.title }}</h3>
          <p class="dif__body">{{ d.body }}</p>
          <p v-if="d.measure.gloss" class="dif__gloss">{{ d.measure.gloss }}</p>
          <!-- The one genuinely sequential thing here: the three working days
               the claim promises. -->
          <ul v-if="d.measure.ticks" class="dif__days">
            <li v-for="t in d.measure.ticks" :key="t" class="dif__day">{{ t }}</li>
          </ul>
          <p v-if="d.footnote" class="dif__footnote">{{ d.footnote }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* The ink ground: one step off the black above (Tradicija) and below
   (Kontakt), so the page's dark half reads as one world with this band
   lifted out of it.

   A GROUND TOKEN, not the ink one. This painted --grafit, which is also the
   paper world's body-text ink (base.css) — fine while both were the same
   near-black, and a trap the moment the grounds moved to bronze: lightening
   --grafit would have turned every paragraph on the paper half brown. The
   band now names the ground it means. Measured under a press-screen highlight
   dot, the worst case here: paper 7.44:1, secondary 4.97:1. */
/* THE BRIGHT BAND (owner's call): this section is paper, not board — it sits
   between two dark bands and lifts the page's second half rather than
   continuing it.

   IT INVERTS BY REMAPPING FOUR TOKENS, not by rewriting twenty rules. Custom
   properties inherit, so re-pointing the dark-world names at their paper-world
   twins here flips every colour in the section at once. Checked before doing
   it — inside this section --list and --papir-dim are ONLY ever text, and
   --rez-na-temnem and --crta-na-temnem ONLY ever lines, so nothing below
   wanted a light value from them and nothing can invert the wrong way.

   Measured in-page on the beige ground (#ece8de): body ink 12.69:1, secondary
   8.21:1, the cut 4.91:1. On a LIGHT ground the worst pixel is a text pixel
   sitting on a SHADOW dot rather than a highlight one — the screen's roles
   invert with the ground — and there they read 10.53:1, 6.82:1 and 4.08:1.
   The cut clears its 3:1 floor with room; it is only ever a mark here (ticks,
   the claim's edge), never text, which is what makes 4.08 fine. */
.dif {
  --list: var(--grafit);
  --papir-dim: var(--grafit-2);
  --rez-na-temnem: var(--rez);
  --crta-na-temnem: var(--mreza-strong);

  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.dif__head {
  margin-bottom: var(--space-16);
}

.dif__title {
  margin-top: var(--space-3);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--list);
  max-width: 16ch;
}

/* --- the instrument ----------------------------------------------------------
   Phones: it sticks to the head of the band and the register runs under it. */
.dif__display {
  position: sticky;
  top: calc(var(--nav-h) + var(--space-2));
  z-index: 1;
  align-self: start;
  /* The values are set against THIS column, not the viewport: the roll runs
     nowrap inside a clipped slot, so a value wider than the column would be
     silently cut off (measured: the longest ran 512px in a 472px slot at
     1280). cqw ties the type to the box that has to hold it, at every width. */
  container-type: inline-size;
  /* The band's own ground, so the register never shows through behind the
     roll as it passes under. Opaque on purpose, which is also why it carries
     no press screen: it would print a second screen over the section's own as
     it slides. */
  background: var(--list-2);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-6);
  /* Vertical reading stays native; horizontal is ours to read (the swipe).
     Pairs with the passive-only listeners in the script — no touchmove is
     ever registered, so the region stays fast-scrollable on iOS. */
  touch-action: pan-y;
}

/* The datum: the red rule across the instrument's head, carrying the frame
   counter — the one number here, and it is a live reading. */
.dif__datum {
  display: flex;
  justify-content: flex-end;
  border-top: 2px solid var(--rez-na-temnem);
  padding-top: var(--space-2);
}

.dif__counter {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--papir-dim);
}

/* The slot: exactly one frame tall. The em is the value's own, so the roll's
   step and the slot's height can never drift apart. */
/* The longest value ("Google + ChatGPT", 16 caps) is what sizes this: measured
   with a Range across the text node, it sets 8.99em — IDENTICAL in the real
   face and in the metric-matched fallback, which is the whole point of the
   fallback. (Measure it with a Range, never scrollWidth: these are block
   boxes, so scrollWidth reports the box and a clipped nowrap line looks like
   a perfect fit. That mistake cost a round here.)

   8.99em against 100cqw allows 11.1cqw exactly; 10cqw keeps ~10% of slack,
   which is what rounding at odd widths needs. Re-measure if the values
   change — a nowrap line in a hidden-overflow slot cannot report clipping. */
.dif__slot {
  font-size: clamp(1.5rem, 10cqw, 3.75rem);
  height: 1.16em;
  overflow: hidden;
}

.dif__roll {
  transform: translateY(calc(var(--i, 0) * -1.16em));
  transition: transform 520ms var(--ease-spring);
}

.dif__value {
  height: 1.16em;
  margin: 0;
  max-width: none;
  font-family: var(--font-sans);
  font-size: 1em;
  font-weight: 400;
  line-height: 1.16;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--list);
}

.dif__sprockets {
  list-style: none;
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.dif__sprocket {
  position: relative;
  width: 26px;
  height: 3px;
  background: var(--crta-na-temnem);
  transition: background var(--dur-tween) var(--ease-hover);
}

/* The tap surface, centred on the tick and bigger than it: 34px wide is the
   row's own pitch (26px line + 8px gap), so neighbouring hits meet edge to
   edge with zero overlap — a nominal 44px here would put a 10px misfire
   strip on every boundary. 44px tall. That trades the house 44px floor down
   to WCAG 2.2's minimum in ONE dimension, knowingly: the ticks are a
   secondary shortcut (the whole banner swipes, and the page scrolls
   natively), and a wrong-neighbour press is the worse failure. The overhang
   past the display's box lands on non-interactive register text only. */
.dif__sprocket-hit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.dif__sprocket--on {
  background: var(--rez-na-temnem);
}

/* --- the register ------------------------------------------------------------- */
.dif__register {
  list-style: none;
}

.dif__claim {
  position: relative;
  padding-block: var(--space-10);
  padding-left: var(--space-6);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
}

/* The reading mark: the row the instrument is showing gets the red edge. It
   is a rule, not a colour swap, so nothing about the text's legibility
   depends on which row is current. */
.dif__claim::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--rez-na-temnem);
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 420ms var(--ease-spring);
}

.dif__claim--on::before {
  transform: scaleY(1);
}

.dif__mark {
  color: var(--papir-dim);
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.dif__claim-title {
  margin-top: var(--space-3);
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: clamp(1.375rem, 1.1rem + 1.2vw, 2rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--list);
}

.dif__body {
  margin-top: var(--space-4);
  color: var(--papir-dim);
  max-width: 54ch;
}

.dif__gloss {
  margin-top: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  line-height: 1.5;
  letter-spacing: var(--type-data-ls);
  color: var(--papir-dim);
  max-width: 46ch;
}

.dif__days {
  list-style: none;
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-5);
}

.dif__day {
  position: relative;
  padding-top: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: 0.12em;
  color: var(--papir-dim);
}

.dif__day::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--rez-na-temnem);
}

.dif__footnote {
  margin-top: var(--space-4);
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--papir-dim);
  max-width: 52ch;
  padding-left: var(--space-4);
  border-left: var(--divider-width) solid var(--crta-na-temnem);
}

/* --- desktop: the instrument stands beside the register ----------------------- */
@media (min-width: 900px) {
  .dif__stage {
    display: grid;
    /* The instrument takes a real half of the row: the value is sized against
       this column (cqw), so a wider column is the only way the display type
       gets to be display type. */
    grid-template-columns: minmax(0, 48fr) minmax(0, 52fr);
    column-gap: var(--space-16);
    align-items: start;
  }

  .dif__display {
    /* High enough that the instrument is read first, low enough that several
       claims are on screen with it. */
    top: 24vh;
    padding-bottom: 0;
    margin-bottom: 0;
    background: none;
  }

  .dif__claim:first-child {
    padding-top: 0;
    border-top: 0;
  }
}
</style>
