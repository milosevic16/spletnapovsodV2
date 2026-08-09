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
              <!-- The site's own palette, sampled. Butted into one framed strip
                   the way a materials legend is drawn — decorative, so hidden
                   from the accessibility tree; the colours say nothing a reader
                   needs in words. -->
              <span class="wkr__inks" aria-hidden="true">
                <span
                  v-for="ink in item.inks"
                  :key="ink"
                  class="wkr__ink"
                  :style="{ background: ink }"
                ></span>
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
  position: relative; /* the marks below hang off this */
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--rung);
  /* The left inset carries the hatched edge AND the margin rule, the right one
     the corner strip. The marks are drawn INTO the padding, never over the
     words — every clearance below is measured. */
  padding-inline: var(--space-8) var(--space-8);
  background: var(--list);
  border: var(--divider-width) solid var(--grafit);
  border-right-width: 2px;
}

/* --- the architect's marks -----------------------------------------------------
   Two of them, both hairline weight, and both INSIDE the block's own box —
   anything drawn outside it would be covered by the sheet in front, because the
   pile occludes. That constraint is why these are marks on the sheet rather
   than lines running off it.

   1. THE MARGIN RULE, drawn twice. Every drawing sheet carries a margin, and a
      hand that draws it goes over the line a second time — so there is a firm
      stroke and a lighter one beside it, and small nodes where it crosses the
      block's own rules. It is what makes the ledger read as drawn ON something
      rather than typeset.
   2. THE CLOSING CORNER, bottom right, where the lines cross and OVERSHOOT each
      other. The overshoot is the whole tell: a ruled corner stops, a drawn one
      runs past. It bookends the block against the heavy right edge.

   Both sit against the photographic plate above them, which is the point — the
   words look like an annotation on the work, not a caption under it. */
.wkr__block::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 24px;
  pointer-events: none;
  background:
    /* the nodes, where the margin meets the block's top and bottom rules */
    linear-gradient(var(--grafit), var(--grafit)) left 16px top 0 / 3px 3px no-repeat,
    linear-gradient(var(--grafit), var(--grafit)) left 16px bottom 0 / 3px 3px no-repeat,
    /* the second pass — the hand going over it again, and still the lighter of
       the two: it must read as the same line drawn twice, never as two lines */
    linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 20px top 0 / 1px 100%
      no-repeat,
    /* the line itself */
    linear-gradient(var(--grafit-2), var(--grafit-2)) left 17px top 0 / 1px 100% no-repeat,
    /* THE CUT EDGE. Hatch means cut material — it is the page's own poché motif,
       and it is what the block is standing on: the ledger is a section through
       the sheet, so its left edge is hatched. Fine and even, never a texture
       fill: the moment it reads as pattern rather than as section it has become
       decoration. */
    repeating-linear-gradient(45deg, transparent 0 3px, var(--mreza-strong) 3px 4px) left 0
      top 0 / 12px 100% no-repeat;
}

/* Both right-hand corners, drawn as one strip so the pair stays in register.
   Each is two lines that cross and OVERSHOOT, with a node at the crossing —
   a ruled corner stops, a drawn one runs past. They bracket the block against
   the heavy right edge, which is what makes it read as a bounded sheet. */
.wkr__block::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 8px;
  width: 14px;
  pointer-events: none;
  background:
    /* nodes at the two crossings */
    linear-gradient(var(--grafit-2), var(--grafit-2)) left 8px top 4px / 3px 3px no-repeat,
    linear-gradient(var(--grafit-2), var(--grafit-2)) left 8px bottom 4px / 3px 3px no-repeat,
    /* top corner: the horizontal runs past the vertical, the vertical past it */
    linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 0 top 5px / 14px 1px
      no-repeat,
    linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 9px top 0 / 1px 14px
      no-repeat,
    /* bottom corner, mirrored */
    linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 0 bottom 5px / 14px 1px
      no-repeat,
    linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 9px bottom 0 / 1px 14px
      no-repeat;
}

/* The leader. The sheet number is a callout, so it arrives on a line that comes
   out of the margin and overshoots it — the same gesture as the corners, at the
   scale of one word. The node sits at the far end, where a hand would have
   stopped and pressed. */
.wkr__index {
  position: relative;
}

