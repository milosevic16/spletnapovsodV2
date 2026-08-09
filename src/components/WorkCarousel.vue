<script setup lang="ts">
/**
 * Reference — the built work drawn as a PILE OF SHEETS.
 *
 * Three finished drawings lie on the table, each offset down-right from the
 * one above it. You see the top sheet whole, the other two as the slivers they
 * leave showing; point at one (or tap it) and it comes to the top of the pile.
 * That is the whole interaction — a sheet is pulled, not a card is flipped.
 *
 * THE STEP IS THE TITLE BLOCK. The diagonal offset is not a chosen number: it
 * equals the height of the title block, so every sheet's block lands exactly in
 * the strip the sheet in front leaves open. The three blocks meet edge to edge
 * and read as ONE ledger stepping down-right — the drawing's legend, in the
 * gaps the pile itself makes. Change --rung and the whole composition follows.
 *
 * NOTHING IS HIDDEN AT REST. Every name, sector and address is visible in the
 * resting composition, which is why the stack needs no hydration gate and
 * causes no first-paint shift: the prerendered HTML is already the finished
 * drawing. Coming to the front reveals an IMAGE, never a word.
 *
 * DEPTH IS DRAWN, never blurred — the house rule, and here the mechanism:
 * occlusion does the work (an opaque sheet covers what is under it), the ink
 * frame turns to the cut red, and the fronted sheet steps a few pixels out of
 * the pile. No shadow anywhere.
 *
 * FRONTING IS CSS ON POINTER DEVICES: :hover and :focus-within raise the sheet,
 * so a mouse and a keyboard both work with JS off. JS contributes exactly one
 * thing — on touch, where there is no hover, the first tap brings a sheet
 * forward and the second follows its link. With JS off a tap simply follows the
 * link, which is the safe degradation.
 *
 * SSG contract: every plate, name, sector and address is in the prerendered
 * HTML; with JS off the composition is complete and every link works.
 */
import { onMounted, ref } from 'vue'
import { references } from '@/content/home'

const items = references.items

/** Which sheet the reader has brought forward BY TAPPING. -1 = none; on
 *  pointer devices this stays -1 forever and :hover does the work. */
const active = ref(-1)
/** Devices with a real pointer front on hover, so a tap there should follow
 *  the link at once. Read on mount — never at module scope (prerender). */
const hoverCapable = ref(true)

/** Variants are generated per project (scripts/build-reference-images.mjs);
 *  the widths list lives with the item, so the srcset cannot claim a file
 *  that was never emitted. */
function srcset(id: string, ext: string, widths: number[]): string {
  return widths.map((w) => `/img/refs/${id}-${w}.${ext} ${w}w`).join(', ')
}

/** Matches the sheet's real measure at both breakpoints (see the styles). */
const SIZES = '(min-width: 900px) min(72vw, 56rem), 84vw'

/**
 * Touch only: the first tap pulls the sheet to the top of the pile, the second
 * follows it. Without this a reader on a phone could never LOOK at a sheet —
 * every tap would leave the site. On a pointer device hover has already done
 * the pulling, so the tap goes straight through.
 */
function onPick(e: MouseEvent, n: number) {
  if (hoverCapable.value || active.value === n) return
  e.preventDefault()
  active.value = n
}

onMounted(() => {
  hoverCapable.value = window.matchMedia('(hover: hover)').matches
})
</script>

