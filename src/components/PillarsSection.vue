<script setup lang="ts">
/**
 * Vsi paketi — three dark plates in a row, each an engraved drawing of its
 * own theme: the browser window being drafted (dizajn), the hatched shield
 * with the keyway (varnost), the lens over the page with rings radiating
 * (vidnost). Big pictures first; the section IS the pictures.
 *
 * THE JOURNEY, built for scanning:
 *  · At rest: three plates side by side, titles on the plates. Hovering
 *    swells one (pure CSS, hover devices only).
 *  · Choosing one: the plate WIDENS ACROSS THE ROW and becomes the reading
 *    surface — summary and points print inside it, wide and shallow, while
 *    the other two fold into slim labeled spines. The row's height does not
 *    change: opening never adds scroll on desktop.
 *  · The spines stay buttons — switching pillars is one click, no close-
 *    then-reopen. Escape or »Zapri« closes; focus returns to the plate.
 *
 * Phones stack the plates; opening unfolds the text below the drawing
 * inside the plate (single column), others stay full plates.
 *
 * With JS off (or before hydration) every plate stands full-width with its
 * text visible — progressive disclosure ships expanded, the collapse is
 * hydration-gated. Under reduced motion all movement lands instantly
 * (global kill-switch); everything stays operable. Every string lives in
 * the accessible flow; the drawings are aria-hidden theatre.
 */
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { pillars } from '@/content/home'
import { createFx } from '@/lib/fx'

const fx = createFx()
const host = ref<HTMLElement | null>(null)
const live = ref(false)

/** The open pillar; −1 = the resting wall. */
const open = ref(-1)

function faceAt(i: number): HTMLElement | undefined {
  return host.value?.querySelectorAll<HTMLElement>('.pil__face')[i]
}

function choose(i: number) {
  open.value = open.value === i ? -1 : i
}

function closeFromPanel(i: number) {
  open.value = -1
  nextTick(() => faceAt(i)?.focus({ preventScroll: true }))
}

function onSectionKeys(e: KeyboardEvent) {
  if (e.key !== 'Escape' || open.value < 0) return
  e.preventDefault()
  closeFromPanel(open.value)
}

