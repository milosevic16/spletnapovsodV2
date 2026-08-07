<script setup lang="ts">
/**
 * Delo — the portfolio as one large, centred preview at a time.
 *
 * The frame is a WINDOW INTO THE RUNNING SITE: each plate shows that client's
 * real landing view, and the only motion painted inside the frame is that
 * site's own, at its own position and timing (src/lib/slide-effects.ts —
 * ports of the sites' shipped code). Nothing animates our chrome.
 *
 * The band is the selected project's STAGE colour — not the site's own
 * background but a PIGMENT from its accent family, entered and left on a clean
 * cutoff against the paper above and below. The three sit at nearly the same
 * weight and differ in hue (see GROUNDS), so the band reads as three inks from
 * one set rather than three brightnesses.
 *
 * That weight match is what lets ONE ink serve all three: paper on every
 * ground and on every frame of every transition (measured, worst 5.31:1). So
 * nothing here changes colour with the selection except the ground itself.
 *
 * SSG contract: all three plates — screenshots, names, sector lines, live
 * links — are in the prerendered HTML. JS adds the carousel on top; with JS
 * off every plate is simply visible in flow, stacked.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import {
  lemurPreview,
  mercPreview,
  bloctopusPreview,
  type SlideEffect,
} from '@/lib/slide-effects'

const fx = createFx()
const items = references.items
const active = ref(0)
const live = ref(false)

const root = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)

/** How long a plate holds before the carousel advances itself. */
const AUTOPLAY_MS = 7000

/**
 * Each project's ground: a MUTED relative of its own accent, never its page
 * background. Measured 2026-08-07 against paper ink #F5F2EB:
 *
 *   lemur     #4A4457 aubergine-slate  paper 8.33:1  chroma 19  (from #7F59F5)
 *   mercpeter #54423E warm clay        paper 8.44:1  chroma 22  (from #D2453E)
 *   bloctopus #3A4A42 deep eucalyptus  paper 8.39:1  chroma 16  (from #1FC49A)
 *
 * Average chroma 19 against the previous set's 111 — the owner's call, the
 * pigments read as loud. These sit in the page's own muted family (--grafit-2
 * is #50555A at chroma 10) while each hue still names its project, and they
 * keep a real cutoff against the paper page at 8.4:1. Deliberately NOT each
 * site's own background: the earlier bloctopus candidate #26343A was within 24
 * of their navy and would have read as a copy of it rather than a companion.
 *
 * The consequence, accepted knowingly: muting the grounds flattens the shots
 * against them — bloctopus's dark navy sits at 1.33:1 here, lemur's pale sage
 * at 3.71:1. Separation is the FRAME'S HAIRLINE's job now, not the ground's,
 * which is this project's doctrine anyway (depth is drawn, never shadowed).
 */
const GROUNDS: Record<string, string> = {
  lemur: '#4A4457',
  mercpeter: '#54423E',
  bloctopus: '#3A4A42',
}

/** Bound on the section, so prerender and hydration agree and nothing jumps. */
const stageGround = computed(() => GROUNDS[items[active.value]!.id] ?? '#1A1C1E')

const effects: (SlideEffect | null)[] = []
let autoplayTimer = 0
let progressAnim: Animation | null = null
let paused = false

const sizes = '(min-width: 900px) min(94vw, 78rem), calc(100vw - 2rem)'

function plates(): HTMLElement[] {
  // Read the DOM rather than a captured ref array: v-for function refs re-run
  // on every update, and a stale entry would strand a plate visible.
  return Array.from(root.value?.querySelectorAll<HTMLElement>('.plate') ?? [])
}

/**
 * Which plate is visible, written as INLINE style — load-bearing, so it must
 * survive any build transform (this stylesheet has already lost declarations
 * to the minifier once). CSS supplies only the transition.
 */
function paint() {
  for (const [i, el] of plates().entries()) {
    const on = i === active.value
    el.style.opacity = on ? '1' : '0'
    el.style.visibility = on ? 'visible' : 'hidden'
  }
}

function stopProgress() {
  progressAnim?.cancel()
  progressAnim = null
}

function startProgress() {
  stopProgress()
  const el = progressEl.value
  if (!el || prefersReducedMotion()) return
  progressAnim = fx.anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
    duration: AUTOPLAY_MS,
    easing: 'linear',
    fill: 'none',
  })
}

function scheduleAutoplay() {
  window.clearTimeout(autoplayTimer)
  if (prefersReducedMotion() || paused) return
  startProgress()
  autoplayTimer = window.setTimeout(() => select((active.value + 1) % items.length, true, 1), AUTOPLAY_MS)
}

