<script setup lang="ts">
/**
 * Reference — five built projects, framed two completely different ways.
 *
 * PHONES: a grid of squares. Two to a row, edge to edge, butted together with no
 * gap and no text at all — the work and nothing else, a block of it. Five
 * projects means the last square sits alone on its row, and that asymmetry is
 * the composition rather than a gap to be filled.
 *
 * DESKTOP: the uneven row the wall of packages below it uses, extended. One
 * project holds three fifths, two hold a fifth each, and the two added last are
 * SLICES at half a fifth — the row reads as a set of drawings pinned at
 * different scales rather than a strip of equal cards. The majority follows the
 * pointer, so any of the five can be the one being looked at.
 *
 * THE WHOLE PLATE IS THE LINK: one tab stop, one obvious target per project. On
 * pointer devices hover hands it the majority and a click follows it. On touch,
 * the first tap gives it the majority and the second follows the link —
 * otherwise a reader could never LOOK at a project without leaving the site.
 * With JS off a tap simply follows the link, which is the safe degradation.
 *
 * TWO CROPS PER PROJECT, chosen by the picture element: a 1:1 tile for the phone
 * grid and the 2:1 plate for the desktop row. Serving the 2:1 into a square box
 * would force a phone to download double the width it shows, so the crops are
 * real files rather than an object-fit trick (scripts/build-reference-images.mjs).
 *
 * SSG contract: every name, sector and address is in the prerendered HTML. On
 * phones they are visually removed — the squares carry no text by design — but
 * kept in the accessibility tree and in the markup, so the links still announce
 * themselves and a crawler still reads them.
 */
import { onMounted, ref } from 'vue'
import { references } from '@/content/home'

const items = references.items

/**
 * THE ROW'S SHAPE, in one place. The first project takes the majority; from
 * this index on, a project is a slice. Adding a sixth project makes it another
 * slice, which is the behaviour that needs no decision.
 */
const SLICE_FROM = 3

/** Which plate the reader has brought forward BY TAPPING. -1 = none; on
 *  pointer devices this stays -1 forever and :hover does the work. */
const active = ref(-1)
/** Devices with a real pointer take the majority on hover, so a tap there
 *  should follow the link at once. Read on mount — never at module scope. */
const hoverCapable = ref(true)

/** Plate variants: the widths list lives with the item, so the srcset cannot
 *  claim a file that was never emitted. */
function srcset(id: string, ext: string, widths: number[]): string {
  return widths.map((w) => `/img/refs/${id}-${w}.${ext} ${w}w`).join(', ')
}

/** Square variants: one fixed ladder for every project (the tiles are all the
 *  same size), so it needs no per-item widths. Paired with SQUARE_WIDTHS in the
 *  image script — change one, change the other. */
const SQUARE_WIDTHS = [240, 480, 720]
function squareset(id: string, ext: string): string {
  return SQUARE_WIDTHS.map((w) => `/img/refs/${id}-sq-${w}.${ext} ${w}w`).join(', ')
}

/** The majority plate's real measure; a phone tile is always half the screen. */
const PLATE_SIZES = '(min-width: 900px) 62vw, 92vw'
const TILE_SIZES = '50vw'
const PHONE = '(max-width: 899.98px)'

/**
 * Touch, and only where a tap CHANGES something: the first tap gives the plate
 * the majority, the second follows it.
 *
 * The row layout is the whole justification. On the phone grid every square is
 * already whole and a tap enlarges nothing, so gating there would simply eat the
 * first tap and read as a dead link — measured on the grid before this guard
 * existed. The query is read at click time rather than at mount because a
 * rotation crosses the breakpoint without remounting anything.
 */
function onPick(e: MouseEvent, n: number) {
  const rowLayout = window.matchMedia('(min-width: 900px)').matches
  if (hoverCapable.value || !rowLayout || active.value === n) return
  e.preventDefault()
  active.value = n
}

