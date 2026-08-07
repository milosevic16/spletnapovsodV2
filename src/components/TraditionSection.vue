<script setup lang="ts">
/**
 * Tradicija in izkušnje — the section that shows its own source.
 *
 * A red cut line sits across the VIEWPORT. Everything above it is the rendered
 * page; everything below it is the markup a crawler receives. Scrolling pushes
 * the section up through the line, so the page converts itself as it passes.
 * The line is draggable, so the two states can be compared at will.
 *
 * Three rules hold it together:
 *
 *  1. THE CUT IS VIEWPORT-RELATIVE. It is a position on the SCREEN, recomputed
 *     into the layer's own coordinates every frame — never a percentage of the
 *     section. A section-relative cut parks the line wherever that percentage
 *     lands, which on a section taller than the screen is off-screen entirely:
 *     the visitor never sees the line and the grip drags something invisible
 *     (measured — the line sat 909px down a 1109px section, past the fold).
 *  2. THE MARKUP LAYER IS OPAQUE. It REPLACES the rendered page below the cut.
 *     Transparent, the two layers simply both paint and the section reads as
 *     garbage — two texts in the same pixels (measured).
 *  3. SPATIAL BINDING. Every block exists in both layers at the same place, so
 *     a block's markup sits exactly where the block sits. The parallax offsets
 *     are custom properties both layers read, so a card and its markup travel
 *     together and can never drift apart.
 *
 * Rest state (stylesheet, no-JS, reduced motion) is the FULLY RENDERED page:
 * `--cut` is unset, which falls back to 100% and clips the markup away
 * entirely. A crawler reads the rendered layer as ordinary HTML.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { invisible } from '@/content/home'
import { factLines } from '@/lib/machine-facts'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const codeLayer = ref<HTMLElement | null>(null)
const grip = ref<HTMLInputElement | null>(null)
const live = ref(false)

/**
 * Where the cut rides, as a percentage of the VIEWPORT height: 0 = screen top
 * (everything on screen is markup), 100 = screen bottom (everything rendered).
 * This is exactly what the grip sets, which is what makes the control legible.
 */
const PARK = 78
/** The arrival sweep: the cut travels from the top of the screen down to PARK. */
const SWEEP_MS = 950

/**
 * Per-block parallax, as a multiplier in [-1, 1] of AMPLITUDE. The detail
 * drawing is one block, so it drifts as a single buried mass against the
 * still header and outro — no relative movement inside it, which is what
 * would open seams between the flush material layers.
 */
const AMPLITUDE = 18
const RATES = [0, 0.7, 0]

/** The cut's viewport position. Written by the sweep and by the grip. */
const scanPct = ref(100)

/**
 * Which material layer the detail drawing is probing. Drives the leader line's
 * position through a single integer custom property, so the swing is one CSS
 * transition rather than per-frame work.
 */
const layer = ref(0)

/** Read the tabs from the DOM: a v-for ref array goes stale on every update. */
function bandAt(i: number): HTMLElement | undefined {
  return root.value?.querySelectorAll<HTMLElement>('.asm__band')[i]
}

/** Vertical tablist: arrows move and select, Home/End jump to the ends. */
function onLayerKeys(e: KeyboardEvent) {
  const n = invisible.items.length
  let next = -1
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (layer.value + 1) % n
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (layer.value - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next < 0) return
  e.preventDefault()
  layer.value = next
  // The focus follows the selection, which is the tablist contract. nextTick,
  // not rAF: this waits on Vue's DOM update, and rAF is throttled to a stop in
  // a background tab — the focus must land regardless.
  nextTick(() => bandAt(next)?.focus())
}

/** The markup each block emits — derived, so it cannot depict tags we do not ship. */
const blocks = computed(() => [
  {
    // One centred header block: the guard-checked head emissions open its
    // markup, exactly as they open the real page's.
    id: 'header',
    kind: 'header' as const,
    code: [
      ...factLines.map((f) => ({ id: f.id, text: f.text })),
      { id: '', text: `<h2>${invisible.title}</h2>` },
      { id: '', text: `<blockquote>${invisible.quote}</blockquote>` },
      { id: '', text: `<p>${invisible.intro}</p>` },
      { id: '', text: `<p>${invisible.machineGloss}</p>` },
    ],
  },
  {
    // The detail drawing is ONE block, so its markup — every layer's article,
    // in order — sits over the drawing that depicts them.
    id: 'assembly',
    kind: 'assembly' as const,
    code: invisible.items.flatMap((item) => [
      { id: '', text: `<article id="${item.id}">` },
      { id: '', text: `  <h3>${item.label}</h3>` },
      { id: '', text: `  <p>${item.detail}</p>` },
      { id: '', text: `</article>` },
    ]),
  },
  {
    id: 'outro',
    kind: 'outro' as const,
    code: [{ id: '', text: `<p>${invisible.outro}</p>` }],
  },
])

