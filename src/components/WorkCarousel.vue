<script setup lang="ts">
/**
 * Delo — the portfolio as a directed carousel: one large project plate at a
 * time, with a title/sector pair, a thumbnail strip, prev/next controls and an
 * autoplay progress bar. The carousel component vocabulary is conventional;
 * what is ours is what each plate DOES.
 *
 * Every plate carries the signature motion of the site it shows, rebuilt from
 * our own source repos (see src/lib/slide-effects.ts):
 *   lemur      → chromatic glitch bursts + a console caret
 *   mercpeter  → a caption line that rotates on a ring-timed cycle
 *   bloctopus  → a scan bar sweeping the plate
 * Only the ACTIVE plate's effect runs, so at most one loop is ever live.
 *
 * SSG contract: all three plates, their names, sectors, descriptions, proofs
 * and live links are in the prerendered HTML. JS adds the carousel behaviour
 * on top; with JS off every plate is simply visible in flow.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import { glitchTerminal, captionTicker, scanSweep, type SlideEffect } from '@/lib/slide-effects'

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

const sizes = '(min-width: 1024px) min(66vw, 60rem), calc(100vw - 2.5rem)'

/** The rotating lines for the mercpeter plate — real fields, not invented copy. */
const tickerLines = computed(() => {
  const r = items.find((i) => i.id === 'mercpeter')
  return r ? [r.sector, r.proof, r.urlLabel] : []
})

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
  autoplayTimer = window.setTimeout(() => select((active.value + 1) % items.length), AUTOPLAY_MS)
}

/**
 * Which plate is visible, written as INLINE style — the load-bearing part of
 * the carousel, so it must survive any build transform (the stylesheet has
 * already lost declarations to the minifier here once). CSS only supplies the
 * transition; if it were dropped the swap would simply be instant.
 */
function plates(): HTMLElement[] {
  // Read the DOM rather than a captured ref array: v-for function refs re-run
  // on every update, and a stale entry here would silently strand a plate
  // visible on top of another.
  return Array.from(root.value?.querySelectorAll<HTMLElement>('.plate') ?? [])
}

function paint() {
  for (const [i, el] of plates().entries()) {
    const on = i === active.value
    el.style.opacity = on ? '1' : '0'
    el.style.visibility = on ? 'visible' : 'hidden'
  }
}

function select(next: number, restart = true) {
  if (next === active.value) return
  effects[active.value]?.pause()
  active.value = next
  paint()
  effects[next]?.play()
  if (restart) scheduleAutoplay()
}

function step(delta: number) {
  select((active.value + delta + items.length) % items.length)
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

  const hosts = plates()
  for (const [i, r] of items.entries()) {
    const host = hosts[i]
    if (!host || prefersReducedMotion()) {
      effects[i] = null
      continue
    }
    if (r.id === 'lemur') {
      effects[i] = glitchTerminal(host, fx, {
        inks: r.inks,
        caret: host.querySelector<HTMLElement>('[data-caret]'),
      })
    } else if (r.id === 'mercpeter') {
      effects[i] = captionTicker(host, fx)
    } else {
      effects[i] = scanSweep(host, fx, { ink: r.inks[1] ?? 'rgb(255 255 255 / 0.5)' })
    }
  }

  // Gate the whole carousel on visibility: nothing animates off-screen.
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
      { threshold: 0.2 },
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
  <section id="reference" ref="root" class="work" :class="{ 'work--live': live }">
    <div class="container work__head">
      <p class="kicker">{{ references.kicker }}</p>
      <h2 class="work__title">{{ references.title }}</h2>
      <p class="work__intro">{{ references.intro }}</p>
    </div>

    <div class="container work__stage" @mouseenter="hold" @mouseleave="resume"
      @focusin="hold" @focusout="resume">
      <ul class="work__plates">
        <li
          v-for="(r, i) in items"
          :key="r.id"
          class="plate"
          :class="[`plate--${r.id}`, live ? 'plate--stacked' : '']"
          :data-ink="r.inks[1]"
          :inert="live && i !== active ? true : undefined"
          :aria-hidden="live && i !== active ? 'true' : undefined"
        >
          <div class="plate__media">
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

            <!-- lemur: a console strip printing the site's real URL + sector. -->
            <div v-if="r.id === 'lemur'" class="plate__console" aria-hidden="true">
              <span class="emisija plate__console-line">{{ r.urlLabel }}</span>
              <span class="plate__console-line plate__console-line--dim">{{ r.sector }}</span>
              <span data-caret class="plate__caret"></span>
            </div>

            <!-- mercpeter: the rotating caption, ring-timed. -->
            <div v-if="r.id === 'mercpeter'" class="plate__ticker">
              <span class="plate__ticker-clip">
                <span data-ticker-item class="plate__ticker-item">{{ tickerLines[0] }}</span>
              </span>
              <svg class="plate__ring" viewBox="0 0 18 18" width="15" height="15" aria-hidden="true">
                <circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor"
                  stroke-opacity="0.25" stroke-width="1.5" />
                <circle data-ticker-ring cx="9" cy="9" r="7.5" fill="none" stroke="currentColor"
                  stroke-width="1.5" stroke-dasharray="47.12" stroke-dashoffset="47.12"
                  transform="rotate(-90 9 9)" />
              </svg>
              <!-- The lines the ticker cycles, declared for crawlers and read
                   by the effect — never injected by it. -->
              <span class="visually-hidden">
                <span v-for="l in tickerLines" :key="l" data-ticker-line>{{ l }}</span>
              </span>
            </div>
          </div>

          <div class="plate__body">
            <h3 class="plate__name">
              <a :href="r.url" target="_blank" rel="noopener" class="plate__link">
                <span data-glitch class="plate__name-inner">{{ r.name }}</span>
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

      <!-- Controls: real buttons, hidden until live so JS-off never sees a
           dead affordance (the plates are all visible in flow there). -->
      <div v-if="live" class="work__controls">
        <button type="button" class="work__step" :aria-label="references.feedback.prevLabel"
          @click="step(-1)">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none"
            stroke="currentColor" stroke-width="1.6">
            <path d="M10 2 4 8l6 6" />
          </svg>
        </button>

        <ul class="work__thumbs" :aria-label="references.feedback.pickLabel">
          <li v-for="(r, i) in items" :key="r.id">
            <button type="button" class="work__thumb" :class="{ 'work__thumb--on': i === active }"
              :aria-current="i === active ? 'true' : undefined" @click="select(i)">
              <img :src="`/img/refs/${r.id}-560.jpg`" :width="112" :height="56" alt=""
                loading="lazy" decoding="async" />
              <span class="visually-hidden">{{ r.name }}</span>
            </button>
          </li>
        </ul>

        <button type="button" class="work__step" :aria-label="references.feedback.nextLabel"
          @click="step(1)">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none"
            stroke="currentColor" stroke-width="1.6">
            <path d="M6 2l6 6-6 6" />
          </svg>
        </button>

        <span class="work__progress" aria-hidden="true">
          <span ref="progressEl" class="work__progress-fill"></span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.work {
  padding-block: var(--section-y);
}

.work__title {
  margin-top: 1rem;
}

.work__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

.work__stage {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}

/* --- plates ---------------------------------------------------------------
   JS-off / prerendered: every plate is an ordinary block in the flow, so all
   three projects read as a list. Once live, they stack into one frame. */
.work__plates {
  list-style: none;
  display: grid;
  gap: 3rem;
}

.plate {
  display: grid;
  gap: 1.25rem;
}

.plate__media {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--mreza-strong);
  background: var(--grafit);
}

