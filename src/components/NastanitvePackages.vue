<script setup lang="ts">
/**
 * The three packages as A TERRACE OF ROW HOUSES (vrstne hiše) — three attached
 * houses left to right, EACH A LITTLE BIGGER AND MORE COMPLEX than the last:
 * Osnovna a plain gable, Napredna taller with a chimney, Profi tallest with
 * chimney and dormer. Each house holds its own tier. Exactly one stands open
 * (Osnovna by default): its facade texture lifts, the red cut lines run down
 * its party walls — the house shown in SECTION, interior exposed — and its
 * schedule prints inside. Choosing another house minimizes the open one: the
 * street re-divides (an all-fr grid-template-columns transition; fr↔fr is the
 * interpolable form — px↔fr snaps), the new interior unfolds, the old one
 * folds shut.
 *
 * PHONES keep the stacked building, per the owner: one improved roof on top,
 * then Osnovna → Napredna → Profi top-to-bottom (DOM order — the previous
 * column-reverse is gone), ground and earth below. Same exclusive behaviour.
 * Textures ascend with the tier everywhere: sparse lines → 45° hatch → full
 * cross-hatch (least to most textured, left to right and top to bottom).
 *
 * SCROLL HONESTY: an exclusive switch collapses content above or beside the
 * click, so every selection runs the anchor-hold — the clicked control's
 * viewport drift is measured per frame for the transition's length and taken
 * back out of the scroll (behavior: 'instant', per the global-smooth trap).
 * Under reduced motion one corrective pass after the instant relayout does
 * the whole job.
 *
 * SEMANTICS: a tablist of three houses (exactly one active is what tabs
 * mean). Roving tabindex; ArrowRight/Down next, ArrowLeft/Up previous (the
 * street is DOM-ordered in both layouts), Home/End; focus follows selection.
 * Interiors are tabpanels labelled by their tabs; closed interiors are inert.
 *
 * CONTRACTS: with JS off all three houses stand OPEN side by side (grid
 * defaults to three equal tracks; the collapsed state exists only live).
 * Reduced motion gets the drawn street instantly, switching without motion.
 * Static HTML carries every string; tier ids stay machine identifiers.
 * NO PRICES (owner's call).
 */
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { packages, type NastInclude, type NastEmphasis, type NastSeo } from '@/content/nastanitve'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const isString = (i: NastInclude): i is string => typeof i === 'string'
const isEmphasis = (i: NastInclude): i is NastEmphasis =>
  typeof i === 'object' && 'strong' in i
const isSeo = (i: NastInclude): i is NastSeo => typeof i === 'object' && 'points' in i

const fx = createFx()
const live = ref(false)
const drawn = ref(false)
const street = ref<HTMLElement | null>(null)

/** The open house. Osnovna by default, per the owner. */
const open = ref(0)

/** How much of the street must be visible before it draws itself. */
const DRAW_VISIBLE = 0.25
/** Safety net: if the observer never delivers, the street must still exist —
 *  disconnect FIRST, then force-draw. */
const DRAW_NET_MS = 4000
/** The street re-division + unfold length; the anchor-hold runs this + a
 *  beat. PAIRS with the 420ms transitions in the style block. */
const SWITCH_MS = 420
const HOLD_EXTRA_MS = 140

function houseAt(i: number): HTMLElement | undefined {
  return street.value?.querySelectorAll<HTMLElement>('.aptp__tab')[i]
}

/**
 * Hold the clicked control still through the relayout: each frame, whatever
 * the collapse/expansion moved it by is taken back out of the scroll. One
 * pass suffices under reduced motion (the relayout is instant there).
 */
let holdRaf = 0
function holdControl(el: HTMLElement) {
  if (holdRaf) cancelAnimationFrame(holdRaf)
  const anchor = el.getBoundingClientRect().top
  const correct = () => {
    const drift = el.getBoundingClientRect().top - anchor
    if (Math.abs(drift) > 0.5) window.scrollBy({ top: drift, behavior: 'instant' as ScrollBehavior })
  }
  if (prefersReducedMotion()) {
    nextTick(correct)
    return
  }
  const t0 = performance.now()
  const step = () => {
    holdRaf = 0
    correct()
    if (performance.now() - t0 < SWITCH_MS + HOLD_EXTRA_MS) holdRaf = fx.raf(step)
  }
  holdRaf = fx.raf(step)
}

