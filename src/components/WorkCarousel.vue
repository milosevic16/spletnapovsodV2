<script setup lang="ts">
/**
 * Reference — the built work as THREE DARK PLATES, in the same language as the
 * wall of packages directly below it.
 *
 * That neighbouring section is the reference for every decision here, because
 * two adjacent bands that speak differently read as two different sites:
 *  · the picture IS the plate — full bleed, no frame, no inset, no caption
 *    strip under it; the plate's own ink rises into the bottom of the frame and
 *    the words print inside it;
 *  · the row is never even. One plate holds three fifths and the other two a
 *    fifth each, and the majority follows the pointer — the same shape sliding
 *    along the row, which is the wall's entire gesture;
 *  · phones pin the plates along a drafting DATUM down the left margin, hanging
 *    at three different indents and overlapping by a sliver, so the stack reads
 *    as drawings laid on a table rather than three equal cards.
 *
 * What this section keeps that the wall has no need of: the sheet numbers, the
 * address, and each site's own palette sampled into a framed strip. They are
 * restated in the wall's materials — paper strokes on dark, one hairline weight
 * — rather than in the paper-ledger vocabulary they came from, which is what
 * made the old version read as a different section.
 *
 * THE WHOLE PLATE IS THE LINK, so there is one tab stop and one obvious target
 * per project. On pointer devices hover hands it the majority and a click
 * follows it. On touch, where there is no hover, the first tap gives the plate
 * the majority and the second follows the link — otherwise a reader could never
 * LOOK at a plate without leaving the site. With JS off a tap simply follows the
 * link, which is the safe degradation.
 *
 * SSG contract: every plate, name, sector and address is in the prerendered
 * HTML and visible at rest; nothing here is disclosed by interaction.
 */
import { onMounted, ref } from 'vue'
import { references } from '@/content/home'

const items = references.items

/** Which plate the reader has brought forward BY TAPPING. -1 = none; on
 *  pointer devices this stays -1 forever and :hover does the work. */
const active = ref(-1)
/** Devices with a real pointer take the majority on hover, so a tap there
 *  should follow the link at once. Read on mount — never at module scope. */
const hoverCapable = ref(true)

/** Variants are generated per project (scripts/build-reference-images.mjs);
 *  the widths list lives with the item, so the srcset cannot claim a file
 *  that was never emitted. */
function srcset(id: string, ext: string, widths: number[]): string {
  return widths.map((w) => `/img/refs/${id}-${w}.${ext} ${w}w`).join(', ')
}

/** The majority plate's real measure at each breakpoint (see the wall block). */
const SIZES = '(min-width: 900px) 62vw, 92vw'

/**
 * Touch only: the first tap gives the plate the majority, the second follows it.
 * On a pointer device hover has already done the giving, so the tap goes
 * straight through.
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
  <section id="reference" class="wkr">
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
          :class="{ 'wkr__plate--front': active === n }"
        >
          <!-- THE PLATE'S GROUND. Not a picture hung inside a plate: the shot
               fills the plate absolutely, edge to edge, and the plate is
               whatever the row makes it — three fifths or one. z-index 0 rather
               than nothing, because an absolutely positioned child otherwise
               paints ABOVE its static siblings and the whole point is that it
               paints below. -->
          <picture class="wkr__shot">
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

          <!-- The sheet number in the margin, on its leader. Phones only, like
               the wall's own index: on desktop the row already carries order. -->
          <span class="wkr__index" aria-hidden="true">00{{ n + 1 }}</span>

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
                <span class="wkr__url emisija">{{ item.urlLabel }}</span>
                <!-- The site's own palette. Butted into ONE hairline frame —
                     separated chips read as confetti, a framed strip reads as
                     the materials legend it is. Decorative, so hidden from the
                     accessibility tree. -->
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
/* The band keeps the page's paper alternation — the deeper beige above it and
   below it, this one on the lighter sheet. No press screen: neither neighbour
   carries one, and a texture that starts and stops at a section boundary is
   exactly what made this band read as pasted in. */
.wkr {
  background: var(--list);
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

/* --- the plates ---------------------------------------------------------------
   Dark plates on the paper band: the machine-world ground, the picture as its
   surface, paper strokes and paper text on top. */
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
  /* The box runs from about 1.9:1 as the majority to about 0.6:1 as a fifth of
     the row, so the crop takes the sides in one state and the top and bottom in
     another. Anchored to the top, because the top of a landing page is the part
     that identifies it. */
  object-position: 50% 0%;
  display: block;
}

/* The face: the whole plate is the link, and it sits above the ground. */
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

/* THE TEXT'S GROUND — the plate's own ink, the poché move (solid graphite = the
   machine world), not a photo-app gradient.

   It rides the NAME BLOCK rather than the plate, and that is the one place this
   section had to depart from the wall below. The wall's scrim is a gradient
   rising a fixed fraction of the plate, which works because its text is two
   short lines. Here the block runs to four or five, and its height is set by
   the copy while the plate's height is set by the row — so at the 320 floor the
   block measured 151px of a 157px plate and its first line sat ABOVE the
   gradient's dense end, on the bare screenshot. A guarantee that holds at 1280
   and fails at 320 is not a guarantee. Tied to the block, the density is the
   same at every width by construction.

   WORST CASE IS MEASURED AGAINST WHITE, not against today's three screenshots:
   a ground that only holds because these shots happen to be mid-toned is one
   that breaks the day a project ships a white landing page — and two of these
   three already do. Composited over pure white, in-page against the real
   tokens: --color-paper 10.9:1, --papir-dim 7.2:1, at any plate size. */
