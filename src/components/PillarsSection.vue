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

function plateAt(i: number): HTMLElement | undefined {
  return host.value?.querySelectorAll<HTMLElement>('.pil__plate')[i]
}

function clipAt(i: number): HTMLVideoElement | null {
  return plateAt(i)?.querySelector<HTMLVideoElement>('.pil__clip') ?? null
}

/**
 * THE PLATE WHOSE PANEL IS STILL LEAVING. Vue's transition classes live on the
 * fold, so the plate itself loses --open the instant the state flips — and
 * everything hung off that class went with it while the panel was still on
 * screen: the beige wash snapped back to graphite under text that was still
 * beige-on-ink, and the reframed picture jumped back to its closed framing at
 * the START of the collapse rather than the end. This ref keeps that plate
 * marked for exactly as long as the collapse lasts, and the styles read
 * :is(--open, --settling) so a leaving panel finishes in the state it was in.
 */
const settling = ref(-1)

/** Clips that are on screen right now, maintained by the observer, so the hold
 *  below can hand playback back to exactly the ones that should be running —
 *  never to one that scrolled away while the fold was moving. */
const visibleClips = new Set<HTMLVideoElement>()

/** The window the fold is allowed to be moving in: the longest transition here
 *  (the 300ms open) plus a beat. Shares its budget with CLOSE_HOLD_MS below. */
const FOLD_HOLD_MS = 340
let foldTimer = 0

/**
 * A FOLD IS THE MOST EXPENSIVE THING THIS SECTION DOES, and on a phone it is
 * the clip that makes it so: the plate's box changes on every frame of the
 * animation and the clip fills it absolutely, so a playing video is decoded,
 * scaled and repainted into a different rectangle for the whole 240–300ms.
 * Holding the two clips involved still for that long costs nothing anyone can
 * see — they are ambient loops, not content — and takes the decode out of the
 * frame budget at exactly the moment the frame budget is under pressure.
 *
 * Playback comes back through the observer's own set, so this can never leave
 * a clip paused that the observer would not itself have paused; and the observer keeps
 * running throughout, so scrolling the plate away and back restarts it anyway.
 * Under reduced motion there is nothing to hold: the fold lands on one frame,
 * so the window is zero and the framing must not linger either.
 */
function holdFold(prev: number, next: number) {
  const ms = prefersReducedMotion() ? 0 : FOLD_HOLD_MS
  settling.value = prev >= 0 && prev !== next && ms > 0 ? prev : -1
  const held: HTMLVideoElement[] = []
  for (const i of [prev, next]) {
    if (i < 0) continue
    const v = clipAt(i)
    if (v && ms > 0) {
      v.pause()
      held.push(v)
    }
  }
  clearTimeout(foldTimer)
  foldTimer = fx.setTimeout(() => {
    settling.value = -1
    for (const v of held) if (visibleClips.has(v)) void v.play().catch(() => {})
  }, ms)
}

function choose(i: number) {
  const prev = open.value
  open.value = prev === i ? -1 : i
  nextTick(() => holdFold(prev, open.value))
}

/**
 * How long the collapse is HELD still. Paired with .fold-leave-active's 240ms
 * below — this is that plus a beat, so the last frame of the transition is
 * still corrected and a late relayout cannot leak through. Change one, change
 * the other.
 */
const CLOSE_HOLD_MS = 340

/**
 * CLOSING MUST NOT MOVE THE READER, and on phones it did — badly. »Zapri« sits
 * at the BOTTOM of a panel that can be several screens tall, so collapsing it
 * removes that much document from ABOVE the viewport's own position while the
 * scroll offset stays where it was: everything below rushes up past the reader
 * and they land somewhere in the next section entirely.
 *
 * The fix is the house rule for collapsing content — hold the tapped thing
 * still — applied to the nearest anchor that SURVIVES the collapse. The button
 * itself does not (it lives inside the folding panel), so the plate's own
 * bottom edge stands in for it: it is 44px below the button, and pinning it
 * means the picture slides down into the space the text vacated and settles
 * exactly where the reader was looking.
 *
 * Per frame rather than once at the end, because the fold animates: measure the
 * anchor's drift, take exactly that out of the scroll position, repeat for the
 * transition's length. `behavior: 'instant'` is required, not stylistic —
 * base.css turns on `scroll-behavior: smooth` at ≥1200px and a corrective loop
 * chasing an animated target would never settle. Under reduced motion the
 * collapse lands on the first frame, so the first pass corrects everything and
 * the rest find no drift.
 */
