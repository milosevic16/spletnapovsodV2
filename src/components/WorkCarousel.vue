<script setup lang="ts">
/**
 * Reference — the built work drawn as a STREET ELEVATION.
 *
 * Three finished sites stand side by side on ONE continuous datum, read left
 * to right the way an elevation of a street is read. Each is a real
 * screenshot in a thin ink frame (the built thing), with extension ticks
 * dropping across the datum at its edges — the dimension convention, and
 * deliberately WITHOUT a figure, because nothing here is a measurement we
 * could honestly put a number on. Under the datum each work carries a real
 * TITLE BLOCK — the site's own motif: sheet index, name, sector, address,
 * closed by a heavy right edge, so the three read as cells of one register
 * rather than as three cards.
 *
 * THE DATUM IS THE WHOLE IDEA: it is a border on each title block and the
 * works sit flush against each other, so the line runs unbroken from the
 * screen's left edge through all three. Nothing else joins them — no rail
 * outline, no gaps, no chrome.
 *
 * NAVIGATION IS THE BROWSER'S. The strip is a native horizontal scroll
 * region: swipe on touch, thin scrollbar and two step controls on pointer
 * devices, arrow keys when focused. No JS scroll-jacking, no autoplay
 * stealing the reader's place, no dots. JS contributes exactly two things —
 * the step controls, and lifting the trailing fade once the last work is
 * reached so it is never dimmed at rest.
 *
 * THE WHOLE WORK IS THE LINK. Facade and title block sit inside one anchor
 * to the live site, so there is one tab stop and one obvious target per
 * project, and the new-window warning rides with it.
 *
 * SSG contract: every plate, name, sector and address is in the prerendered
 * HTML; with JS off the strip still scrolls and every link works.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const items = references.items
const live = ref(false)
const atEnd = ref(false)
const strip = ref<HTMLElement | null>(null)

/** Variants are generated per project (scripts/build-reference-images.mjs);
 *  the widths list lives with the item, so the srcset cannot claim a file
 *  that was never emitted. */
function srcset(id: string, ext: string, widths: number[]): string {
  return widths.map((w) => `/img/refs/${id}-${w}.${ext} ${w}w`).join(', ')
}

/** Matches the facade's real measure at both breakpoints (see the styles). */
const SIZES = '(min-width: 900px) min(76vw, 60rem), 88vw'

function measureEnd() {
  const el = strip.value
  if (!el) return
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
}

/** One work per press. Reduced motion gets the instant jump — the house rule
 *  that every programmatic scroll states its behaviour explicitly. */
function step(dir: number) {
  const el = strip.value
  if (!el) return
  const work = el.querySelector<HTMLElement>('.wk__work')
  const delta = (work?.getBoundingClientRect().width ?? el.clientWidth * 0.8) * dir
  el.scrollBy({
    left: delta,
    behavior: (prefersReducedMotion() ? 'instant' : 'smooth') as ScrollBehavior,
  })
}

