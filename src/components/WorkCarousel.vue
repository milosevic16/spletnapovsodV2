<script setup lang="ts">
/**
 * Delo — the portfolio as one large, centred preview at a time.
 *
 * The frame is a WINDOW INTO THE RUNNING SITE: each plate shows that client's
 * real page, and the motion painted inside the frame is that site's own —
 * lemur's glitch and console, Peter Merc's rotating docket line, Bloctopus's
 * forensic scan (see src/lib/slide-effects.ts, ported from those sites' own
 * repos). Nothing animates our chrome; the effects belong to the preview.
 *
 * Only the active plate's effect runs, and the whole stage is
 * visibility-gated, so at most one loop is ever live.
 *
 * SSG contract: all three plates — names, sectors, descriptions, proofs, live
 * links — are in the prerendered HTML. JS adds the carousel on top; with JS
 * off every plate is simply visible in flow.
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

const effects: (SlideEffect | null)[] = []
let autoplayTimer = 0
let progressAnim: Animation | null = null
let paused = false

const sizes = '(min-width: 900px) min(96vw, 76rem), calc(100vw - 2.5rem)'

/** Lines the docket rotates — real fields from the content module, never invented. */
const docketLines = computed(() => {
  const r = items.find((i) => i.id === 'mercpeter')
  return r ? [r.sector, r.proof, r.urlLabel] : []
})

/** Relative luminance, for picking each project's own darkest sampled ink. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/**
 * The stage takes each project's OWN ground — the darkest colour sampled from
 * that live site (#131220 violet-black, #26282C charcoal, #1A2B38 navy).
 * Derived rather than hand-listed, so re-sampling `inks` moves the wallpaper
 * with it and the two can never drift.
 *
 * Measured on all three: --list 12.98–16.55:1, --papir-dim 8.67–11.05:1, and
 * every midpoint the transition passes through stays 13–15:1 — so no frame of
 * the fade drops text below AA.
 */
const grounds = items.map((r) =>
  r.inks.slice().sort((a, b) => luminance(a) - luminance(b))[0] ?? '#1A1C1E',
)