let scheduled = false
let syncScheduled = false
let sweeping = false

/**
 * Pin each markup block onto the box of the block it describes.
 *
 * The two layers cannot share a grid: their rows size to their own content,
 * and mono lines are not the height of a rendered card, so the markup drifts
 * off the block it describes. The rendered layer is the single geometry
 * authority; every markup block is placed onto its counterpart's box.
 *
 * Parallax is zeroed for the whole measurement, so the rects read are LAYOUT
 * positions — getBoundingClientRect includes transforms, and pinning to a
 * transformed box would bake one frame's parallax in permanently.
 *
 * Driven by a ResizeObserver, never a one-shot on mount: the pane this renders
 * in can still be settling its width when mount fires, and coordinates
 * measured at a transient width are wrong forever afterwards.
 */
function syncCode() {
  const el = root.value
  const layer = codeLayer.value
  if (!el || !layer) return
  const rendered = Array.from(el.querySelectorAll<HTMLElement>('.trad__render .trad__b'))
  const coded = Array.from(el.querySelectorAll<HTMLElement>('.trad__code .trad__b'))
  if (rendered.length !== coded.length || !rendered.length) return

  for (const [i] of RATES.entries()) el.style.setProperty(`--p${i}`, '0px')
  for (const src of rendered) src.style.minHeight = ''

  // Horizontal first: columns are grid-driven and final, and a markup block's
  // height only settles once it knows its width.
  let layerRect = layer.getBoundingClientRect()
  const boxes = rendered.map((src) => {
    const r = src.getBoundingClientRect()
    return { left: r.left - layerRect.left, width: r.width }
  })
  for (const [i, dst] of coded.entries()) {
    dst.style.left = `${boxes[i]!.left.toFixed(1)}px`
    dst.style.width = `${boxes[i]!.width.toFixed(1)}px`
  }

  // Reserve the taller of the two states per block, so markup can never spill
  // onto a neighbour and the rendered block never leaves a hole.
  const needs = coded.map((dst) => dst.offsetHeight)
  const own = rendered.map((src) => src.offsetHeight)
  for (const [i, src] of rendered.entries()) {
    if (needs[i]! > own[i]!) src.style.minHeight = `${needs[i]}px`
  }

  // Rows are final — pin each markup block onto the block it describes, then
  // confirm. Reserving heights above CHANGES the very rows being pinned, so a
  // single pass can settle on stale numbers and the markup then sits wrong
  // forever with nothing to correct it. The check is one extra reflow and it
  // converges: re-pinning moves only absolutely-positioned boxes, which cannot
  // feed back into the rendered layer's geometry.
  for (let pass = 0; pass < 2; pass++) {
    layerRect = layer.getBoundingClientRect()
    const tops = rendered.map((src) => src.getBoundingClientRect().top - layerRect.top)
    let worst = 0
    for (const [i, dst] of coded.entries()) {
      const want = tops[i]!
      worst = Math.max(worst, Math.abs(want - parseFloat(dst.style.top || '0')))
      dst.style.top = `${want.toFixed(1)}px`
    }
    if (worst < 0.5) break
  }

  measure()
}

/**
 * One read, one write per frame: the cut in the markup layer's own
 * coordinates, and the parallax both layers share.
 */
function measure() {
  scheduled = false
  const el = root.value
  const layer = codeLayer.value
  const st = stage.value
  if (!el || !layer || !st) return

  const vh = window.innerHeight
  const layerRect = layer.getBoundingClientRect()
  // The cut's screen position, expressed as a distance into the markup layer.
  const cut = Math.min(Math.max((scanPct.value / 100) * vh - layerRect.top, 0), layerRect.height)
  el.style.setProperty('--cut', `${cut.toFixed(1)}px`)

  // Progress of the stage across the screen, centred: -1 entering, +1 leaving.
  const rect = st.getBoundingClientRect()
  const raw = (vh - rect.top) / (vh + rect.height)
  const c = Math.min(1, Math.max(-1, raw * 2 - 1))
  for (const [i, rate] of RATES.entries()) {
    el.style.setProperty(`--p${i}`, `${(c * rate * AMPLITUDE).toFixed(1)}px`)
  }
}