.wkr__index::before {
  content: '';
  position: absolute;
  top: 50%;
  right: calc(100% + 4px);
  width: 12px;
  height: 3px;
  transform: translateY(-50%);
  pointer-events: none;
  background:
    linear-gradient(var(--grafit), var(--grafit)) left 0 top 0 / 3px 3px no-repeat,
    linear-gradient(var(--grafit-2), var(--grafit-2)) left 0 top 1px / 12px 1px no-repeat;
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

/* The samples strip. Butted into ONE hairline frame, not spaced apart: a row of
   separated colour chips reads as confetti, a framed strip reads as the
   materials legend it is. That single decision is what keeps it drafting. */
.wkr__inks {
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  border: var(--divider-width) solid var(--grafit-2);
}

.wkr__ink {
  width: 12px;
  height: 12px;
}

.wkr__url {
  flex: 0 0 auto;
  color: var(--grafit-2);
  border-bottom: var(--divider-width) solid currentColor;
  padding-bottom: 2px;
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

/* The edge takes the weight, and takes it in the page's OWN ink — no second
   colour enters to say "selected". An OUTLINE rather than a fatter border, and
   deliberately so: outlines are outside layout, so the sheet cannot change size
   when it comes forward. Offset by exactly one divider inwards, the outline
   lands against the inside of the border and the two read as one 2px edge —
   the weight the title block's own right-hand rule already carries, so nothing
   new was invented to draw it. */
.wkr__sheet:focus-within .wkr__plate,
.wkr__sheet:focus-within .wkr__block,
.wkr__sheet--front .wkr__plate,
.wkr__sheet--front .wkr__block {
  outline: var(--divider-width) solid var(--grafit);
  outline-offset: calc(var(--divider-width) * -1);
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
    outline: var(--divider-width) solid var(--grafit);
    outline-offset: calc(var(--divider-width) * -1);
  }
}

/* --- phones --------------------------------------------------------------------
   The pile holds; it just leans mostly DOWNWARD so the plates stay near full
   width and the screenshots stay legible. The block takes three ruled lines,
   and --rung grows to hold them: the step follows the block, always. */
@media (max-width: 899.98px) {
  .wkr__stage {
    --rung: 7.5rem;
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
       overlap and the composition would break. Measured at the 320px floor on
       the worst of the three (two-line sector, longest address): 21px first row
       + 62px name-and-sector + 22px address + two 2px gaps = 109px in a 120px
       rung, 11px of headroom for font-metric drift. Re-measure this slack
       before enlarging anything in here. */
    row-gap: 2px;
    column-gap: var(--space-3);
    padding-inline: var(--space-6) var(--space-3);
  }

  /* The hatched edge and the margin rule pull in with the inset; the gesture is
     the same, only narrower. */
  .wkr__block::before {
    width: 20px;
    background:
      linear-gradient(var(--grafit), var(--grafit)) left 11px top 0 / 3px 3px no-repeat,
      linear-gradient(var(--grafit), var(--grafit)) left 11px bottom 0 / 3px 3px no-repeat,
      linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 15px top 0 / 1px 100%
        no-repeat,
      linear-gradient(var(--grafit-2), var(--grafit-2)) left 12px top 0 / 1px 100%
        no-repeat,
      repeating-linear-gradient(45deg, transparent 0 3px, var(--mreza-strong) 3px 4px)
        left 0 top 0 / 8px 100% no-repeat;
  }

  /* The corner strip goes: on the wrapped layout the name and sector run the
     block's full width on the bottom row, straight through where it would sit.
     The margin rule and the leader stay — they live in the left inset, which
     nothing else uses at any width. */
  .wkr__block::after {
    display: none;
  }

  /* Shorter, so it still emerges from the margin rather than overshooting it
     by half the inset (the number sits closer to the edge here). */
  .wkr__index::before {
    width: 9px;
  }

  /* Row one carries the number, the samples and the address; the name and its
     sector take the full width beneath. The samples shrink with the row. */
  .wkr__inks {
    order: 1;
    margin-left: auto;
  }

  .wkr__ink {
    width: 9px;
    height: 9px;
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

  /* THREE DECLARED ROWS, not three hoped-for ones. Number and samples share the
     first (both are small and fixed, so they cannot not fit), the name takes
     the second, the address the third on its own full-width basis.
     Measured why: with the address sharing row one, the longest of the three
     (mercpeter.netlify.app) collided with the samples by 19px at the 320 floor,
     wrapped, and pushed its content 13px past the rung — and since the rung IS
     the diagonal step, that is not a cramped block, that is the ledger rows
     overlapping. A layout that depends on a string being short enough is the
     bug; this one cannot wrap differently at any width. */
  .wkr__url {
    flex: 1 1 100%;
  }

  .wkr__index {
    order: 1;
  }

  .wkr__url {
    order: 3;
    margin-left: 0;
  }

  .wkr__index {
    order: 1;
  }
}
</style>