/** Bound on the section, so prerender and hydration agree and nothing jumps. */
const stageInk = computed(() => grounds[active.value] ?? '#1A1C1E')

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

  for (const [i, r] of items.entries()) {
    const frame = plates()[i]?.querySelector<HTMLElement>('.plate__frame')
    if (!frame || prefersReducedMotion()) {
      effects[i] = null
      continue
    }
    if (r.id === 'lemur') effects[i] = lemurPreview(frame, fx, { inks: r.inks })
    else if (r.id === 'mercpeter')
      effects[i] = mercPreview(frame, fx, { name: r.name, lines: docketLines.value })
    else effects[i] = bloctopusPreview(frame, fx, r.inks[1] ?? '#1FC496')
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
    :style="{ '--stage': stageInk }"
  >
    <!-- The bridge: paper at the top where the copy sits, dissolving into the
         selected project's own ground by the time it meets the stage. -->
    <div class="work__head">
      <div class="container">
        <p class="kicker">{{ references.kicker }}</p>
        <h2 class="work__title">{{ references.title }}</h2>
      </div>
    </div>

    <div
      class="work__stage"
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
                 the project name below is already the accessible route — a
                 second stop to the same URL is noise. -->
            <a
              :href="r.url"
              target="_blank"
              rel="noopener"
              class="plate__hit"
              tabindex="-1"
              aria-hidden="true"
            ></a>
          </div>

          <div class="plate__meta">
            <h3 class="plate__name">
              <a :href="r.url" target="_blank" rel="noopener" class="plate__link">
                {{ r.name }}
                <span class="visually-hidden">
                  — {{ r.urlLabel }}, {{ references.newWindowNote }}
                </span>
              </a>
            </h3>
            <p class="annot plate__sector">{{ r.sector }}</p>
            <p class="plate__desc">{{ r.description }}</p>
            <p class="plate__proof">{{ r.proof }}</p>
          </div>
        </li>
      </ul>

      <!-- Controls appear only once live: with JS off the plates are all in
           flow and there is nothing to control. -->
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
    </div>

  </section>
</template>

<style scoped>
/* --- the adaptive ground ----------------------------------------------------
   THE WHOLE SECTION is painted once, here, in the selected project's own
   darkest sampled ink. Head and stage are transparent over it, so a colour
   change is ONE repaint region rather than two, and the seam between them is
   the same colour by construction — invisible at every point of the fade.

   Why the colour lives on background-COLOR and the fade on a separate,
   never-changing background-IMAGE: background-image is not an animatable
   property in any browser, so a gradient whose stop we swapped would cut
   rather than fade. Transitioning the solid colour underneath a static
   gradient sidesteps that entirely and needs no @property registration. */
/* The section paints NOTHING itself — it only owns the animating property, and
   `inherits: true` carries each interpolated frame down to the head and the
   stage. Painting the ground here instead laid solid colour under the head,
   whose own paper top then cut the page's warm wash off at a hard line.
   The registered --stage is what animates (see tokens.css); the children just
   read it. Slightly longer than the plate's 520ms entrance (SWAP_IN_MS), so
   the environment settles just AFTER the subject lands. */
.work {
  transition: --stage 760ms var(--ease-out);
  /* Closes back to the site's own graphite, so the adaptive ground never
     meets the next section on a hard edge. */
  background-image: linear-gradient(to top, var(--grafit) 0, rgb(26 28 30 / 0) 160px);
}

/* The bridge from the paper band above into the stage. The gradient itself is
   static — only the colour beneath it moves. It fades to PAPER-AT-ALPHA-0,
   never the `transparent` keyword, which interpolates through transparent
   black and lays a muddy grey band across the middle. */
/* Transparent at the top so the page's warm wash runs straight through, then
   the project's ground fades IN over it, reaching full strength exactly at the
   head's bottom edge — where the stage begins in the same colour, so the join
   is invisible. Fading the ground in (rather than fading paper out) is what
   keeps the wash unbroken: there is no opaque paper to cut it. */
/* The fade gets its own runway BELOW the copy. Starting it at 34% put the
   intro's last line on a mid-grey at 2.29:1 against a 4.5 floor — the wash
   crossing body copy, which no screenshot review would have caught. The deep
   bottom padding keeps the text in the top half; the ground only begins to
   come up once the copy has ended. */
.work__head {
  padding-block: clamp(3rem, 2.5rem + 3vw, 5rem) clamp(8rem, 6rem + 8vw, 14rem);
  /* Literal fallback = --grafit at alpha 0, for engines without relative colour. */
  background-image: linear-gradient(to bottom, rgb(26 28 30 / 0) 64%, var(--stage) 100%);
  background-image: linear-gradient(
    to bottom,
    rgb(from var(--stage) r g b / 0) 64%,
    var(--stage) 100%
  );
}

.work__stage {
  background-color: var(--stage);
  padding-block: clamp(1.5rem, 1rem + 2vw, 3rem);
  padding-inline: var(--gutter);
}

.work__plates {
  list-style: none;
  display: grid;
  gap: 3rem;
}

.plate {
  display: grid;
  gap: 1.25rem;
}

/* The window into the live site. */
.plate__frame {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-inline: auto;
  background: #000;
  line-height: 0;
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

.plate__meta {
  display: grid;
  gap: 0.4rem;
  color: var(--list);
}

.plate__name {
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.5rem, 1.1rem + 1.8vw, 2.2rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
}

.plate__link {
  text-decoration: none;
}

.plate__sector {
  color: var(--papir-dim);
}

.plate__desc {
  color: var(--list);
  max-width: 52ch;
}

/* Paper, not red: --rez-na-temnem measures 4.44:1 on bloctopus's navy ground,
   just under the 4.5 floor for text this size. The red stays as a structural
   mark on the rule, which carries a 3:1 UI floor and passes on all three. */
.plate__proof {
  font-style: italic;
  color: var(--list);
  border-left: 2px solid var(--rez-na-temnem);
  padding-left: 0.7rem;
  max-width: 48ch;
}

/* --- controls -------------------------------------------------------------- */
.work__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.work__thumbs {
  list-style: none;
  display: flex;
  gap: 0.5rem;
}

.work__thumb {
  display: block;
  padding: 0;
  border: 1px solid var(--crta-na-temnem);
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

.work__thumb--on {
  opacity: 1;
  border-color: var(--rez-na-temnem);
}

.work__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 1px solid var(--crta-na-temnem);
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
  background: var(--crta-na-temnem);
  overflow: hidden;
}

.work__progress-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--rez-na-temnem);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- the written record, below the stage ----------------------------------- */
.work__title {
  margin-top: 1rem;
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
  /* The preview takes roughly half the visible field and is centred, so the
     three sites are the subject of the screen. */
  .plate--stacked .plate__frame {
    height: min(52vh, 30rem);
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

  .plate--stacked .plate__meta {
    max-width: 76rem;
    margin-inline: auto;
    width: 100%;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    column-gap: 2.5rem;
    align-items: start;
  }

  .plate--stacked .plate__name {
    grid-column: 1;
  }
  .plate--stacked .plate__sector {
    grid-column: 1;
  }
  .plate--stacked .plate__desc {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
  .plate--stacked .plate__proof {
    grid-column: 2;
    grid-row: 3;
  }
}
</style>