/**
 * The swap is directed: the outgoing plate leaves against the travel, the
 * incoming one arrives with it, so paging reads as movement through a reel
 * rather than a crossfade. Both run on WAAPI with fill:'none' over the final
 * inline state, so an interrupted swap can never strand a plate mid-way.
 */
const SWAP_IN_MS = 520
const SWAP_OUT_MS = 420
const SHIFT = 3

function select(next: number, restart = true, dir = 1) {
  if (next === active.value) return
  const from = active.value
  const els = plates()
  effects[from]?.pause()
  active.value = next
  paint()

  const outEl = els[from]
  const inEl = els[next]
  if (outEl && inEl && !prefersReducedMotion()) {
    // The outgoing plate stays painted for the length of its exit.
    outEl.style.visibility = 'visible'
    fx.anim(
      outEl,
      [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: `translateX(${-dir * SHIFT}%)` },
      ],
      { duration: SWAP_OUT_MS, easing: 'cubic-bezier(0.4,0,1,1)', fill: 'none' },
    )
    fx.setTimeout(() => {
      if (active.value !== from) outEl.style.visibility = 'hidden'
    }, SWAP_OUT_MS + 20)

    fx.anim(
      inEl,
      [
        { opacity: 0, transform: `translateX(${dir * SHIFT}%)` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: SWAP_IN_MS, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'none' },
    )
  }

  effects[next]?.play()
  if (restart) scheduleAutoplay()
}

function step(delta: number) {
  select((active.value + delta + items.length) % items.length, true, delta >= 0 ? 1 : -1)
}

/** Hover/focus holds the carousel still — never yank a plate someone is reading. */
function hold() {
  paused = true
  window.clearTimeout(autoplayTimer)
  stopProgress()
}

function resume() {
  paused = false
  scheduleAutoplay()
}

onMounted(() => {
  live.value = true
  paint()

  // Effects are created in EVERY tier — lemur's rebuilt intro line and status
  // dots are page content the capture deliberately blanks, so they must exist
  // even under reduced motion. Each effect gates its own MOTION internally.
  for (const [i, r] of items.entries()) {
    const frame = plates()[i]?.querySelector<HTMLElement>('.plate__frame')
    if (!frame) {
      effects[i] = null
      continue
    }
    if (r.id === 'lemur') effects[i] = lemurPreview(frame, fx)
    else if (r.id === 'mercpeter') effects[i] = mercPreview(frame, fx)
    else effects[i] = bloctopusPreview(frame, fx)
  }

  // Nothing animates off-screen.
  if ('IntersectionObserver' in window && root.value) {
    const io = fx.io(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            effects[active.value]?.play()
            resume()
          } else {
            effects[active.value]?.pause()
            hold()
          }
        }
      },
      { threshold: 0.15 },
    )
    io.observe(root.value)
  } else {
    effects[0]?.play()
    scheduleAutoplay()
  }

  fx.on(window, 'keydown', ((e: KeyboardEvent) => {
    if (!root.value?.contains(document.activeElement)) return
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }) as EventListener)
})

onUnmounted(() => {
  window.clearTimeout(autoplayTimer)
  fx.dispose()
})
</script>