function closeFromPanel(i: number) {
  const plate = plateAt(i)
  const anchor = plate?.getBoundingClientRect().bottom
  open.value = -1
  nextTick(() => {
    holdFold(i, -1)
    faceAt(i)?.focus({ preventScroll: true })
    if (!plate || anchor === undefined) return
    const until = performance.now() + CLOSE_HOLD_MS
    const hold = () => {
      const drift = plate.getBoundingClientRect().bottom - anchor
      if (drift) window.scrollBy({ top: drift, behavior: 'instant' })
      if (performance.now() < until) fx.raf(hold)
    }
    fx.raf(hold)
  })
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
 * A pillar not listed here keeps its drawn plate, which is what let them be
 * replaced one at a time without the section ever being half-broken. All three
 * carry a clip now; the drawn plates stay as the path back and as the shape any
 * fourth pillar would start from.
 *
 * PAIRED with PLATE_VERSION in that script: /video/* ships an immutable year-long
 * cache header, so a re-encode under the same name never reaches a repeat
 * visitor — bump both together.
 */
const PLATE_VERSION = 'v3'
const PLATE_CLIPS = new Set(['design', 'security', 'seo'])

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
          visibleClips.add(v)
          // play() rejects when the tab is backgrounded or the decode is
          // refused; the poster stays, which is a fine resting state.
          void v.play().catch(() => {})
        } else {
          visibleClips.delete(v)
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
  // AFTER the live re-render. The original reason was that the clips lived
  // INSIDE the face — a <component :is="live ? 'button' : 'div'"> — so flipping
  // `live` replaced that element and every child with it, and an observer
  // attached at mount held nodes Vue was about to throw away. The clips are the
  // plate's ground now and sit outside the face, so they survive that swap; the
  // tick stays because observing after the first full render is still the
  // correct order and it costs one microtask.
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
          :class="[
            `pil__plate--${item.id}`,
            {
              'pil__plate--clip': hasClip(item.id),
              'pil__plate--open': live && open === n,
              'pil__plate--settling': live && settling === n,
              'pil__plate--spine': live && open >= 0 && open !== n,
            },
          ]"
        >
          <!-- THE PLATE'S GROUND, where a clip exists. It sits OUTSIDE the face
               and fills the plate absolutely, which is the whole point: closed,
               it IS the plate, edge to edge with no inset; open, the plate grows
               to hold the panel and the clip grows with it, so the same footage
               becomes the surface the text prints on. (It also means the clip
               survives the face's div→button swap, which used to destroy it.)
               No autoplay attribute — the markup ships paused on its poster,
               which is what JS-off and reduced-motion readers get, and
               wireClips() starts it when the plate is on screen. muted +
               playsinline are what make an inline autostart legal on iOS at
               all; preload="none" keeps three clips off the wire until one is
               actually wanted. -->
          <video
            v-if="hasClip(item.id)"
            class="pil__clip"
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
            <!-- THE DRAWN PLATES, for any pillar without a clip. A clip takes
                 the drawing's place entirely — and takes the whole plate with
                 it, from behind (see the ground above), so nothing but the name
                 block is left in the face here. -->
            <template v-if="!hasClip(item.id)">
            <!-- dizajn — the browser window being drafted: chrome dots, an
                 asymmetric composition blocked out, guides and one dimension
                 line still on the sheet. -->
            <svg
              v-if="item.id === 'design'"
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
            </template>

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
  /* EACH PLATE IS ITS OWN STACKING CONTEXT, and on phones that is load-bearing
     rather than hygiene. The stack is imbricated — each plate rides 1rem over
     the one above — and the rule that makes it read is that the LOWER plate
     covers the upper one. But the face and the fold both claim z-index 1 to sit
     above their plate's clip, and a plate with z-index:auto is not a stacking
     context, so those two were promoted into the SECTION's context instead:
     an open plate's fold painted its wash straight over the top of the plate
     below it (visible the moment the fold gained a background — a grey belt
     across the next plate's picture). `isolate` keeps z-index 1 meaning
     "above this plate's own clip" and nothing more, and tree order then does
     what it always should have: the next plate covers this one. */
  isolation: isolate;
  background: var(--grafit);
  border: var(--divider-width) solid var(--grafit);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pil__face {
  /* Positioned so it sits ABOVE the clip that fills the plate behind it — see
     the z-index note in the clip block. */
  position: relative;
  z-index: 1;
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
  outline: 2px solid var(--plate-focus, var(--rez-na-temnem));
  outline-offset: -6px;
}

.pl {
  width: 100%;
  height: auto;
  flex: 1;
  min-height: 0;
  display: block;
}

/* --- the clip as the plate's GROUND -------------------------------------------
   Not a picture hung inside a plate: the clip fills the plate absolutely, edge
   to edge, and the plate is whatever the state makes it — a fifth of the row, a
   spine, three fifths, or the whole row with a panel of text printed on it. It
   is the same element throughout, so opening a plate does not swap a picture
   for a background; it grows the one that was already there.

   `cover` is what absorbs that range, and the range is wide: the box runs from
   about 0.40:1 as a minority plate to about 2:1 open, so the crop takes the
   sides in one state and the top and bottom in another. 50% 50% is the only
   position that stays honest through both. The box keeps the plate's own ground
   so nothing flashes through before the first frame decodes.

   z-index 0 rather than nothing: an absolutely positioned child paints ABOVE
   its statically positioned siblings' content by default, and the entire point
   here is that it paints below. The face and the fold claim 1 to sit on it. */
.pil__clip {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  background: var(--grafit);
  /* A tap on the plate must reach the button, never the media element. */
  pointer-events: none;
}

/* THE TEXT'S GROUND — the only thing between a plate's title and a moving
   image, so it is measured rather than judged. Two layers, because they do
   different jobs and only one of them animates:

   ::before is the resting scrim — the plate's own ink rising into the bottom of
   the frame. That is the poché move (solid graphite = the machine world), not a
   photo-app gradient, and it is sized so the whole name block sits inside its
   dense end.

   ::after is the OPEN wash: a flat sheet of the same ink over the entire plate,
   faded in with the fold. Two elements rather than one animated gradient
   because gradients interpolate only when their stop lists match, and a
   three-stop fade and a flat sheet do not — it would snap.

   WORST CASE IS MEASURED AGAINST WHITE, not against these three clips: a scrim
   that only holds because today's footage happens to be mid-toned is one that
   breaks on the next clip. Composited over a pure white frame, in-page against
   the real tokens:
     closed, bottom stop      rgb(49 49 49)  --color-paper 11.61:1
     closed, 24% stop         rgb(75 75 75)  --papir-dim    5.18:1
   The OPEN ground is not measured here any more — it moved to the theme block
   below, because it is no longer one number: each plate's wash is its own
   clip's colour and each was measured against its own footage. */
.pil__plate--clip::before,
.pil__plate--clip::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.pil__plate--clip::before {
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--grafit) 94%, transparent) 0%,
    color-mix(in srgb, var(--grafit) 82%, transparent) 24%,
    color-mix(in srgb, var(--grafit) 0%, transparent) 58%
  );
}

