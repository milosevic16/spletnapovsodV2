<script setup lang="ts">
/**
 * Reference — the built work as THREE DARK PLATES, in the same language as the
 * wall of packages directly below it.
 *
 * That neighbouring section is the reference for every decision here, because
 * two adjacent bands that speak differently read as two different sites:
 *  · the picture IS the plate — full bleed, no frame, no inset, no caption
 *    strip under it; the plate's own ink rises into the bottom of the frame and
 *    the words print inside it;
 *  · the row is never even. One plate holds three fifths and the other two a
 *    fifth each, and the majority follows the pointer — the same shape sliding
 *    along the row, which is the wall's entire gesture;
 *  · phones pin the plates along a drafting DATUM down the left margin, hanging
 *    at three different indents and overlapping by a sliver, so the stack reads
 *    as drawings laid on a table rather than three equal cards.
 *
 * What this section keeps that the wall has no need of: the sheet numbers, the
 * address, and each site's own palette sampled into a framed strip. They are
 * restated in the wall's materials — paper strokes on dark, one hairline weight
 * — rather than in the paper-ledger vocabulary they came from, which is what
 * made the old version read as a different section.
 *
 * THE WHOLE PLATE IS THE LINK, so there is one tab stop and one obvious target
 * per project. On pointer devices hover hands it the majority and a click
 * follows it. On touch, where there is no hover, the first tap gives the plate
 * the majority and the second follows the link — otherwise a reader could never
 * LOOK at a plate without leaving the site. With JS off a tap simply follows the
 * link, which is the safe degradation.
 *
 * SSG contract: every plate, name, sector and address is in the prerendered
 * HTML and visible at rest; nothing here is disclosed by interaction.
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()

const items = references.items

/**
 * How many projects stand at rest. Five is more work than either layout wants
 * to show at once — a phone would scroll through five full-width belts before
 * reaching anything else — so the set stops after the third and the rest are
 * one control away.
 */
const AT_REST = 3

/** Which plate the reader has brought forward BY TAPPING. -1 = none; on
 *  pointer devices this stays -1 forever and :hover does the work. */
const active = ref(-1)
/** Devices with a real pointer take the majority on hover, so a tap there
 *  should follow the link at once. Read on mount — never at module scope. */
const hoverCapable = ref(true)

/**
 * PROGRESSIVE DISCLOSURE SHIPS EXPANDED. `live` flips on mount, so the
 * prerendered HTML carries all five projects in flow with no control at all —
 * a crawler and a JS-off reader get the complete set, and the shortening is
 * purely an affordance for people who can operate it.
 */
const live = ref(false)
const revealed = ref(false)
const collapsed = computed(() => live.value && !revealed.value)

/**
 * The ids the control owns, so `aria-controls` names exactly the two projects
 * it opens and closes rather than gesturing at the section.
 */
const extraIds = computed(() =>
  items
    .slice(AT_REST)
    .map((item) => `reference-${item.id}`)
    .join(' '),
)

/**
 * ONE CONTROL THAT TOGGLES, not a control that disappears when it has worked.
 * It keeps its place in both layouts, so pressing it never moves the focus it
 * is holding and the way back is exactly where the way in was — which is also
 * why nothing here reaches for focus: a disclosure that stays put should leave
 * the reader on it.
 */
const sectionEl = ref<HTMLElement | null>(null)
const groundEl = ref<HTMLElement | null>(null)
const moreEl = ref<HTMLElement | null>(null)

/**
 * HOW FAR THE GROUND TRAVELS, in px, and PAIRED with --wkr-reach in the styles:
 * the layer hangs exactly this far past the section's top and bottom edges, so
 * the travel can never expose the band underneath. Change one, change the other.
 */
const GROUND_REACH = 120

