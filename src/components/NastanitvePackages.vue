<script setup lang="ts">
/**
 * The three packages as A BUILDING IN SECTION — all three storeys in full
 * view. The audience runs houses and the tiers ascend, so the schedule IS a
 * drawn guest house: Osnovna the ground floor, Napredna the storey above,
 * Profi under the roof, poché earth below, one gable over everything. Every
 * floor shows its name and summary FROM THE START (the owner's requirement:
 * the three must be equally visible); clicking a floor expands that floor in
 * place — its includes unfold inside the storey, the red section planes
 * appear on its slab lines, and the quiet red wash floods it.
 *
 * The toggles are INDEPENDENT, not an exclusive accordion, for two reasons:
 * comparison (two tiers open side by side is the real buying question), and
 * scroll honesty — nothing above the click ever collapses, and because each
 * floor's body unfolds BELOW its own header inside the band, the clicked
 * control never moves (the column-reverse stack lays floors top-down from
 * Profi, so growth always happens below the point of interaction).
 *
 * DISTINCTNESS AT REST: each floor's left edge is its material strip, hatch
 * density ascending with the tier — sparse lines, 45° section hatch, full
 * cross-hatch — the drawing convention for "more substance", so the three
 * read apart before any interaction. Text never sits on hatch.
 *
 * ON ARRIVAL (IntersectionObserver + the mandatory safety net) the house
 * draws itself once: roof stroke, floors hatching in bottom-up, the ground
 * line ruling across the poché. Class-driven one-shot CSS; every keyframe
 * ends on the stylesheet rest, so force-finish or reduced motion land on the
 * finished drawing.
 *
 * CONTRACTS: with JS off every floor stands OPEN in flow (the collapsed
 * state exists only once live — progressive disclosure ships expanded);
 * reduced motion gets instant toggles (kill-switch) on the fully drawn
 * house. Buttons are real <h3><button aria-expanded aria-controls> pairs,
 * bodies are labelled regions, closed bodies are inert. Tier ids stay
 * machine identifiers (the contact form's chips derive from them).
 * NO PRICES (owner's call).
 */
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { packages, type NastInclude, type NastEmphasis, type NastSeo } from '@/content/nastanitve'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const isString = (i: NastInclude): i is string => typeof i === 'string'
const isEmphasis = (i: NastInclude): i is NastEmphasis =>
  typeof i === 'object' && 'strong' in i
const isSeo = (i: NastInclude): i is NastSeo => typeof i === 'object' && 'points' in i

const fx = createFx()
const live = ref(false)
const drawn = ref(false)
const drawing = ref<HTMLElement | null>(null)

/** Which floors stand open. Live starts all shut (the equal resting state);
 *  with JS off this is never consulted — everything is open in flow. */
const open = reactive<boolean[]>(packages.items.map(() => false))

function toggle(n: number) {
  open[n] = !open[n]
}

/** How much of the drawing must be visible before the house draws itself. */
const DRAW_VISIBLE = 0.25
/** Safety net: if the observer never delivers (throttled tab, exotic pane),
 *  the house must still exist — disconnect FIRST, then force-draw. */
const DRAW_NET_MS = 4000