function select(n: number) {
  if (n === open.value) return
  const btn = houseAt(n)
  open.value = n
  if (btn) holdControl(btn)
}

/** The street is DOM-ordered in both layouts (left→right on desktop, top→
 *  bottom on phones), so one arrow mapping serves both axes. */
function onStreetKeys(e: KeyboardEvent) {
  const count = packages.items.length
  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(open.value + 1, count - 1)
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(open.value - 1, 0)
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = count - 1
  if (next < 0 || next === open.value) return
  e.preventDefault()
  select(next)
  nextTick(() => houseAt(next)?.focus())
}

onMounted(() => {
  live.value = true

  // Reduced motion: the drawn street IS the resting design — no arrival act.
  // No IntersectionObserver: never hide what cannot be un-hidden.
  if (prefersReducedMotion() || !('IntersectionObserver' in window) || !street.value) {
    drawn.value = true
    return
  }
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.disconnect()
        drawn.value = true
      }
    },
    { threshold: DRAW_VISIBLE },
  )
  io.observe(street.value)
  fx.setTimeout(() => {
    if (drawn.value) return
    io.disconnect()
    drawn.value = true
  }, DRAW_NET_MS)
})

onUnmounted(() => {
  if (holdRaf) cancelAnimationFrame(holdRaf)
  fx.dispose()
})
</script>