/**
 * THE PARALLAX. The ground is a LAYER rather than the section's own background,
 * because a background cannot be moved without repainting the box it is painted
 * into — and this one carries the press screen, a four-layer dot lattice across
 * a full-width band. As a layer it is rasterised once and slid on the
 * compositor, which is the whole difference between a parallax and a stutter.
 *
 * The rate is NORMALISED rather than a fixed multiplier. Offset is the section's
 * centre against the viewport's; dividing by the largest that offset can reach
 * while any part of the section is on screen — (viewport + section) / 2 — gives
 * −1 as it arrives and +1 as it leaves, whatever the section's height. So the
 * ground always travels exactly ±GROUND_REACH, the overhang is exactly right by
 * construction, and a section that grows (the two held-back projects opening)
 * cannot push the layer off its own edge. The effective rate on a 900-tall
 * viewport works out near 0.1, which is the slow end on purpose: this is a sheet
 * drifting behind a drawing, not a photo carousel.
 *
 * Gated on the observer so the listener does nothing while the band is off
 * screen, rAF-throttled so a scroll burst writes one transform per frame, and
 * absent entirely under reduced motion — where the layer simply stands still and
 * the section is exactly what it always was.
 */
function wireParallax() {
  const section = sectionEl.value
  const ground = groundEl.value
  if (!section || !ground || prefersReducedMotion() || !('IntersectionObserver' in window)) return
  let onScreen = false
  let queued = false
  const apply = () => {
    queued = false
    const r = section.getBoundingClientRect()
    const reach = (window.innerHeight + r.height) / 2
    if (reach <= 0) return
    const offset = r.top + r.height / 2 - window.innerHeight / 2
    const p = Math.max(-1, Math.min(1, offset / reach))
    ground.style.transform = `translate3d(0, ${(-p * GROUND_REACH).toFixed(1)}px, 0)`
  }
  const schedule = () => {
    if (!onScreen || queued) return
    queued = true
    fx.raf(apply)
  }
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        onScreen = e.isIntersecting
        if (onScreen) schedule()
      }
    },
    { threshold: 0 },
  )
  io.observe(section)
  fx.on(window, 'scroll', schedule, { passive: true })
  fx.on(window, 'resize', schedule)
}

/** Paired with the belts' 340ms collapse below — this is that plus a beat. */
const HIDE_HOLD_MS = 440

/**
 * CLOSING MUST NOT MOVE THE READER. »Skrij« stands UNDER the belts it closes,
 * so collapsing them removes two full-width belts from above the reader's own
 * scroll offset while the offset stays where it was: the page rushes up past
 * them and they land somewhere below the section entirely. The control itself
 * survives the collapse — it is outside the list — which makes it the ideal
 * anchor, and holding it still is the house rule for collapsing content.
 *
 * Only on the way IN. Opening pushes the button DOWN because the belts arrive
 * above it, and that is the reveal doing its job: pinning the button there
 * would scroll the new work past the reader instead of showing it to them.
 */
function toggle() {
  const closing = revealed.value
  const btn = moreEl.value
  const anchor = btn?.getBoundingClientRect().top
  revealed.value = !revealed.value
  // A plate that is being HIDDEN cannot keep the majority: pointerleave never
  // fires for an element that vanished, so the flag would survive the collapse
  // and pin every remaining plate at a fifth — measured, the row came back even
  // with no majority at all. Closing hands the row back to its default.
  if (closing && active.value >= AT_REST) active.value = -1
  if (!closing || !btn || anchor === undefined) return
  nextTick(() => {
    const until = performance.now() + HIDE_HOLD_MS
    const hold = () => {
      const drift = btn.getBoundingClientRect().top - anchor
      if (drift) window.scrollBy({ top: drift, behavior: 'instant' })
      if (performance.now() < until) fx.raf(hold)
    }
    fx.raf(hold)
  })
}

/** Variants are generated per project (scripts/build-reference-images.mjs);
 *  the widths list lives with the item, so the srcset cannot claim a file
 *  that was never emitted. */
function srcset(id: string, ext: string, widths: number[]): string {
  return widths.map((w) => `/img/refs/${id}-${w}.${ext} ${w}w`).join(', ')
}

/** The majority plate's real measure at each breakpoint (see the wall block). */
const SIZES = '(min-width: 900px) 62vw, 92vw'

