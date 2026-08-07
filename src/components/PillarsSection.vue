<script setup lang="ts">
/**
 * »Kaj vsebujejo vsi paketi?« — three pillars as a work-wall.
 *
 * ONE layout on every screen (owner's call): the pillar titles stand at the
 * stage's corners in display size and the three plates sit as a staggered
 * cluster in the middle — phones get the same wall, just recomposed for a
 * portrait stage. Hovering a plate (pointer devices) enlarges it while the
 * others step back and its corner title inks red; clicking or tapping a plate
 * — or its title — expands that plate across the whole stage and the pillar's
 * full text appears over it. One open at a time, Escape closes, focus moves
 * to the panel's close control and returns to the invoker on close.
 *
 * The prerendered page and JS-off readers get all three articles IN FULL, in
 * flow, each with its plate as an ordinary figure — the collapse is applied by
 * JS after hydration (inline styles from paint(), never CSS), so nothing is
 * ever hidden without a way back.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { pillars } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import PrerezLine from './PrerezLine.vue'

const fx = createFx()
const host = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const live = ref(false)
/** Which pillar is expanded — null when the wall is showing. */
const open = ref<string | null>(null)
/** The control that opened the panel, for focus return on close. */
let invoker: HTMLElement | null = null

const items = pillars.items
const OPEN_MS = 520
const CLOSE_MS = 200

function panelOf(id: string): HTMLElement | null {
  return host.value?.querySelector<HTMLElement>(`#pilp-${id}`) ?? null
}
function tileOf(id: string): HTMLElement | null {
  return host.value?.querySelector<HTMLElement>(`.pil__tile[data-p="${id}"]`) ?? null
}

/**
 * Visibility is INLINE style — the minifier has dropped duplicate-selector
 * declarations in this project before, and a hidden state must never depend
 * on the stylesheet anyway (JS applied it, JS can always undo it). The same
 * pass keeps the wall's controls out of the way while a panel covers them:
 * they get `inert`, so Tab and a screen reader can never land on a control
 * that is visually underneath the open panel.
 */
function paint() {
  const overlay = live.value && open.value !== null
  for (const it of items) {
    const panel = panelOf(it.id)
    if (panel) panel.style.display = !live.value || open.value === it.id ? '' : 'none'
  }
  for (const b of host.value?.querySelectorAll<HTMLElement>('.pil__label, .pil__tile') ?? []) {
    if (overlay) b.setAttribute('inert', '')
    else b.removeAttribute('inert')
  }
}

function show(id: string, from: HTMLElement) {
  if (open.value === id) return
  invoker = from
  open.value = id
  paint()

  const panel = panelOf(id)
  const st = stage.value
  if (!panel || !st) return

  // If the stage's top has scrolled past (a bottom tile on a portrait stage),
  // snap it back so the opened panel is read from its beginning. Instant —
  // never a glide (house rule) — and BEFORE the FLIP measures anything.
  const stTop = st.getBoundingClientRect().top
  if (stTop < -8) {
    window.scrollTo({ top: stTop + window.scrollY, behavior: 'instant' as ScrollBehavior })
  }

  // Focus follows the expansion; Escape and the close control lead back out.
  panel.querySelector<HTMLElement>('.pil__close')?.focus({ preventScroll: true })

  if (prefersReducedMotion()) return

  // FLIP: the panel grows out of the plate the visitor clicked.
  const tile = tileOf(id)
  if (!tile) return
  const t = tile.getBoundingClientRect()
  const s = st.getBoundingClientRect()
  panel.style.transformOrigin = '0 0'
  fx.anim(
    panel,
    [
      {
        transform: `translate(${(t.left - s.left).toFixed(1)}px, ${(t.top - s.top).toFixed(1)}px) scale(${(t.width / s.width).toFixed(4)}, ${(t.height / s.height).toFixed(4)})`,
      },
      { transform: 'none' },
    ],
    { duration: OPEN_MS, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'none' },
  )
  const body = panel.querySelector<HTMLElement>('.pil__scroll')
  if (body) {
    fx.anim(body, [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], {
      duration: OPEN_MS + 240,
      easing: 'ease-out',
      fill: 'none',
    })
  }
}