<template>
  <section
    id="paketi"
    class="aptp press press--light"
    :class="[`aptp--open-${open}`, { 'aptp--live': live, 'aptp--drawn': drawn }]"
  >
    <div class="container">
      <p class="kicker aptp__kicker">{{ packages.kicker }}</p>
      <h2 class="aptp__title">{{ packages.title }}</h2>

      <div class="aptp__terrace">
        <!-- PHONES ONLY: the one building keeps one roof — the improved gable
             with eaves, chimney and dormer — over the whole stack. -->
        <svg
          class="aptp__roof aptp__roof--building"
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path class="aptp__roofpath" d="M2 58 L100 6 L198 58" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
          <path class="aptp__roofpath" d="M140 32 L140 10 L154 10 L154 25" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
          <path class="aptp__roofpath" d="M52 46 L66 33 L80 46" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        </svg>

        <ul
          ref="street"
          class="aptp__street"
          :role="live ? 'tablist' : undefined"
          :aria-label="live ? packages.feedback.streetLabel : undefined"
          @keydown="live && onStreetKeys($event)"
        >
          <li
            v-for="(p, n) in packages.items"
            :key="p.id"
            class="aptp__house"
            :class="[`aptp__house--${p.id}`, { 'aptp__house--open': !live || open === n }]"
            :style="{ '--n': n }"
          >
            <!-- Each house's own roof (desktop street): complexity ascends —
                 plain gable, +chimney, +chimney and dormer. -->
            <svg
              v-if="p.id === 'basic'"
              class="aptp__roof aptp__roof--house"
              viewBox="0 0 200 34"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path class="aptp__roofpath" d="M2 32 L100 6 L198 32" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </svg>
            <svg
              v-else-if="p.id === 'advanced'"
              class="aptp__roof aptp__roof--house"
              viewBox="0 0 200 46"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path class="aptp__roofpath" d="M2 44 L100 6 L198 44" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
              <path class="aptp__roofpath" d="M138 26 L138 9 L151 9 L151 21" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </svg>
            <svg
              v-else
              class="aptp__roof aptp__roof--house"
              viewBox="0 0 200 58"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path class="aptp__roofpath" d="M2 56 L100 5 L198 56" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
              <path class="aptp__roofpath" d="M140 30 L140 9 L154 9 L154 23" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
              <path class="aptp__roofpath" d="M50 44 L64 31 L78 44" pathLength="100" fill="none" stroke="var(--grafit)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </svg>

            <div class="aptp__walls">
              <!-- The facade texture: the tier's material, densest on Profi.
                   Lifts when the house is cut open. -->
              <span class="aptp__facade" aria-hidden="true"></span>

              <!-- The cut: red lines with square ticks — down the party walls
                   on the desktop street, across the slab lines on the phone
                   stack. Present while the house is open. -->
              <span class="aptp__plane aptp__plane--a" aria-hidden="true"></span>
              <span class="aptp__plane aptp__plane--b" aria-hidden="true"></span>

              <div class="aptp__room">
                <h3 class="aptp__name">
                  <button
                    v-if="live"
                    :id="`tab-${p.id}`"
                    type="button"
                    class="aptp__tab"
                    role="tab"
                    :aria-selected="open === n ? 'true' : 'false'"
                    :aria-controls="`room-${p.id}`"
                    :tabindex="open === n ? 0 : -1"
                    @click="select(n)"
                  >
                    <span class="aptp__tab-name">{{ p.name }}</span>
                  </button>
                  <span v-else :id="`tab-${p.id}`" class="aptp__tab">
                    <span class="aptp__tab-name">{{ p.name }}</span>
                  </span>
                </h3>

                <p class="aptp__summary">{{ p.summary }}</p>

                <div
                  :id="`room-${p.id}`"
                  class="aptp__body"
                  :role="live ? 'tabpanel' : undefined"
                  :aria-labelledby="live ? `tab-${p.id}` : undefined"
                  :inert="live && open !== n ? true : undefined"
                >
                  <div class="aptp__body-in">
                    <ul class="aptp__includes">
                      <li
                        v-for="(inc, i) in p.includes"
                        :key="i"
                        class="aptp__include"
                        :class="{ 'aptp__include--seo': isSeo(inc) }"
                      >
                        <template v-if="isString(inc)">{{ inc }}</template>
                        <template v-else-if="isEmphasis(inc)">{{ inc.lead }}<strong>{{ inc.strong }}</strong>{{ inc.tail }}</template>
                        <details v-else class="aptp__seo">
                          <summary class="aptp__seo-summary">{{ inc.summary }}</summary>
                          <div class="aptp__seo-panel">
                            <p class="aptp__seo-intro">{{ inc.intro }}</p>
                            <ul class="aptp__seo-list">
                              <li v-for="pt in inc.points" :key="pt" class="aptp__seo-point">{{ pt }}</li>
                            </ul>
                          </div>
                        </details>
                      </li>
                    </ul>
                    <p v-if="p.footnote" class="aptp__foot">{{ p.footnote }}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- The ground the terrace stands on, running past the end walls,
             and the below-grade poché. -->
        <span class="aptp__groundline" aria-hidden="true"></span>
        <span class="aptp__earth" aria-hidden="true"></span>
      </div>

      <p class="aptp__cta-wrap">
        <a :href="`#${packages.ctaTarget}`" class="aptp__cta">{{ packages.ctaLabel }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.aptp {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.aptp__kicker {
  color: var(--grafit-2);
}

.aptp__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-12);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

/* --- the street -------------------------------------------------------------
   Terraced: gap 0, party walls shared. Houses stand on one ground line
   (align-items: end), each taller than the last. */
.aptp__terrace {
  max-width: 980px;
}

.aptp__street {
  display: grid;
  /* JS-off: three open houses side by side. The live division below. */
  grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The live street: one wide house, two narrow. ALL tracks in fr — the only
   form grid-template-columns can interpolate; px↔fr snaps. Closed widths
   ascend with the tier (each house a little bigger). PAIRS with the
   interior width shares below. */
@media (min-width: 810px) {
  .aptp--live .aptp__street {
    transition: grid-template-columns 420ms var(--ease-out);
  }
  .aptp--live.aptp--open-0 .aptp__street {
    grid-template-columns: 1fr 0.22fr 0.27fr;
  }
  .aptp--live.aptp--open-1 .aptp__street {
    grid-template-columns: 0.18fr 1fr 0.27fr;
  }
  .aptp--live.aptp--open-2 .aptp__street {
    grid-template-columns: 0.18fr 0.22fr 1fr;
  }
}

.aptp__house {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Party walls: every house draws its left wall; the last draws its right.
   The heaviest lines in the drawing. */
.aptp__walls {
  position: relative;
  flex: 1 1 auto;
  border-left: 1.5px solid var(--grafit);
  display: flex;
  flex-direction: column;
}
.aptp__house:last-child .aptp__walls {
  border-right: 1.5px solid var(--grafit);
}

/* Ascending facades: each closed house a little taller than the previous.
   The open house grows to its content. */
@media (min-width: 810px) {
  .aptp__house--basic .aptp__walls {
    min-height: 240px;
  }
  .aptp__house--advanced .aptp__walls {
    min-height: 288px;
  }
  .aptp__house--profi .aptp__walls {
    min-height: 336px;
  }
}

/* The open house takes the quiet red wash — the "opened ground" token. */
.aptp__walls {
  transition: background-color 300ms var(--ease-out);
}
.aptp__house--open .aptp__walls {
  background-color: var(--rez-vodni);
}

/* --- the facade textures -----------------------------------------------------
   The tier drawn as density, least to most: sparse lines, 45° section hatch,
   full cross-hatch. Line work by gradient (the .press technique). The open
   house's facade lifts — the interior is paper. */
.aptp__facade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.4;
  transition: opacity 300ms var(--ease-out);
}

.aptp__house--basic .aptp__facade {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 10px,
    var(--grafit-2) 10px 11px
  );
}
.aptp__house--advanced .aptp__facade {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 5px,
    var(--grafit-2) 5px 6px
  );
}
.aptp__house--profi .aptp__facade {
  background-image:
    repeating-linear-gradient(45deg, transparent 0 5px, var(--grafit-2) 5px 6px),
    repeating-linear-gradient(-45deg, transparent 0 5px, var(--grafit-2) 5px 6px);
}