/**
 * Touch only: the first tap gives the plate the majority, the second follows it.
 * On a pointer device the pointer has already done the giving, so the tap goes
 * straight through.
 */
function onPick(e: MouseEvent, n: number) {
  if (hoverCapable.value || active.value === n) return
  e.preventDefault()
  active.value = n
}

/**
 * THE MAJORITY IS STATE, NOT :hover — and that is a bug fix, not a refactor.
 * A CSS :hover rule that RESIZES the thing it matches is a feedback loop: the
 * plate grows, the row re-lays-out under a cursor that never moved, the cursor
 * is now inside a different plate, that one grows, and the row swaps back. With
 * a 380ms transition on top it reads as the row flickering between two states
 * for as long as the pointer rests near a seam — which is exactly the glitch
 * reported.
 *
 * Driving it from pointerenter does not fix that by itself: the browser
 * synthesises those events too when the layout moves under a still cursor. What
 * separates the two cases is the CURSOR, so that is what is tested — a genuine
 * move arrives at new client coordinates, a layout-induced one arrives at
 * exactly the coordinates of the pick that caused it and is ignored. The
 * majority then belongs to the plate the reader actually pointed at, and stays
 * there until they move.
 */
let pickedX = -1
let pickedY = -1

function onPlateEnter(n: number, e: PointerEvent) {
  if (!hoverCapable.value) return
  if (e.clientX === pickedX && e.clientY === pickedY) return
  pickedX = e.clientX
  pickedY = e.clientY
  active.value = n
}

function onWallLeave() {
  if (!hoverCapable.value) return
  pickedX = -1
  pickedY = -1
  active.value = -1
}