function close(returnFocus = true) {
  if (open.value === null) return
  const panel = panelOf(open.value)
  const done = () => {
    if (open.value === null) return
    open.value = null
    paint()
    if (returnFocus) invoker?.focus({ preventScroll: true })
    invoker = null
  }
  if (!panel || prefersReducedMotion()) {
    done()
    return
  }
  // The one close direction CSS can't run: fade, then drop from the tree.
  fx.anim(panel, [{ opacity: 1 }, { opacity: 0 }], {
    duration: CLOSE_MS,
    easing: 'ease-out',
    fill: 'none',
  })
  // Paired with CLOSE_MS above; lands the state even if the animation never
  // advances (throttled tab).
  fx.setTimeout(done, CLOSE_MS + 40)
}

function toggle(id: string, ev: Event) {
  if (open.value === id) close()
  else show(id, ev.currentTarget as HTMLElement)
}

onMounted(() => {
  live.value = true
  paint()
  fx.on(window, 'keydown', ((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open.value !== null) close()
  }) as EventListener)
})

onUnmounted(() => fx.dispose())

const sizesTile = '(min-width: 900px) 27vw, 48vw'
const sizesCover = '100vw'

function srcset(id: string, ext: string) {
  return [480, 800, 1200, 1600].map((w) => `/img/pillars/${id}-${w}.${ext} ${w}w`).join(', ')
}
</script>