function onScroll() {
  if (scheduled) return
  scheduled = true
  fx.raf(measure)
}

/** Coalesce the observer's bursts into one sync per frame. The sync is
    idempotent, so no "we are writing" guard is needed — and such a guard would
    drop the genuine resize that lands in the same window. */
function scheduleSync() {
  if (syncScheduled) return
  syncScheduled = true
  fx.raf(() => {
    syncScheduled = false
    syncCode()
  })
}

function onGrip() {
  const g = grip.value
  if (!g) return
  sweeping = false // a hand on the control always wins
  scanPct.value = Number(g.value)
  measure()
}

/** The arrival sweep: the cut enters at the top of the screen and settles at
    PARK, converting everything it passes. Self-driven, because the visitor may
    not be scrolling while it runs. */
function sweep() {
  sweeping = true
  const t0 = performance.now()
  const step = (now: number) => {
    if (!sweeping) return
    const t = Math.min(1, (now - t0) / SWEEP_MS)
    const eased = 1 - Math.pow(1 - t, 3)
    scanPct.value = eased * PARK
    measure()
    if (t < 1) fx.raf(step)
    else sweeping = false
  }
  fx.raf(step)
}

onMounted(() => {
  live.value = true
  const el = root.value
  const st = stage.value
  if (!el || !st) return

  const reduced = prefersReducedMotion()
  // Reduced motion gets the finished page and a live control — nothing moves
  // on its own. Everyone else arrives on the markup and watches it convert.
  scanPct.value = reduced ? 100 : 0

  // The first pin waits for the hydrated DOM. Hydration REPLACES this
  // section's layout — the four callouts collapse to one, the bands become
  // tabs — and measuring before that re-render pins the markup to a layout
  // that is about to vanish (measured: 136.8px of permanent drift).
  measure()
  nextTick(syncCode)

  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(
    window,
    'resize',
    () => {
      // Two independent paths to a re-pin: the failure is silent and permanent.
      scheduleSync()
      onScroll()
    },
    { passive: true },
  )

  if ('ResizeObserver' in window) {
    const ro = fx.ro(scheduleSync)
    ro.observe(el.querySelector('.trad__render')!)
    for (const b of el.querySelectorAll('.trad__render .trad__b')) ro.observe(b)
  }
  // Text metrics change on font swap — re-pin once they have landed.
  document.fonts?.ready.then(() => scheduleSync())

  // Probing a layer swaps the callout, which changes the block's height.
  // Re-pin explicitly rather than leaning on the ResizeObserver: this one is
  // a state change we own, so it should not depend on observing its own
  // side effect.
  watch(layer, () => nextTick(scheduleSync))

  if (reduced || !('IntersectionObserver' in window)) return

  let swept = false
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        // rootMargin pins the trigger to the moment the top edge lands.
        if (!e.isIntersecting || swept) continue
        swept = true
        io.disconnect()
        sweep()
      }
    },
    { rootMargin: '0px 0px -100% 0px', threshold: 0 },
  )
  io.observe(st)

  // Safety net: never strand the visitor on markup.
  fx.setTimeout(() => {
    if (swept) return
    swept = true
    io.disconnect()
    sweep()
  }, 9000)
})