onMounted(() => {
  hoverCapable.value = window.matchMedia('(hover: hover)').matches
})
</script>

<template>
  <section id="reference" class="wkr press press--light">
    <div class="container">
      <header class="wkr__head">
        <p class="wkr__kicker">{{ references.kicker }}</p>
        <h2 class="wkr__title">{{ references.title }}</h2>
        <p class="wkr__intro">{{ references.intro }}</p>
      </header>

      <ol class="wkr__wall" :aria-label="references.feedback.regionLabel">
        <li
          v-for="(item, n) in items"
          :key="item.id"
          class="wkr__plate"
          :class="{
            'wkr__plate--lead': n === 0,
            'wkr__plate--slice': n >= SLICE_FROM,
            'wkr__plate--front': active === n,
          }"
        >
          <!-- The picture element does the art direction: the square tile on
               phones, the 2:1 plate above them. Media sources come FIRST — the
               browser takes the first matching source, so the order is the
               rule. -->
          <picture class="wkr__shot">
            <source :media="PHONE" type="image/avif" :srcset="squareset(item.id, 'avif')" :sizes="TILE_SIZES" />
            <source :media="PHONE" type="image/webp" :srcset="squareset(item.id, 'webp')" :sizes="TILE_SIZES" />
            <source :media="PHONE" type="image/jpeg" :srcset="squareset(item.id, 'jpg')" :sizes="TILE_SIZES" />
            <source type="image/avif" :srcset="srcset(item.id, 'avif', item.image.widths)" :sizes="PLATE_SIZES" />
            <source type="image/webp" :srcset="srcset(item.id, 'webp', item.image.widths)" :sizes="PLATE_SIZES" />
            <img
              :src="`/img/refs/${item.id}-${item.image.widths[item.image.widths.length - 2]}.jpg`"
              :srcset="srcset(item.id, 'jpg', item.image.widths)"
              :sizes="PLATE_SIZES"
              :width="item.image.width"
              :height="item.image.height"
              :alt="item.alt"
              loading="lazy"
              decoding="async"
            />
          </picture>

          <a
            class="wkr__face"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            @click="onPick($event, n)"
          >
            <span class="wkr__name">
              <span class="wkr__project">{{ item.name }}</span>
              <span class="wkr__sector">{{ item.sector }}</span>
              <span class="wkr__meta">
                <span class="wkr__index" aria-hidden="true">00{{ n + 1 }}</span>
                <span class="wkr__url emisija">{{ item.urlLabel }}</span>
                <!-- The site's own palette, sampled from its plate crop. Butted
                     into ONE hairline frame — separated chips read as confetti,
                     a framed strip reads as the materials legend it is. -->
                <span class="wkr__inks" aria-hidden="true">
                  <span
                    v-for="ink in item.inks"
                    :key="ink"
                    class="wkr__ink"
                    :style="{ background: ink }"
                  ></span>
                </span>
              </span>
            </span>
            <span class="visually-hidden">{{ references.newWindowNote }}</span>
          </a>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* The band takes »Kje se ločimo« ground exactly (owner's call): the deeper
   beige AND its press screen.

   background-COLOR, never the shorthand. The shorthand resets background-image,
   and this scoped rule would silently win over the .press utility that supplies
   the screen — the texture would simply not appear. */
.wkr {
  background-color: var(--list-2);
  padding-block: var(--section-block);
}

.wkr__head {
  margin-bottom: var(--v-block);
}

/* The inverted chip the wall's kicker uses — paper on ink, hairline framed. */
.wkr__kicker {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  line-height: var(--type-label-lh);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-paper);
  background: var(--color-ink);
  border: 1px solid var(--divider);
  padding: var(--space-1) var(--space-2);
}

