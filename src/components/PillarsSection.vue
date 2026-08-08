<script setup lang="ts">
/**
 * Vsi paketi — the exploded view. A technical drawing's native way of saying
 * "here is what's inside": each pillar is an abstract plate REDRAWN as a
 * layered inline drawing, and choosing one pulls its layers apart — the
 * drawing opens, the pillar names itself in the opened seam, and its points
 * unfold as ruled callouts under the row that chose it.
 *
 * Layout is the design system's index + preview archetype: a numbered list
 * (30%) beside the stage (68%). Hovering or focusing a row PREVIEWS its
 * drawing (150ms crossfade — the reference's measured tempo); activating it
 * EXPLODES the drawing (four layers, staggered, zero overshoot) and expands
 * the row's callout panel. One open at a time, Escape closes, the panel's
 * closing control returns focus to its row.
 *
 * THE STAGE IS AN INSTRUMENT, NOT CONTENT: every string lives in the
 * accessible flow (rows + panels); the drawings and the seam title are
 * aria-hidden theatre. With JS off (or before hydration) the section is the
 * stacked layout with every panel open and every drawing composed — nobody
 * meets a dead control, crawlers read everything (progressive disclosure
 * ships expanded; the collapse is hydration-gated). Under reduced motion the
 * explosion and crossfades land instantly (global kill-switch) and
 * everything stays operable.
 *
 * ONE SET OF DRAWINGS, TWO PLACEMENTS: on desktop the three drawing cells
 * are stacked into the same grid cell (the stage) and crossfade; below the
 * breakpoint the same elements fall back into each pillar's own block flow.
 * No duplication, no JS re-parenting.
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { pillars } from '@/content/home'
import { canHover, createFx } from '@/lib/fx'

const fx = createFx()
const host = ref<HTMLElement | null>(null)
const live = ref(false)

/** The open pillar (−1 = none) and the previewed one (hover/focus). */
const open = ref(-1)
const preview = ref(0)

/** What the stage shows: the open drawing wins; otherwise the preview. */
const staged = computed(() => (open.value >= 0 ? open.value : preview.value))

function rowAt(i: number): HTMLElement | undefined {
  return host.value?.querySelectorAll<HTMLElement>('.pil__row')[i]
}

function toggle(i: number) {
  open.value = open.value === i ? -1 : i
}

/** The panel's closing control: collapse, then hand focus back to the row
 *  that owns the panel (focus must never strand inside a closing region). */
function closeFromPanel(i: number) {
  open.value = -1
  nextTick(() => rowAt(i)?.focus({ preventScroll: true }))
}

function onSectionKeys(e: KeyboardEvent) {
  if (e.key !== 'Escape' || open.value < 0) return
  e.preventDefault()
  closeFromPanel(open.value)
}