onUnmounted(() => {
  sweeping = false
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
          <template v-if="b.kind === 'header'">
            <p class="kicker kicker--on-dark">{{ invisible.kicker }}</p>
            <h2 class="trad__title">{{ invisible.title }}</h2>
            <blockquote class="trad__quote">
              <p>{{ invisible.quote }}</p>
            </blockquote>
            <p class="trad__intro">{{ invisible.intro }}</p>
            <p class="trad__gloss">{{ invisible.machineGloss }}</p>
          </template>

          <!-- THE DETAIL: a section through the site's own build-up. Four
               material layers, each drawn in its own drafting hatch; probing
               one swings the leader across to its callout.

               The bands become tabs ONLY once hydrated — with JS off they are
               an inert drawing and all four callouts stand open in flow, so
               nobody meets a control that does nothing. The article ids are
               real, so the markup layer's <article id="…"> depicts a tag we
               actually ship. -->
          <template v-else-if="b.kind === 'assembly'">
            <div class="asm" :style="{ '--sel': layer }">
              <div
                class="asm__stack"
                :role="live ? 'tablist' : undefined"
                :aria-label="live ? invisible.feedback.layersLabel : undefined"
                aria-orientation="vertical"
                @keydown="live && onLayerKeys($event)"
              >
                <!-- Dimension rule down the left edge: extension ticks only,
                     never a figure — this drawing measures nothing we could
                     honestly put a number on. -->
                <span class="asm__dim" aria-hidden="true"></span>

                <component
                  :is="live ? 'button' : 'div'"
                  v-for="(item, n) in invisible.items"
                  :key="item.id"
                  class="asm__band"
                  :class="[`asm__band--${n}`, { 'asm__band--on': live && n === layer }]"
                  :type="live ? 'button' : undefined"
                  :role="live ? 'tab' : undefined"
                  :aria-selected="live ? String(n === layer) : undefined"
                  :aria-controls="live ? `layer-${item.id}` : undefined"
                  :tabindex="live ? (n === layer ? 0 : -1) : undefined"
                  @click="live && (layer = n)"
                >
                  <span class="asm__fill" aria-hidden="true"></span>
                  <!-- The cut plane marking the probed layer: the site's own
                       motif, red rule with square end ticks. -->
                  <span class="asm__plane" aria-hidden="true"></span>
                  <span v-if="live" class="visually-hidden">{{ item.label }}</span>
                </component>

                <!-- Swings to the probed layer; positioned from --sel alone. -->
                <span v-if="live" class="asm__leader" aria-hidden="true"></span>
              </div>

              <div class="asm__callouts">
                <article
                  v-for="(item, n) in invisible.items"
                  :id="item.id"
                  :key="item.id"
                  class="asm__callout"
                  :class="{ 'asm__callout--on': !live || n === layer }"
                  :role="live ? 'tabpanel' : undefined"
                  :aria-labelledby="undefined"
                  :hidden="live && n !== layer"
                >
                  <h3 class="asm__label" :id="`layer-${item.id}`">{{ item.label }}</h3>
                  <p class="asm__detail">{{ item.detail }}</p>
                </article>
              </div>
            </div>
          </template>

          <template v-else>
            <p class="trad__outro">{{ invisible.outro }}</p>
          </template>
        </div>
      </div>

      <!-- MARKUP: the same blocks, in the same places, as the tags we emit.
           Opaque, so below the cut it REPLACES the page rather than joining
           it. Decorative for assistive tech — the rendered layer already
           carries every string. The cut line lives in here so it and the clip
           share one variable AND one coordinate system. -->
      <div ref="codeLayer" class="trad__code" aria-hidden="true">
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
  </section>
</template>

<style scoped>
.trad {
  position: relative;
  background: var(--grafit);
  color: var(--list);
  /* Asymmetric on purpose: the owner wants the header tight under the top of
     the band, so the entry padding is roughly half the section rhythm. The
     markup layer reads BOTH values to cover the padding, so they live as
     variables rather than in the shorthand alone. */
  --pad-t: clamp(2.25rem, 1.75rem + 2vw, 3.5rem);
  --pad-b: var(--section-y);
  padding-block: var(--pad-t) var(--pad-b);
}

/* Full-bleed, so the markup layer's ground can reach the screen edges. The
   rendered layer inside carries the measure. */
.trad__stage {
  position: relative;
}

/* The geometry authority; the only child in flow. One column — the header,
   the four strata flush against each other, the outro. Spacing is per-block
   margin, so the strata can sit at 0 while the text blocks breathe. */
.trad__render {
  position: relative;
  z-index: 0;
  display: grid;
  gap: 0;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: var(--gutter);
  /* Clear the grip rail. Additive to the gutter, not a replacement for it:
     the rail is measured from the same 76rem box, so the clearance is
     (gutter + this) - 44px. */
  padding-right: calc(var(--gutter) + 3rem);
}

/* The markup layer covers the section's own block padding too, so the cut
   never leaves a seam between the two grounds. `--cut` is a LENGTH into this
   box, computed per frame; unset (no JS) it falls back to 100% and the whole
   layer is clipped away, leaving the finished page. */
.trad__code {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--pad-t) * -1);
  bottom: calc(var(--pad-b) * -1);
  z-index: 1;
  background: var(--grafit-inset);
  clip-path: inset(var(--cut, 100%) 0 0 0);
}