<template>
  <section id="reference" class="wkr press press--light">
    <header class="container wkr__head">
      <p class="kicker">{{ references.kicker }}</p>
      <h2 class="wkr__title">{{ references.title }}</h2>
      <p class="wkr__intro">{{ references.intro }}</p>
    </header>

    <div class="container">
      <ol class="wkr__stage" :aria-label="references.feedback.regionLabel">
        <li
          v-for="(item, n) in items"
          :key="item.id"
          class="wkr__sheet"
          :class="{ 'wkr__sheet--lead': n === 0, 'wkr__sheet--front': active === n }"
          :style="{ '--i': n }"
        >
          <a
            class="wkr__link"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            @click="onPick($event, n)"
          >
            <!-- The plate: the built thing, in a thin ink frame. -->
            <div class="wkr__plate">
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

            <!-- The title block. Opaque paper: it is what covers the sheet
                 below, and the covering is how the pile reads as a pile. -->
            <div class="wkr__block">
              <span class="wkr__index emisija" aria-hidden="true">{{
                String(n + 1).padStart(3, '0')
              }}</span>
              <span class="wkr__id">
                <span class="wkr__name">{{ item.name }}</span>
                <span class="wkr__sector">{{ item.sector }}</span>
              </span>
              <span class="wkr__url emisija">{{ item.urlLabel }}</span>
            </div>

            <span class="visually-hidden">{{ references.newWindowNote }}</span>
          </a>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* background-COLOR, never the shorthand: the shorthand resets
   background-image, and this scoped rule would silently win over the .press
   utility that supplies the screen — the texture would simply not appear. */
.wkr {
  background-color: var(--list);
  padding-block: var(--section-block);
}

.wkr__head {
  margin-bottom: var(--space-10);
}

.wkr__title {
  margin-top: var(--space-3);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--grafit);
  max-width: 18ch;
}

.wkr__intro {
  margin-top: var(--space-6);
  color: var(--grafit-2); /* 8.99:1 on paper */
  max-width: 62ch;
}

/* --- the pile ----------------------------------------------------------------
   THE THREE NUMBERS THAT MAKE THE COMPOSITION:

   --rung   the title block's height, and therefore the vertical step. Setting
            them from one token is what makes the blocks meet edge to edge
            instead of overlapping or leaving a sliver of the next plate.
   --stride the horizontal step. Free — it only decides how far the pile leans.
   --lift   how far a fronted sheet steps out of the pile, up and left.

   The stage reserves exactly the room the pile needs: two strides on the right,
   two rungs at the bottom, one lift at the top-left. The last sheet's bottom
   edge lands flush with the stage's, so nothing is guessed. */
.wkr__stage {
  --rung: clamp(3.75rem, 4.6vw, 5rem);
  --stride: clamp(2.5rem, 6.5vw, 7rem);
  --lift: 6px;

  position: relative;
  padding: var(--lift) calc(2 * var(--stride)) calc(2 * var(--rung)) var(--lift);
  list-style: none;
}

.wkr__sheet {
  position: absolute;
  top: calc(var(--lift) + var(--i) * var(--rung));
  left: calc(var(--lift) + var(--i) * var(--stride));
  width: calc(100% - var(--lift) - 2 * var(--stride));
  /* Resting order: the first sheet on top, the rest receding down-right. */
  z-index: calc(9 - var(--i));
}

/* The lead sheet stays IN FLOW — it is what gives the stage its height, and
   with it the other two are positioned against a box that cannot be wrong. */
.wkr__sheet--lead {
  position: relative;
  top: auto;
  left: auto;
  width: 100%;
}

.wkr__link {
  display: block;
  text-decoration: none;
  color: inherit;
  /* Tabbing to a sheet must not park it under the fixed masthead (WCAG 2.4.11
     — focused and VISIBLE are different things). The browser's own
     scroll-into-view knows nothing about fixed chrome, so the margin says it. */
  scroll-margin-top: calc(var(--nav-h, 0px) + var(--space-4));
  /* Only transform and colour: both compositor-cheap, and the resting values
     are the stylesheet's own, so there is no end state to defend. */
  transition: transform var(--dur-tween) var(--ease-hover);
}

.wkr__link:focus-visible {
  outline: 2px solid var(--rez);
  outline-offset: 3px;
}

/* --- the plate ---------------------------------------------------------------- */
.wkr__plate {
  border: var(--divider-width) solid var(--grafit);
  border-bottom: 0;
  transition: border-color var(--dur-tween) var(--ease-hover);
}

