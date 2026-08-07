<script setup lang="ts">
/**
 * »Kaj vsebujejo vsi paketi?« — three pillars as a work-wall.
 *
 * Desktop, hydrated: the pillar titles stand at the stage's corners in display
 * size and the three plates sit as a staggered cluster in the middle. Hovering
 * a plate enlarges it while the others step back (and its corner title inks
 * red); clicking a plate — or its title — expands that plate across the whole
 * stage and the pillar's full text appears over it. One open at a time,
 * Escape closes, focus moves to the panel's close control and returns to the
 * invoker on close.
 *
 * The prerendered page and JS-off readers get all three articles IN FULL, in
 * flow, each with its plate as an ordinary figure — the collapse is applied by
 * JS after hydration (inline styles from paint(), never CSS), so nothing is
 * ever hidden without a way back. Phones keep the flow layout: plates become
 * tappable ledger bands and the tapped article expands in place.
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

const isDesktop = () => window.matchMedia('(min-width: 900px)').matches

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
 * on desktop they get `inert`, so Tab can never land on a button that is
 * visually underneath the open panel.
 */
function paint() {
  const desktopOverlay = live.value && open.value !== null && isDesktop()
  for (const it of items) {
    const panel = panelOf(it.id)
    if (panel) panel.style.display = !live.value || open.value === it.id ? '' : 'none'
  }
  for (const b of host.value?.querySelectorAll<HTMLElement>('.pil__label, .pil__tile') ?? []) {
    if (desktopOverlay) b.setAttribute('inert', '')
    else b.removeAttribute('inert')
  }
}