onMounted(() => {
  live.value = true

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

      <!-- THE BUILDING. Roof, three storeys, ground line, below-grade poché.
           DOM ascends Osnovna → Profi (reading, focus and JS-off order); the
           stack renders bottom-up, as a building stands. -->
      <div ref="drawing" class="aptp__house">
        <svg class="aptp__roof" viewBox="0 0 800 56" preserveAspectRatio="none" aria-hidden="true">
          <path
            class="aptp__roofpath"
            d="M3 54 L400 4 L797 54"
            pathLength="100"
            fill="none"
            stroke="var(--grafit)"
            stroke-width="1.5"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <ol class="aptp__stack">
          <!-- Dimension rail: extension ticks, no figure — this drawing
               measures nothing we could honestly put a number on. -->
          <span class="aptp__dim" aria-hidden="true"></span>

          <li
            v-for="(p, n) in packages.items"
            :key="p.id"
            class="aptp__floor"
            :class="[`aptp__floor--${p.id}`, { 'aptp__floor--open': !live || open[n] }]"
            :style="{ '--n': n }"
          >
            <!-- The floor's material strip: its tier's density, ascending. -->
            <span class="aptp__strip" aria-hidden="true"></span>

            <!-- The cut planes on the slab lines, present while the floor is
                 open — the site's red rule with square end ticks. -->
            <span class="aptp__plane aptp__plane--top" aria-hidden="true"></span>
            <span class="aptp__plane aptp__plane--bot" aria-hidden="true"></span>

            <div class="aptp__room">
              <h3 class="aptp__name">
                <button
                  v-if="live"
                  :id="`floor-${p.id}`"
                  type="button"
                  class="aptp__toggle"
                  :aria-expanded="open[n] ? 'true' : 'false'"
                  :aria-controls="`room-${p.id}`"
                  @click="toggle(n)"
                >
                  <span class="aptp__toggle-name">{{ p.name }}</span>
                  <span class="aptp__glyph" aria-hidden="true"></span>
                </button>
                <span v-else :id="`floor-${p.id}`" class="aptp__toggle">
                  <span class="aptp__toggle-name">{{ p.name }}</span>
                </span>
              </h3>

              <p class="aptp__summary">{{ p.summary }}</p>

              <div
                :id="`room-${p.id}`"
                class="aptp__body"
                role="region"
                :aria-labelledby="`floor-${p.id}`"
                :inert="live && !open[n] ? true : undefined"
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
          </li>
        </ol>

        <!-- The ground: a heavier line running past the walls, and the
             below-grade poché the whole site stands things on. -->
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

/* --- the building ----------------------------------------------------------
   One gable, three storeys, ground and earth. Proportioned as a long pension
   rather than a cottage: the storeys are full schedule rows. */
.aptp__house {
  max-width: 780px;
}

.aptp__roof {
  display: block;
  width: 100%;
  height: clamp(34px, 6vw, 56px);
  margin-bottom: -1px;
}

/* The walls carry the drawing's heaviest line. */
.aptp__stack {
  position: relative;
  display: flex;
  /* DOM ascends Osnovna → Profi; the BUILDING puts the ground floor at the
     bottom. Each floor's body unfolds below its own header, so growth always
     happens below the click — nothing above ever moves. */
  flex-direction: column-reverse;
  margin: 0;
  padding: 0;
  list-style: none;
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

/* A storey. Its top border is the slab above it: between storeys in the
   reversed stack, and the wall plate under the roof for Profi. */
.aptp__floor {
  position: relative;
  display: grid;
  grid-template-columns: clamp(40px, 8vw, 64px) minmax(0, 1fr);
  border-top: 1px solid var(--mreza-strong);
  transition: background-color 280ms var(--ease-out);
}

/* The open floor takes the quiet red wash — the token whose job is
   "opened ground" — so the cut reads in fill as well as in planes. */
.aptp__floor--open {
  background-color: var(--rez-vodni);
}

/* The material strip: the floor's tier drawn as density. Line work by
   gradient (the .press technique), never a colour ramp; deepens when open. */
.aptp__strip {
  position: relative;
  border-right: 1px solid var(--mreza-strong);
  opacity: 0.55;
  transition: opacity 280ms var(--ease-out);
  pointer-events: none;
}

.aptp__floor--open .aptp__strip {
  opacity: 0.95;
}

/* Osnovna — sparse lines: the lightest build. */
.aptp__floor--basic .aptp__strip {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 9px,
    var(--grafit-2) 9px 10px
  );
}

/* Napredna — the standard 45° section hatch. */
.aptp__floor--advanced .aptp__strip {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 5px,
    var(--grafit-2) 5px 6px
  );
}

/* Profi — cross-hatch: the densest material in the drawing convention. */
.aptp__floor--profi .aptp__strip {
  background-image:
    repeating-linear-gradient(45deg, transparent 0 5px, var(--grafit-2) 5px 6px),
    repeating-linear-gradient(-45deg, transparent 0 5px, var(--grafit-2) 5px 6px);
}

/* The cut planes on the open floor's slab lines: red rules with square end
   ticks, overhanging the walls the way a section plane runs past the
   building. They draw across when the floor opens. */
.aptp__plane {
  position: absolute;
  left: -8px;
  right: -8px;
  height: 2px;
  background: var(--rez);
  pointer-events: none;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left center;
  transition:
    opacity 240ms var(--ease-out),
    transform 360ms var(--ease-out);
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
  top: -1px;
}
.aptp__plane--bot {
  bottom: -1px;
}

.aptp__floor--open .aptp__plane {
  opacity: 1;
  transform: scaleX(1);
}

/* The room: the floor's content column. */
.aptp__room {
  padding: var(--space-5) var(--space-5) var(--space-6);
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

/* The whole name row is the control: name left, drawn +/- right, 44px met.
   The h3>button pair is the accordion's canonical accessible shape. */
.aptp__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  min-height: 44px;
  padding: 0;
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

button.aptp__toggle {
  cursor: pointer;
}

button.aptp__toggle:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

/* The drawn +/-: two hairlines, the site's disclosure device. The vertical
   bar fades when open, leaving a minus. Never a dingbat, never an emoji. */
.aptp__glyph {
  position: relative;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
}
.aptp__glyph::before,
.aptp__glyph::after {
  content: '';
  position: absolute;
  background: var(--grafit-2);
  transition: opacity 200ms var(--ease-out);
}
.aptp__glyph::after {
  left: 0;
  right: 0;
  top: 6.25px;
  height: 1.5px;
}
.aptp__glyph::before {
  top: 0;
  bottom: 0;
  left: 6.25px;
  width: 1.5px;
}
.aptp__floor--open .aptp__glyph::before {
  opacity: 0;
}

@media (hover: hover) {
  button.aptp__toggle:hover .aptp__glyph::before,
  button.aptp__toggle:hover .aptp__glyph::after {
    background: var(--grafit);
  }
}

.aptp__summary {
  margin: var(--space-2) 0 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--grafit);
  max-width: 58ch;
}

/* --- the unfolding room ------------------------------------------------------
   Collapsed state exists ONLY live (JS off ships everything open). The
   grid-rows transition needs no measurement; the inner wrapper clips. Closed
   bodies are inert (out of the tab order and off assistive tech). */
.aptp__body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 360ms var(--ease-out);
}