<template>
  <section id="paketi" ref="host" class="pil" :class="{ 'pil--live': live }">
    <div class="container pil__head">
      <p class="kicker">{{ pillars.kicker }}</p>
      <div class="pil__headright">
        <h2 class="pil__title">{{ pillars.title }}</h2>
        <p class="pil__intro">{{ pillars.intro }}</p>
      </div>
    </div>

    <div ref="stage" class="pil__stage">
      <!-- Corner titles — the wall's own typography. Hydration-only: with JS
           off there is no wall, only the three full articles below. -->
      <template v-if="live">
        <button
          v-for="p in items"
          :key="`lab-${p.id}`"
          type="button"
          class="pil__label"
          :class="`pil__label--${p.id}`"
          :data-p="p.id"
          :aria-expanded="open === p.id"
          :aria-controls="`pilp-${p.id}`"
          @click="toggle(p.id, $event)"
        >
          {{ p.title }}
        </button>
      </template>

      <div v-for="p in items" :key="p.id" class="pil__group">
        <!-- The plate. -->
        <button
          v-if="live"
          type="button"
          class="pil__tile"
          :data-p="p.id"
          :aria-expanded="open === p.id"
          :aria-controls="`pilp-${p.id}`"
          @click="toggle(p.id, $event)"
        >
          <span class="pil__tile-pic">
            <picture>
              <source type="image/avif" :srcset="srcset(p.id, 'avif')" :sizes="sizesTile" />
              <source type="image/webp" :srcset="srcset(p.id, 'webp')" :sizes="sizesTile" />
              <img
                :src="`/img/pillars/${p.id}-480.jpg`"
                :srcset="srcset(p.id, 'jpg')"
                :sizes="sizesTile"
                width="1600"
                height="1200"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </picture>
          </span>
          <span class="visually-hidden">{{ p.title }}</span>
        </button>

        <article :id="`pilp-${p.id}`" class="pil__panel" :aria-label="p.title">
          <!-- The plate as the panel's ground (and the static page's figure). -->
          <figure class="pil__cover" aria-hidden="true">
            <picture>
              <source type="image/avif" :srcset="srcset(p.id, 'avif')" :sizes="sizesCover" />
              <source type="image/webp" :srcset="srcset(p.id, 'webp')" :sizes="sizesCover" />
              <img
                :src="`/img/pillars/${p.id}-800.jpg`"
                :srcset="srcset(p.id, 'jpg')"
                :sizes="sizesCover"
                width="1600"
                height="1200"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </picture>
          </figure>

          <div class="pil__scroll">
            <div class="pil__body">
              <p class="annot pil__artifact">{{ p.artifact }}</p>
              <h3 class="pil__name">{{ p.title }}</h3>
              <p class="pil__summary">{{ p.summary }}</p>
              <dl class="pil__points">
                <div v-for="pt in p.points" :key="pt.label" class="pil__point">
                  <dt class="pil__point-label">{{ pt.label }}</dt>
                  <dd class="pil__point-detail">{{ pt.detail }}</dd>
                </div>
              </dl>
              <!-- PrerezLine keeps its paper-world inks: it sits on a paper
                   chip, so the dark cover never touches its contrast. -->
              <div v-if="p.prerez" class="pil__prerez">
                <PrerezLine :annotation="p.prerez.annotation" :gloss="p.prerez.gloss" />
              </div>
            </div>
          </div>

          <button v-if="live" type="button" class="pil__close" @click="close()">
            <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true" fill="none"
              stroke="currentColor" stroke-width="1.8"><path d="M1 1l12 12M13 1L1 13" /></svg>
            {{ pillars.feedback.closeLabel }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pil {
  background: var(--list-2);
  padding-block: var(--section-y);
}

/* Head: kicker at the left edge, the statement block to the right — the wall
   below answers it. */
.pil__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.pil__headright {
  max-width: 34rem;
}

.pil__intro {
  margin-top: 1rem;
  color: var(--grafit-2);
}

/* --- static / JS-off: three full articles in flow ------------------------- */
.pil__stage {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}

.pil__group + .pil__group {
  margin-top: 2.5rem;
}

.pil__panel {
  border-top: 1px solid var(--mreza-strong);
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.pil__cover {
  margin-top: 1.5rem;
  line-height: 0;
}

.pil__cover img {
  width: 100%;
  height: clamp(180px, 34vw, 300px);
  object-fit: cover;
}

.pil__body {
  padding-block: 1.5rem 0.5rem;
}

.pil__artifact {
  color: var(--grafit-2);
}

.pil__name {
  margin-top: 0.35rem;
}

.pil__summary {
  margin-top: 1rem;
  max-width: var(--measure);
}

.pil__points {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.1rem;
}

@media (min-width: 640px) {
  .pil__points {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.25rem 2.5rem;
  }
}

.pil__point-label {
  font-weight: 600;
}

.pil__point-detail {
  color: var(--grafit-2);
  max-width: 58ch;
}

/* The paper chip that carries PrerezLine in every context. */
.pil__prerez {
  margin-top: 1.75rem;
  max-width: 30rem;
  background: var(--list);
  border: 1px solid var(--mreza);
  padding: 1rem 1.25rem;
}

/* --- hydrated: the wall, every screen -------------------------------------- */
/* Portrait phones get a taller-than-wide stage and the same three corners. */
.pil--live .pil__stage {
  position: relative;
  height: min(78svh, 44rem);
}

.pil--live .pil__group {
  display: contents;
}

/* Corner titles. */
.pil__label {
  position: absolute;
  z-index: 2;
  background: none;
  border: 0;
  padding: 0.25rem 0;
  cursor: pointer;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.3rem, 0.55rem + 3.4vw, 3.1rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--grafit);
  text-align: left;
  max-width: min(60vw, 34ch);
  transition: color var(--t-lift) var(--ease-out);
}

.pil__label--design {
  top: 0;
  left: var(--gutter);
}
.pil__label--security {
  top: 0;
  right: var(--gutter);
  text-align: right;
}
.pil__label--seo {
  bottom: 0;
  left: var(--gutter);
}

/* On narrow screens the right label's BOX reaches left of its right-aligned
   ink (shrink-to-fit caps at max-width when the text wraps), and that empty
   box would sit over the left label's letters and steal their clicks
   (measured: a 50px shared strip at 375px). The left-anchored labels stack
   above, so every ink pixel belongs to its own button; the right label's ink
   is never under a left box. */
.pil__label--design,
.pil__label--seo {
  z-index: 3;
}

.pil__label:hover {
  color: var(--rez);
}

/* The cluster: absolute within the stage, staggered off each other's rhythm
   like plates on a wall. Portrait positions first; desktop repositions below. */
.pil--live .pil__tile {
  position: absolute;
  z-index: 1;
  display: block;
  width: 48%;
  padding: 0;
  border: 0;
  background: var(--grafit);
  line-height: 0;
  cursor: pointer;
  transition: transform 340ms var(--ease-out);
}

.pil--live .pil__tile[data-p='design'] {
  left: 10%;
  top: 13%;
}
.pil--live .pil__tile[data-p='security'] {
  left: 44%;
  top: 38%;
}
.pil--live .pil__tile[data-p='seo'] {
  left: 14%;
  top: 63%;
}

.pil--live .pil__tile-pic {
  display: block;
  width: 100%;
  border: 1px solid var(--mreza-strong);
}

.pil--live .pil__tile-pic img {
  width: 100%;
  /* height:auto is load-bearing: the img carries height="1200" as its CLS
     hint, and a presentational height BEATS aspect-ratio (which only resolves
     an AUTO dimension). Without this line every tile is 1200px tall
     (measured). */
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

/* Hover: pointer devices only, so touch never wires a state that cannot
   leave. The hovered plate steps forward, the others step back, and the
   plate's own corner title inks red — in both directions, so the title is a
   remote hand for its plate. Transform-only; :has misses simply cost the
   cross-highlight, never the function. */
@media (hover: hover) {
  .pil--live .pil__tile:hover {
    transform: scale(1.07);
    z-index: 3;
  }
  .pil--live .pil__stage:has(.pil__tile:hover) .pil__tile:not(:hover) {
    transform: scale(0.93);
  }
  .pil--live .pil__stage:has(.pil__label--design:hover) .pil__tile[data-p='design'],
  .pil--live .pil__stage:has(.pil__label--security:hover) .pil__tile[data-p='security'],
  .pil--live .pil__stage:has(.pil__label--seo:hover) .pil__tile[data-p='seo'] {
    transform: scale(1.07);
    z-index: 3;
  }
  .pil--live .pil__stage:has(.pil__tile[data-p='design']:hover) .pil__label--design,
  .pil--live .pil__stage:has(.pil__tile[data-p='security']:hover) .pil__label--security,
  .pil--live .pil__stage:has(.pil__tile[data-p='seo']:hover) .pil__label--seo {
    color: var(--rez);
  }
}

/* The open panel: the plate across the whole stage, the article over it.
   Text sits on a graphite veil at 0.86 — measured over pure white that
   composites to #434547: paper 9.94:1, papir-dim 6.64:1. */
.pil--live .pil__panel {
  position: absolute;
  inset: 0;
  z-index: 6;
  max-width: none;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: var(--grafit);
}

.pil--live .pil__cover {
  position: absolute;
  inset: 0;
  margin: 0;
}

.pil--live .pil__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pil--live .pil__cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(26 28 30 / 0.86);
}

.pil--live .pil__scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
}

