<script setup lang="ts">
/**
 * Tradicija in izkušnje — the section that shows its own source.
 *
 * The visitor arrives on the MARKUP: the tags and text a crawler receives.
 * When the section's top reaches the top of the viewport a scan line sweeps
 * down and everything it passes resolves into the rendered page. The line then
 * parks low in the viewport and stays draggable, so the two states can be
 * compared at will.
 *
 * Two rules hold the whole thing together:
 *
 *  1. SPATIAL BINDING. Every block exists in BOTH layers at the same grid
 *     position, so a block's markup sits exactly where the block sits — two
 *     code blocks side by side when two cards are. The parallax offsets are
 *     custom properties on the section, read by both layers, so a card and its
 *     markup travel together and can never drift apart.
 *  2. HONESTY. The markup layer is derived from the same content the rendered
 *     layer draws, so it cannot depict tags we do not emit. Its <head> lines
 *     are the guard-checked emissions from machine-facts.ts.
 *
 * Rest state (stylesheet, no-JS, reduced motion) is FULLY RENDERED. JS lowers
 * the scan to reveal the markup and sweeps it back — nothing is ever hidden
 * without a way back, and a crawler reads the rendered layer as ordinary HTML.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { invisible } from '@/content/home'
import { factLines } from '@/lib/machine-facts'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import ArchitectureCompare from './ArchitectureCompare.vue'

const fx = createFx()
const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const grip = ref<HTMLInputElement | null>(null)
const live = ref(false)
/**
 * The scan position, and the single source the control is bound to. Writing
 * the input's value imperatively does not work: the input only exists once
 * `live` has flipped and Vue has re-rendered, so the write on mount lands on
 * nothing and the thumb sits at 100 while the section shows markup at 0
 * (measured). Bound, the control cannot misreport the state.
 */
const scanPct = ref(100)

/** Where the line parks after the sweep — low, but still on screen. */
const PARK = 82
/** The sweep itself: fast, one-shot. Paired with .trad--sweeping in the CSS. */
const SWEEP_MS = 900

/**
 * Per-block parallax rate, in px of travel per px of scroll. Deliberately
 * uneven so the strata separate; index matches the block order below.
 */
const RATES = [0, -0.04, -0.09, -0.03, -0.11, -0.06, 0]

/** The markup each block emits — derived, so it cannot depict tags we do not ship. */
const blocks = computed(() => [
  {
    id: 'head',
    kind: 'head' as const,
    code: factLines.map((f) => ({ id: f.id, text: f.text })),
  },
  {
    id: 'intro',
    kind: 'intro' as const,
    code: [
      { id: '', text: `<h2>${invisible.title}</h2>` },
      { id: '', text: `<blockquote>${invisible.quote}</blockquote>` },
      { id: '', text: `<p>${invisible.intro}</p>` },
    ],
  },
  ...invisible.items.map((item) => ({
    id: item.id,
    kind: 'item' as const,
    item,
    code: [
      { id: '', text: `<article id="${item.id}">` },
      { id: '', text: `  <h3>${item.label}</h3>` },
      { id: '', text: `  <p>${item.detail}</p>` },
      { id: '', text: `</article>` },
    ],
  })),
  {
    id: 'outro',
    kind: 'outro' as const,
    code: [{ id: '', text: `<p>${invisible.outro}</p>` }],
  },
])

let raf = 0
let scheduled = false
let syncScheduled = false

function setScan(v: number) {
  const n = Math.min(100, Math.max(0, v))
  scanPct.value = n
  root.value?.style.setProperty('--scan', `${n}%`)
}

function onGrip() {
  const g = grip.value
  if (!g) return
  root.value?.classList.remove('trad--sweeping')
  setScan(Number(g.value))
}

/**
 * Pin each markup block onto the box of the block it describes.
 *
 * The two layers cannot simply share a grid definition: their rows size to
 * their own content, and mono lines are not the height of a rendered card, so
 * the markup drifts off its block (measured — 5 of 7 blocks were adrift). The
 * rendered layer is therefore the single authority on geometry, and every
 * markup block is placed onto its counterpart's untransformed layout box.
 * offsetTop/offsetLeft ignore transforms, so the shared --pN parallax still
 * moves both together afterwards.
 *
 * Driven by a ResizeObserver, not by a one-shot measurement on mount: the pane
 * this renders in can still be settling its width when mount fires, and a set
 * of coordinates measured at a transient 196px viewport is wrong forever
 * afterwards (measured — every block pinned to width 148px). The observer
 * catches the real width, the media-query flip, and the font swap alike.
 */
