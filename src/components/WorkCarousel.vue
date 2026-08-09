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
import { computed, nextTick, onMounted, ref } from 'vue'
import { references } from '@/content/home'

const items = references.items

/**
 * How many projects stand at rest. Five is more work than either layout wants
 * to show at once — a phone would scroll through five full-width belts before
 * reaching anything else — so the set stops after the third and the rest are
 * one control away.
 */
const AT_REST = 3

/** Which plate the reader has brought forward BY TAPPING. -1 = none; on
 *  pointer devices this stays -1 forever and :hover does the work. */
const active = ref(-1)
/** Devices with a real pointer take the majority on hover, so a tap there
 *  should follow the link at once. Read on mount — never at module scope. */
const hoverCapable = ref(true)

/**
 * PROGRESSIVE DISCLOSURE SHIPS EXPANDED. `live` flips on mount, so the
 * prerendered HTML carries all five projects in flow with no control at all —
 * a crawler and a JS-off reader get the complete set, and the shortening is
 * purely an affordance for people who can operate it.
 */
const live = ref(false)
const revealed = ref(false)
const collapsed = computed(() => live.value && !revealed.value)

const root = ref<HTMLElement | null>(null)

/** Reveal, then put the reader at the first project that just arrived — the
 *  control they pressed is gone, so focus has to land somewhere deliberate. */
function reveal() {
  revealed.value = true
  nextTick(() => {
    root.value?.querySelectorAll<HTMLElement>('.wkr__plate')[AT_REST]?.querySelector('a')?.focus({
      preventScroll: true,
    })
  })
}

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
  live.value = true
})
</script>