.pil__plate--clip::after {
  background: color-mix(
    in srgb,
    var(--plate-wash, var(--grafit)) var(--plate-alpha, 80%),
    transparent
  );
  opacity: 0;
  transition: opacity 280ms var(--ease-spring);
}

/* AN OPEN PLATE DROPS THE RESTING SCRIM. It is a full-plate gradient, so while
   the plate's height animates the compositor re-rasterises it every frame — and
   for nothing: open, its dense end is at the plate's BOTTOM, under the fold's
   own wash, and where it would show (the face) it has already faded to zero.
   Removing it takes one full-size gradient out of every frame of the fold. */
.pil__plate--clip:is(.pil__plate--open, .pil__plate--settling)::before {
  display: none;
}

/* --- each plate takes its own clip's colour -------------------------------
   THE OPEN PANEL IS THE CLIP CONTINUED, and varnost is the proof: its wash
   happens to be graphite and its footage is graphite, so the text looks like
   it is printed on the same material the picture is made of. The other two
   were wearing varnost's ground over their own footage — a beige studio and a
   blue-grey server room, both behind a dark grey sheet — which is why only
   one of the three read right.

   EVERY VALUE HERE IS SAMPLED FROM THE FOOTAGE, not chosen. Method: decode
   the clip, take the strip that is actually visible, and average the rows that
   end up BEHIND the text. That gives design #af9b8d and seo #86939a. Each is
   then lifted 14% toward white — the smallest lift that carries the ink clear
   of AA against the darkest pixel the same region can produce — and the wash
   goes to 92%, so the picture reads as a texture in the ground rather than as
   a picture behind glass.

   ONE PAIR OF VALUES SERVES BOTH BREAKPOINTS, and that is worth stating because
   the two crops are not the same: a phone plate is ~0.27:1 against a 4:3 source
   so `cover` shows its central ~16% of width, while a desktop plate is ~2.2:1
   and shows the full width but only the central ~61% of the height. Both were
   composited against their own region's 2nd/98th percentile and both clear AA
   on the same wash, so a plate keeps ONE colour identity rather than two:
     phone    design ground #ad9d90..#bcaca1  ink 6.22:1
              seo    ground #8e999f..#9ea9af  ink 5.53:1
     desktop  design ground #b1a195..#bcab9f  ink 6.23:1
              seo    ground #919ca2..#9ca7ac  ink 5.53:1
   RE-DERIVE ALL OF IT WHEN A CLIP CHANGES. They are paired to PLATE_VERSION as
   surely as the file names are.

   ONE INK, NOT TWO, on the light plates. A light ground has no room for a
   dimmed secondary: the lightest text that still clears 4.5:1 against the
   dark end of this footage is within a few per cent of the ink itself, so a
   second colour would be a difference nobody can see that costs a contrast
   failure to have. The hierarchy the dark plates get from paper-vs-dim comes
   from WEIGHT here instead, which the markup already carries (labels 500,
   details 400). The rule between them and the button's border drop to a
   transparent ink instead of the dark world's bronze hairline.

   CLOSED PLATES ARE UNTOUCHED — every rule above reads these through
   var(…, <the old value>), and the variables are only ever set on an OPEN
   plate. The titles on the wall keep the paper they have always had; only an
   opened one goes to ink, because on a beige ground white type is not a style
   question. */