function syncCode() {
  const el = root.value
  if (!el) return
  const rendered = Array.from(el.querySelectorAll<HTMLElement>('.trad__render .trad__b'))
  const coded = Array.from(el.querySelectorAll<HTMLElement>('.trad__code .trad__b'))
  if (rendered.length !== coded.length || !rendered.length) return

  // Release the previous run's reservations before measuring anything.
  for (const src of rendered) src.style.minHeight = ''

  // Horizontal geometry first: the columns are grid-driven and already final,
  // and a markup block's height only settles once it knows its width.
  const boxes = rendered.map((src) => ({ left: src.offsetLeft, width: src.offsetWidth }))
  for (const [i, dst] of coded.entries()) {
    dst.style.left = `${boxes[i]!.left}px`
    dst.style.width = `${boxes[i]!.width}px`
  }

  // Reserve, per block, the taller of the two states: markup can then never
  // spill onto a neighbouring block, and the rendered block never leaves a hole.
  const needs = coded.map((dst) => dst.offsetHeight)
  const own = rendered.map((src) => src.offsetHeight)
  for (const [i, src] of rendered.entries()) {
    if (needs[i]! > own[i]!) src.style.minHeight = `${needs[i]}px`
  }

  // Rows are final — pin each markup block onto the block it describes.
  const tops = rendered.map((src) => src.offsetTop)
  for (const [i, dst] of coded.entries()) dst.style.top = `${tops[i]}px`
}

/**
 * Coalesce the observer's bursts into one sync per frame.
 *
 * Deliberately no "we are writing, ignore this" guard: the reservations below
 * resize the observed blocks, so such a guard drops the genuine resize that
 * lands in the same window and the markup stays pinned to the old layout
 * (measured — a 1280→375 flip left every block on its desktop coordinates).
 * The sync is idempotent instead: the second pass writes identical values,
 * which changes no geometry, so the observer falls silent by itself.
 */
function scheduleSync() {
  if (syncScheduled) return
  syncScheduled = true
  fx.raf(() => {
    syncScheduled = false
    syncCode()
  })
}

/** Parallax: one read, one write per frame, both layers reading the result. */
function measure() {
  scheduled = false
  const el = root.value
  const st = stage.value
  if (!el || !st) return
  const rect = st.getBoundingClientRect()
  // Progress of the stage through the viewport, centred on its own travel.
  const d = window.innerHeight - rect.top
  for (const [i, rate] of RATES.entries()) {
    el.style.setProperty(`--p${i}`, `${(d * rate).toFixed(1)}px`)
  }
}

function onScroll() {
  if (scheduled) return
  scheduled = true
  raf = fx.raf(measure)
}

onMounted(() => {
  live.value = true
  const el = root.value
  const st = stage.value
  if (!el || !st) return

  syncCode()
  measure()
  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(
    window,
    'resize',
    () => {
      // Two independent paths to a re-pin, because the failure is silent and
      // permanent: the markup keeps the coordinates of a layout that is gone.
      scheduleSync()
      onScroll()
    },
    { passive: true },
  )

  // Re-pin whenever the geometry the markup is bound to actually changes —
  // container width, media-query flip, font swap, a copy edit that rewraps.
  if ('ResizeObserver' in window) {
    const ro = fx.ro(scheduleSync)
    ro.observe(el.querySelector('.trad__render')!)
    for (const b of el.querySelectorAll('.trad__render .trad__b')) ro.observe(b)
  }

  // Reduced motion keeps the finished page and the draggable line, no sweep.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

  // Start on the markup, and hold there until the section's top reaches the
  // top of the viewport.
  setScan(0)

  let swept = false
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        // rootMargin pins the trigger to the moment the top edge lands.
        if (!e.isIntersecting || swept) continue
        swept = true
        io.disconnect()
        el.classList.add('trad--sweeping')
        setScan(PARK)
        fx.setTimeout(() => el.classList.remove('trad--sweeping'), SWEEP_MS + 40)
      }
    },
    { rootMargin: '0px 0px -100% 0px', threshold: 0 },
  )
  io.observe(st)

  // Safety net: if the observer never fires, do not strand the visitor on code.
  fx.setTimeout(() => {
    if (swept) return
    swept = true
    io.disconnect()
    setScan(PARK)
  }, 9000)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  fx.dispose()
})
</script>