onMounted(() => {
  hoverCapable.value = window.matchMedia('(hover: hover)').matches
  live.value = true
  wireParallax()
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section id="reference" ref="sectionEl" class="wkr">
    <!-- THE GROUND, and it is a layer rather than the section's own background
         so it can be MOVED. It carries the band's paper and its press screen;
         the section keeps only the flat colour underneath, which is what stops
         a seam ever showing at the edges the layer travels past. Static in the
         markup and aria-hidden: with JS off, or under reduced motion, this is
         simply the background the band always had, standing still. -->
    <div ref="groundEl" class="wkr__ground press press--light" aria-hidden="true"></div>
    <div class="container">
      <header class="wkr__head">
        <p class="wkr__kicker">{{ references.kicker }}</p>
        <h2 class="wkr__title">{{ references.title }}</h2>
        <p class="wkr__intro">{{ references.intro }}</p>
      </header>

      <div
        class="wkr__stage"
        :class="{ 'wkr__stage--collapsed': collapsed, 'wkr__stage--live': live }"
      >
        <ol
          class="wkr__wall"
          :aria-label="references.feedback.regionLabel"
          @pointerleave="onWallLeave"
        >
        <li
          v-for="(item, n) in items"
          :key="item.id"
          :id="n >= AT_REST ? `reference-${item.id}` : undefined"
          class="wkr__plate"
          :class="{ 'wkr__plate--front': active === n, 'wkr__plate--extra': n >= AT_REST }"
          @pointerenter="onPlateEnter(n, $event)"
        >
          <!-- THE PLATE'S GROUND. Not a picture hung inside a plate: the shot
               fills the plate absolutely, edge to edge, and the plate is
               whatever the row makes it — three fifths or one. z-index 0 rather
               than nothing, because an absolutely positioned child otherwise
               paints ABOVE its static siblings and the whole point is that it
               paints below. -->
          <picture class="wkr__shot">
            <source
              type="image/avif"
              :srcset="srcset(item.id, 'avif', item.image.widths)"
              :sizes="SIZES"
            />
            <source
              type="image/webp"
              :srcset="srcset(item.id, 'webp', item.image.widths)"
              :sizes="SIZES"
            />
            <img
              :src="`/img/refs/${item.id}-${item.image.widths[item.image.widths.length - 2]}.jpg`"
              :srcset="srcset(item.id, 'jpg', item.image.widths)"
              :sizes="SIZES"
              :width="item.image.width"
              :height="item.image.height"
              :alt="item.alt"
              loading="lazy"
              decoding="async"
            />
          </picture>

          <a
            class="wkr__face"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            @click="onPick($event, n)"
          >
            <span class="wkr__name">
              <span class="wkr__project">{{ item.name }}</span>
              <span class="wkr__sector">{{ item.sector }}</span>
              <span class="wkr__meta">
                <!-- The sheet number rides the meta row on phones, where the
                     belts run edge to edge and there is no margin to hang it
                     in; the desktop row carries its order in the widths. -->
                <span class="wkr__index" aria-hidden="true">00{{ n + 1 }}</span>
                <span class="wkr__url emisija">{{ item.urlLabel }}</span>
                <!-- The site's own palette. Butted into ONE hairline frame —
                     separated chips read as confetti, a framed strip reads as
                     the materials legend it is. Decorative, so hidden from the
                     accessibility tree. -->
                <span class="wkr__inks" aria-hidden="true">
                  <span
                    v-for="ink in item.inks"
                    :key="ink"
                    class="wkr__ink"
                    :style="{ background: ink }"
                  ></span>
                </span>
              </span>
            </span>
            <span class="visually-hidden">{{ references.newWindowNote }}</span>
          </a>
        </li>
        </ol>

        <!-- ONE CONTROL, TWO FACES — and it TOGGLES rather than disappearing
             once it has worked, so the way back is exactly where the way in
             was. A quiet ruled strip under the belts on phones; a thin sliver
             standing at the right end of the row on desktop, which is the edge
             the held-back projects open out of. Same button, same handler,
             never two controls that can disagree. -->
        <div v-if="live" ref="moreEl" class="wkr__more">
          <button
            type="button"
            class="wkr__more-btn"
            :aria-expanded="revealed"
            :aria-controls="extraIds"
            @click="toggle"
          >
            <span class="wkr__more-label">{{
              revealed ? references.feedback.lessLabel : references.feedback.moreLabel
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The band takes »Kje se ločimo« ground exactly (owner's call): the deeper
   beige AND its press screen, rather than the lighter sheet this band used to
   sit on.

   background-COLOR, never the shorthand. The shorthand resets background-image,
   and this scoped rule would silently win over the .press utility that supplies
   the screen — the texture would simply not appear. The same line in the
   differentiators section carries the same warning for the same reason. */
.wkr {
  background-color: var(--list-2);
  padding-block: var(--section-block);
  /* The ground hangs past both edges and the content stands on it. */
  position: relative;
  overflow: clip;
  --wkr-reach: 120px; /* PAIRED with GROUND_REACH in the script */
}

/* The moving ground. It repeats the band's colour so that the moment before a
   transform is ever written — and every moment under reduced motion — it is
   indistinguishable from the background it replaced.

   translate3d rather than translateY: the z keeps the layer on the compositor,
   which is what makes sliding a full-width dot lattice free. No will-change,
   deliberately — the transform promotes it while it is moving and lets it go
   again, rather than holding a band-sized layer in memory for the whole page. */
.wkr__ground {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--wkr-reach) * -1);
  bottom: calc(var(--wkr-reach) * -1);
  z-index: 0;
  background-color: var(--list-2);
  pointer-events: none;
}

/* Everything else stands on the ground rather than under it. */
.wkr > .container {
  position: relative;
  z-index: 1;
}

.wkr__head {
  margin-bottom: var(--v-block);
}

/* The inverted chip the wall's kicker uses — paper on ink, hairline framed. */
.wkr__kicker {
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

.wkr__title {
  margin-top: var(--space-4);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.wkr__intro {
  margin-top: var(--space-6);
  color: var(--grafit-2); /* 8.99:1 on paper */
  max-width: 58ch;
}

/* --- the plates ---------------------------------------------------------------
   Dark plates on the paper band: the machine-world ground, the picture as its
   surface, paper strokes and paper text on top. */
.wkr__wall {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
}

.wkr__plate {
  position: relative;
  background: var(--grafit);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wkr__shot,
.wkr__shot img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* The box runs from about 1.9:1 as the majority to about 0.6:1 as a fifth of
     the row, so the crop takes the sides in one state and the top and bottom in
     another. Anchored to the top, because the top of a landing page is the part
     that identifies it. */
  object-position: 50% 0%;
  display: block;
}

/* The face: the whole plate is the link, and it sits above the ground. */
.wkr__face {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.wkr__face:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: -6px;
}

/* THE TEXT'S GROUND — the plate's own ink, the poché move (solid graphite = the
   machine world), not a photo-app gradient.

   It rides the NAME BLOCK rather than the plate, and that is the one place this
   section had to depart from the wall below. The wall's scrim is a gradient
   rising a fixed fraction of the plate, which works because its text is two
   short lines. Here the block runs to four or five, and its height is set by
   the copy while the plate's height is set by the row — so at the 320 floor the
   block measured 151px of a 157px plate and its first line sat ABOVE the
   gradient's dense end, on the bare screenshot. A guarantee that holds at 1280
   and fails at 320 is not a guarantee. Tied to the block, the density is the
   same at every width by construction.

   WORST CASE IS MEASURED AGAINST WHITE, not against today's three screenshots:
   a ground that only holds because these shots happen to be mid-toned is one
   that breaks the day a project ships a white landing page — and two of these
   three already do. Composited over pure white, in-page against the real
   tokens: --color-paper 10.9:1, --papir-dim 7.2:1, at any plate size. */
.wkr__name {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--grafit) 92%, transparent);
}

/* The band's top edge, dissolved into the picture above it — the only part of
   the ground that is a gradient, and it carries no text. */
.wkr__name::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  height: 3rem;
  pointer-events: none;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--grafit) 92%, transparent),
    color-mix(in srgb, var(--grafit) 0%, transparent)
  );
}