:is(.pil__plate--open, .pil__plate--settling).pil__plate--design,
:is(.pil__plate--open, .pil__plate--settling).pil__plate--seo {
  --plate-alpha: 92%;
  --plate-ink: var(--grafit);
  --plate-ink-dim: var(--grafit);
  --plate-rule: color-mix(in srgb, var(--grafit) 32%, transparent);
  /* The focus ring has to clear 3:1 against these grounds and the dark
     world's --rez-na-temnem cannot (1.59:1 on the beige, measured). The
     pressed cut red does: 3.23:1, and it keeps the ring the page's own red
     rather than turning it into another piece of ink. */
  --plate-focus: var(--rez-deep);
}

:is(.pil__plate--open, .pil__plate--settling).pil__plate--design {
  --plate-wash: #baa99d;
}

:is(.pil__plate--open, .pil__plate--settling).pil__plate--seo {
  --plate-wash: #97a2a8;
}

/* The flat sheet is the DESKTOP device only. There the open plate is a ROW —
   text on the left, picture on the right — so there is no top and bottom to
   fade between; the wash has to cover the whole plate or it covers nothing.
   Phones open the plate as a COLUMN (picture above, text below), which is a
   different shape and takes a different ground — see the phone block. */
@media (min-width: 900px) {
  .pil__plate--clip.pil__plate--open::after {
    opacity: 1;
  }
}