<template>
  <section id="reference" ref="root" class="wkr press press--light">
    <div class="container">
      <header class="wkr__head">
        <p class="wkr__kicker">{{ references.kicker }}</p>
        <h2 class="wkr__title">{{ references.title }}</h2>
        <p class="wkr__intro">{{ references.intro }}</p>
      </header>

      <div class="wkr__stage" :class="{ 'wkr__stage--collapsed': collapsed }">
        <ol class="wkr__wall" :aria-label="references.feedback.regionLabel">
        <li
          v-for="(item, n) in items"
          :key="item.id"
          class="wkr__plate"
          :class="{ 'wkr__plate--front': active === n, 'wkr__plate--extra': n >= AT_REST }"
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
                <!-- The sheet number rides the meta row on phones, where the
                     belts run edge to edge and there is no margin to hang it
                     in; the desktop row carries its order in the widths. -->
                <span class="wkr__index" aria-hidden="true">00{{ n + 1 }}</span>
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

        <!-- ONE CONTROL, TWO FACES. A paper button under the belts on phones; a
             dark sliver standing at the right end of the row on desktop, which
             is the edge the hidden projects arrive from. Same button, same
             string, same handler — never two controls that can disagree. -->
        <div v-if="collapsed" class="wkr__more">
          <button type="button" class="wkr__more-btn" @click="reveal">
            <span class="wkr__more-label">{{ references.feedback.moreLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The band takes »Kje se ločimo« ground exactly (owner's call): the deeper
   beige AND its press screen, rather than the lighter sheet this band used to
   sit on.

   background-COLOR, never the shorthand. The shorthand resets background-image,
   and this scoped rule would silently win over the .press utility that supplies
   the screen — the texture would simply not appear. The same line in the
   differentiators section carries the same warning for the same reason. */
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

/* --- the set, and the control that completes it ----------------------------------
   The stage exists so the control can be positioned against the row on desktop
   without being a member of the list — it is not a project, and putting a button
   inside an <ol> of projects would say it was. */
.wkr__stage {
  --more-w: 3.25rem;

  position: relative;
}

.wkr__more-btn {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  transition:
    border-color var(--dur-tween) var(--ease-hover),
    color var(--dur-tween) var(--ease-hover);
}

/* --- phones: three belts ---------------------------------------------------------
   THE BOLDEST THING AVAILABLE IS THE FULL MEASURE. Three bands of work running
   edge to edge, one under the other, with the words on the paper beneath each —
   no datum, no indents, no overlap, no keyline, and no dark band under the
   picture. Everything that made the phone stack read as drawings laid on a table
   is gone on purpose: at this width the belt IS the statement, and any inset
   around it is the layout apologising for itself.

   The words move to the paper, so every ink flips with them — graphite on beige
   instead of paper on graphite. That flip is the whole reason this block is long:
   a colour left behind would be invisible rather than merely wrong. */
@media (max-width: 899.98px) {
  .wkr__wall {
    /* Out through the container's own gutters. The section keeps its measure
       for the heading; only the belts break it. */
    gap: var(--space-8);
    margin-inline: calc(var(--gutter) * -1);
  }

  /* The plate is no longer a dark frame with words printed into it, so it stops
     carrying a fill at all — the belt brings its own. */
  .wkr__plate {
    background: none;
  }

  /* The shot returns to the FLOW: it is the belt itself now, not a ground behind
     a face. 2:1 is the shots' own ratio — all three sources are exactly that —
     so a full-width belt crops nothing whatsoever. The graphite behind it is
     what shows while the image decodes. */
  .wkr__shot,
  .wkr__shot img {
    position: static;
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 1;
    background: var(--grafit);
  }

  .wkr__face {
    display: block;
  }

  /* The ring rides the BELT, not the whole link. The link now spans two grounds
     and no single accent clears 3:1 on both — measured, against the real tokens:
     --rez-na-temnem is 4.74:1 on the belt but 2.67:1 on paper, and --rez is the
     exact reverse at 2.58:1 and 5.37:1. A ring drawn across both would fail on
     one half of its own length, so it stays where it passes. */
  .wkr__face:focus-visible {
    outline: none;
  }

  .wkr__face:focus-visible .wkr__shot img {
    outline: 2px solid var(--rez-na-temnem);
    outline-offset: -4px;
  }

  /* The words, on paper. The measure comes back here — the belt is full bleed,
     the reading is not. */
  .wkr__name {
    background: none;
    padding: var(--space-3) var(--gutter) 0;
  }

  /* No band left to dissolve into the picture. */
  .wkr__name::after {
    display: none;
  }

  /* The corner mark flips to a drawn stroke on paper. Same gesture, same
     overshoot, the other ink. */
  .wkr__name::before {
    top: 0;
    left: var(--gutter);
    background:
      linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 0 top 5px / 16px 1px
        no-repeat,
      linear-gradient(var(--mreza-strong), var(--mreza-strong)) left 5px top 0 / 1px 16px
        no-repeat;
  }

  .wkr__project {
    color: var(--grafit); /* 13.9:1 on the beige */
    font-size: 1.375rem;
  }

  .wkr__sector {
    color: var(--grafit-2); /* 8.5:1 on the beige */
  }

  .wkr__url {
    color: var(--grafit-2);
  }

  .wkr__inks {
    border-color: var(--mreza-strong);
  }

  .wkr__index {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--type-data-size);
    letter-spacing: var(--type-data-ls);
    color: var(--grafit-2);
  }

  /* The set stops after the third belt. Five full-width belts is a long scroll
     before anything else on the page arrives, and the reader can have the rest
     for one press. */
  .wkr__stage--collapsed .wkr__plate--extra {
    display: none;
  }

  /* THE PAPER BUTTON. The section's own sheet, a graphite hairline and narrow
     caps — the page's furniture rather than a UI widget dropped onto it. Full
     measure, because a small centred pill under two full-bleed belts would read
     as an afterthought. */
  .wkr__more {
    margin-top: var(--space-8);
  }

  .wkr__more-btn {
    width: 100%;
    min-height: 52px;
    padding: var(--space-3) var(--space-4);
    background: var(--list);
    border: var(--divider-width) solid var(--grafit);
    /* The title block's heavy closing edge, on the one control in the band. */
    border-right-width: 2px;
    color: var(--grafit); /* 13.9:1 on the sheet */
  }

  .wkr__more-btn:focus-visible {
    outline: 2px solid var(--rez);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    .wkr__more-btn:hover {
      border-color: var(--rez);
      color: var(--rez); /* 5.37:1 on the sheet */
    }
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

  /* THE PAINTED ORDER IS NOT THE CONTENT ORDER. The majority sits third from the
     left, with the projects held back arriving to its right — the edge the
     sliver stands at. The markup keeps the projects in the order the content
     module lists them, so the tab order and what a screen reader hears follow
     the content rather than the picture. */
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

  .wkr__plate:first-of-type {
    flex-grow: 3;
  }

  /* HELD BACK, NOT REMOVED. The two sit in the row at zero width, so revealing
     them is a flex-grow transition from 0 to 1 — they open out of the right-hand
     edge rather than appearing. The negative margin cancels the gap a zero-width
     item would still be given, so the collapsed row measures the same as a row
     of three. */
  .wkr__stage--collapsed .wkr__plate--extra {
    flex: 0 0 0;
    margin-left: calc(var(--space-3) * -1);
    overflow: hidden;
  }

  /* Room for the sliver, only while it is standing there. */
  .wkr__stage--collapsed .wkr__wall {
    padding-right: calc(var(--more-w) + var(--space-3));
  }

  /* THE SLIVER. A dark edge at the right of the row, in the plates' own
     graphite, reading bottom-to-top the way the wall's spines do. It is where
     the held-back work is, and pressing it opens exactly that. */
  .wkr__more {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--more-w);
  }

  .wkr__more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: var(--space-3) 0;
    background: var(--grafit);
    border: 0;
    color: var(--color-paper); /* 13.9:1 on the graphite */
  }

  .wkr__more-label {
    writing-mode: vertical-rl;
    white-space: nowrap;
  }

  .wkr__more-btn:focus-visible {
    outline: 2px solid var(--rez-na-temnem); /* 4.74:1 on the graphite */
    outline-offset: -6px;
  }

  @media (hover: hover) {
    .wkr__more-btn:hover {
      color: var(--rez-na-temnem);
    }
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