function show(id: string, from: HTMLElement) {
  if (open.value === id) return
  invoker = from
  const wasOpen = open.value
  open.value = id

  // Phones: closing the other article above the tapped band moves the page —
  // measure the band's drift across the repaint and take it back out.
  const before = from.getBoundingClientRect().top
  paint()
  if (!isDesktop()) {
    if (wasOpen) {
      const drift = from.getBoundingClientRect().top - before
      if (drift !== 0) window.scrollBy({ top: drift, behavior: 'instant' as ScrollBehavior })
    }
    return
  }

  const panel = panelOf(id)
  if (!panel) return
  // Focus follows the expansion; Escape and the close control lead back out.
  panel.querySelector<HTMLElement>('.pil__close')?.focus({ preventScroll: true })

  if (prefersReducedMotion()) return

  // FLIP: the panel grows out of the plate the visitor clicked.
  const tile = tileOf(id)
  const st = stage.value
  if (!tile || !st) return
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
  if (!panel || prefersReducedMotion() || !isDesktop()) {
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

const sizesTile = '(min-width: 900px) 27vw, 6rem'
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
        <!-- The plate: a cluster tile on desktop, a ledger band on phones. -->
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
          <span class="pil__tile-name">{{ p.title }}</span>
          <span class="pil__tile-ind" aria-hidden="true"></span>
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

/* Static articles keep their measure even though the stage is full-bleed live. */
.pil__panel {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.pil__close {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding-inline: 1rem;
  background: none;
  border: 1px solid var(--mreza-strong);
  color: var(--grafit);
  cursor: pointer;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  margin-block: 1rem 1.5rem;
}

/* --- phones, hydrated: ledger bands + in-flow expansion -------------------- */
.pil__tile {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  min-height: 44px;
  padding: 0.6rem var(--gutter);
  background: none;
  border: 0;
  border-top: 1px solid var(--mreza-strong);
  cursor: pointer;
  text-align: left;
}

.pil__group:last-child .pil__tile {
  border-bottom: 1px solid var(--mreza-strong);
}

.pil__tile-pic {
  flex: 0 0 auto;
  width: 6rem;
  line-height: 0;
  border: 1px solid var(--mreza);
}

.pil__tile-pic img {
  width: 100%;
  height: auto;
}

.pil__tile-name {
  flex: 1;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.1rem, 1rem + 0.6vw, 1.4rem);
  color: var(--grafit);
}

/* +/− indicator drawn as two strokes — no dingbat glyph. */
.pil__tile-ind {
  position: relative;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
}
.pil__tile-ind::before,
.pil__tile-ind::after {
  content: '';
  position: absolute;
  background: var(--rez);
}
.pil__tile-ind::before {
  left: 0;
  right: 0;
  top: 6px;
  height: 2px;
}
.pil__tile-ind::after {
  top: 0;
  bottom: 0;
  left: 6px;
  width: 2px;
  transition: transform 200ms var(--ease-out);
}
.pil__tile[aria-expanded='true'] .pil__tile-ind::after {
  transform: scaleY(0);
}

/* Hydrated phones: the band shows the plate, so the article drops its figure
   and top rule (the band above is the divider). JS-off never has bands, so
   this must stay behind the live flag. */
@media (max-width: 899.98px) {
  /* The corner titles are the desktop wall's typography; on phones the bands
     already carry the names, so the label buttons would be duplicate text. */
  .pil__label {
    display: none;
  }
  .pil--live .pil__cover {
    display: none;
  }
  .pil--live .pil__panel {
    border-top: 0;
  }
  .pil--live .pil__group + .pil__group {
    margin-top: 0;
  }
  .pil--live .pil__body {
    border-left: 3px solid var(--rez);
    background: var(--rez-vodni);
    padding: 1.25rem;
    margin-block: 0.75rem 1.25rem;
  }
  .pil--live .pil__close {
    display: none;
  }
}

/* --- desktop, hydrated: the wall ------------------------------------------- */
@media (min-width: 900px) {
  .pil--live .pil__stage {
    position: relative;
    height: min(86vh, 54rem);
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
    font-size: clamp(1.8rem, 1.2rem + 1.9vw, 3.1rem);
    line-height: 1.05;
    letter-spacing: -0.015em;
    color: var(--grafit);
    text-align: left;
    max-width: 34ch;
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

  .pil__label:hover {
    color: var(--rez);
  }

  /* The cluster. Tiles are absolute within the stage, staggered off each
     other's rhythm like plates on a wall. */
  .pil--live .pil__tile {
    position: absolute;
    z-index: 1;
    display: block;
    width: 26%;
    min-height: 0;
    padding: 0;
    border: 0;
    background: var(--grafit);
    line-height: 0;
    transition: transform 340ms var(--ease-out);
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

  .pil--live .pil__tile-pic {
    display: block;
    width: 100%;
    border: 1px solid var(--mreza-strong);
  }

  .pil--live .pil__tile-pic img {
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  .pil--live .pil__tile-name,
  .pil--live .pil__tile-ind {
    display: none;
  }

  /* Hover: the hovered plate steps forward, the others step back, and the
     plate's own corner title inks red — in both directions, so the title is
     a remote hand for its plate. Transform-only; :has misses simply cost the
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
     composites to #434547: paper 9.94:1, papir-dim 6.64:1, and the red
     indicator strokes 3.40:1 against the 3:1 UI floor. */
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
    padding: clamp(2.5rem, 2rem + 2vw, 4rem) var(--gutter) 3rem;
  }

  .pil--live .pil__artifact {
    color: var(--papir-dim);
  }

  .pil--live .pil__name {
    color: var(--list);
    font-size: clamp(1.6rem, 1.3rem + 1.2vw, 2.4rem);
  }

  .pil--live .pil__summary {
    color: var(--list);
  }

  .pil--live .pil__points {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.25rem 2.5rem;
  }

  .pil--live .pil__point-label {
    color: var(--list);
  }

  .pil--live .pil__point-detail {
    color: var(--papir-dim);
  }

  .pil--live .pil__close {
    position: absolute;
    top: 1.25rem;
    right: var(--gutter);
    z-index: 7;
    margin: 0;
    color: var(--list);
    border-color: rgb(245 242 235 / 0.6);
    background: rgb(26 28 30 / 0.5);
  }

  .pil--live .pil__close:hover {
    border-color: var(--list);
  }

  .pil--live .pil__panel :focus-visible {
    outline-color: var(--rez-na-temnem);
  }

  /* Non-live desktop (JS off): points still spread into columns. */
  .pil__points {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }
}
</style>