/* THE GRAYSCALE IS GONE, on both counts it was there for. It existed to make
   three clips shot on three different grounds behave like one material and to
   buy legibility — and now each plate wears its own clip's colour, so making
   them behave alike is the opposite of the point, and the wash alone is
   measured to carry the copy (see the theme block). It also cost: a filter on a
   playing video forces it off the compositor's fast path, and this one was
   TRANSITIONED over the same 380ms in which the plate's box was changing size,
   i.e. re-filtering a re-scaled video every frame of the open. Dropping it is
   the single largest saving in this section's animation.

   Measured with no filter at all, against each clip's own 2nd/98th percentile
   in the region the desktop plate actually shows (full width, central 61% of
   the height):
     design    ground #b1a195..#bcab9f   ink        6.23:1
     security  ground #1f1f1f..#444547   paper 8.54 · dim 5.70:1
     seo       ground #919ca2..#9ca7ac   ink        5.53:1 */

/* A clip plate carries NO FRAME. The face's padding is what used to read as
   one — a graphite inset on all four sides — and the plate's 1px border was a
   second, hairline one in the same colour. With the clip as the ground both go,
   and the padding moves to the text, which is the only thing that still needs
   it. */
.pil__plate--clip {
  border: 0;
}

.pil__plate--clip .pil__face {
  padding: 0;
  /* The name block drops to the bottom of the frame, into the scrim. */
  justify-content: flex-end;
}

.pil__plate--clip .pil__plate-name {
  padding: var(--space-4);
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
  color: var(--plate-ink, var(--color-paper));
}

.pil__plate-artifact {
  color: var(--plate-ink-dim, var(--papir-dim));
}

/* --- the reading surface ----------------------------------------------------- */
.pil__reveal {
  padding: 0 var(--space-4) var(--space-4);
  color: var(--plate-ink-dim, var(--papir-dim));
}

.pil__summary {
  color: var(--plate-ink-dim, var(--papir-dim));
  max-width: 58ch;
}

.pil__points {
  list-style: none;
  margin-top: var(--space-4);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--space-3) var(--space-6);
  border-top: var(--divider-width) solid var(--plate-rule, var(--crta-na-temnem));
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
  color: var(--plate-ink, var(--color-paper));
}

.pil__point-detail {
  color: var(--plate-ink-dim, var(--papir-dim));
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
  color: var(--plate-ink, var(--color-paper));
}

.pil__prerez-gloss {
  color: var(--plate-ink-dim, var(--papir-dim));
  font-size: 0.9375rem;
}

.pil__close {
  margin-top: var(--space-4);
  padding: 0.55rem 1rem;
  min-height: 44px;
  background: none;
  border: 1px solid var(--plate-rule, var(--crta-na-temnem));
  color: var(--plate-ink, var(--color-paper));
  text-transform: uppercase;
  letter-spacing: 0.09em;
  cursor: pointer;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  .pil__close:hover {
    border-color: var(--plate-focus, var(--rez-na-temnem));
    color: var(--plate-focus, var(--rez-na-temnem));
  }
}

.pil__close:focus-visible {
  outline: 2px solid var(--plate-focus, var(--rez-na-temnem));
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
  /* Above the plate's clip, like the face. */
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 1fr;
}

.pil__reveal {
  /* The grid row's size is what animates; the content must be allowed to be
     clipped by it, and a grid item's default min-height:auto refuses to go
     below its content. */
  min-height: 0;
  overflow: hidden;
  /* This box is the tallest thing on the page that changes size every frame of
     the fold. Containment tells the engine what is already true of it — its
     children's layout does not depend on its height, and nothing it paints
     escapes it — so a frame of the fold cannot dirty the rest of the document.
     Paired with the overflow above: without that, paint containment would be a
     behaviour change rather than a promise. */
  contain: layout paint;
}

.fold-enter-active,
.fold-leave-active {
  transition: grid-template-rows var(--fold-ms, 300ms) var(--fold-ease, var(--ease-spring));
}

.fold-enter-active .pil__reveal,
.fold-leave-active .pil__reveal {
  transition:
    opacity var(--fold-content-ms, 200ms) var(--fold-ease, var(--ease-spring)) var(--fold-content-delay, 90ms),
    transform var(--fold-content-ms, 200ms) var(--fold-ease, var(--ease-spring)) var(--fold-content-delay, 90ms);
}

/* The leaving side takes the mirror: quicker, no delay on the content (it
   goes first, then the fold closes under it), and the reversed easing. */