.wkr__title {
  margin-top: var(--space-4);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.wkr__intro {
  margin-top: var(--space-6);
  color: var(--grafit-2); /* 8.99:1 on paper */
  max-width: 58ch;
}

.wkr__wall {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
}

.wkr__plate {
  position: relative;
  background: var(--grafit);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wkr__shot,
.wkr__shot img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 0%;
  display: block;
}

.wkr__face {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.wkr__face:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: -6px;
}

/* THE TEXT'S GROUND — the plate's own ink, the poché move. It rides the NAME
   BLOCK rather than the plate so its density cannot depend on how tall the
   block happens to be at a given width. Composited over pure WHITE, the worst
   ground a screenshot can be: --color-paper 10.81:1, --papir-dim 7.22:1. */
.wkr__name {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--grafit) 92%, transparent);
}

/* The band's top edge dissolving into the picture — the only gradient here, and
   it carries no text. */
.wkr__name::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  height: 3rem;
  pointer-events: none;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--grafit) 92%, transparent),
    color-mix(in srgb, var(--grafit) 0%, transparent)
  );
}

/* The architect's mark, in the wall's ink: two paper strokes that cross and
   OVERSHOOT at the corner where the words begin. A ruled corner stops, a drawn
   one runs past. */
.wkr__name::before {
  content: '';
  position: absolute;
  top: 6px;
  left: var(--space-4);
  width: 16px;
  height: 16px;
  pointer-events: none;
  background:
    linear-gradient(rgb(245 242 235 / 0.5), rgb(245 242 235 / 0.5)) left 0 top 5px / 16px
      1px no-repeat,
    linear-gradient(rgb(245 242 235 / 0.5), rgb(245 242 235 / 0.5)) left 5px top 0 / 1px
      16px no-repeat;
}

.wkr__project {
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-paper);
}

.wkr__sector {
  color: var(--papir-dim);
  font-size: 0.9375rem;
  line-height: 1.35;
}

.wkr__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  margin-top: var(--space-2);
}

.wkr__index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--papir-dim);
}

.wkr__url {
  color: var(--papir-dim);
  border-bottom: var(--divider-width) solid currentColor;
  padding-bottom: 2px;
}

.wkr__inks {
  flex: 0 0 auto;
  display: flex;
  border: var(--divider-width) solid var(--crta-na-temnem);
}

.wkr__ink {
  width: 11px;
  height: 11px;
}

/* --- phones: a grid of squares ---------------------------------------------------
   Two to a row, butted together, breaking the container's gutters so the block
   runs edge to edge. Five projects leaves the last square alone on its row; that
   asymmetry is the composition, not a hole to fill.

   NO TEXT, by design. The words stay in the markup and in the accessibility tree
   — clipped rather than display:none — so each link still announces its project
   and a crawler still reads every name, sector and address. */
@media (max-width: 899.98px) {
  .wkr__wall {
    /* ONE number sets the whole rhythm. The gap between tiles and the inset
       from the screen edge are the same value, so every square carries an even
       band of paper on all four sides instead of the block having a seam down
       its middle and none at its edges. Dial --tile-gap and the grid stays
       even by construction. */
    --tile-gap: var(--space-2);

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--tile-gap);
    /* Still breaking the container's gutters, just landing --tile-gap short of
       the screen edge rather than on it. */
    margin-inline: calc(var(--tile-gap) - var(--gutter));
  }

  .wkr__face {
    display: block;
    aspect-ratio: 1;
  }

  /* Clipped, not removed: display:none would take the words out of the
     accessibility tree and out of what a mobile-first crawler renders. */
  .wkr__name {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    background: none;
    border: 0;
  }

  .wkr__name::before,
  .wkr__name::after {
    display: none;
  }

  /* THE FOCUS RING NEEDS A GROUND OF ITS OWN. A tile is edge-to-edge
     photography, and no single accent can be guaranteed 3:1 against an
     arbitrary screenshot — so the tile steps IN by 7px on focus and the ring is
     drawn into the plate's own graphite, where --rez-na-temnem measures 4.74:1.
     The image visibly shrinking is a second, colour-independent cue.

     Padding on the face was the first attempt and did nothing, measured: the
     picture is positioned against the PLATE, not the face, so the face's box
     model never touched it. The inset has to be applied to the picture itself.

     The outline is declared outside the :has() rule on purpose. It paints above
     the image regardless (the face owns z-index 1), so a browser without :has()
     still gets a visible indicator — just without the guaranteed backing. */
  .wkr__face:focus-visible {
    outline: 3px solid var(--rez-na-temnem);
    outline-offset: -4px;
  }

  /* width/height must be released with the inset, or they win: the base rule
     pins the picture to 100% of the plate, so `inset` alone MOVED it 7px and
     kept its size, pushing it 7px off the right edge instead of framing it
     (measured — the picture's box was still 160px inside a 160px plate). */
  .wkr__plate:has(.wkr__face:focus-visible) .wkr__shot {
    inset: 7px;
    width: auto;
    height: auto;
  }
}