.wkr__name {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4);
  background: color-mix(in srgb, var(--grafit) 92%, transparent);
}

/* The band's top edge, dissolved into the picture above it — the only part of
   the ground that is a gradient, and it carries no text. */
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

/* The architect's mark, restated in the wall's own ink: two paper strokes that
   cross and OVERSHOOT each other at the corner where the words begin. A ruled
   corner stops, a drawn one runs past — the same gesture the ledger carried,
   in the material of the section it now sits in. */
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

/* The sheet number, in the margin on its leader — phones only (see the datum
   block below), matching the wall's own index exactly. */
.wkr__index {
  display: none;
}

/* --- phones: plates pinned along a datum ---------------------------------------
   The wall's phone layout, to the pixel: a drafting datum down the left margin,
   the plates hanging off it at three different indents, each overlapping the one
   above by a sliver. The paper keyline is an outline, so it costs no layout, and
   it is what makes the overlap read as intentional rather than as a collision —
   depth here is drawn, never cast. The chosen plate takes the full measure back,
   which is the layout's own way of saying "this one now". */
@media (max-width: 899.98px) {
  .wkr__wall {
    position: relative;
    gap: 0;
    padding-left: 2.8rem;
  }

  .wkr__wall::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0.4rem;
    bottom: 0.4rem;
    width: 1px;
    background: var(--mreza-strong);
  }

  .wkr__plate {
    outline: 4px solid var(--list);
    margin-top: -1rem;
  }

  .wkr__plate:first-of-type {
    margin-top: 0;
  }

  .wkr__plate:nth-of-type(2) {
    margin-left: 1.6rem;
  }

  .wkr__plate:nth-of-type(3) {
    margin-right: 2.2rem;
  }

  /* Doubled class on purpose: the indent rules above are :nth-of-type
     (specificity 0,2,0) and would otherwise outrank a single state class. */
  .wkr__plate.wkr__plate--front {
    margin-left: 0;
    margin-right: 0;
  }

  /* The shot is out of flow, so the face has to declare the shape. 4/3 is the
     wall's own ratio; the floor beside it is this section's addition, because
     the name block does not shrink with the plate — without it the narrowest
     plate measured 151px of text in a 157px frame, which is a caption with a
     rumour of a picture behind it. 18rem keeps roughly half the plate for the
     work at every width down to 320. */
  .wkr__face {
    aspect-ratio: 4 / 3;
    min-height: 18rem;
  }

  .wkr__index {
    display: block;
    position: absolute;
    top: var(--space-2);
    left: -1.75rem;
    writing-mode: vertical-rl;
    font-family: var(--font-mono);
    font-size: var(--type-data-size);
    letter-spacing: var(--type-data-ls);
    color: var(--grafit-2);
  }
}

/* --- desktop: the wall ---------------------------------------------------------
   THE ROW IS NEVER EVEN. The majority plate holds three fifths and the other two
   a fifth each — a fifth more than a half, which is what makes it read as the
   one being looked at rather than merely the larger one. At rest that majority
   belongs to the FIRST project; pointing at any plate hands it the majority and
   returns the others to a fifth, so the same shape slides along the row.

   The height is the wall's own gesture at this section's scale: 22rem makes the
   majority plate about 1.9:1, which is very near the shots' native 2:1, so the
   plate being looked at crops almost nothing. */
@media (min-width: 900px) {
  .wkr__wall {
    flex-direction: row;
    gap: var(--space-3);
    align-items: stretch;
    min-height: 22rem;
  }

  .wkr__plate {
    flex: 1 1 0;
    transition: flex-grow 380ms var(--ease-spring);
  }

  .wkr__plate:first-of-type {
    flex-grow: 3;
  }

  /* Touch: a tapped plate takes the majority and the first plate gives it up.
     Both rules tie with :first-of-type at 0,2,0 and win on order — the wall
     below learned this the hard way, where a lone state class left the first
     plate holding a third of the row it should have surrendered. */
  .wkr__wall:has(.wkr__plate--front) .wkr__plate {
    flex-grow: 1;
  }

  .wkr__plate.wkr__plate--front {
    flex-grow: 3;
  }

  @media (hover: hover) {
    .wkr__wall:hover .wkr__plate {
      flex-grow: 1;
    }

    .wkr__wall .wkr__plate:hover {
      flex-grow: 3;
    }
  }

  /* A fifth of the row is a narrow plate, so the name block loses its indent
     and the sector its second line rather than the words being crushed. Nothing
     is hidden: every string stays rendered and legible at every width. */
  .wkr__name {
    padding: var(--space-3);
  }

  .wkr__name::before {
    left: var(--space-3);
  }
}
</style>