.aptp__house--open .aptp__facade {
  opacity: 0;
}

@media (hover: hover) {
  .aptp__house:not(.aptp__house--open) .aptp__walls:hover .aptp__facade {
    opacity: 0.62;
  }
}

/* --- the cut ------------------------------------------------------------------
   Red rules with square end ticks on the OPEN house. Desktop: down the party
   walls (the section runs vertically through the terrace). Phone: across the
   slab lines. They draw in when the house opens. */
.aptp__plane {
  position: absolute;
  background: var(--rez);
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 240ms var(--ease-out),
    transform 380ms var(--ease-out);
}
.aptp__plane::before,
.aptp__plane::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--rez);
}
.aptp__house--open .aptp__plane {
  opacity: 1;
}

@media (min-width: 810px) {
  .aptp__plane {
    top: -6px;
    bottom: -6px;
    width: 2px;
    transform: scaleY(0);
    transform-origin: center top;
  }
  .aptp__plane--a {
    left: -1.75px;
  }
  .aptp__plane--b {
    right: -1.75px;
  }
  .aptp__plane::before {
    top: 0;
    left: -2px;
  }
  .aptp__plane::after {
    bottom: 0;
    left: -2px;
  }
  .aptp__house--open .aptp__plane {
    transform: scaleY(1);
  }
}

/* --- the room -------------------------------------------------------------- */
.aptp__room {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  padding: var(--space-5);
}

.aptp__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

/* The tab is the whole house: the button stretches over the facade, so a
   click anywhere on a closed house opens it. Its visible face is the name
   on a paper chip (fills break around lettering). */
.aptp__tab {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

button.aptp__tab {
  cursor: pointer;
}

button.aptp__tab::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* The open house's tab is just its heading — the stretch target retires so
   the interior (details, links) is freely clickable. */
.aptp__house--open button.aptp__tab {
  cursor: default;
}
.aptp__house--open button.aptp__tab::after {
  content: none;
}

button.aptp__tab:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

.aptp__tab-name {
  position: relative;
  z-index: 1;
  padding: 3px 10px;
  margin-left: -10px;
  background: var(--list);
  transition: background-color 300ms var(--ease-out);
}
.aptp__house--open .aptp__tab-name {
  background: transparent;
}

.aptp__summary {
  margin: var(--space-2) 0 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--grafit);
  max-width: 58ch;
}

/* Closed houses on the street show the name alone — a 0.2fr column holds no
   paragraph. Phones keep summaries on every floor. */
@media (min-width: 810px) {
  .aptp--live .aptp__house:not(.aptp__house--open) .aptp__summary {
    display: none;
  }
}