.plate__shot {
  width: 100%;
  height: auto;
}

.plate__name {
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.7rem, 1.2rem + 2.4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.015em;
}

.plate__link {
  text-decoration: none;
}

/* The glitch host: ghosts are absolutely positioned inside it. */
.plate__name-inner {
  position: relative;
  display: inline-block;
}

.plate__sector {
  color: var(--grafit-2);
}

.plate__desc {
  max-width: 46ch;
}

.plate__proof {
  font-style: italic;
  color: var(--rez);
  max-width: 44ch;
}

/* --- lemur: console strip -------------------------------------------------- */
.plate__console {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem 0.9rem;
  background: rgb(19 18 32 / 0.92); /* lemur's own terminal ground */
  border-top: 1px solid rgb(127 89 245 / 0.4);
  /* CRT scanlines — decoration only. */
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0 5px,
    rgb(168 139 255 / 0.05) 5px 6px
  );
}

.plate__console-line {
  color: #a88bff;
  font-size: 0.68rem;
}

.plate__console-line--dim {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  color: #6e6890;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
}

.plate__caret {
  width: 6px;
  height: 0.85em;
  margin-left: auto;
  background: #a88bff;
}

/* --- mercpeter: rotating caption ------------------------------------------- */
.plate__ticker {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  background: rgb(38 40 44 / 0.92); /* mercpeter's own graphite */
  color: #ece9e2;
}

/* The clip box is what makes the swap read as rising from under a mask. */
.plate__ticker-clip {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: block;
}

.plate__ticker-item {
  display: block;
  font-family: var(--font-text);
  font-style: italic;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.plate__ring {
  flex: 0 0 auto;
  color: #d2453e; /* mercpeter's own accent */
}

/* --- controls -------------------------------------------------------------- */
.work__controls {
  display: none;
}

.work__thumbs {
  list-style: none;
  display: flex;
  gap: 0.5rem;
}

.work__thumb {
  display: block;
  padding: 0;
  border: 1px solid var(--mreza-strong);
  background: none;
  cursor: pointer;
  line-height: 0;
  opacity: 0.45;
  transition:
    opacity var(--t-lift) var(--ease-out),
    border-color var(--t-lift) var(--ease-out);
}

.work__thumb img {
  width: 74px;
  height: auto;
}

.work__thumb:hover {
  opacity: 0.8;
}

.work__thumb--on {
  opacity: 1;
  border-color: var(--rez);
}

.work__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: 1px solid var(--mreza-strong);
  color: var(--grafit);
  cursor: pointer;
  transition: border-color var(--t-lift) var(--ease-out);
}

.work__step:hover {
  border-color: var(--grafit);
}

.work__progress {
  display: block;
  width: 5rem;
  height: 1px;
  background: var(--mreza-strong);
  overflow: hidden;
}

.work__progress-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--rez);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- live: one plate at a time ---------------------------------------------
   ONE rule block for the stacked state, and the load-bearing part — which
   plate is visible — is mirrored as an INLINE style from JS (see paint()).
   Both precautions are the house rule about the minifier, and both were
   earned here: a `.work--live .plate` ancestor was dropped by the scoped
   compiler, and then a second `.plate--off` block with the same selector had
   its opacity/visibility declarations dropped while its grid-area survived.
   An inline style survives any build transform; if this CSS vanished entirely
   the plates would still swap correctly. */
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
  .plate--stacked {
    grid-template-columns: minmax(0, 15fr) minmax(0, 9fr);
    gap: 2.5rem;
    align-items: center;
  }

  .plate--stacked .plate__media {
    aspect-ratio: 16 / 9;
  }

  .plate--stacked .plate__shot {
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }

  .work__controls {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-top: 1.75rem;
  }
}
</style>