<template>
  <section id="nevidno" ref="root" class="trad" :class="{ 'trad--live': live }">
    <div ref="stage" class="trad__stage">
      <!-- RENDERED: the real page. In normal flow, so it defines the height
           and a crawler reads it as ordinary HTML. -->
      <div class="trad__render">
        <div v-for="(b, i) in blocks" :key="b.id" class="trad__b" :class="`trad__b--${b.id}`"
          :style="{ '--p': `var(--p${i}, 0px)` }">
          <template v-if="b.kind === 'head'">
            <p class="kicker kicker--on-dark">{{ invisible.kicker }}</p>
          </template>

          <template v-else-if="b.kind === 'intro'">
            <h2 class="trad__title">{{ invisible.title }}</h2>
            <blockquote class="trad__quote">
              <p>{{ invisible.quote }}</p>
            </blockquote>
            <p class="trad__intro">{{ invisible.intro }}</p>
            <p class="trad__gloss">{{ invisible.machineGloss }}</p>
          </template>

          <template v-else-if="b.kind === 'item'">
            <article class="card">
              <h3 class="card__label">{{ b.item.label }}</h3>
              <p class="card__detail">{{ b.item.detail }}</p>
            </article>
          </template>

          <template v-else>
            <p class="trad__outro">{{ invisible.outro }}</p>
          </template>
        </div>
      </div>

      <!-- MARKUP: the same blocks, in the same cells, as the tags we emit.
           Decorative for assistive tech — the rendered layer already carries
           every string. -->
      <div class="trad__code" aria-hidden="true">
        <div v-for="(b, i) in blocks" :key="b.id" class="trad__b" :class="`trad__b--${b.id}`"
          :style="{ '--p': `var(--p${i}, 0px)` }">
          <code
            v-for="(line, n) in b.code"
            :key="n"
            class="emisija trad__line"
            :data-fact="line.id || undefined"
            >{{ line.text }}</code
          >
        </div>
      </div>

      <!-- The scan itself, and the control that owns it. -->
      <div class="trad__scan" aria-hidden="true">
        <span class="trad__scan-line"></span>
      </div>

      <!-- The labels name the section's two states and stay in the static
           HTML; only the control itself waits for hydration, so JS-off never
           sees a dead affordance. -->
      <div class="trad__grip-wrap">
        <div class="trad__grip-rail">
          <span class="datum trad__grip-label">{{ invisible.humanLabel }}</span>
          <input
            v-if="live"
            ref="grip"
            class="trad__grip"
            type="range"
            min="0"
            max="100"
            step="1"
            :value="scanPct"
            :aria-label="invisible.feedback.scanLabel"
            @input="onGrip"
          />
          <span class="datum trad__grip-label">{{ invisible.machineLabel }}</span>
        </div>
      </div>
    </div>

    <div class="container">
      <ArchitectureCompare />
    </div>
  </section>
</template>

<style scoped>
.trad {
  /* Rest state: fully rendered. JS lowers this to reveal the markup. */
  --scan: 100%;
  background: var(--grafit);
  color: var(--list);
  padding-block: var(--section-y);
}

.trad__stage {
  position: relative;
  padding-inline: var(--gutter);
  max-width: 76rem;
  margin-inline: auto;
}

/* The rendered layer is the geometry authority; it alone is in flow. */
.trad__render {
  position: relative;
  display: grid;
  gap: 2rem;
  /* Keep the copy clear of the grip rail. The desktop gutter is already wider
     than the 44px control, so this is only needed while the gutter is narrow
     (measured — 20px of overlap on a 375px screen without it). */
  padding-right: 3rem;
}

/* The markup lies over the rendered page and is clipped away above the scan,
   so everything the line has passed reads as the finished site. The inline
   inset matches the stage's gutter, which puts this box exactly over the
   rendered layer's content box — the coordinates JS pins with are then shared. */
.trad__code {
  position: absolute;
  inset: 0 var(--gutter);
  clip-path: inset(var(--scan) 0 0 0);
}

/* Pinned onto their counterparts by syncCode(), never laid out by the grid:
   two grids sizing rows to their own content is exactly how the markup drifts
   off the block it describes. */
.trad__code .trad__b {
  position: absolute;
}

.trad--sweeping .trad__code,
.trad--sweeping .trad__scan {
  transition: clip-path 900ms var(--ease-out);
}