/* The architect's mark, restated in the wall's own ink: two paper strokes that
   cross and OVERSHOOT each other at the corner where the words begin. A ruled
   corner stops, a drawn one runs past — the same gesture the ledger carried,
   in the material of the section it now sits in. */
.wkr__name::before {
  content: '';
  position: absolute;
  top: 6px;
  left: var(--space-4);
  width: 16px;
  height: 16px;
  pointer-events: none;
  background:
    linear-gradient(rgb(245 242 235 / 0.5), rgb(245 242 235 / 0.5)) left 0 top 5px / 16px
      1px no-repeat,
    linear-gradient(rgb(245 242 235 / 0.5), rgb(245 242 235 / 0.5)) left 5px top 0 / 1px
      16px no-repeat;
}

.wkr__project {
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-paper);
}

.wkr__sector {
  color: var(--papir-dim);
  font-size: 0.9375rem;
  line-height: 1.35;
}

.wkr__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin-top: var(--space-2);
}

.wkr__url {
  color: var(--papir-dim);
  border-bottom: var(--divider-width) solid currentColor;
  padding-bottom: 2px;
}

.wkr__inks {
  flex: 0 0 auto;
  display: flex;
  border: var(--divider-width) solid var(--crta-na-temnem);
}

.wkr__ink {
  width: 11px;
  height: 11px;
}

/* The sheet number, in the margin on its leader — phones only (see the datum
   block below), matching the wall's own index exactly. */
.wkr__index {
  display: none;
}

/* --- the set, and the control that completes it ----------------------------------
   The stage exists so the control can be positioned against the row on desktop
   without being a member of the list — it is not a project, and putting a button
   inside an <ol> of projects would say it was. */
.wkr__stage {
  --more-w: 3.25rem;

  position: relative;
}