/* --- desktop: the uneven row -----------------------------------------------------
   Three fifths to the majority, a fifth each to the next two, half a fifth to
   each slice. Measured at 1280: 544 / 181 / 181 / 91 / 91 — a slice is exactly
   half a full plate, which is what makes the row read as one system of scales
   rather than as five arbitrary widths.

   THE PAINTED ORDER IS NOT THE CONTENT ORDER. The majority sits third from the
   left with the slices to its right, while the markup keeps the projects in the
   order the content module lists them — so the tab order and what a screen
   reader hears both follow the content, not the picture. */
@media (min-width: 900px) {
  .wkr__wall {
    display: flex;
    flex-direction: row;
    gap: var(--space-3);
    align-items: stretch;
    min-height: 22rem;
  }

  .wkr__plate:nth-child(1) {
    order: 3;
  }
  .wkr__plate:nth-child(2) {
    order: 2;
  }
  .wkr__plate:nth-child(3) {
    order: 1;
  }
  .wkr__plate:nth-child(4) {
    order: 4;
  }
  .wkr__plate:nth-child(5) {
    order: 5;
  }

  .wkr__plate {
    flex: 1 1 0;
    transition: flex-grow 380ms var(--ease-spring);
  }

  /* Resting shares. Both are single classes so the state rules below outrank
     them on order alone; the wall in the section beneath learned the hard way
     what happens when a resting share outranks the state that should replace
     it. */
  .wkr__plate--lead {
    flex-grow: 3;
  }

  .wkr__plate--slice {
    flex-grow: 0.5;
  }

  /* Touch. :not() on the fronted plate, so a fronted LEAD is not handed back
     the fifth by the rule that demotes the resting lead. */
  .wkr__wall:has(.wkr__plate--front) .wkr__plate--lead:not(.wkr__plate--front) {
    flex-grow: 1;
  }

  .wkr__plate--front {
    flex-grow: 3;
  }

  @media (hover: hover) {
    .wkr__wall:hover .wkr__plate--lead:not(:hover) {
      flex-grow: 1;
    }

    .wkr__wall .wkr__plate:hover {
      flex-grow: 3;
    }
  }

  /* A slice is about 91px of row. Its sector, address and samples step aside
     rather than being crushed into a column of broken words — they come back
     the moment it takes the majority, which is one hover or one tap away. The
     name stays, because a slice with no name is a swatch. */
  .wkr__plate--slice:not(.wkr__plate--front) .wkr__sector,
  .wkr__plate--slice:not(.wkr__plate--front) .wkr__meta {
    display: none;
  }

  .wkr__plate--slice:not(.wkr__plate--front) .wkr__project {
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .wkr__plate--slice:not(.wkr__plate--front) .wkr__name {
    padding: var(--space-3);
  }

  .wkr__plate--slice:not(.wkr__plate--front) .wkr__name::before {
    display: none;
  }
}
</style>