onMounted(() => {
  live.value = true
  // Hover previews only where hover exists (touch would stick them);
  // focus previews everywhere — keyboard parity is not optional.
  if (canHover() && host.value) {
    host.value.querySelectorAll<HTMLElement>('.pil__row').forEach((row, i) => {
      fx.on(row, 'mouseenter', () => {
        preview.value = i
      })
    })
  }
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section id="paketi" ref="host" class="pil" :class="{ 'pil--live': live }" @keydown="onSectionKeys">
    <div class="container">
      <header class="pil__head">
        <p class="pil__kicker">{{ pillars.kicker }}</p>
        <h2 class="pil__title">{{ pillars.title }}</h2>
        <p class="pil__intro">{{ pillars.intro }}</p>
      </header>

      <div class="pil__body">
        <template v-for="(item, n) in pillars.items" :key="item.id">
          <!-- THE ROW: index, name, artifact claim, state node. A real button
               once live; plain flow before that. -->
          <component
            :is="live ? 'button' : 'div'"
            class="pil__row"
            :class="[`pil__cell--${n}`, { 'pil__row--open': live && open === n }]"
            :type="live ? 'button' : undefined"
            :aria-expanded="live ? String(open === n) : undefined"
            :aria-controls="live ? `paketi-panel-${item.id}` : undefined"
            @click="live && toggle(n)"
            @focusin="preview = n"
          >
            <span class="pil__index" aria-hidden="true">00{{ n + 1 }}</span>
            <span class="pil__row-main">
              <span class="pil__row-kicker annot">{{ item.kicker }}</span>
              <h3 class="pil__row-title">{{ item.title }}</h3>
              <span class="pil__row-artifact annot">{{ item.artifact }}</span>
            </span>
            <span class="pil__node" aria-hidden="true"></span>
          </component>

          <!-- THE DRAWING: the pillar's abstract plate, four layers that part
               when its row opens. Desktop stacks all three into the stage
               cell; phones keep each in its pillar's flow. Pure instrument —
               aria-hidden, no strings. -->
          <div
            class="pil__art"
            :class="[`pil__cell--${n}`, { 'pil__art--staged': staged === n, 'pil__art--open': live && open === n }]"
            aria-hidden="true"
          >
            <!-- The staged pillar's name, ABOVE the drawing — a label, not a
                 layer (visual only; the row's h3 is the accessible name). -->
            <span class="pil__stage-title">{{ item.title }}</span>

            <!-- design — a composition study: guides, masses, type rules,
                 the red registration. The canvas carries ±60px headroom so
                 the exploded layers never cross the viewBox edge. -->
            <svg v-if="item.id === 'design'" class="xp" viewBox="0 -60 800 760">
              <g class="xp__l xp__l--1">
                <rect x="120" y="120" width="560" height="400" class="xp-line" />
                <line x1="120" y1="220" x2="680" y2="220" class="xp-hair" />
                <line x1="120" y1="420" x2="680" y2="420" class="xp-hair" />
                <line x1="320" y1="120" x2="320" y2="520" class="xp-hair" />
                <line x1="540" y1="120" x2="540" y2="520" class="xp-hair" />
              </g>
              <g class="xp__l xp__l--2">
                <rect x="150" y="150" width="140" height="140" class="xp-fill" />
                <rect x="350" y="250" width="300" height="140" class="xp-line" />
                <rect x="150" y="330" width="140" height="160" class="xp-line" />
              </g>
              <g class="xp__l xp__l--3">
                <line x1="360" y1="160" x2="640" y2="160" class="xp-rule" />
                <line x1="360" y1="184" x2="580" y2="184" class="xp-rule" />
                <line x1="360" y1="208" x2="610" y2="208" class="xp-rule" />
                <line x1="180" y1="450" x2="290" y2="450" class="xp-rule" />
                <line x1="360" y1="440" x2="560" y2="440" class="xp-rule" />
                <line x1="360" y1="464" x2="520" y2="464" class="xp-rule" />
              </g>
              <g class="xp__l xp__l--4">
                <rect x="104" y="104" width="560" height="400" class="xp-red" />
                <line x1="84" y1="104" x2="124" y2="104" class="xp-red" />
                <line x1="104" y1="84" x2="104" y2="124" class="xp-red" />
              </g>
              <g class="xp__tags">
                <text x="700" y="126" class="xp-tag">001</text>
                <text x="700" y="256" class="xp-tag">002</text>
                <text x="700" y="386" class="xp-tag">003</text>
                <text x="700" y="516" class="xp-tag">004</text>
              </g>
            </svg>

            <!-- security — the seal in section: perimeter, gauge rings, the
                 pin row over the keyway, the red seal arc. -->
            <svg v-else-if="item.id === 'security'" class="xp" viewBox="0 -60 800 760">
              <g class="xp__l xp__l--1">
                <rect x="160" y="80" width="480" height="480" class="xp-line" />
                <line v-for="t in 12" :key="t" :x1="160 + (t - 1) * 43.6" y1="80"
                  :x2="160 + (t - 1) * 43.6 + 16" y2="64" class="xp-hair" />
              </g>
              <g class="xp__l xp__l--2">
                <circle cx="400" cy="320" r="170" class="xp-line" />
                <circle cx="400" cy="320" r="120" class="xp-hair" />
                <circle cx="400" cy="320" r="66" class="xp-line" />
              </g>
              <g class="xp__l xp__l--3">
                <line x1="330" y1="320" x2="330" y2="252" class="xp-pin" />
                <line x1="365" y1="320" x2="365" y2="230" class="xp-pin" />
                <line x1="400" y1="320" x2="400" y2="272" class="xp-pin" />
                <line x1="435" y1="320" x2="435" y2="214" class="xp-pin" />
                <line x1="470" y1="320" x2="470" y2="258" class="xp-pin" />
                <rect x="318" y="320" width="164" height="34" class="xp-fill" />
              </g>
              <g class="xp__l xp__l--4">
                <path d="M 400 150 A 170 170 0 0 1 570 320" class="xp-red" />
                <circle cx="570" cy="320" r="7" class="xp-red-fill" />
              </g>
              <g class="xp__tags">
                <text x="672" y="96" class="xp-tag">001</text>
                <text x="672" y="226" class="xp-tag">002</text>
                <text x="672" y="356" class="xp-tag">003</text>
                <text x="672" y="486" class="xp-tag">004</text>
              </g>
            </svg>

            <!-- seo — the page radiating: the document node, detection arcs,
                 the constellation, the red beacon. -->
            <svg v-else class="xp" viewBox="0 -60 800 760">
              <g class="xp__l xp__l--1">
                <rect x="120" y="240" width="150" height="190" class="xp-line" />
                <line x1="140" y1="272" x2="250" y2="272" class="xp-rule" />
                <line x1="140" y1="296" x2="226" y2="296" class="xp-rule" />
                <line x1="140" y1="320" x2="238" y2="320" class="xp-rule" />
                <line x1="140" y1="356" x2="214" y2="356" class="xp-rule" />
              </g>
              <g class="xp__l xp__l--2">
                <path d="M 330 160 A 240 240 0 0 1 330 500" class="xp-dash" />
                <path d="M 390 210 A 165 165 0 0 1 390 450" class="xp-dash" />
                <path d="M 440 258 A 95 95 0 0 1 440 402" class="xp-dash" />
              </g>
              <g class="xp__l xp__l--3">
                <circle cx="560" cy="180" r="9" class="xp-node" />
                <circle cx="640" cy="300" r="9" class="xp-node" />
                <circle cx="600" cy="450" r="9" class="xp-node" />
                <circle cx="500" cy="530" r="9" class="xp-node" />
                <line x1="270" y1="330" x2="551" y2="185" class="xp-hair" />
                <line x1="270" y1="335" x2="631" y2="300" class="xp-hair" />
                <line x1="270" y1="345" x2="592" y2="446" class="xp-hair" />
              </g>
              <g class="xp__l xp__l--4">
                <line x1="270" y1="340" x2="676" y2="120" class="xp-red" />
                <circle cx="684" cy="116" r="7" class="xp-red-fill" />
              </g>
              <g class="xp__tags">
                <text x="700" y="256" class="xp-tag">001</text>
                <text x="700" y="326" class="xp-tag">002</text>
                <text x="700" y="396" class="xp-tag">003</text>
                <text x="700" y="466" class="xp-tag">004</text>
              </g>
            </svg>
          </div>

          <!-- THE PANEL: the pillar's whole content, in the accessible flow.
               Ships open; hydration collapses it under its row. -->
          <div
            :id="`paketi-panel-${item.id}`"
            class="pil__panel"
            :class="[`pil__cell--${n}`, { 'pil__panel--open': !live || open === n }]"
          >
            <div class="pil__panel-inner">
              <p class="pil__summary">{{ item.summary }}</p>
              <ul class="pil__points">
                <li v-for="(pt, k) in item.points" :key="k" class="pil__point">
                  <span class="pil__point-index" aria-hidden="true">{{ String(k + 1).padStart(3, '0') }}</span>
                  <span class="pil__point-label">{{ pt.label }}</span>
                  <span class="pil__point-detail">{{ pt.detail }}</span>
                </li>
              </ul>
              <p v-if="item.prerez" class="pil__prerez">
                <span class="annot">{{ item.prerez.annotation }}</span>
                <span class="pil__prerez-gloss">{{ item.prerez.gloss }}</span>
              </p>
              <button
                v-if="live"
                type="button"
                class="pil__close annot"
                @click="closeFromPanel(n)"
              >
                {{ pillars.feedback.closeLabel }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pil {
  background: var(--list-2);
  padding-block: var(--section-block);
}

.pil__head {
  margin-bottom: var(--v-block);
}

/* The mono chip kicker — same constant plate as the Tradicija section's. */
.pil__kicker {
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

.pil__title {
  margin-top: var(--space-4);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.pil__intro {
  margin-top: var(--space-6);
  color: var(--grafit-2);
  max-width: 58ch;
}

/* --- the rows ---------------------------------------------------------------- */
.pil__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) 0;
  margin: 0;
  border: 0;
  border-top: var(--divider-width) solid var(--mreza-strong);
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

button.pil__row {
  cursor: pointer;
}

.pil__index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--grafit-2);
  flex: 0 0 2rem;
}

.pil__row-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pil__row-kicker {
  color: var(--grafit-2);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.pil__row-title {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.pil__row-artifact {
  color: var(--grafit-2);
}

/* Hollow = available, red = open — the drawing's own terminal language. */
.pil__node {
  margin-left: auto;
  align-self: center;
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border: 1px solid var(--grafit-2);
  transition:
    background var(--dur-tween) var(--ease-hover),
    border-color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  button.pil__row:hover .pil__node {
    border-color: var(--grafit);
  }
}

.pil__row--open .pil__node {
  background: var(--rez);
  border-color: var(--rez);
}

/* --- the drawings ------------------------------------------------------------ */
.pil__art {
  position: relative;
  padding-block: var(--space-2);
}

.xp {
  width: 100%;
  height: auto;
  display: block;
}

/* Stroke vocabulary: ink hairlines, faint fills, red accents — the plate is
   DRAWN, never photographed. */
.xp-line {
  fill: none;
  stroke: var(--grafit);
  stroke-width: 2;
}
.xp-hair {
  fill: none;
  stroke: var(--mreza-strong);
  stroke-width: 1;
}
.xp-rule {
  fill: none;
  stroke: var(--grafit-2);
  stroke-width: 3;
}
.xp-fill {
  fill: rgb(36 36 36 / 0.1);
  stroke: var(--grafit);
  stroke-width: 2;
}
.xp-pin {
  fill: none;
  stroke: var(--grafit);
  stroke-width: 6;
  stroke-linecap: round;
}
.xp-dash {
  fill: none;
  stroke: var(--grafit-2);
  stroke-width: 2;
  stroke-dasharray: 10 8;
}
.xp-node {
  fill: none;
  stroke: var(--grafit);
  stroke-width: 2;
}
.xp-red {
  fill: none;
  stroke: var(--rez);
  stroke-width: 3;
}
.xp-red-fill {
  fill: var(--rez);
}

/* THE EXPLOSION: four layers part on the drawing's own vertical, staggered,
   decisive, zero overshoot. States are stylesheet poses, so the reduced-
   motion kill-switch lands them instantly. */
.xp__l {
  transition: transform 480ms var(--ease-spring);
}
/* Travels sized to the canvas' ±60px headroom: the topmost stroke (security's
   perimeter ticks, y 64) lands at −20 ≥ −60, the deepest (design's red frame,
   y 504 + 92) at 596 ≤ 700 — nothing ever crosses the viewBox edge, so the
   explosion can never clip. */
.pil__art--open .xp__l--1 {
  transform: translateY(-84px);
}
.pil__art--open .xp__l--2 {
  transform: translateY(-30px);
  transition-delay: 60ms;
}
.pil__art--open .xp__l--3 {
  transform: translateY(36px);
  transition-delay: 120ms;
}
.pil__art--open .xp__l--4 {
  transform: translateY(92px);
  transition-delay: 180ms;
}

/* Layer indexes: mono, present only once the drawing has opened. */
.xp__tags {
  opacity: 0;
  transition: opacity 240ms var(--ease-spring) 240ms;
}
.pil__art--open .xp__tags {
  opacity: 1;
}
.xp-tag {
  font-family: var(--font-mono);
  font-size: 22px;
  letter-spacing: 0.03em;
  fill: var(--grafit-2);
}

/* The staged pillar's name, above its drawing — a label in flow, never baked
   into the picture. It travels with its art cell (crossfades with it), so the
   stage always names what it shows. */
.pil__stage-title {
  display: block;
  font-family: var(--font-sans);
  font-size: clamp(1.25rem, 1rem + 1vw, 1.75rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--grafit);
  padding-bottom: var(--space-2);
  border-bottom: var(--divider-width) solid var(--mreza-strong);
  margin-bottom: var(--space-3);
}

/* --- the panels -------------------------------------------------------------- */
/* Ships open (static HTML, JS off); once live, closed panels collapse via the
   0fr/1fr grid — animatable, and the kill-switch makes it instant. */
.pil__panel {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 420ms var(--ease-spring);
}

.pil--live .pil__panel {
  grid-template-rows: 0fr;
}

.pil--live .pil__panel--open {
  grid-template-rows: 1fr;
}

.pil__panel-inner {
  overflow: hidden;
  min-height: 0;
}

.pil__summary {
  padding-top: var(--space-3);
  color: var(--grafit-2);
  max-width: 52ch;
}

.pil__points {
  list-style: none;
  margin-top: var(--space-4);
  border-top: var(--divider-width) solid var(--mreza-strong);
}

.pil__point {
  display: grid;
  grid-template-columns: 2rem minmax(0, 12rem) minmax(0, 1fr);
  align-items: baseline;
  column-gap: var(--space-4);
  padding-block: var(--space-2);
  border-bottom: var(--divider-width) solid var(--mreza);
}

.pil__point-index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--grafit-2);
}

.pil__point-label {
  font-weight: 500;
  font-size: 0.9375rem;
  line-height: 1.3;
}

.pil__point-detail {
  color: var(--grafit-2);
  font-size: 0.9375rem;
  line-height: 1.45;
}

.pil__prerez {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 52ch;
}

.pil__prerez .annot {
  color: var(--grafit);
}

.pil__prerez-gloss {
  color: var(--grafit-2);
  font-size: 0.9375rem;
}

.pil__close {
  margin-block: var(--space-4) var(--space-2);
  padding: 0.55rem 1rem;
  min-height: 44px;
  background: none;
  border: 1px solid var(--mreza-strong);
  color: var(--grafit);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  cursor: pointer;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  .pil__close:hover {
    border-color: var(--rez);
    color: var(--rez);
  }
}

/* --- stacked flow (phones, and every pre-hydration reader) ------------------
   Natural order per pillar: row, drawing, panel. Once live, phones show only
   the OPEN pillar's drawing — three standing figures would push each row a
   full plate away from its neighbour. */
@media (max-width: 899.98px) {
  .pil--live .pil__art {
    display: none;
  }
  .pil--live .pil__art--open {
    display: block;
  }
  /* The row directly above already names the drawing — a stage label here
     would say it twice in a row. */
  .pil__stage-title {
    display: none;
  }
}

/* --- desktop: index + preview (30 / 68) -------------------------------------- */
@media (min-width: 900px) {
  .pil__body {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 30fr) minmax(0, 68fr);
    column-gap: var(--space-8);
    /* Six left-column slots: row, its panel, row, its panel, row, its panel.
       Each pair gets its OWN grid row — sharing one row overlaps the items. */
    grid-template-rows: repeat(6, auto);
    align-content: start;
    align-items: start;
    /* Room for the stage at rest (the drawings are ABSOLUTE — in the grid
       they would span the tracks and inflate the list's gaps, measured at
       112px per closed panel). */
    min-height: 34rem;
  }

  .pil__row.pil__cell--0 {
    grid-column: 1;
    grid-row: 1;
  }
  .pil__panel.pil__cell--0 {
    grid-column: 1;
    grid-row: 2;
  }
  .pil__row.pil__cell--1 {
    grid-column: 1;
    grid-row: 3;
  }
  .pil__panel.pil__cell--1 {
    grid-column: 1;
    grid-row: 4;
  }
  .pil__row.pil__cell--2 {
    grid-column: 1;
    grid-row: 5;
  }
  .pil__panel.pil__cell--2 {
    grid-column: 1;
    grid-row: 6;
  }

  /* …and the three drawings stack into ONE absolute stage over the right
     column — out of the grid's track sizing on purpose (see min-height
     above). PINNED to the top, with the rest-state height: when a panel
     opens and the body grows, the stage must NOT re-centre against the new
     height (measured: it slid ~580px down and out of the viewport — the
     visitor never saw the explosion they had just asked for). */
  .pil__art {
    position: absolute;
    top: 0;
    height: 34rem;
    left: calc((100% - var(--space-8)) * 0.3061 + var(--space-8));
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    opacity: 0;
    transition: opacity var(--dur-fast) linear;
    pointer-events: none;
    padding-block: 0;
  }

  .pil__art .xp {
    flex: 1;
    min-height: 0;
    width: 100%;
    height: 100%;
  }

  .pil__art--staged {
    opacity: 1;
  }
}
</style>