.fold-leave-active {
  --fold-ms: 240ms;
  --fold-ease: cubic-bezier(0.64, 0, 0.78, 0);
  --fold-content-ms: 140ms;
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

  /* The clip is out of flow now, so a closed plate has no height of its own —
     the face has to declare the shape. 4:3 is the encode's own ratio
     (scripts/build-pillar-videos.mjs crops to it), so a stacked plate shows the
     whole frame and crops nothing. Desktop needs none of this: there the wall's
     min-height sets the row and the plates stretch to it. */
  .pil__plate--clip .pil__face {
    aspect-ratio: 4 / 3;
  }

  /* THE OPEN GROUND ON A PHONE, and it is built from the plate's own shape
     rather than from a flat sheet over everything. An open plate here is a
     column: a 4:3 picture, then the text under it. So the picture keeps a CLEAR
     BAND at the top — the clip is the reason the plate is worth opening, and a
     72% sheet over all of it left a dead grey rectangle — and the wash arrives
     underneath it, ramped in, exactly where something has to be read on top.

     THE RAMP IS ANCHORED TO THE NAME BLOCK, and that is the whole trick. It
     started life pinned to the FACE — a percentage of the picture — and that
     is what produced the wide grey belt above the title: the fade had to start
     high enough to be safe for the longest possible title, so on every plate
     whose title is short it ran for a third of the picture with nothing in it.
     Hanging it off .pil__plate-name instead means the ramp always ends exactly
     where the text begins, whatever the title does — one line, two lines, a
     longer artifact line — with no percentage to re-derive and nothing to be
     safe about. 3rem of fade above the block, full wash from its top edge down
     through the fold. That constant is the only knob: raise it for a softer
     edge, drop it for a harder one.

     AND THE WASH IS 80% HERE, NOT 72%, because the phone keeps the clip in
     COLOUR — the band at the top has to look like the plate did before it was
     opened, so the grayscale/brightness filter that carries the desktop is not
     available to help. The wash alone has to hold the copy against the worst
     frame the footage could ever show. Measured in-page against pure white,
     unfiltered:
       72%   ink rgb(97 97 97)  paper 5.51:1 · --papir-dim 3.68:1  (fails)
       78%       rgb(84 84 84)  paper 6.75:1 · --papir-dim 4.51:1  (bare)
       80%       rgb(80 80 80)  paper 7.23:1 · --papir-dim 4.83:1  (taken)
     --papir-dim is the binding one — it carries the summary and every point's
     detail line at 15px, so it needs the full 4.5. Drop this number and those
     are the two pairs to re-measure.

     z-index −1 keeps it behind the face's own content while staying inside the
     face's stacking context, i.e. still above the clip. A positive z-index
     would paint the ramp OVER the plate title. */
  .pil__plate--clip .pil__plate-name {
    position: relative;
  }

  .pil__plate--clip .pil__plate-name::before {
    content: '';
    position: absolute;
    inset: -3rem 0 0;
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--plate-wash, var(--grafit)) 0%, transparent) 0,
      color-mix(
          in srgb,
          var(--plate-wash, var(--grafit)) var(--plate-alpha, 80%),
          transparent
        )
        3rem,
      color-mix(
        in srgb,
        var(--plate-wash, var(--grafit)) var(--plate-alpha, 80%),
        transparent
      )
    );
    opacity: 0;
    transition: opacity 280ms var(--ease-spring);
  }

  .pil__plate--clip:is(.pil__plate--open, .pil__plate--settling) .pil__plate-name::before {
    opacity: 1;
  }

  /* And the text's own ground is the fold's, so it covers the text and nothing
     else. It needs no fade of its own: the fold grows out of the ramp's dense
     end, so the two meet at the same value and read as one surface. */
  .pil__plate--clip.pil__plate--open .pil__fold {
    background: color-mix(
      in srgb,
      var(--plate-wash, var(--grafit)) var(--plate-alpha, 80%),
      transparent
    );
  }


  /* --- the reframe ----------------------------------------------------------
     THE CLEAR BAND HAS TO HAVE SOMETHING IN IT. An open plate is so tall and
     narrow that `cover` maps the clip's FULL height onto it, so the band at the
     top always showed the first ~10% of the frame — and measuring the motion
     row by row (frame-to-frame delta, averaged over the clip, inside the strip
     that is actually visible) says that is the deadest place to be:
       band at    0%     18%     32%    of the frame
       design    65%     95%     67%    of that clip's own peak motion
       seo        1%     45%     83%
       varnost   74%     47%     40%
     varnost is why the report says varnost is fine: its picture is already busy
     where the band sits. The other two are re-aimed onto their own peaks —
     design to 18%, seo to 32% — by making the element taller than the plate and
     hanging it above the top edge, then clipping it back to the plate's bounds.

     `object-position` cannot do this: `cover` here overflows horizontally only,
     so there is no vertical overflow for it to move. Hence the box.

     THE THREE NUMBERS ARE ONE CALCULATION. For height H and offset −T (both %
     of the plate), the plate's top edge samples the source at T / H and the
     bottom at (T + 100) / H, so H must be at least T + 100 or the picture runs
     out before the plate does. clip-path then trims exactly what hangs outside:
     T/H off the top, (H − 100 − T)/H off the bottom. The plate does not clip its
     own overflow — the phone stack's index marks live outside it — so the
     clipping has to be the element's own. */
  :is(.pil__plate--open, .pil__plate--settling).pil__plate--design .pil__clip {
    top: -23%;
    bottom: auto;
    height: 126%;
    clip-path: inset(18.25% 0 2.38% 0);
  }

  :is(.pil__plate--open, .pil__plate--settling).pil__plate--seo .pil__clip {
    top: -49%;
    bottom: auto;
    height: 152%;
    clip-path: inset(32.24% 0 1.97% 0);
  }

  /* »Zapri« CLEARS THE OVERLAP. The stack is deliberately imbricated — each
     plate rides 1rem over the one above it, with a 4px paper keyline — and the
     button, being the panel's last element, sat under that keyline: its bottom
     border was inside the next plate. This lifts it by the overlap plus a
     breath. The overlap itself is untouched; only the button moves. */
  .pil__close {
    margin-bottom: 1.75rem;
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
    transition: flex-grow 280ms var(--ease-spring);
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

  /* Open: the plate takes the row; text prints beside its drawing.

     DOUBLED CLASS, for the same reason the phone indents carry one: the default
     majority above is `.pil__plate:first-of-type`, which is 0,2,0 and outranks
     a lone state class at 0,1,0. Measured before the fix, at a 1280 viewport
     with the MIDDLE plate open: the first plate held flex-grow 3 and sat 409px
     wide beside the open one instead of collapsing to a 22px spine — a vertical
     label stranded on a third of the row. Opening the first plate hid it,
     because there 3-vs-5 only changes how much of an already-dominant row it
     takes (1006px against the 1053px it should have had). */
  .pil__plate.pil__plate--open {
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
  .pil__plate.pil__plate--spine {
    flex-grow: 0.16;
  }

  /* A spine is ~30px of row. A vertical slice that narrow is noise rather than
     picture, so the clip steps aside with the drawings — and because the IO
     watches the element itself, display:none reports as "not intersecting" and
     pauses the decode for free. */
  .pil__plate--spine .pl,
  .pil__plate--spine .pil__clip,
  .pil__plate--spine .pil__plate-artifact {
    display: none;
  }

  .pil__plate--spine .pil__face {
    align-items: flex-start;
  }

  /* The spine's label reads from the top, so it keeps the face's own start
     alignment rather than the clip plates' bottom drop. */
  .pil__plate--clip.pil__plate--spine .pil__face {
    justify-content: flex-start;
  }

  .pil__plate--spine .pil__plate-name {
    padding-top: 0;
  }

  /* ...but a clip plate's padding lives on the name block, so zeroing the top
     here would put the label against the plate's edge. Restore exactly what the
     face's own padding used to give it. */
  .pil__plate--clip.pil__plate--spine .pil__plate-name {
    padding-top: var(--space-4);
  }

  .pil__plate--spine .pil__plate-title {
    writing-mode: vertical-rl;
    font-size: 1.0625rem;
    white-space: nowrap;
  }
}
</style>