/* Every block carries its own parallax offset, and BOTH layers read the same
   custom property — a card and its markup can never separate. */
.trad__b {
  transform: translateY(var(--p, 0px));
}

.trad__line {
  display: block;
  color: var(--papir-dim);
  line-height: 1.75;
  overflow-wrap: anywhere;
}

/* --- the rendered page ----------------------------------------------------- */
.trad__title {
  margin-top: 0.75rem;
  color: var(--list);
}

.trad__quote {
  margin-top: 1.5rem;
  border-left: 3px solid var(--rez-na-temnem);
  padding-left: 1.25rem;
}

.trad__quote p {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 1.05rem + 0.9vw, 1.6rem);
  font-weight: 500;
  line-height: 1.35;
  max-width: 30ch;
}

.trad__intro {
  margin-top: 1.25rem;
  color: var(--papir-dim);
  max-width: 54ch;
}

.card {
  border: 1px solid var(--crta-na-temnem);
  border-top: 3px solid var(--rez-na-temnem);
  background: var(--grafit-inset);
  padding: 1.25rem;
}

.card__label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--list);
}

.card__detail {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: var(--papir-dim);
}

.trad__outro {
  font-size: var(--fs-lead);
  color: var(--list);
  max-width: 46ch;
}

/* --- the scan -------------------------------------------------------------- */
.trad__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  clip-path: inset(calc(var(--scan) - 1px) 0 0 0);
}

.trad__scan-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: var(--rez-na-temnem);
  box-shadow: 0 0 18px 1px var(--rez-na-temnem);
}

.trad__gloss {
  margin-top: 1rem;
  font-style: italic;
  font-size: 0.92rem;
  color: var(--papir-dim);
  max-width: 48ch;
}

/* The control IS the line's owner: a real range input, so dragging, the
   keyboard and touch all work without a single touch listener — and none of
   the iOS non-passive-touchmove traps apply. */
/* The rail runs the height of the section but the control STICKS to the
   viewport inside it. A full-height vertical range would own its gesture down
   the entire right edge — on a phone that is hundreds of pixels where a swipe
   moves the scan instead of scrolling the page. Sticky keeps it in reach the
   whole way down while leaving most of the edge to normal scrolling. */
.trad__grip-wrap {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Flush on phones: the stage spans the viewport there, so the desktop
     quarter-rem bleed becomes 4px of horizontal page scroll (measured). */
  right: 0;
  z-index: 5;
  pointer-events: none;
}

.trad__grip-rail {
  position: sticky;
  top: 22vh;
  height: 56vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  pointer-events: auto;
}

.trad__grip {
  flex: 1;
  /* A vertical range: dragging the thumb never scrolls the page, which is
     what lets this work on touch with no listeners of our own. */
  writing-mode: vertical-lr;
  direction: rtl;
  width: 44px;
  background: transparent;
  cursor: ns-resize;
  accent-color: var(--rez-na-temnem);
}

.trad__grip:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 2px;
}

.trad__grip-label {
  color: var(--papir-dim);
  writing-mode: vertical-rl;
}

@media (min-width: 900px) {
  .trad__render {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: start;
    gap: 2.5rem 1.5rem;
    padding-right: 0;
  }

  /* The stage is centred here, so the bleed lands in its own margin. */
  .trad__grip-wrap {
    right: -0.25rem;
  }

  /* Scattered, not stacked: the blocks sit off each other's rhythm. Placement
     lives on the rendered layer alone — the markup layer inherits the result
     through syncCode(), so there is only ever one description of the layout. */
  .trad__render .trad__b--head {
    grid-column: 1 / span 5;
    grid-row: 1;
  }
  .trad__render .trad__b--intro {
    grid-column: 1 / span 6;
    grid-row: 2;
  }
  .trad__render .trad__b--seo-foundation {
    grid-column: 8 / span 5;
    grid-row: 1 / span 2;
    margin-top: 3.5rem;
  }
  .trad__render .trad__b--forms {
    grid-column: 2 / span 4;
    grid-row: 3;
  }
  .trad__render .trad__b--compliance {
    grid-column: 7 / span 4;
    grid-row: 3;
    margin-top: 4rem;
  }
  .trad__render .trad__b--hosting {
    grid-column: 4 / span 5;
    grid-row: 4;
  }
  .trad__render .trad__b--outro {
    grid-column: 1 / span 6;
    grid-row: 5;
    margin-top: 2rem;
  }
}
</style>