.wkr__more-btn {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

/* --- phones: three belts ---------------------------------------------------------
   THE BOLDEST THING AVAILABLE IS THE FULL MEASURE. Three bands of work running
   edge to edge, one under the other, with the words on the paper beneath each —
   no datum, no indents, no overlap, no keyline, and no dark band under the
   picture. Everything that made the phone stack read as drawings laid on a table
   is gone on purpose: at this width the belt IS the statement, and any inset
   around it is the layout apologising for itself.

   The words move to the paper, so every ink flips with them — graphite on beige
   instead of paper on graphite. That flip is the whole reason this block is long:
   a colour left behind would be invisible rather than merely wrong. */
@media (max-width: 899.98px) {
  .wkr__wall {
    /* Out through the container's own gutters. The section keeps its measure
       for the heading; only the belts break it. */
    gap: var(--space-8);
    margin-inline: calc(var(--gutter) * -1);
  }

  /* The plate is no longer a dark frame with words printed into it, so it stops
     carrying a fill at all — the belt brings its own. */
  .wkr__plate {
    background: none;
  }

  /* The shot returns to the FLOW: it is the belt itself now, not a ground behind
     a face. 2:1 is the shots' own ratio — all three sources are exactly that —
     so a full-width belt crops nothing whatsoever. The graphite behind it is
     what shows while the image decodes. */
  .wkr__shot,
  .wkr__shot img {
    position: static;
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 1;
    background: var(--grafit);
  }

  .wkr__face {
    display: block;
  }

  /* The ring rides the BELT, not the whole link. The link now spans two grounds
     and no single accent clears 3:1 on both — measured, against the real tokens:
     --rez-na-temnem is 4.74:1 on the belt but 2.67:1 on paper, and --rez is the
     exact reverse at 2.58:1 and 5.37:1. A ring drawn across both would fail on
     one half of its own length, so it stays where it passes. */
  .wkr__face:focus-visible {
    outline: none;
  }

  .wkr__face:focus-visible .wkr__shot img {
    outline: 2px solid var(--rez-na-temnem);
    outline-offset: -4px;
  }

  /* The words, on paper. The measure comes back here — the belt is full bleed,
     the reading is not. */
  .wkr__name {
    background: none;
    padding: var(--space-3) var(--gutter) 0;
  }

  /* No band left to dissolve into the picture. */
  .wkr__name::after {
    display: none;
  }

  /* The corner mark flips to a drawn stroke on paper. Same gesture, same
     overshoot, the other ink. */
  .wkr__name::before {
    top: 0;
    left: var(--gutter);
    background:
      linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 0 top 5px / 16px 1px
        no-repeat,
      linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 5px top 0 / 1px 16px
        no-repeat;
  }

  .wkr__project {
    color: var(--grafit); /* 13.9:1 on the beige */
    font-size: 1.375rem;
  }

  .wkr__sector {
    color: var(--grafit-2); /* 8.5:1 on the beige */
  }

  .wkr__url {
    color: var(--grafit-2);
  }

  .wkr__inks {
    border-color: var(--mreza-strong);
  }

  .wkr__index {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--type-data-size);
    letter-spacing: var(--type-data-ls);
    color: var(--grafit-2);
  }

  /* The set stops after the third belt. Five full-width belts is a long scroll
     before anything else on the page arrives, and the reader can have the rest
     for one press.

     THEY FOLD RATHER THAN VANISH. `display: none` cannot animate, so the two
     held-back belts collapse on max-height instead — with the wall's own gap
     cancelled by a negative margin, or a hidden item would still leave its
     32px behind. max-height is the one honest way to transition to a height
     nobody can know in advance, and the ceiling here is MEASURED rather than
     picked: a belt is a 2:1 shot at the full viewport width plus its name
     block, and that block measures 112px at 390 and 100px at 320 — so 50vw +
     10rem clears the tallest of them with room for a project name that wraps
     to a second line, and overshoots the real height by 16% at 390 and 22% at
     320. The overshoot spends the tail of an ease-out curve, where almost no
     travel is left; 14rem was the first guess and wasted a third of it. The
     opacity runs shorter and leads so the belts are gone before the last of
     the height is.

     visibility is what keeps a closed belt out of the tab order — it cannot be
     animated, so it is DELAYED by the collapse's own duration on the way out
     and immediate on the way in. */
  .wkr__plate--extra {
    overflow: hidden;
    max-height: calc(50vw + 10rem);
    opacity: 1;
    visibility: visible;
    transition:
      max-height 340ms var(--ease-spring),
      margin-top 340ms var(--ease-spring),
      opacity 220ms var(--ease-spring) 60ms,
      visibility 0s;
  }

  .wkr__stage--collapsed .wkr__plate--extra {
    max-height: 0;
    margin-top: calc(var(--space-8) * -1);
    opacity: 0;
    visibility: hidden;
    transition:
      max-height 340ms var(--ease-spring),
      margin-top 340ms var(--ease-spring),
      opacity 160ms var(--ease-spring),
      visibility 0s 340ms;
  }

  /* A MARK, NOT A BAR. It was a full-measure box with a hairline all the way
     round, which made it the widest single element in the band and read as the
     section's conclusion rather than as a way to see more of it. What is left
     is a small centred label on a rule of its own — the same secondary
     graphite, a step further down in size, with the section's press screen
     running straight through it because it still carries no fill.

     THE HIT TARGET DOES NOT SHRINK WITH IT. 44px of height and 3rem of width
     stay, bought with padding rather than border, so the thing that got quieter
     is the ink and not the target. Subtlety is about weight, never about being
     hard to hit. */
  .wkr__more {
    margin-top: var(--space-5);
    display: flex;
    justify-content: center;
  }

  .wkr__more-btn {
    min-height: 44px;
    min-width: 3rem;
    padding: var(--space-2) var(--space-4);
    background: none;
    border: 0;
    border-bottom: var(--divider-width) solid var(--mreza-strong);
    color: var(--grafit-2); /* 8.2:1 on the band */
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
  }

  .wkr__more-btn:focus-visible {
    outline: 2px solid var(--rez);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    .wkr__more-btn:hover {
      border-bottom-color: var(--grafit);
      color: var(--grafit);
    }
  }
}

