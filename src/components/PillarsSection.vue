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
import { createFx, prefersReducedMotion } from '@/lib/fx'

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

/**
 * Whether the fold may ANIMATE. The panels ship open (progressive disclosure),
 * so the very first thing hydration does is close all three — and that must be
 * instant, not three panels visibly folding away on every page load. `live`
 * flips in a microtask, this in a macrotask after it, so the initial collapse
 * is evaluated with the Transition's CSS disabled and every later toggle with
 * it enabled.
 */
const armed = ref(false)

/**
 * THE PLATE LOOPS. Which pillars have an encoded clip
 * (scripts/build-pillar-videos.mjs → public/video/pillar-<id>-<version>.*).
 * A pillar not listed here keeps its drawn plate, so the two can be replaced
 * one at a time without the section ever being half-broken.
 *
 * PAIRED with VERSION in that script: /video/* ships an immutable year-long
 * cache header, so a re-encode under the same name never reaches a repeat
 * visitor — bump both together.
 */
const PLATE_VERSION = 'v1'
const PLATE_CLIPS = new Set(['design'])

function hasClip(id: string): boolean {
  return PLATE_CLIPS.has(id)
}
function clip(id: string, ext: string): string {
  return `/video/pillar-${id}-${PLATE_VERSION}.${ext}`
}

/**
 * The loops are DECORATION, so they obey the house rule for loops: they run
 * only while their plate is on screen, and they never run at all under reduced
 * motion. Autoplay is therefore NOT an attribute — the markup ships a paused
 * video showing its poster, which is exactly what a JS-off reader and a
 * reduced-motion visitor should get, and JS is what starts it.
 */
function wireClips(host: HTMLElement) {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  const vids = Array.from(host.querySelectorAll<HTMLVideoElement>('.pil__clip'))
  if (!vids.length) return
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement
        if (e.isIntersecting) {
          // play() rejects when the tab is backgrounded or the decode is
          // refused; the poster stays, which is a fine resting state.
          void v.play().catch(() => {})
        } else {
          v.pause()
        }
      }
    },
    // ANY sliver, deliberately. A share-based threshold can never be met by an
    // element with no area, and these sit inside a plate whose width is still
    // animating at mount — the clip would simply never start.
    { threshold: 0 },
  )
  for (const v of vids) io.observe(v)
}