onMounted(() => {
  live.value = true
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

      <div class="pil__wall">
        <article
          v-for="(item, n) in pillars.items"
          :key="item.id"
          class="pil__plate"
          :class="{
            'pil__plate--open': live && open === n,
            'pil__plate--spine': live && open >= 0 && open !== n,
          }"
        >
          <!-- The plate's mark on the sheet. Phones only (see the datum block
               in the styles); decorative, so it stays out of the button. -->
          <span class="pil__plate-index" aria-hidden="true">00{{ n + 1 }}</span>
          <!-- The face: the whole plate is the control. Click opens (or, as a
               spine, switches); click again closes. -->
          <component
            :is="live ? 'button' : 'div'"
            class="pil__face"
            :type="live ? 'button' : undefined"
            :aria-expanded="live ? String(open === n) : undefined"
            :aria-controls="live ? `paketi-panel-${item.id}` : undefined"
            @click="live && choose(n)"
          >
            <!-- dizajn — the browser window being drafted: chrome dots, an
                 asymmetric composition blocked out, guides and one dimension
                 line still on the sheet. -->
            <svg v-if="item.id === 'design'" class="pl" viewBox="0 0 800 600" aria-hidden="true">
              <rect x="90" y="70" width="620" height="460" class="pl-line" />
              <line x1="90" y1="130" x2="710" y2="130" class="pl-line" />
              <circle cx="126" cy="100" r="7" class="pl-dot" />
              <circle cx="156" cy="100" r="7" class="pl-dot" />
              <circle cx="186" cy="100" r="7" class="pl-dot" />
              <rect x="240" y="92" width="380" height="16" class="pl-faint" />
              <!-- the composition: one bold mass, one red bar, type rules -->
              <rect x="130" y="170" width="270" height="200" class="pl-solid" />
              <rect x="130" y="404" width="120" height="86" class="pl-line" />
              <rect x="440" y="170" width="230" height="26" class="pl-red-solid" />
              <line x1="440" y1="238" x2="670" y2="238" class="pl-rule" />
              <line x1="440" y1="268" x2="632" y2="268" class="pl-rule" />
              <line x1="440" y1="298" x2="658" y2="298" class="pl-rule" />
              <line x1="440" y1="328" x2="600" y2="328" class="pl-rule" />
              <rect x="440" y="404" width="230" height="86" class="pl-hatch-r" />
              <!-- construction: guides run off the sheet, a dimension line -->
              <line x1="130" y1="40" x2="130" y2="560" class="pl-guide" />
              <line x1="440" y1="40" x2="440" y2="560" class="pl-guide" />
              <line x1="60" y1="170" x2="740" y2="170" class="pl-guide" />
              <line x1="130" y1="562" x2="400" y2="562" class="pl-dim" />
              <line x1="130" y1="554" x2="130" y2="570" class="pl-dim" />
              <line x1="400" y1="554" x2="400" y2="570" class="pl-dim" />
            </svg>

            <!-- varnost — the shield in section: one half hatched (the cut
                 matter), the keyway red, calibration ticks around the crown. -->
            <svg v-else-if="item.id === 'security'" class="pl" viewBox="0 0 800 600" aria-hidden="true">
              <path
                d="M 400 78 L 620 140 L 620 320 C 620 440 520 510 400 552 C 280 510 180 440 180 320 L 180 140 Z"
                class="pl-line"
              />
              <path
                d="M 400 118 L 582 170 L 582 316 C 582 416 500 476 400 512 C 300 476 218 416 218 316 L 218 170 Z"
                class="pl-faint"
              />
              <!-- the cut half: section hatch -->
              <path
                d="M 400 118 L 400 512 C 300 476 218 416 218 316 L 218 170 Z"
                class="pl-hatch"
              />
              <!-- the keyway -->
              <circle cx="400" cy="300" r="34" class="pl-red" />
              <rect x="388" y="330" width="24" height="74" class="pl-red-solid" />
              <!-- crown ticks -->
              <line x1="260" y1="96" x2="268" y2="116" class="pl-tick" />
              <line x1="330" y1="76" x2="335" y2="97" class="pl-tick" />
              <line x1="470" y1="76" x2="465" y2="97" class="pl-tick" />
              <line x1="540" y1="96" x2="532" y2="116" class="pl-tick" />
            </svg>

            <!-- vidnost — the page that gets FOUND. The document emits from
                 its own edge; the signal weakens outward across the reach
                 frontier; three systems sit out there and receive it, and one
                 has answered — the red axis and its lit node. (A magnifier
                 would have said "we inspect your page"; this says "they find
                 it", which is what the pillar is about.) -->
            <svg v-else class="pl" viewBox="0 0 800 600" aria-hidden="true">
              <!-- the page -->
              <rect x="90" y="150" width="250" height="330" class="pl-line" />
              <rect x="120" y="185" width="130" height="24" class="pl-solid" />
              <line x1="120" y1="252" x2="310" y2="252" class="pl-rule" />
              <line x1="120" y1="288" x2="272" y2="288" class="pl-rule" />
              <line x1="120" y1="324" x2="300" y2="324" class="pl-rule" />
              <line x1="120" y1="360" x2="256" y2="360" class="pl-rule" />
              <line x1="120" y1="396" x2="292" y2="396" class="pl-rule" />
              <line x1="120" y1="432" x2="236" y2="432" class="pl-rule" />
              <!-- emission, weakening outward -->
              <path d="M 403 225 A 110 110 0 0 1 403 405" class="pl-line" />
              <path d="M 443 168 A 180 180 0 0 1 443 462" class="pl-faint" />
              <path d="M 501 124 A 250 250 0 0 1 501 507" class="pl-faint" />
              <!-- the reach frontier -->
              <path d="M 552 103 A 300 300 0 0 1 552 527" class="pl-ring" />
              <!-- the systems out there -->
              <rect x="588" y="118" width="28" height="28" class="pl-line" />
              <circle cx="602" cy="132" r="5" class="pl-solid" />
              <rect x="588" y="484" width="28" height="28" class="pl-line" />
              <circle cx="602" cy="498" r="5" class="pl-solid" />
              <rect x="646" y="301" width="28" height="28" class="pl-line" />
              <!-- the one that answered -->
              <line x1="344" y1="315" x2="640" y2="315" class="pl-red" />
              <circle cx="660" cy="315" r="6" class="pl-red-solid" />
            </svg>

            <span class="pil__plate-name">
              <span class="pil__plate-title">{{ item.title }}</span>
              <span class="pil__plate-artifact annot">{{ item.artifact }}</span>
            </span>
          </component>

          <!-- The reading surface: prints inside the widened plate. -->
          <div
            :id="`paketi-panel-${item.id}`"
            class="pil__reveal"
          >
            <p class="pil__summary">{{ item.summary }}</p>
            <ul class="pil__points">
              <li v-for="(pt, k) in item.points" :key="k" class="pil__point">
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
        </article>
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

/* --- the plates -------------------------------------------------------------
   Dark plates on the paper band: the machine-world ground carrying paper
   strokes and the red. Text on them: paper 13.9:1, papir-dim 10.4:1. */
.pil__plate {
  position: relative;
  background: var(--grafit);
  border: var(--divider-width) solid var(--grafit);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pil__face {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  padding: var(--space-4);
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

button.pil__face {
  cursor: pointer;
}

.pil__face:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: -6px;
}

.pl {
  width: 100%;
  height: auto;
  flex: 1;
  min-height: 0;
  display: block;
}

/* Engraving vocabulary: paper strokes on the dark plate, one red. */
.pl-line {
  fill: none;
  stroke: rgb(245 242 235 / 0.85);
  stroke-width: 2.5;
}
.pl-faint {
  fill: none;
  stroke: rgb(245 242 235 / 0.35);
  stroke-width: 2;
}
.pl-rule {
  fill: none;
  stroke: rgb(245 242 235 / 0.55);
  stroke-width: 4;
}
.pl-solid {
  fill: rgb(245 242 235 / 0.85);
}
.pl-dot {
  fill: rgb(245 242 235 / 0.85);
}
.pl-guide {
  fill: none;
  stroke: rgb(245 242 235 / 0.18);
  stroke-width: 1.5;
}
.pl-dim {
  fill: none;
  stroke: rgb(245 242 235 / 0.45);
  stroke-width: 1.5;
}
.pl-tick {
  fill: none;
  stroke: rgb(245 242 235 / 0.5);
  stroke-width: 2.5;
}
.pl-hatch {
  fill: none;
  stroke: rgb(245 242 235 / 0.3);
  stroke-width: 1.5;
}
.pl-hatch-r {
  fill: none;
  stroke: rgb(245 242 235 / 0.35);
  stroke-width: 1.5;
}
.pl-ring {
  fill: none;
  stroke: rgb(245 242 235 / 0.25);
  stroke-width: 1.5;
  stroke-dasharray: 10 10;
}
.pl-red {
  fill: none;
  stroke: var(--rez-na-temnem);
  stroke-width: 5;
}
.pl-red-solid {
  fill: var(--rez-na-temnem);
}

/* The shield's hatch and the template block: patterned via SVG lines is
   heavy — a CSS repeating gradient cannot reach inside SVG, so those two
   paths carry a light stroke fill instead and the density reads from the
   plate itself. */

.pil__plate-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: var(--space-3);
}

.pil__plate-title {
  font-family: var(--font-sans);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-paper);
}