/* --- desktop: the wall ---------------------------------------------------------
   THE ROW IS NEVER EVEN. The majority plate holds three fifths and the other two
   a fifth each — a fifth more than a half, which is what makes it read as the
   one being looked at rather than merely the larger one. At rest that majority
   belongs to the FIRST project; pointing at any plate hands it the majority and
   returns the others to a fifth, so the same shape slides along the row.

   The height is the wall's own gesture at this section's scale: 22rem makes the
   majority plate about 1.9:1, which is very near the shots' native 2:1, so the
   plate being looked at crops almost nothing. */
@media (min-width: 900px) {
  /* HEIGHT, NOT MIN-HEIGHT, and it is the second half of the glitch. With a
     minimum the row was free to grow to its tallest CONTENT — and the content
     that grows is the name block, which wraps differently at every width a
     plate can take. So pointing at a plate changed three widths, which changed
     how many lines two name blocks wrapped to, which changed the height of
     every strip in the row. A fixed height decouples the two: the strips are
     22rem whatever the widths do, which is what was asked for and also one less
     thing for a resize to feed back into. 22rem makes the majority plate about
     1.9:1, very near the shots' native 2:1, so the plate being looked at crops
     almost nothing. */
  .wkr__wall {
    flex-direction: row;
    gap: var(--space-3);
    align-items: stretch;
    height: 22rem;
  }

  /* The row can no longer grow to fit a name block, so the plate takes
     responsibility for its own overflow. Nothing is ever actually clipped at
     the widths this row produces — measured — but a fixed height with no
     containment is a promise waiting to be broken by a longer project name. */
  .wkr__plate {
    overflow: hidden;
  }

  /* THE PAINTED ORDER IS NOT THE CONTENT ORDER. The majority sits third from the
     left, with the projects held back arriving to its right — the edge the
     sliver stands at. The markup keeps the projects in the order the content
     module lists them, so the tab order and what a screen reader hears follow
     the content rather than the picture. */
  .wkr__plate:nth-child(1) {
    order: 3;
  }
  .wkr__plate:nth-child(2) {
    order: 2;
  }
  .wkr__plate:nth-child(3) {
    order: 1;
  }
  .wkr__plate:nth-child(4) {
    order: 4;
  }
  .wkr__plate:nth-child(5) {
    order: 5;
  }

  .wkr__plate {
    flex: 1 1 0;
    transition: flex-grow 280ms var(--ease-spring);
  }

  .wkr__plate:first-of-type {
    flex-grow: 3;
  }

  /* HELD BACK, NOT REMOVED. The two sit in the row at zero width, so revealing
     them is a flex-grow transition from 0 to 1 — they open out of the right-hand
     edge rather than appearing. The negative margin cancels the gap a zero-width
     item would still be given, so the collapsed row measures the same as a row
     of three. */
  .wkr__stage--collapsed .wkr__plate--extra {
    flex: 0 0 0;
    margin-left: calc(var(--space-3) * -1);
    overflow: hidden;
  }

  /* Room for the sliver. Reserved whenever the control exists — not only while
     the row is short — so opening and closing the set never shifts the row's
     right edge by the sliver's own width. */
  .wkr__stage--live .wkr__wall {
    padding-right: calc(var(--more-w) + var(--space-3));
  }

  /* THE SLIVER. A thin dark edge at the right of the row, in the plates' own
     graphite, reading bottom-to-top the way the wall's spines do. It stands at
     the edge the held-back work opens out of, and it stays there to close it
     again. */
  .wkr__more {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--more-w);
  }

  .wkr__more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: var(--space-3) 0;
    background: var(--grafit);
    border: 0;
    color: var(--color-paper); /* 13.9:1 on the graphite */
  }

  .wkr__more-label {
    writing-mode: vertical-rl;
    white-space: nowrap;
  }

  .wkr__more-btn:focus-visible {
    outline: 2px solid var(--rez-na-temnem); /* 4.74:1 on the graphite */
    outline-offset: -6px;
  }

  @media (hover: hover) {
    .wkr__more-btn:hover {
      color: var(--rez-na-temnem);
    }
  }

  /* THE MAJORITY, and it is now ONE mechanism for both input kinds: --front is
     set by a tap on touch and by the pointer on everything else (see the script
     — the :hover rules that used to do this on pointer devices were a resize
     feedback loop and are gone).

     THE SPECIFICITY HERE IS LOAD-BEARING and it was wrong. :has() takes the
     specificity of its argument, so the first rule is 0,3,0 — which quietly
     outranked the 0,2,0 that was supposed to hand the majority to the front
     plate. Measured before the fix: tapping a plate on touch set the class and
     changed nothing, because every plate including the tapped one was pinned at
     flex-grow 1. The second rule now carries 0,3,0 of its own and wins on
     order. */
  .wkr__wall:has(.wkr__plate--front) .wkr__plate {
    flex-grow: 1;
  }

  .wkr__wall .wkr__plate.wkr__plate--front {
    flex-grow: 3;
  }

  /* AND THE HELD-BACK WORK STAYS HELD BACK. Same trap, other direction: the
     collapsed rule above is 0,2,0, so the 0,3,0 rule that pins the row at
     flex-grow 1 was opening the two extra plates the moment ANY plate took the
     majority — the reported "hovering uncovers the other two projects". The
     doubled class takes this to 0,3,0 and its place at the end of the block
     wins the tie, so the only thing that can open them is the control. */
  .wkr__stage--collapsed .wkr__plate--extra.wkr__plate--extra {
    flex: 0 0 0;
    margin-left: calc(var(--space-3) * -1);
    overflow: hidden;
  }

  /* A fifth of the row is a narrow plate, so the name block loses its indent
     and the sector its second line rather than the words being crushed. Nothing
     is hidden: every string stays rendered and legible at every width. */
  .wkr__name {
    padding: var(--space-3);
  }

  .wkr__name::before {
    left: var(--space-3);
  }
}
</style>