onMounted(() => {
  live.value = true
  const el = strip.value
  if (!el) return
  fx.on(el, 'scroll', measureEnd, { passive: true })
  fx.on(window, 'resize', measureEnd, { passive: true })
  measureEnd()
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section id="reference" class="wk">
    <header class="container wk__head">
      <p class="kicker">{{ references.kicker }}</p>
      <h2 class="wk__title">{{ references.title }}</h2>
      <p class="wk__intro">{{ references.intro }}</p>
    </header>

    <div
      ref="strip"
      class="wk__strip"
      :class="{ 'wk__strip--end': atEnd }"
      tabindex="0"
      role="group"
      :aria-label="references.feedback.regionLabel"
    >
      <div class="wk__rail">
        <article v-for="(item, n) in items" :key="item.id" class="wk__work">
          <a class="wk__link" :href="item.url" target="_blank" rel="noopener noreferrer">
            <div class="wk__facade">
              <picture>
                <source
                  type="image/avif"
                  :srcset="srcset(item.id, 'avif', item.image.widths)"
                  :sizes="SIZES"
                />
                <source
                  type="image/webp"
                  :srcset="srcset(item.id, 'webp', item.image.widths)"
                  :sizes="SIZES"
                />
                <img
                  :src="`/img/refs/${item.id}-${item.image.widths[item.image.widths.length - 2]}.jpg`"
                  :srcset="srcset(item.id, 'jpg', item.image.widths)"
                  :sizes="SIZES"
                  :width="item.image.width"
                  :height="item.image.height"
                  :alt="item.alt"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>

            <!-- The title block: the drawing's own register strip. -->
            <div class="wk__block">
              <div class="wk__block-inner">
                <span class="wk__index" aria-hidden="true">{{
                  String(n + 1).padStart(3, '0')
                }}</span>
                <div class="wk__id">
                  <h3 class="wk__name">{{ item.name }}</h3>
                  <p class="wk__sector">{{ item.sector }}</p>
                </div>
                <span class="wk__url emisija">{{ item.urlLabel }}</span>
              </div>
            </div>

            <span class="visually-hidden">{{ references.newWindowNote }}</span>
          </a>
        </article>
      </div>
    </div>

    <!-- Pointer devices only: on touch the trailing fade and the swipe are
         the affordance, and a control sitting on the drawing is worse than
         none (house rule). -->
    <div v-if="live" class="wk__controls container">
      <button
        type="button"
        class="wk__step"
        :aria-label="references.feedback.prevLabel"
        @click="step(-1)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M15 4 L7 12 L15 20" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
      <button
        type="button"
        class="wk__step"
        :aria-label="references.feedback.nextLabel"
        @click="step(1)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 4 L17 12 L9 20" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* The sheet. Full bleed: the elevation runs off the page's left edge, which
   is what makes it read as a drawing that continues rather than a widget. */
.wk {
  background: var(--list);
  padding-block: var(--section-block);
}

/* The band's heading, in the system's statement-band shape: mono kicker,
   display title, intro at a real measure, the right third left empty. */
.wk__head {
  margin-bottom: var(--space-10);
}

.wk__title {
  margin-top: var(--space-3);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--grafit);
  max-width: 18ch;
}

.wk__intro {
  margin-top: var(--space-6);
  color: var(--grafit-2); /* 8.99:1 on paper */
  max-width: 62ch;
}

.wk__strip {
  overflow-x: auto;
  overflow-y: hidden;
  /* The strip's own scroll area must never become the PAGE's. Measured: with
     overflow alone the document's scroll width grew to the rail's extent and
     the whole page scrolled sideways — and forcing overflow-x: hidden did not
     fix it, while paint containment did. `contain: paint` states the thing
     directly ("nothing here paints outside this box"), and a scroll container
     is exactly what it is for. Re-measure page overflow-x if this line ever
     goes. */
  contain: paint;
  /* A swipe that runs past the last work must not chain to the page — on touch
     that is what pans the document sideways (and on some engines arms the
     back-navigation gesture). `contain: paint` keeps the rail from GROWING the
     page; this keeps the gesture from MOVING it. The two are different
     failures with the same symptom. */
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: var(--mreza-strong) transparent;
  /* The trailing-edge fade: the touch affordance for "more". A MASK, not an
     overlay — the system allows gradients only as masks — and lifted the
     moment the last work is reached so nothing sits dimmed at rest. */
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 5rem), transparent 100%);
  mask-image: linear-gradient(90deg, #000 calc(100% - 5rem), transparent 100%);
}

.wk__strip--end {
  -webkit-mask-image: none;
  mask-image: none;
}

.wk__strip:focus-visible {
  outline: 2px solid var(--rez);
  outline-offset: -2px;
}

/* padding-block gives the focus ring room: overflow-y is hidden, and an
   outline drawn outside the rail would otherwise be clipped. */
