<script setup lang="ts">
/**
 * The three packages as A BUILDING IN SECTION — the page's audience runs
 * houses, and the tiers ascend, so the selector is a drawn guest house:
 * Osnovna is the ground floor, Napredna the storey above, Profi the floor
 * under the roof. Selecting a floor drives the site's cut motif: the two red
 * section planes CLIMB the building to bound the chosen floor, the floor
 * takes the quiet red wash, and the tier's contents print beside the drawing
 * line by line. Upgrade = building up, in the drawing vocabulary the whole
 * site already speaks (hatch, poché, dimension rail, planes with square end
 * ticks). Depth stays DRAWN — line weight and fills, never a shadow.
 *
 * ON ARRIVAL (IntersectionObserver, once) the house draws itself: the roof
 * strokes in, the floors hatch in bottom-up, the ground line rules across
 * its below-grade poché, then the planes arrive on the default floor. All
 * one-shot, class-driven CSS; with reduced motion `drawn` is set immediately
 * and the kill-switch collapses the animations, so the static drawing IS the
 * finished state. With JS off nothing is ever hidden: the floors are an inert
 * drawing and ALL three tier panels stand open in flow (the disclosure
 * contract every interactive section on this site keeps).
 *
 * ACCESSIBILITY: the floors are a real vertical tablist — roving tabindex,
 * arrows move the selection (visually: up is up — the stack renders
 * bottom-up via column-reverse, so ArrowUp selects the HIGHER tier), Home
 * and End jump to the ends, focus follows selection. Each floor is a
 * 62px-tall button (44px floor honoured); panels are tabpanels labelled by
 * their tabs. The floor labels sit on paper chips so the hatch never runs
 * through the lettering (the drafting convention: fills break around text).
 *
 * NO PRICES (owner's call), and the tier ids stay machine identifiers — the
 * contact form's chips derive from them.
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
/** The selected tier = the selected FLOOR. Index into packages.items. */
const tier = ref(0)
const stack = ref<HTMLElement | null>(null)
const drawing = ref<HTMLElement | null>(null)

/** How much of the drawing must be visible before the house draws itself. */
const DRAW_VISIBLE = 0.3
/** Safety net: if the observer never delivers (throttled tab, exotic pane),
 *  the house must still exist — disconnect FIRST, then force-draw. */
const DRAW_NET_MS = 4000

function floorAt(i: number): HTMLElement | undefined {
  return stack.value?.querySelectorAll<HTMLElement>('.aptp__floor')[i]
}

/**
 * Aim the two section planes at the selected floor's slab lines. Measured
 * from layout (offsetTop is render-order truth, immune to the stack's
 * column-reverse), written as two custom properties the planes transition
 * between — the climb is one CSS transition, no per-frame work.
 */
let planeRaf = 0
function placePlanes() {
  planeRaf = 0
  const f = floorAt(tier.value)
  const st = stack.value
  if (!f || !st) return
  st.style.setProperty('--pt', `${f.offsetTop}px`)
  st.style.setProperty('--pb', `${f.offsetTop + f.offsetHeight}px`)
}

/** Cancel-and-reschedule, never a boolean latch (house rule). */
function schedulePlanes() {
  if (planeRaf) cancelAnimationFrame(planeRaf)
  planeRaf = fx.raf(placePlanes)
}

function select(n: number) {
  tier.value = n
  nextTick(placePlanes)
}

/** Vertical tablist, oriented like the building: ArrowUp selects the HIGHER
 *  floor. Focus follows selection — the tablist contract. */
function onFloorKeys(e: KeyboardEvent) {
  const n = packages.items.length
  let next = -1
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = Math.min(tier.value + 1, n - 1)
  else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(tier.value - 1, 0)
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next < 0 || next === tier.value) return
  e.preventDefault()
  select(next)
  nextTick(() => floorAt(next)?.focus())
}