.pil__plate-artifact {
  color: var(--papir-dim);
}

/* --- the reading surface ----------------------------------------------------- */
.pil__reveal {
  padding: 0 var(--space-4) var(--space-4);
  color: var(--papir-dim);
}

.pil__summary {
  color: var(--papir-dim);
  max-width: 58ch;
}

.pil__points {
  list-style: none;
  margin-top: var(--space-4);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--space-3) var(--space-6);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
  padding-top: var(--space-3);
}

.pil__point {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pil__point-label {
  font-weight: 500;
  font-size: 0.9375rem;
  line-height: 1.3;
  color: var(--color-paper);
}

.pil__point-detail {
  color: var(--papir-dim);
  font-size: 0.9375rem;
  line-height: 1.45;
}

.pil__prerez {
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 58ch;
}

.pil__prerez .annot {
  color: var(--color-paper);
}

.pil__prerez-gloss {
  color: var(--papir-dim);
  font-size: 0.9375rem;
}

.pil__close {
  margin-top: var(--space-4);
  padding: 0.55rem 1rem;
  min-height: 44px;
  background: none;
  border: 1px solid var(--crta-na-temnem);
  color: var(--color-paper);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  cursor: pointer;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  .pil__close:hover {
    border-color: var(--rez-na-temnem);
    color: var(--rez-na-temnem);
  }
}

.pil__close:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 2px;
}