onMounted(() => {
  live.value = true
  fx.setTimeout(() => {
    armed.value = true
  }, 0)
  // AFTER the live re-render, and that is the whole point: the plate's face is
  // a <component :is="live ? 'button' : 'div'">, so flipping `live` REPLACES
  // that element and every child with it — including these videos. Observing
  // them at mount attached the observer to nodes Vue was about to throw away,
  // and nothing ever played. nextTick waits for the swap and observes the
  // elements that actually end up on the page.
  nextTick(() => {
    if (host.value) wireClips(host.value)
  })
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
            <!-- THE PLATE LOOP, where one exists: it takes the drawing's place
                 entirely, and only the name block below it stays. No autoplay
                 attribute — the markup ships paused on its poster (what JS-off
                 and reduced-motion readers get) and wireClips() starts it when
                 the plate is on screen. muted+playsinline are what make an
                 inline autostart legal on iOS at all; preload="none" keeps
                 three clips off the wire until one is actually wanted. -->
            <video
              v-if="hasClip(item.id)"
              class="pl pil__clip"
              :poster="clip(item.id, 'jpg')"
              muted
              loop
              playsinline
              preload="none"
              disablepictureinpicture
              aria-hidden="true"
              tabindex="-1"
            >
              <source :src="clip(item.id, 'webm')" type="video/webm" />
              <source :src="clip(item.id, 'mp4')" type="video/mp4" />
            </video>

            <!-- dizajn — the browser window being drafted: chrome dots, an
                 asymmetric composition blocked out, guides and one dimension
                 line still on the sheet. -->
            <svg
              v-else-if="item.id === 'design'"
              class="pl"
              viewBox="0 0 800 600"
              aria-hidden="true"
            >
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

          <!-- The reading surface: prints inside the widened plate.
               `v-if` rather than a CSS hide, so a closing panel can be HELD in
               the DOM for the length of its own leave — a display:none reveal
               has nothing to animate out. The condition keeps the progressive
               -disclosure contract exactly as it was: not live (prerender, JS
               off) renders every panel open in flow. -->
          <Transition name="fold" :css="armed">
            <div
              v-if="!live || open === n"
              :id="`paketi-panel-${item.id}`"
              class="pil__fold"
            >
              <div class="pil__reveal">
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
            </div>
          </Transition>
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

/* The plate loop fills the drawing's slot. `cover` on purpose: the clips are
   portrait and the slot's shape changes across breakpoints and again when a
   plate opens, so the frame is cropped to the slot rather than the slot bent
   to the frame. object-position is high because the composition sits in the
   upper half of the frame. The box carries the plate's own ground so nothing
   flashes through before the first frame decodes. */
.pil__clip {
  /* A DECLARED plate shape, not whatever flex hands out: stacked on a phone the
     clip took its height from `flex: 1` and came out 416px against the drawn
     plates' 173, which is not a shape anyone chose. 4:3 is the encode's OWN
     ratio (scripts/build-pillar-videos.mjs crops to it), so a stacked plate
     shows the whole frame and crops nothing. Desktop drops the ratio — there
     the wall sets the height and `cover` does the cropping as the plate
     widens and narrows. */
  aspect-ratio: 4 / 3;
  height: auto;
  object-fit: cover;
  /* The composition sits in the upper half of the frame. */
  object-position: 50% 42%;
  background: var(--grafit);
  /* A tap on the plate must reach the button, never the media element. */
  pointer-events: none;
}

@media (min-width: 900px) {
  .pil__clip {
    aspect-ratio: auto;
    height: 100%;
  }
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
   A column of plates; before hydration every reveal is visible. Once live, a
   closed plate simply has no panel in the DOM (v-if) — nothing is hidden with
   CSS, which is what lets the close animate. */
.pil__wall {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* --- the fold ----------------------------------------------------------------
   MAXIMIZE / MINIMIZE. Each breakpoint animates the thing that actually
   changes there, and the leave is the enter run backwards through the mirrored
   easing — a close that is not simply the open reversed is what reads as
   glitchy.

   PHONES: the plate has to grow taller, so the fold animates its own row from
   0fr to 1fr — the one honest way to transition to an auto height — while the
   content rises and fades inside it.
   DESKTOP: the plate's own flex-grow already carries the size (see the wall
   block below), so the fold does NOT animate height at all; the content simply
   arrives a beat later, once the plate has finished widening.

   Under reduced motion the global kill-switch zeroes every duration here, so
   the panel appears and disappears with no travel — the same states, no
   animation. */
.pil__fold {
  display: grid;
  grid-template-rows: 1fr;
}

.pil__reveal {
  /* The grid row's size is what animates; the content must be allowed to be
     clipped by it, and a grid item's default min-height:auto refuses to go
     below its content. */
  min-height: 0;
  overflow: hidden;
}

.fold-enter-active,
.fold-leave-active {
  transition: grid-template-rows var(--fold-ms, 420ms) var(--fold-ease, var(--ease-spring));
}

.fold-enter-active .pil__reveal,
.fold-leave-active .pil__reveal {
  transition:
    opacity var(--fold-content-ms, 260ms) var(--fold-ease, var(--ease-spring)) var(--fold-content-delay, 120ms),
    transform var(--fold-content-ms, 260ms) var(--fold-ease, var(--ease-spring)) var(--fold-content-delay, 120ms);
}

/* The leaving side takes the mirror: quicker, no delay on the content (it
   goes first, then the fold closes under it), and the reversed easing. */
.fold-leave-active {
  --fold-ms: 340ms;
  --fold-ease: cubic-bezier(0.64, 0, 0.78, 0);
  --fold-content-ms: 180ms;
  --fold-content-delay: 0ms;
}

.fold-enter-from,
.fold-leave-to {
  grid-template-rows: 0fr;
}

.fold-enter-from .pil__reveal,
.fold-leave-to .pil__reveal {
  opacity: 0;
  transform: translateY(-8px);
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

  /* THE WALL IS NEVER EVEN. The majority plate holds 3/5 of the row and the
     other two a fifth each — 3 : 1 : 1 = 60/20/20, a fifth more than a half,
     which is what makes it read as the one being looked at rather than merely
     the larger one. At rest that majority belongs to the FIRST pillar;
     hovering any plate hands it the majority and returns the others to a
     fifth, so the same shape slides along the row. All three clips play the
     whole time — what changes is how much of each you are given.

     THE SPLIT IS ALSO THE ENCODE'S SPEC: 60% of the row against the wall's
     height makes the majority plate ~1.31:1 and a minority plate ~0.44:1, and
     scripts/build-pillar-videos.mjs crops to the first while the second is
     what sets the clips' safe area. Change these numbers and that script's
     TARGET_RATIO changes with them. */
  .pil__plate {
    flex: 1 1 0;
    transition: flex-grow 380ms var(--ease-spring);
  }

  .pil__plate:first-of-type {
    flex-grow: 3;
  }

  @media (hover: hover) {
    /* Order matters: the wall-hover rule outranks :first-of-type (0,3,0 against
       0,2,0), so the first plate gives up its default majority the moment any
       other is pointed at. */
    .pil--live .pil__wall:not(:has(.pil__plate--open)):hover .pil__plate {
      flex-grow: 1;
    }
    .pil--live .pil__wall:not(:has(.pil__plate--open)) .pil__plate:hover {
      flex-grow: 3;
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

  /* The fold is the flex child now; on desktop it never animates its height —
     the plate's flex-grow is the maximize, and the content fades in behind it
     (see the fold block above). grid-template-rows is pinned at 1fr in every
     transition state so the row can never collapse here. */
  .pil__plate--open .pil__fold {
    flex: 1;
    min-width: 0;
  }

  /* No height travel here — the row is 1fr in every state — but the fold KEEPS
     its declared transition duration. Vue times a leave from the transitioned
     element itself, not from its children, so zeroing it here would strip the
     classes on the next tick and take the content's own fade down with it
     (measured: the text snapped in at the start of the widen instead of
     arriving with it). The content's 120ms delay + 260ms then lands exactly as
     the plate's 380ms flex-grow finishes. */
  .fold-enter-from,
  .fold-leave-to {
    grid-template-rows: 1fr;
  }

  .pil__plate--open .pil__reveal {
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