/* --- the unfolding interior ---------------------------------------------------
   Collapsed state exists ONLY live. The grid-rows transition needs no
   measurement; the inner wrapper clips. Closed interiors are inert. On the
   street the interior is laid at its FINAL width during the reveal (the
   share of the street each open house takes — pairs with the fr divisions
   above), so text never reflows mid-transition. */
.aptp__body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 420ms var(--ease-out);
}

.aptp--live .aptp__body[inert] {
  grid-template-rows: 0fr;
}

.aptp__body-in {
  overflow: hidden;
  min-height: 0;
}

@media (min-width: 810px) {
  .aptp--live.aptp--open-0 .aptp__house--basic .aptp__body-in {
    width: calc((min(980px, 100vw - 2 * var(--gutter)) - 3px) * 0.671);
  }
  .aptp--live.aptp--open-1 .aptp__house--advanced .aptp__body-in {
    width: calc((min(980px, 100vw - 2 * var(--gutter)) - 3px) * 0.69);
  }
  .aptp--live.aptp--open-2 .aptp__house--profi .aptp__body-in {
    width: calc((min(980px, 100vw - 2 * var(--gutter)) - 3px) * 0.714);
  }
  .aptp__body-in {
    max-width: 62ch;
  }
}

.aptp__includes {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
}

/* Drawn marker, never a dingbat or an emoji bullet. */
.aptp__include {
  position: relative;
  padding-left: var(--space-6);
  margin-top: var(--space-3);
  line-height: 1.5;
  color: var(--grafit-2);
}

.aptp__include::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 12px;
  height: 1px;
  background: var(--mreza-strong);
}

.aptp__include strong {
  font-weight: 600;
  color: var(--grafit);
}

.aptp__seo-summary {
  position: relative;
  padding-right: var(--space-8);
  cursor: pointer;
  list-style: none;
  color: var(--grafit);
}

.aptp__seo-summary::-webkit-details-marker {
  display: none;
}

.aptp__seo-summary::after,
.aptp__seo-summary::before {
  content: '';
  position: absolute;
  background: var(--grafit-2);
}

.aptp__seo-summary::after {
  right: 0;
  top: 0.7em;
  width: 12px;
  height: 1.5px;
}

.aptp__seo-summary::before {
  right: 5.25px;
  top: calc(0.7em - 5.25px);
  width: 1.5px;
  height: 12px;
  transition: opacity 200ms var(--ease-out);
}

.aptp__seo[open] .aptp__seo-summary::before {
  opacity: 0;
}

@media (hover: hover) {
  .aptp__seo-summary:hover::after,
  .aptp__seo-summary:hover::before {
    background: var(--grafit);
  }
}

.aptp__seo-summary:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

.aptp__seo-panel {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--mreza);
}

.aptp__seo-intro {
  max-width: 60ch;
  margin: 0;
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptp__seo-list {
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}

.aptp__seo-point {
  position: relative;
  max-width: 60ch;
  padding-left: var(--space-5);
  margin-top: var(--space-3);
  font-size: var(--fs-annot);
  line-height: 1.5;
  color: var(--grafit-2);
}

.aptp__seo-point::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 8px;
  height: 1px;
  background: var(--mreza-strong);
}

@media (prefers-reduced-motion: no-preference) {
  .aptp__seo[open] .aptp__seo-panel {
    animation: aptp-seo-reveal 300ms var(--ease-out);
  }
}