/* Pinned onto their counterparts by syncCode(), never laid out by a grid.
   margin: 0 is load-bearing: the block-modifier classes below set layout
   margins, a margin offsets an absolute box from its `top`, and these blocks
   share those classes — the outro's margin-top walked its markup 56px off the
   block it describes (measured). Text stays left-aligned raw code even where
   the rendered twin centres. */
.trad__code .trad__b {
  position: absolute;
  margin: 0;
  text-align: left;
}

/* Every block carries its own parallax offset, and BOTH layers read the same
   custom property — a card and its markup can never separate. */
.trad__b {
  transform: translateY(var(--p, 0px));
}

.trad__line {
  display: block;
  color: var(--papir-dim); /* 8.87:1 on --grafit-inset */
  line-height: 1.75;
  overflow-wrap: anywhere;
}

/* The cut itself: the first visible row of the unclipped region, so it and the
   clip can never disagree. */
.trad__scan-line {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--cut, 100%);
  height: 2px;
  background: var(--rez-na-temnem);
  box-shadow: 0 0 18px 1px var(--rez-na-temnem);
  opacity: 0;
}

.trad--live .trad__scan-line {
  opacity: 1;
}

/* --- the centred header ----------------------------------------------------
   One stack, centred, tight under the band's top edge — every element caps
   its own measure and centres itself, so the column reads as one plumb line. */
.trad__render .trad__b--header {
  text-align: center;
  margin-bottom: clamp(2.5rem, 2rem + 2.5vw, 4rem);
}

.trad__title {
  margin-top: 0.6rem;
  color: var(--list);
}

.trad__quote {
  margin-top: 1.1rem;
}

.trad__quote p {
  font-family: var(--font-text);
  font-size: clamp(1.25rem, 1.05rem + 1.1vw, 1.75rem);
  font-weight: 500;
  line-height: 1.4;
  max-width: 36ch;
  margin-inline: auto;
  color: var(--list);
}

.trad__intro {
  margin-top: 1.1rem;
  color: var(--papir-dim);
  max-width: 58ch;
  margin-inline: auto;
}

.trad__gloss {
  margin-top: 0.9rem;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--papir-dim);
  max-width: 48ch;
  margin-inline: auto;
}

/* --- the detail drawing -----------------------------------------------------
   A section through the site's build-up: four material layers, each in its own
   drafting hatch, probed one at a time. Depth is DRAWN — fill, line and hatch,
   never a shadow. Nothing here carries a figure: the honesty contract reserves
   mono for real machine emissions, and a drawing's numbers would be invented,
   so the technical register is carried by CONVENTION (hatch, dimension ticks,
   leader, cut plane) instead. */
.asm {
  --asm-gap: clamp(2rem, 6vw, 6rem);
  display: grid;
  gap: 2rem;
}

.asm__stack {
  position: relative;
  display: grid;
  grid-auto-rows: 1fr; /* equal bands — the leader's 25% steps depend on it */
  min-height: clamp(17rem, 46vw, 26rem);
  border: 1px solid var(--crta-na-temnem);
  /* The leader reaches out of this box. */
  overflow: visible;
  margin-left: 1.25rem;
}

/* Dimension rule: extension ticks top and bottom, no figure. */
.asm__dim {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1.25rem;
  width: 1px;
  background: var(--crta-na-temnem);
  pointer-events: none;
}
.asm__dim::before,
.asm__dim::after {
  content: '';
  position: absolute;
  left: -3px;
  width: 7px;
  height: 1px;
  background: var(--crta-na-temnem);
}
.asm__dim::before {
  top: 0;
}
.asm__dim::after {
  bottom: 0;
}

.asm__band {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  border-bottom: 1px solid var(--crta-na-temnem);
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  overflow: hidden;
}

.asm__band:last-of-type {
  border-bottom: 0;
}

button.asm__band {
  cursor: pointer;
}

/* The four materials. Grounds step darker with depth (the dark family's own
   steps), hatches change CHARACTER rather than only pitch, the way a section
   distinguishes materials. papir-dim measures 8.87:1 on the lightest of these
   and only climbs as they darken. */
.asm__fill {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity var(--t-lift) var(--ease-out);
  opacity: 0.5;
}

.asm__band--0 {
  background: var(--grafit-inset);
}
.asm__band--0 .asm__fill {
  background: repeating-linear-gradient(
    45deg,
    transparent 0 9px,
    rgb(245 242 235 / 0.34) 9px 10px
  );
}