<template>
  <section
    id="reference"
    ref="root"
    class="work"
    :class="{ 'work--live': live }"
    :style="{ '--stage': stageGround }"
    :aria-label="references.feedback.regionLabel"
    @mouseenter="hold"
    @mouseleave="resume"
    @focusin="hold"
    @focusout="resume"
  >
    <ul class="work__plates">
      <li
        v-for="(r, i) in items"
        :key="r.id"
        class="plate"
        :class="[`plate--${r.id}`, live ? 'plate--stacked' : '']"
        :inert="live && i !== active ? true : undefined"
        :aria-hidden="live && i !== active ? 'true' : undefined"
      >
        <!-- The window. Everything the effects paint lives in here. -->
        <div class="plate__frame">
          <picture>
            <source
              type="image/avif"
              :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.avif ${w}w`).join(', ')"
              :sizes="sizes"
            />
            <source
              type="image/webp"
              :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.webp ${w}w`).join(', ')"
              :sizes="sizes"
            />
            <img
              :src="`/img/refs/${r.id}-${r.image.widths[0]}.jpg`"
              :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.jpg ${w}w`).join(', ')"
              :sizes="sizes"
              :width="r.image.width"
              :height="r.image.height"
              :alt="r.alt"
              :loading="i === 0 ? 'eager' : 'lazy'"
              :fetchpriority="i === 0 ? 'high' : undefined"
              decoding="async"
              class="plate__shot"
            />
          </picture>

          <!-- Mouse convenience: the whole preview opens the project. Kept
               out of the tab order and hidden from assistive tech because
               the corner name is already the accessible route — a second
               stop to the same URL is noise. -->
          <a
            :href="r.url"
            target="_blank"
            rel="noopener"
            class="plate__hit"
            tabindex="-1"
            aria-hidden="true"
          ></a>
        </div>

        <!-- The band's only text: the sector line and the site's name, driven
             into opposite corners of the plate — BELOW the frame on desktop,
             ABOVE it on phones. Both set in the machine register: uppercase,
             wide-tracked, technical. One paper ink, which passes on all three
             grounds and on every frame between them. -->
        <div class="plate__corners">
          <p class="plate__sector">{{ r.sector }}</p>
          <a :href="r.url" target="_blank" rel="noopener" class="plate__name">
            {{ r.name }}
            <span class="visually-hidden">
              — {{ r.urlLabel }}, {{ references.newWindowNote }}
            </span>
          </a>
        </div>
      </li>
    </ul>

    <!-- Controls appear only once live: with JS off the plates are all in
         flow and there is nothing to control. They sit straight on the ground
         in the same paper ink as the corners — no backing chip, because no
         ink here changes with the selection. -->
    <div v-if="live" class="work__controls">
      <button
        type="button"
        class="work__step"
        :aria-label="references.feedback.prevLabel"
        @click="step(-1)"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none"
          stroke="currentColor" stroke-width="1.6"><path d="M10 2 4 8l6 6" /></svg>
      </button>

      <ul class="work__thumbs" :aria-label="references.feedback.pickLabel">
        <li v-for="(r, i) in items" :key="r.id">
          <button
            type="button"
            class="work__thumb"
            :class="{ 'work__thumb--on': i === active }"
            :aria-current="i === active ? 'true' : undefined"
            @click="select(i, true, i > active ? 1 : -1)"
          >
            <img :src="`/img/refs/${r.id}-560.jpg`" width="96" height="48" alt=""
              loading="lazy" decoding="async" />
            <span class="visually-hidden">{{ r.name }}</span>
          </button>
        </li>
      </ul>

      <button
        type="button"
        class="work__step"
        :aria-label="references.feedback.nextLabel"
        @click="step(1)"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none"
          stroke="currentColor" stroke-width="1.6"><path d="M6 2l6 6-6 6" /></svg>
      </button>

      <span class="work__progress" aria-hidden="true">
        <span ref="progressEl" class="work__progress-fill"></span>
      </span>
    </div>
  </section>
</template>

<style scoped>
/* --- the stage ---------------------------------------------------------------
   The section IS the band: one solid registered colour (--stage, tokens.css),
   interpolating on a swap, meeting the paper above and below on a clean
   cutoff. Slightly longer than the plate's 520ms entrance, so the environment
   settles just AFTER the subject lands. */
.work {
  background-color: var(--stage);
  transition: --stage 760ms var(--ease-out);
  padding-block: clamp(1.75rem, 1.25rem + 2vw, 3rem) clamp(1.25rem, 1rem + 1.5vw, 2rem);
  padding-inline: var(--gutter);
}

.work__plates {
  list-style: none;
  display: grid;
  gap: 3.5rem;
}

.plate {
  display: grid;
  gap: 0.9rem;
}

/* The window into the live site. cqi inside the frame (lemur's rebuilt intro
   line) needs the frame to be an inline-size container. */
/* The drawn edge. With the grounds muted, the shots no longer separate by
   colour — bloctopus's sits at 1.33:1 against its own ground — so the frame is
   defined by a LINE, which is how this project draws depth everywhere else
   (zero shadows sitewide). Paper @0.5 clears the 3:1 UI floor on all three
   grounds (3.41/3.43/3.42 — the obvious 0.3 measured 2.17) and still reads
   against the frame's black backing on the inside at 7.69:1. Outline rather
   than border: it must not eat into the shot or change the frame's box. */
.plate__frame {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-inline: auto;
  background: #000;
  outline: 1px solid rgb(245 242 235 / 0.5);
  outline-offset: 0;
  line-height: 0;
  container-type: inline-size;
}

/* <picture> is inline by default, so a percentage height on the image would
   resolve against IT (auto) and collapse the shot. Make it fill the frame. */
.plate__frame picture {
  display: block;
  width: 100%;
  height: 100%;
}

/* The whole preview opens the project. Above the ornament layers so the click
   always lands; the ornament is pointer-events:none anyway. */
.plate__hit {
  position: absolute;
  inset: 0;
  z-index: 7;
}

.plate__shot {
  width: 100%;
  height: auto;
}

/* --- the corners ------------------------------------------------------------
   PHONES put the pair ABOVE the frame (owner's call): the plate is a column,
   and `order: -1` lifts the corners over the window without touching DOM
   order, so the reading order stays sector → name → link. */
.plate__corners {
  order: -1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: var(--list);
  width: 100%;
  margin-inline: auto;
}

/* Both corners share ONE register — the machine voice, uppercase and
   wide-tracked. Deliberately mono here and nowhere else in this band: these
   are a real URL's owner and its sector, the closest thing the carousel has to
   a checkable emission, and the honesty contract's own examples name URLs. */
.plate__sector,
.plate__name {
  font-family: var(--font-mono);
  font-size: clamp(0.75rem, 0.62rem + 0.55vw, 0.9rem);
  font-weight: 400;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--list);
}

.plate__sector {
  max-width: 34ch;
}

.plate__name {
  text-decoration: none;
  white-space: nowrap;
  text-align: right;
}

.plate__name:hover {
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.work :focus-visible {
  outline-color: var(--list);
}

/* --- controls ---------------------------------------------------------------
   Straight on the ground. Every hairline is paper at alpha, so one measured
   ink covers all three pigments and every frame between them; the red accent
   would have vanished on the brick.

   Hairlines are paper @0.5, the same weight as the frame's drawn edge —
   3.41/3.43/3.42 on the three grounds, clearing the 3:1 UI floor. They were
   0.75 while the grounds were bright; against these muted ones that measured
   5.5:1 and the controls became the loudest line in the band. The progress
   TRACK deliberately stays below the floor: it is a 1px rail whose meaning is
   carried entirely by the fill running over it at 8.3:1. */
.work__controls {
  width: fit-content;
  margin: 1.1rem auto 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.work__thumbs {
  list-style: none;
  display: flex;
  gap: 0.5rem;
}

.work__thumb {
  display: block;
  padding: 0;
  border: 1px solid rgb(245 242 235 / 0.5);
  background: none;
  cursor: pointer;
  line-height: 0;
  opacity: 0.4;
  transition:
    opacity var(--t-lift) var(--ease-out),
    border-color var(--t-lift) var(--ease-out);
}

.work__thumb img {
  width: 64px;
  height: auto;
}

.work__thumb:hover {
  opacity: 0.75;
}

/* Selected state is opacity AND border weight — never colour alone. */
.work__thumb--on {
  opacity: 1;
  border-color: var(--list);
}

.work__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 1px solid rgb(245 242 235 / 0.5);
  color: var(--list);
  cursor: pointer;
  transition: border-color var(--t-lift) var(--ease-out);
}

.work__step:hover {
  border-color: var(--list);
}

.work__progress {
  display: block;
  width: 5rem;
  height: 1px;
  background: rgb(245 242 235 / 0.3);
  overflow: hidden;
}

.work__progress-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--list);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- live: one plate at a time ---------------------------------------------
   ONE rule block, single class, no ancestor: the scoped compiler dropped a
   `.work--live .plate` ancestor here once, and a duplicate-selector block lost
   its opacity to the minifier. Visibility itself is set inline from paint(). */
.plate--stacked {
  grid-area: 1 / 1;
  transition:
    opacity 420ms var(--ease-out),
    visibility 0s linear 420ms;
}

.work--live .work__plates {
  gap: 0;
}

@media (min-width: 900px) {
  /* The portal is the subject of the screen: as much of the visible field as
     the band can give it while the corners and controls stay on screen. */
  .plate--stacked .plate__frame {
    height: min(62vh, 34rem);
    aspect-ratio: 2 / 1;
    width: auto;
    max-width: 100%;
  }

  .plate--stacked .plate__shot {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }

  /* Desktop returns them BELOW the frame and drives them to ITS corners, not
     the band's: the frame is height-driven at 2:1, so its rendered width is
     2 × min(62vh, 34rem) = min(124vh, 68rem), capped by the plate. Repeating
     that expression — rather than the band's measure — is what makes the two
     lines land on the frame's own edges. Paired with .plate--stacked
     .plate__frame above; change one, change the other. */
  .plate--stacked .plate__corners {
    order: 0;
    width: min(124vh, 68rem, 100%);
    margin-top: 0.15rem;
  }

  /* A step larger here — the frame gives them the room the phone cannot. */
  .plate--stacked .plate__sector,
  .plate--stacked .plate__name {
    font-size: 0.98rem;
    letter-spacing: 0.1em;
  }
}
</style>