.aptp--live .aptp__body[inert] {
  grid-template-rows: 0fr;
}

.aptp__body-in {
  overflow: hidden;
  min-height: 0;
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

/* The ground line runs past the walls; below it, the earth is poché. */
.aptp__groundline {
  display: block;
  width: 104%;
  margin-left: -2%;
  height: 2px;
  background: var(--grafit);
}
.aptp__earth {
  display: block;
  width: 104%;
  margin-left: -2%;
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
   every keyframe ends on the element's stylesheet rest. */
.aptp--live:not(.aptp--drawn) .aptp__roofpath {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}
.aptp--live:not(.aptp--drawn) .aptp__strip,
.aptp--live:not(.aptp--drawn) .aptp__groundline,
.aptp--live:not(.aptp--drawn) .aptp__earth,
.aptp--live:not(.aptp--drawn) .aptp__dim {
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
  /* The strips hatch in bottom-up: the build ascends. */
  .aptp--drawn .aptp__strip {
    animation: aptp-strip 450ms var(--ease-out) both;
    animation-delay: calc(220ms + var(--n, 0) * 140ms);
  }
}

/* Keyframes end at each element's stylesheet rest — cancel-safe anywhere.
   Elements resting BELOW opacity 1 (strip .55, earth .45) get from-only
   keyframes, so the cascade's resting value is the landing. */
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
@keyframes aptp-strip {
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

@media (max-width: 809px) {
  .aptp__house {
    /* Room for the dimension rail off the left wall. */
    margin-left: 14px;
    max-width: calc(100% - 14px);
  }

  .aptp__dim {
    left: -14px;
  }

  .aptp__room {
    padding: var(--space-4) var(--space-4) var(--space-5);
  }

  .aptp__foot {
    max-width: none;
  }
}
</style>