.asm__band--1 {
  background: #1f2327;
}
.asm__band--1 .asm__fill {
  background:
    repeating-linear-gradient(45deg, transparent 0 9px, rgb(245 242 235 / 0.3) 9px 10px),
    repeating-linear-gradient(-45deg, transparent 0 9px, rgb(245 242 235 / 0.3) 9px 10px);
}

.asm__band--2 {
  background: #191d21;
}
.asm__band--2 .asm__fill {
  background-image: radial-gradient(rgb(245 242 235 / 0.5) 1px, transparent 1.2px);
  background-size: 9px 9px;
}

.asm__band--3 {
  background: var(--zemlja);
}
.asm__band--3 .asm__fill {
  background: repeating-linear-gradient(
    90deg,
    transparent 0 5px,
    rgb(245 242 235 / 0.24) 5px 6px
  );
}

button.asm__band:hover .asm__fill,
.asm__band--on .asm__fill {
  opacity: 1;
}

/* The cut plane through the probed layer: red rule, square end ticks. */
.asm__plane {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: var(--rez-na-temnem);
  opacity: 0;
  transform: scaleX(0.82);
  transition:
    opacity var(--t-lift) var(--ease-out),
    transform 320ms var(--ease-out);
  pointer-events: none;
}
.asm__plane::before,
.asm__plane::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 8px;
  height: 8px;
  background: var(--rez-na-temnem);
}
.asm__plane::before {
  left: 0;
}
.asm__plane::after {
  right: 0;
}

.asm__band--on .asm__plane {
  opacity: 1;
  transform: scaleX(1);
}

/* Swings between layers on --sel alone: bands are equal, so each centre is
   (n + 0.5) × 25%. One transition, no per-frame work. */
.asm__leader {
  position: absolute;
  left: 100%;
  width: var(--asm-gap);
  height: 1px;
  top: calc((var(--sel, 0) + 0.5) * 25%);
  background: var(--rez-na-temnem);
  transition: top 380ms var(--ease-out);
  pointer-events: none;
  display: none;
}
.asm__leader::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--rez-na-temnem);
}

/* --- the callout ----------------------------------------------------------- */
.asm__callout[hidden] {
  display: none;
}

/* Only genuinely adjacent VISIBLE callouts are spaced — the JS-off case where
   all four stand open. `+` still matches across `display:none` siblings, so
   the plain selector gave the one visible panel a phantom top margin whose
   presence depended on which band was probed (measured). */
.asm__callout:not([hidden]) + .asm__callout:not([hidden]) {
  margin-top: 1.75rem;
}

.asm__label {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 500;
  font-size: clamp(1.35rem, 1rem + 1.8vw, 2.15rem);
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--list);
  padding-bottom: 0.7rem;
  border-bottom: 1px solid var(--crta-na-temnem);
}

.asm__detail {
  margin-top: 0.9rem;
  font-size: 1rem;
  color: var(--papir-dim);
  max-width: 46ch;
}

/* --- the outro -------------------------------------------------------------- */
.trad__render .trad__b--outro {
  margin-top: clamp(2.25rem, 1.75rem + 2vw, 3.5rem);
  text-align: center;
}

.trad__outro {
  font-size: var(--fs-lead);
  color: var(--list);
  max-width: 50ch;
  margin-inline: auto;
}

/* --- the control ------------------------------------------------------------
   A real range input, so dragging, the keyboard and touch all work without a
   single touch listener — and none of the iOS non-passive-touchmove traps
   apply. The rail runs the section's height but the control STICKS to the
   viewport inside it: a full-height vertical range would own its gesture down
   the entire right edge, which on a phone is hundreds of pixels where a swipe
   moves the cut instead of scrolling. */
/* Constrained to the SAME measure as the rendered layer. The stage is
   full-bleed now, so anchoring the rail to the stage's own right edge would
   strand it at the viewport edge on any screen wider than the measure. */
.trad__grip-wrap {
  position: absolute;
  inset: 0;
  max-width: 76rem;
  margin-inline: auto;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
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
    padding-right: calc(var(--gutter) + 0.5rem);
  }

  /* Drawing left, callout right, the leader crossing the gap between them. */
  .asm {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: var(--asm-gap);
    align-items: center;
  }

  .asm__leader {
    display: block;
  }

  /* The panel swaps content on selection; reserving the tallest keeps the
     drawing from jumping as the leader swings. */
  .asm__callouts {
    min-height: 11rem;
  }
}
</style>