/* --- resting flow (phones, pre-hydration) ------------------------------------
   A column of plates; before hydration every reveal is visible. Once live,
   closed reveals leave the flow — the opening motion is the plate itself. */
.pil__wall {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pil--live .pil__plate:not(.pil__plate--open) .pil__reveal {
  display: none;
}

/* The plate's mark on the sheet — phones only (the desktop wall has no
   margin to hold it, and the plate titles already carry the order). */
.pil__plate-index {
  display: none;
}

/* --- phones: plates pinned along a datum -------------------------------------
   Not a list of pictures: a drafting DATUM runs down the left margin, the
   plates hang off it at three different indents, and each overlaps the one
   above by a sliver — so the stack reads as drawings laid on a table, not as
   three equal cards. The paper keyline (an outline, so it costs no layout)
   is what makes the overlap read as intentional rather than as a collision;
   depth here is still drawn, never cast. Opening a plate takes the full
   measure back, which is the layout's own way of saying "this one now". */
@media (max-width: 899.98px) {
  .pil__wall {
    position: relative;
    gap: 0;
    padding-left: 2.8rem;
  }

  /* the datum */
  .pil__wall::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0.4rem;
    bottom: 0.4rem;
    width: 1px;
    background: var(--mreza-strong);
  }

  .pil__plate {
    outline: 4px solid var(--list-2);
    margin-top: -1rem;
  }

  .pil__plate:first-of-type {
    margin-top: 0;
  }

  /* the irregular rhythm */
  .pil__plate:nth-of-type(2) {
    margin-left: 1.6rem;
  }

  .pil__plate:nth-of-type(3) {
    margin-right: 2.2rem;
  }

  /* Doubled class on purpose: the indent rules above are :nth-of-type
     (specificity 0,2,0) and would otherwise outrank a single class — the
     open plate kept its indent and never took the full measure (measured). */
  .pil__plate.pil__plate--open {
    margin-left: 0;
    margin-right: 0;
  }

  .pil__plate-index {
    display: block;
    position: absolute;
    top: var(--space-2);
    left: -1.75rem;
    writing-mode: vertical-rl;
    font-family: var(--font-mono);
    font-size: var(--type-data-size);
    letter-spacing: var(--type-data-ls);
    color: var(--grafit-2);
  }
}

/* --- desktop: the wall ------------------------------------------------------- */
@media (min-width: 900px) {
  .pil__wall {
    flex-direction: row;
    gap: var(--space-3);
    align-items: stretch;
    min-height: 34rem;
  }

  .pil__plate {
    flex: 1 1 0;
    transition: flex-grow 380ms var(--ease-spring);
  }

  /* Hover: the pointed-at plate swells, the others give way (CSS only,
     hover devices only, never while one is open). */
  @media (hover: hover) {
    .pil--live .pil__wall:not(:has(.pil__plate--open)):hover .pil__plate {
      flex-grow: 0.9;
    }
    .pil--live .pil__wall:not(:has(.pil__plate--open)) .pil__plate:hover {
      flex-grow: 1.35;
    }
  }

  /* Open: the plate takes the row; text prints beside its drawing. */
  .pil__plate--open {
    flex-grow: 5;
  }

  .pil__plate--open .pil__face {
    flex: 0 0 38%;
    align-self: stretch;
  }

  .pil__plate--open {
    flex-direction: row-reverse;
    align-items: stretch;
  }

  .pil__plate--open .pil__reveal {
    flex: 1;
    min-width: 0;
    padding: var(--space-4);
    overflow-y: auto;
  }

  /* The spines: slim, label rotated, still buttons — switching is one
     click. Their drawings and artifacts step aside. */
  .pil__plate--spine {
    flex-grow: 0.16;
  }

  .pil__plate--spine .pl,
  .pil__plate--spine .pil__plate-artifact {
    display: none;
  }

  .pil__plate--spine .pil__face {
    align-items: flex-start;
  }

  .pil__plate--spine .pil__plate-name {
    padding-top: 0;
  }

  .pil__plate--spine .pil__plate-title {
    writing-mode: vertical-rl;
    font-size: 1.0625rem;
    white-space: nowrap;
  }
}
</style>