.wk__rail {
  display: flex;
  align-items: flex-end;
  width: max-content;
  padding-block: 4px;
}

.wk__work {
  flex: 0 0 auto;
  width: min(76vw, 60rem);
  scroll-snap-align: start;
}

/* The set closes on the page margin rather than on the viewport edge. */
.wk__work:last-child {
  margin-right: var(--gutter);
}

.wk__link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.wk__link:focus-visible {
  outline: 2px solid var(--rez);
  outline-offset: -2px;
}

/* --- the facade ------------------------------------------------------------- */
.wk__facade {
  position: relative;
  margin-inline: calc(var(--gutter) / 2);
  margin-bottom: var(--space-4);
  border: var(--divider-width) solid var(--grafit);
}

.wk__facade img {
  display: block;
  width: 100%;
  height: auto;
}

/* Extension ticks crossing the datum at the facade's own edges — the
   dimension convention with no figure attached. */
.wk__facade::before,
.wk__facade::after {
  content: '';
  position: absolute;
  bottom: -24px;
  width: 1px;
  height: 16px;
  background: var(--mreza-strong);
}

.wk__facade::before {
  left: -1px;
}

.wk__facade::after {
  right: -1px;
}

/* --- the title block --------------------------------------------------------
   The datum is this border: works sit flush, so the line runs unbroken
   through the whole set. */
.wk__block {
  border-top: var(--divider-width) solid var(--grafit);
}

.wk__block-inner {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  margin-inline: calc(var(--gutter) / 2);
  padding-top: var(--space-3);
  padding-right: var(--space-3);
  min-height: 4.25rem;
  /* the title block's heavy right edge — the motif's own closing rule */
  border-right: 2px solid var(--grafit);
}

.wk__index {
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--grafit-2);
}

.wk__id {
  min-width: 0;
}

.wk__name {
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.wk__sector {
  margin-top: 2px;
  color: var(--grafit-2);
  font-size: 0.9375rem;
  line-height: 1.35;
  max-width: 46ch;
}

.wk__url {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--grafit-2);
  border-bottom: var(--divider-width) solid currentColor;
  padding-bottom: 2px;
}

/* Hover is wired in CSS only and gated to devices that have it — on touch a
   stuck hover state would outlive the tap. */
@media (hover: hover) {
  .wk__facade,
  .wk__url {
    transition:
      border-color var(--dur-tween) var(--ease-hover),
      color var(--dur-tween) var(--ease-hover);
  }

  .wk__link:hover .wk__facade {
    border-color: var(--rez);
  }

  .wk__link:hover .wk__url {
    color: var(--rez);
  }
}

/* --- the step controls -------------------------------------------------------- */
.wk__controls {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

@media (hover: none) {
  .wk__controls {
    display: none;
  }
}

.wk__step {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: var(--divider-width) solid var(--mreza-strong);
  color: var(--grafit);
  cursor: pointer;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  .wk__step:hover {
    border-color: var(--rez);
    color: var(--rez);
  }
}

.wk__step:focus-visible {
  outline: 2px solid var(--rez);
  outline-offset: 2px;
}

/* --- phones -------------------------------------------------------------------
   The elevation holds; only the crop and the register change. The facade is
   cut to a taller window on the site's own head, so a phone shows the work
   at a readable scale instead of a 2:1 sliver, and the title block stacks
   into two ruled lines. */
@media (max-width: 899.98px) {
  .wk__work {
    width: 88vw;
  }

  .wk__facade img {
    aspect-ratio: 16 / 11;
    object-fit: cover;
    object-position: top center;
  }

  .wk__block-inner {
    flex-wrap: wrap;
    row-gap: var(--space-2);
    min-height: 0;
  }

  .wk__id {
    flex: 1 1 60%;
  }

  .wk__url {
    flex: 1 1 100%;
    margin-left: 0;
  }
}
</style>