.wkr__plate img {
  display: block;
  width: 100%;
  /* height:auto is LOAD-BEARING, not tidiness. The width/height attributes map
     to CSS presentational hints, and an explicit height beats aspect-ratio — so
     without this every plate takes its own file's height and the three sheets
     come out different sizes, which breaks the whole ledger (measured: sheet 2
     short by exactly 896-776=120px, the two files' height attributes). */
  height: auto;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  object-position: top center;
}

/* --- the title block ----------------------------------------------------------
   Height IS the step (see --rung). Opaque, because covering the sheet beneath
   is the whole depth cue on a page with no shadows. The heavy right edge is the
   title-block motif's own closing rule. */
.wkr__block {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--rung);
  padding-inline: var(--space-4);
  background: var(--list);
  border: var(--divider-width) solid var(--grafit);
  border-right-width: 2px;
  transition: border-color var(--dur-tween) var(--ease-hover);
}

.wkr__index {
  flex: 0 0 auto;
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--grafit-2);
}

.wkr__id {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wkr__name {
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.wkr__sector {
  color: var(--grafit-2);
  font-size: 0.9375rem;
  line-height: 1.3;
}

.wkr__url {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--grafit-2);
  border-bottom: var(--divider-width) solid currentColor;
  padding-bottom: 2px;
  transition: color var(--dur-tween) var(--ease-hover);
}

/* --- coming to the front -------------------------------------------------------
   Three signals, no shadow: the sheet covers the others, its frame turns to the
   cut red, and it steps out of the pile. Keyboard gets it everywhere (a focused
   sheet the reader cannot see is a WCAG 2.4.11 failure); hover is gated to
   devices that have one, or the state would stick on touch after a tap. */
.wkr__sheet:focus-within,
.wkr__sheet--front {
  z-index: 20;
}

.wkr__sheet:focus-within .wkr__link,
.wkr__sheet--front .wkr__link {
  transform: translate(calc(var(--lift) * -1), calc(var(--lift) * -1));
}

.wkr__sheet:focus-within .wkr__plate,
.wkr__sheet:focus-within .wkr__block,
.wkr__sheet--front .wkr__plate,
.wkr__sheet--front .wkr__block {
  border-color: var(--rez);
}

.wkr__sheet:focus-within .wkr__url,
.wkr__sheet--front .wkr__url {
  color: var(--rez);
}

@media (hover: hover) {
  .wkr__sheet:hover {
    z-index: 20;
  }

  .wkr__sheet:hover .wkr__link {
    transform: translate(calc(var(--lift) * -1), calc(var(--lift) * -1));
  }

  .wkr__sheet:hover .wkr__plate,
  .wkr__sheet:hover .wkr__block {
    border-color: var(--rez);
  }

  .wkr__sheet:hover .wkr__url {
    color: var(--rez);
  }
}

/* --- phones --------------------------------------------------------------------
   The pile holds; it just leans mostly DOWNWARD so the plates stay near full
   width and the screenshots stay legible. The block takes three ruled lines,
   and --rung grows to hold them: the step follows the block, always. */
@media (max-width: 899.98px) {
  .wkr__stage {
    --rung: 6rem;
    --stride: 0.875rem;
    --lift: 4px;
  }

  .wkr__plate img {
    aspect-ratio: 16 / 11;
  }

  .wkr__block {
    flex-wrap: wrap;
    align-content: center;
    /* Tight on purpose. The block's height IS the diagonal step, so content
       that outgrows it would not merely look cramped — the ledger rows would
       overlap and the composition would break. Measured at the 320px floor,
       where the sector takes two lines: content 86px in a 96px rung, 10px of
       headroom for font-metric drift. Re-measure this slack before enlarging
       anything in here. */
    row-gap: 2px;
    column-gap: var(--space-3);
    padding-inline: var(--space-3);
  }

  .wkr__name {
    font-size: 1.125rem;
  }

  .wkr__id {
    flex: 1 1 100%;
    /* Atomic group: the name and its sector never break apart (house rule —
       wrapping rows break on flex-basis, before any shrinking). */
    order: 2;
  }

  .wkr__index {
    order: 1;
  }

  .wkr__url {
    order: 1;
    margin-left: auto;
  }
}
</style>