.pil--live .pil__body {
  max-width: 62rem;
  margin-inline: auto;
  /* The close control owns the top-right corner; the first row of text
     starts below its 44px + breathing room, on every screen. */
  padding: clamp(4.25rem, 3.5rem + 2vw, 5.5rem) var(--gutter) 3rem;
}

.pil--live .pil__artifact {
  color: var(--papir-dim);
}

.pil--live .pil__name {
  color: var(--list);
  font-size: clamp(1.45rem, 1.2rem + 1.2vw, 2.4rem);
}

.pil--live .pil__summary {
  color: var(--list);
}

.pil--live .pil__point-label {
  color: var(--list);
}

.pil--live .pil__point-detail {
  color: var(--papir-dim);
}

.pil__close {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding-inline: 1rem;
  cursor: pointer;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  position: absolute;
  top: 0.9rem;
  right: var(--gutter);
  z-index: 7;
  margin: 0;
  color: var(--list);
  border: 1px solid rgb(245 242 235 / 0.6);
  background: rgb(26 28 30 / 0.5);
}

.pil__close:hover {
  border-color: var(--list);
}

.pil--live .pil__panel :focus-visible {
  outline-color: var(--rez-na-temnem);
}

/* --- desktop recomposition of the same wall -------------------------------- */
@media (min-width: 900px) {
  .pil--live .pil__stage {
    height: min(86vh, 54rem);
  }

  .pil--live .pil__tile {
    width: 26%;
  }

  .pil--live .pil__tile[data-p='design'] {
    left: 33%;
    top: 10%;
  }
  .pil--live .pil__tile[data-p='security'] {
    left: 52%;
    top: 35%;
  }
  .pil--live .pil__tile[data-p='seo'] {
    left: 30%;
    top: 58%;
  }
}
</style>