onMounted(() => {
  live.value = true
  nextTick(placePlanes)

  // Re-aim the planes whenever the drawing's geometry can move.
  fx.on(window, 'resize', schedulePlanes, { passive: true })
  document.fonts?.ready.then(schedulePlanes)
  if ('ResizeObserver' in window && stack.value) {
    fx.ro(schedulePlanes).observe(stack.value)
  }

  // Reduced motion: the drawn state IS the resting design — no arrival act.
  // No IntersectionObserver: never hide what cannot be un-hidden.
  if (prefersReducedMotion() || !('IntersectionObserver' in window) || !drawing.value) {
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
  io.observe(drawing.value)
  fx.setTimeout(() => {
    if (drawn.value) return
    io.disconnect()
    drawn.value = true
  }, DRAW_NET_MS)
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section
    id="paketi"
    class="aptp press press--light"
    :class="{ 'aptp--live': live, 'aptp--drawn': drawn }"
  >
    <div class="container">
      <p class="kicker aptp__kicker">{{ packages.kicker }}</p>
      <h2 class="aptp__title">{{ packages.title }}</h2>

      <div class="aptp__instrument">
        <!-- THE DRAWING: a guest house in section. Sticky beside the panel on
             desktop so the selector never scrolls away from what it selects. -->
        <div ref="drawing" class="aptp__drawing">
          <!-- The roof, stroked in on arrival. Decoration: the panels carry
               every fact. -->
          <svg class="aptp__roof" viewBox="0 0 264 62" aria-hidden="true">
            <path
              class="aptp__roofpath"
              d="M2 60 L132 4 L262 60"
              pathLength="100"
              fill="none"
              stroke="var(--grafit)"
              stroke-width="1.5"
            />
          </svg>

          <div
            ref="stack"
            class="aptp__stack"
            :role="live ? 'tablist' : undefined"
            :aria-label="live ? packages.feedback.floorsLabel : undefined"
            aria-orientation="vertical"
            @keydown="live && onFloorKeys($event)"
          >
            <!-- Dimension rail: extension ticks, no figure — this drawing
                 measures nothing we could honestly put a number on. -->
            <span class="aptp__dim" aria-hidden="true"></span>

            <component
              :is="live ? 'button' : 'div'"
              v-for="(p, n) in packages.items"
              :id="`tab-${p.id}`"
              :key="p.id"
              class="aptp__floor"
              :class="{ 'aptp__floor--on': live && n === tier }"
              :style="{ '--n': n }"
              :type="live ? 'button' : undefined"
              :role="live ? 'tab' : undefined"
              :aria-selected="live ? String(n === tier) : undefined"
              :aria-controls="live ? `panel-${p.id}` : undefined"
              :tabindex="live ? (n === tier ? 0 : -1) : undefined"
              @click="live && select(n)"
            >
              <span class="aptp__hatch" aria-hidden="true"></span>
              <span class="aptp__floor-label">{{ p.name }}</span>
            </component>

            <!-- The cut planes, bounding the selected floor. They CLIMB when
                 the visitor upgrades — one transition on two properties. -->
            <template v-if="live">
              <span class="aptp__plane aptp__plane--top" aria-hidden="true"></span>
              <span class="aptp__plane aptp__plane--bot" aria-hidden="true"></span>
            </template>
          </div>

          <!-- The ground: a heavier line running past the walls, and the
               below-grade poché the whole site stands things on. -->
          <span class="aptp__groundline" aria-hidden="true"></span>
          <span class="aptp__earth" aria-hidden="true"></span>
        </div>

        <!-- THE SCHEDULE: the selected tier's contents. With JS off all three
             stand open in flow; live, they swap as tabpanels and the lines
             print in with a short stagger. -->
        <div class="aptp__panels">
          <article
            v-for="(p, n) in packages.items"
            :id="`panel-${p.id}`"
            :key="p.id"
            class="aptp__panel"
            :role="live ? 'tabpanel' : undefined"
            :aria-labelledby="live ? `tab-${p.id}` : undefined"
            :hidden="live && n !== tier"
          >
            <h3 class="aptp__name aptp__rline" style="--i: 0">{{ p.name }}</h3>
            <p class="aptp__summary aptp__rline" style="--i: 1">{{ p.summary }}</p>
            <ul class="aptp__includes">
              <li
                v-for="(inc, i) in p.includes"
                :key="i"
                class="aptp__include aptp__rline"
                :class="{ 'aptp__include--seo': isSeo(inc) }"
                :style="{ '--i': i + 2 }"
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
            <p
              v-if="p.footnote"
              class="aptp__foot aptp__rline"
              :style="{ '--i': p.includes.length + 2 }"
            >
              {{ p.footnote }}
            </p>
          </article>
        </div>
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

/* --- the instrument: drawing beside schedule ------------------------------ */
.aptp__instrument {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-10) var(--space-16);
}

@media (min-width: 900px) {
  .aptp__instrument {
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }

  /* The selector stays beside what it selects while a long tier scrolls. */
  .aptp__drawing {
    position: sticky;
    top: calc(var(--nav-h, 59px) + var(--space-8));
  }
}

/* --- the house ------------------------------------------------------------- */
.aptp__drawing {
  width: min(264px, 100%);
}

.aptp__roof {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: -1px;
}

/* The walls: the building's outline is the drawing's heaviest line. */
.aptp__stack {
  position: relative;
  display: flex;
  /* DOM ascends Osnovna → Profi (the reading and tab order); the BUILDING
     puts the ground floor at the bottom. offsetTop measurement is unaffected:
     it reads rendered positions. */
  flex-direction: column-reverse;
  border-inline: 1.5px solid var(--grafit);
}

/* Dimension rail with end ticks, off the left wall. */
.aptp__dim {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -18px;
  width: 1px;
  background: var(--mreza-strong);
  pointer-events: none;
}
.aptp__dim::before,
.aptp__dim::after {
  content: '';
  position: absolute;
  left: -3px;
  width: 7px;
  height: 1px;
  background: var(--mreza-strong);
}
.aptp__dim::before {
  top: 0;
}
.aptp__dim::after {
  bottom: 0;
}

/* A floor: one storey of the section. Its top border is the slab above it —
   with the column-reverse stack this lands between storeys, and the top
   storey's line is the wall plate under the roof. */
.aptp__floor {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 62px;
  padding: 0 var(--space-4);
  margin: 0;
  border: 0;
  border-top: 1px solid var(--mreza-strong);
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  transition: background-color 240ms var(--ease-out);
}

button.aptp__floor {
  cursor: pointer;
}

button.aptp__floor:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: -4px;
}

/* The selected floor takes the quiet red wash — the token whose job is
   "opened ground" — so the cut reads in fill as well as in planes. */
.aptp__floor--on {
  background-color: var(--rez-vodni);
}

/* The section hatch. Line work drawn by gradient (the .press technique),
   dimmed until the floor is selected. */
.aptp__hatch {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 6px,
    var(--grafit-2) 6px 7px
  );
  opacity: 0.16;
  transition: opacity 240ms var(--ease-out);
}