@keyframes aptp-seo-reveal {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.aptp__foot {
  max-width: 62ch;
  margin-top: var(--space-5);
  margin-bottom: 0;
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

/* --- roofs ------------------------------------------------------------------- */
.aptp__roof {
  display: block;
  width: 100%;
  margin-bottom: -1px;
  flex: 0 0 auto;
}
.aptp__roof--house {
  height: clamp(26px, 4.5vw, 44px);
}
.aptp__house--advanced .aptp__roof--house {
  height: clamp(34px, 5.5vw, 56px);
}
.aptp__house--profi .aptp__roof--house {
  height: clamp(42px, 6.5vw, 68px);
}
/* The building roof exists for the phone stack alone. */
.aptp__roof--building {
  display: none;
}

/* --- ground and earth ---------------------------------------------------------- */
.aptp__groundline {
  display: block;
  width: 103%;
  margin-left: -1.5%;
  height: 2px;
  background: var(--grafit);
}
.aptp__earth {
  display: block;
  width: 103%;
  margin-left: -1.5%;
  height: 16px;
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 5px,
    var(--grafit-2) 5px 6px
  );
  opacity: 0.45;
}

/* --- the arrival act -----------------------------------------------------------
   Hidden states exist ONLY once live (never in static HTML); every keyframe
   ends on the element's stylesheet rest. */
.aptp--live:not(.aptp--drawn) .aptp__roofpath {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}
.aptp--live:not(.aptp--drawn) .aptp__facade,
.aptp--live:not(.aptp--drawn) .aptp__groundline,
.aptp--live:not(.aptp--drawn) .aptp__earth {
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .aptp--drawn .aptp__roofpath {
    stroke-dasharray: 100;
    animation: aptp-roof 700ms var(--ease-out) both;
  }
  .aptp--drawn .aptp__groundline {
    animation: aptp-rule 600ms var(--ease-out) both;
    transform-origin: left center;
  }
  .aptp--drawn .aptp__earth {
    animation: aptp-earth 500ms var(--ease-out) 350ms both;
  }
  /* Facades hatch in along the street, left to right. */
  .aptp--drawn .aptp__facade {
    animation: aptp-facade 450ms var(--ease-out) both;
    animation-delay: calc(220ms + var(--n, 0) * 140ms);
  }
}

@keyframes aptp-roof {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes aptp-rule {
  from {
    opacity: 1;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}
/* From-only keyframes: these elements rest below opacity 1 (facade .4 or 0
   when open, earth .45), so the cascade's resting value is the landing. */
@keyframes aptp-facade {
  from {
    opacity: 0;
  }
}
@keyframes aptp-earth {
  from {
    opacity: 0;
  }
}

.aptp__cta-wrap {
  margin-top: var(--space-12);
  margin-bottom: 0;
}

.aptp__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white);
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid var(--rez);
  transition:
    background-color 200ms var(--ease-out),
    color 200ms var(--ease-out);
}

@media (hover: hover) {
  .aptp__cta:hover {
    background-color: transparent;
    color: var(--rez);
  }
}

.aptp__cta:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

/* --- the phone stack -----------------------------------------------------------
   One building, one improved roof, storeys top-to-bottom in READING order —
   Osnovna first, per the owner — with the texture densifying downward.
   Slab lines between storeys; ground and earth close the bottom. */
@media (max-width: 809px) {
  .aptp__street {
    grid-template-columns: minmax(0, 1fr);
  }

  .aptp__roof--building {
    display: block;
    height: clamp(44px, 13vw, 60px);
  }
  .aptp__roof--house {
    display: none;
  }

  .aptp__house + .aptp__house .aptp__walls {
    border-top: 1px solid var(--mreza-strong);
  }
  .aptp__walls {
    border-right: 1.5px solid var(--grafit);
  }

  /* The facade texture narrows to the material strip so text never sits on
     hatch — the stacked structure kept as it was. */
  .aptp__facade {
    inset: 0 auto 0 0;
    width: clamp(36px, 9vw, 48px);
    border-right: 1px solid var(--mreza-strong);
    opacity: 0.55;
  }
  .aptp__house--open .aptp__facade {
    opacity: 0.95;
  }

  .aptp__room {
    margin-left: clamp(36px, 9vw, 48px);
    padding: var(--space-4) var(--space-4) var(--space-5);
  }

  /* The cut runs across the slab lines here. */
  .aptp__plane {
    left: -8px;
    right: -8px;
    height: 2px;
    transform: scaleX(0);
    transform-origin: left center;
  }
  .aptp__plane--a {
    top: -1px;
  }
  .aptp__plane--b {
    bottom: -1px;
  }
  .aptp__plane::before {
    left: 0;
    top: -2px;
  }
  .aptp__plane::after {
    right: 0;
    top: -2px;
  }
  .aptp__house--open .aptp__plane {
    transform: scaleX(1);
  }

  .aptp__foot {
    max-width: none;
  }
}
</style>