@media (hover: hover) {
  button.aptp__floor:hover .aptp__hatch {
    opacity: 0.34;
  }
}

.aptp__floor--on .aptp__hatch {
  opacity: 0.42;
}

/* The floor's name on a paper chip: fills break around lettering, so the
   hatch never runs through the word. */
.aptp__floor-label {
  position: relative;
  z-index: 1;
  padding: 3px 10px;
  background: var(--list);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.8125rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--grafit-2);
  transition: color 240ms var(--ease-out);
}

.aptp__floor--on .aptp__floor-label,
button.aptp__floor:hover .aptp__floor-label {
  color: var(--grafit);
}

/* The cut planes: the site's red rule with square end ticks, overhanging the
   walls the way a section plane runs past the building. The climb is the
   `top` transition; reduced motion collapses it to a jump (kill-switch). */
.aptp__plane {
  position: absolute;
  left: -8px;
  right: -8px;
  height: 2px;
  margin-top: -1px;
  background: var(--rez);
  pointer-events: none;
  transition:
    top 380ms var(--ease-out),
    opacity 300ms var(--ease-out);
}
.aptp__plane::before,
.aptp__plane::after {
  content: '';
  position: absolute;
  top: -2px;
  width: 6px;
  height: 6px;
  background: var(--rez);
}
.aptp__plane::before {
  left: 0;
}
.aptp__plane::after {
  right: 0;
}
.aptp__plane--top {
  top: var(--pt, 0px);
}
.aptp__plane--bot {
  top: var(--pb, 62px);
}

/* The ground line runs past the walls; below it, the earth is poché. */
.aptp__groundline {
  display: block;
  width: 112%;
  margin-left: -6%;
  height: 2px;
  background: var(--grafit);
}
.aptp__earth {
  display: block;
  width: 112%;
  margin-left: -6%;
  height: 16px;
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 5px,
    var(--grafit-2) 5px 6px
  );
  opacity: 0.45;
}

/* --- the arrival act --------------------------------------------------------
   Hidden states exist ONLY once the app is live (never in static HTML), and
   the drawn state's last frame equals the stylesheet rest. */
.aptp--live:not(.aptp--drawn) .aptp__roofpath {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}
.aptp--live:not(.aptp--drawn) .aptp__hatch,
.aptp--live:not(.aptp--drawn) .aptp__floor-label,
.aptp--live:not(.aptp--drawn) .aptp__groundline,
.aptp--live:not(.aptp--drawn) .aptp__earth,
.aptp--live:not(.aptp--drawn) .aptp__dim,
.aptp--live:not(.aptp--drawn) .aptp__plane {
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
  .aptp--drawn .aptp__dim {
    animation: aptp-fade 500ms var(--ease-out) 500ms both;
  }
  /* Floors hatch in bottom-up: the build ascends. */
  .aptp--drawn .aptp__hatch {
    animation: aptp-hatch 450ms var(--ease-out) both;
    animation-delay: calc(250ms + var(--n, 0) * 140ms);
  }
  .aptp--drawn .aptp__floor-label {
    animation: aptp-fade 450ms var(--ease-out) both;
    animation-delay: calc(250ms + var(--n, 0) * 140ms);
  }
  .aptp--drawn .aptp__plane {
    animation: aptp-planes 400ms var(--ease-out) 800ms both;
  }
  /* The schedule prints line by line on every selection (display:none →
     shown restarts the animation), capped by the longest list at ~600ms. */
  .aptp--live .aptp__rline {
    animation: aptp-line 320ms var(--ease-out) both;
    animation-delay: calc(var(--i, 0) * 45ms);
  }
}

/* Keyframes end at each element's stylesheet rest — cancel-safe anywhere.
   Elements resting BELOW opacity 1 (hatch .16/.42, earth .45) get their own
   from-zero keyframes with no `to`, so the cascade's resting value is the
   landing. */
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
@keyframes aptp-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes aptp-hatch {
  from {
    opacity: 0;
  }
}
@keyframes aptp-earth {
  from {
    opacity: 0;
  }
}
@keyframes aptp-planes {
  from {
    opacity: 0;
  }
}
@keyframes aptp-line {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- the schedule ----------------------------------------------------------- */
.aptp__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.aptp__summary {
  margin: var(--space-3) 0 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--grafit);
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

/* JS-off: the three schedules stand open in sequence, ruled apart. Live, the
   rules and spacing collapse — only one panel shows at a time. */
.aptp__panel + .aptp__panel {
  margin-top: var(--space-10);
  padding-top: var(--space-10);
  border-top: 1px solid var(--mreza-strong);
}
.aptp--live .aptp__panel + .aptp__panel {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
.aptp__panel[hidden] {
  display: none;
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

@media (max-width: 809px) {
  .aptp__drawing {
    width: min(232px, 86%);
    /* Room for the dimension rail off the left wall. */
    margin-left: 20px;
  }

  .aptp__floor {
    min-height: 54px;
  }

  .aptp__foot {
    max-width: none;
  }
}
</style>
