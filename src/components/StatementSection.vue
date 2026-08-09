<script setup lang="ts">
/**
 * The opening band — A TITLE SHEET. The whole hero is one drafting sheet: a
 * hairline frame inset from the page edges, crop marks at its corners, a
 * construction line where the type stops, and a title block along the bottom
 * carrying the claim. The brand name is the drawing on it.
 *
 * THE MARK IS THE SHEET'S CORNER STAMP. It sits ON the frame's top-left
 * corner, punched into the border on its own patch of paper, the way a stamp
 * or a register mark sits on a real sheet — not fenced off in a strip of its
 * own above a rule, which is what made it read as a separate object. That
 * position is also exactly what the intro veil's landing formula wants: the
 * frame corner IS --hero-inset, so ink-left = ink-top = --hero-inset (+ the
 * 45px desktop masthead strip), ink-height = 0.55em of --hero-display. The
 * veil (index.html) copies those as literals — change either, change both.
 *
 * THE DRAWING. Two courses of monumental type divided by the site's cut plane,
 * both cut from the SAME material — the press screen the contact band is
 * printed on, carried on the ink and clipped to the letterforms. Above the cut
 * »Spletna« is that pressed stock and nothing else; below it »Povsod« has a
 * moving image behind the same glyphs, so what you see is what the page is
 * made of, and what holds it up is the same stock with something running
 * through it. One red rule with square end ticks, exactly as wide as the
 * courses.
 *
 * THE COURSES ARE FLUSH BY ARITHMETIC, not by eye. Measured at 100px in the
 * real face (Geist 400, uppercase, ls −0.02em): »SPLETNA« sets 4.218em wide,
 * »POVSOD« 3.951em. Those ratios are properties of the strings, not of the
 * size, so dividing one target width by each constant makes both words span
 * EXACTLY the same measure at every viewport. Re-measure both if the lettering
 * or the tracking ever changes. (They changed once already: the second word
 * was 3.118em while it carried a script splice on its tail. That device is
 * cancelled — one face per title, everywhere.)
 *
 * No JavaScript, no animation, nothing to reveal. The rendered sheet is the
 * whole design, identical with JS off and under reduced motion. On phones the
 * sheet deliberately stops short of the fold so the work below shows through —
 * a hero that ends where the next thing begins.
 */
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { hero } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

const WORD_1 = 'Spletna'
const WORD_2 = 'Povsod'
/** The clip path holds its own copy of the word. Uppercased here rather than
 *  by `text-transform`, which is not dependable on SVG text — and a clip that
 *  renders lowercase would cut the wrong shapes out of the video. */
const WORD_2_CLIP = WORD_2.toUpperCase()

/** PAIRED with BANDS['hero-povsod'] in scripts/build-pillar-videos.mjs.
 *  /video/* is immutable-cached, so a re-encode must bump both. */
const CLIP_VERSION = 'v1'
const clip = (ext: string) => `/video/hero-povsod-${CLIP_VERSION}.${ext}`

const fx = createFx()
const rootEl = ref<HTMLElement | null>(null)
/** Gates the window: with JS off »POVSOD« is simply the screened ink word, and
 *  a clip that never resolved could not leave a video rectangle on the page. */
const live = ref(false)

onMounted(() => {
  live.value = true
  // Reduced motion keeps the window — a still frame seen through the letters
  // is not movement — but it is never played.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  nextTick(() => {
    const v = rootEl.value?.querySelector<HTMLVideoElement>('.stmt__window-vid')
    if (!v) return
    const io = fx.io(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        }
      },
      { threshold: 0 },
    )
    io.observe(v)
  })
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section ref="rootEl" class="stmt">
    <!-- The sheet. data-brand-sentinel is a contract with SiteMasthead: the
         phone bar appears exactly when this element leaves the screen, so the
         brand is never absent from the page. -->
    <div class="stmt__sheet" data-brand-sentinel>
      <!-- Crop marks on the three free corners; the fourth is the mark. -->
      <span class="stmt__crop stmt__crop--tr" aria-hidden="true"></span>
      <span class="stmt__crop stmt__crop--bl" aria-hidden="true"></span>
      <span class="stmt__crop stmt__crop--br" aria-hidden="true"></span>

      <!-- The corner stamp: the pd mark, punched into the frame. Two
           overlapping discs carrying Povsod's first and last letters; the d is
           the p rotated 180° (the mark's point symmetry). THE VEIL LANDS HERE
           — see the header comment before touching its size or position. -->
      <span class="stmt__stamp">
        <svg class="stmt__mark" viewBox="0 0 244 144" aria-hidden="true">
          <circle cx="72" cy="72" r="72" fill="var(--rez)" />
          <circle cx="172" cy="72" r="72" fill="var(--rez)" />
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
          <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round"
            transform="rotate(180 122 72)">
            <circle cx="79" cy="79" r="33" />
            <line x1="46" y1="55" x2="46" y2="118" />
          </g>
        </svg>
      </span>

      <!-- THE DRAWING. A container query context: both courses size themselves
           from THIS box's inline width, so they are flush to each other and to
           the measure without measuring anything at runtime. -->
      <div class="stmt__elevation">
        <!-- The construction line: a box exactly as wide as the courses,
             showing only its right edge — the line the type stops on. A CHILD,
             not a pseudo-element of the container: container-query units
             cannot query the container they are declared on. -->
        <span class="stmt__edge" aria-hidden="true"></span>

        <p class="stmt__course stmt__course--drawn">
          <span class="stmt__wordmark press">{{ WORD_1 }}</span>
        </p>

        <!-- The cut plane: one red rule, square end ticks, exactly as wide as
             the courses it divides. -->
        <span class="stmt__cut" aria-hidden="true"></span>

        <p class="stmt__course stmt__course--solid">
          <span class="stmt__wordmark press">
            {{ WORD_2 }}
            <!-- THE WINDOW: the same word cut out of a moving image. The box is
                 the wordmark's own, so the clip path's user space and the
                 glyphs share one origin; the letters are the only place the
                 video is allowed to show. -->
            <span v-if="live" class="stmt__window" aria-hidden="true">
              <video
                class="stmt__window-vid"
                :poster="clip('jpg')"
                muted
                loop
                playsinline
                preload="none"
                disablepictureinpicture
                tabindex="-1"
              >
                <source :src="clip('webm')" type="video/webm" />
                <source :src="clip('mp4')" type="video/mp4" />
              </video>

              <!-- THE KNOCKOUT. A plate of the sheet's own ground laid over the
                   video with the word masked OUT of it, so the video survives
                   only inside the letters. The mask is applied to an SVG shape,
                   not to the HTML box — see the note on .stmt__knock. -->
              <svg class="stmt__knock" aria-hidden="true" focusable="false">
                <defs>
                  <mask id="stmt-povsod-mask" maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                    <text class="stmt__masktext" x="0" y="0">{{ WORD_2_CLIP }}</text>
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="var(--list-2)"
                  mask="url(#stmt-povsod-mask)"
                />
                <!-- THE CONTOUR, and it is structural rather than decorative:
                     the window's content is a moving image, so the fill inside
                     a letter is whatever the clip happens to be showing. The
                     hairline is what guarantees the word is always READ as the
                     word — the same outline »SPLETNA« carries above the cut,
                     the same hand. Drawn last so it sits over both the plate
                     and the video. -->
                <text class="stmt__masktext stmt__contour" x="0" y="0">{{ WORD_2_CLIP }}</text>
              </svg>
            </span>
          </span>
        </p>
      </div>

      <!-- The title block: the sheet's own register strip, along the bottom. -->
      <div class="stmt__block">
        <h1 class="stmt__title">
          <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
        </h1>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* PINNED light: the page root flips with the ground switch and this section's
   inks are the paper world's. `overflow: clip` is load-bearing, not tidiness:
   the courses are sized so the REAL face spans the measure exactly, and for
   the instant before the webfont swaps, the metric-matched fallback's wider
   advances would push the ink past the frame. */
.stmt {
  position: relative;
  overflow: clip;
  /* The deeper beige (owner's call): the opening band takes the darker of the
     two papers, which also sets the page's alternation — beige hero, paper
     references, beige paketi. THREE THINGS ARE PAIRED TO THIS VALUE and must
     move with it: the veil's ground and the theme-color meta (index.html —
     the surface the intro and the status bar meet, where a mismatch shows as
     the page darkening under the veil as it lifts), and the mark's cut-out
     below, which is painted in this fill to read as a hole. */
  background: var(--list-2);
  padding: var(--hero-inset);
}

/* --- the sheet --------------------------------------------------------------
   The frame is inset by exactly --hero-inset, which is what puts its top-left
   corner where the veil lands the mark. */
.stmt__sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  border: var(--divider-width) solid var(--mreza-strong);
  /* Clear the corner stamp; the rest of the sheet's own frame padding. */
  padding: calc(0.55 * var(--hero-display) + var(--space-4)) var(--space-4) var(--space-4);
  /* Short of the fold ON PURPOSE (phones): the work below has to show through,
     so the hero ends where the next thing begins. Desktop takes the full
     screen below. */
  min-height: 72svh;
}

/* Crop marks: two hairlines meeting at a corner, the drafting sheet's own
   registration.
   Each is a box showing only the two borders that form its corner. */
.stmt__crop {
  position: absolute;
  width: var(--space-6);
  height: var(--space-6);
  pointer-events: none;
}
.stmt__crop--tr {
  top: 0;
  right: 0;
  border-top: var(--divider-width) solid var(--grafit);
  border-right: var(--divider-width) solid var(--grafit);
  margin: -1px -1px 0 0;
}
.stmt__crop--bl {
  bottom: 0;
  left: 0;
  border-bottom: var(--divider-width) solid var(--grafit);
  border-left: var(--divider-width) solid var(--grafit);
  margin: 0 0 -1px -1px;
}
.stmt__crop--br {
  bottom: 0;
  right: 0;
  border-bottom: var(--divider-width) solid var(--grafit);
  border-right: var(--divider-width) solid var(--grafit);
  margin: 0 -1px -1px 0;
}

/* The stamp sits ON the corner: its own patch of paper punches the frame's
   two lines, so the mark reads as part of the sheet's furniture rather than as
   an object fenced above it. The padding extends the paper past the ink on the
   inside edges only — the ink's top-left stays exactly on the corner, which is
   the veil's landing formula. */
.stmt__stamp {
  position: absolute;
  /* Pulled out by the border's own width: an absolute box is positioned
     against the PADDING box, so `0` would sit the ink one border inside the
     frame — and the veil lands on --hero-inset exactly, which is the frame's
     OUTER corner. Measured: 21px against a 20px inset before this. */
  left: calc(var(--divider-width) * -1);
  top: calc(var(--divider-width) * -1);
  display: block;
  padding: 0 var(--space-3) var(--space-3) 0;
  /* Painted in the band's OWN fill so it reads as a cut-out — it follows
     every change of .stmt's background, or it becomes a visible patch. */
  background: var(--list-2);
}

.stmt__mark {
  display: block;
  height: 0.55em;
  width: auto;
  font-size: var(--hero-display);
}

/* --- the drawing ------------------------------------------------------------
   `--mon-span` is the width both courses span; each divides it by its own
   measured em-width (see the header), so both land on exactly that width. cqw,
   not vw: the container's inline size already excludes the scrollbar, the
   section's inset and the sheet's own padding, so the ink lands inside the
   frame by construction rather than by subtraction.

   The cap stops the type growing without bound on very wide screens; because
   both caps carry the same 4.218 : 3.951 relation, capping never breaks the
   flush. */
.stmt__elevation {
  position: relative;
  container-type: inline-size;
  --mon-span: 100cqw;
  --mon-cap: 16rem;
  /* The courses' shared width, for anything that must align to where the type
     ends. Declared here but RESOLVED in the children that use it, which is the
     only context where cqw can see this container. */
  --mon-w: calc(min(calc(var(--mon-span) / 4.4502), var(--mon-cap)) * 4.4502);
  /* auto ABOVE and auto on the title block below: the free space divides
     equally, so the drawing floats centred on the sheet instead of the void
     pooling in one place. */
  margin-top: auto;
  padding-block: clamp(1rem, 2vw, 2rem);
}

/* Hidden by default: on a phone the courses already reach both edges of the
   frame, so a line at their right edge would just double the frame. */
.stmt__edge {
  display: none;
}

.stmt__course {
  margin: 0;
  font-family: var(--font-sans);
  /* 700, not 400: both courses are now FILLED — one with a drafting hatch, the
     other with a moving image — and a 400 letterform is too thin a window for
     either to read inside it. The weight is what makes the fills legible, so
     it is not a style preference but a requirement of the treatment. */
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--grafit);
  /* The 0.8 line-height crops the caps' own box; a hair of leading keeps the
     cut off the letterforms. */
  padding-block: 0.04em;
}

/* »SPLETNA« — 4.4502em wide in the real face (measured at weight 700; it was
   4.218 at 400, and the constants MUST be re-measured whenever the weight or
   the tracking moves, or the two courses stop being flush). */
.stmt__course--drawn {
  font-size: min(calc(var(--mon-span) / 4.4502), var(--mon-cap));
}

/* »POVSOD« — 4.13em at the same weight. The cap carries the same ratio
   (16rem × 4.4502 / 4.13 = 17.24rem) so capping never breaks the flush. */
.stmt__course--solid {
  position: relative;
  font-size: min(calc(var(--mon-span) / 4.125), calc(var(--mon-cap) * 1.0788));
  color: var(--grafit);
}

/* BOTH COURSES ARE CUT FROM MATERIAL, and it is the SAME material the contact
   band »Povejte, kaj potrebujete« is printed on: the press screen (base.css
   `.press`), carried on the ink and clipped to the letterforms. The glyphs
   become the window and the pressed stock shows through them, so the pair
   reads as two blocks milled out of one sheet rather than as type sitting on
   one.

   A 45° section hatch stood here first and was wrong — it is the drawing
   convention for cut EARTH, borrowed from a section further down the page, and
   on the brand name it read as a pattern rather than as a material. The press
   screen is the page's own surface, at the same 9px cell it runs at in the
   contact band, so the hero states what the page is made of instead of quoting
   a drawing.

   ONE RULE FOR BOTH WORDS, deliberately: identical declarations split across
   two selectors is exactly the shape the CSS minifier merges and prunes
   (rendering.md trap 8), and there is no reason for the two courses to be able
   to drift apart. What still separates them is what is behind the glyphs —
   above the cut the pressed stock IS the fill, below it a moving image sits
   over the fill and shows through instead.

   Gated, and the gate is load-bearing: background-clip:text needs `color:
   transparent` to show anything, so an engine without it would render the
   brand name invisible. Outside the guard the words stay solid ink. */
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .stmt__wordmark {
    background-color: var(--grafit);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

/* The cut plane, exactly as wide as the courses, with its square end ticks —
   and extension lines dropping the full height of the sheet from both ends,
   the dimension convention that ties the drawing to its frame. */
.stmt__cut {
  position: relative;
  display: block;
  width: var(--mon-w);
  max-width: 100%;
  height: 2px;
  background: var(--rez);
  margin-block: clamp(0.4rem, 0.8vw, 0.7rem);
}
.stmt__cut::before,
.stmt__cut::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 8px;
  height: 8px;
  background: var(--rez);
}
.stmt__cut::before {
  left: 0;
}
.stmt__cut::after {
  right: 0;
}

.stmt__wordmark {
  display: inline-block;
  /* The window is positioned against this box, so the clip path's user space
     and the glyphs it cuts share one origin. */
  position: relative;
}

/* --- the window -------------------------------------------------------------
   »POVSOD« is cut out of a moving image: the video fills the wordmark's box and
   `clip-path` lets it through the letterforms only. The screened ink word sits
   underneath it, which is what shows with JS off and what the video is laid
   over when it plays.

   THE BAND IS CHOSEN AT ENCODE TIME, not here. The word is ~4.7 times wider
   than it is tall, so only a horizontal strip of any frame could ever appear
   in it; scripts/build-pillar-videos.mjs cuts that strip out of the source and
   the file arrives already the shape of the word. */
.stmt__window {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stmt__window-vid {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* A KNOCKOUT, NOT A CLIP, and that is a measured decision. The obvious build
   is `clip-path: url(#…)` on the video's box with a <clipPath> holding the
   word — and it does not work: tested here with hit-testing, a clipPath whose
   child is a <rect> clips an HTML element correctly, while the identical
   clipPath holding <text> is IGNORED ENTIRELY, leaving the video as a full
   rectangle over the wordmark. Both with and without a transform on the text.
   So the cut-out is done where masking is dependable — INSIDE the SVG: a plate
   of the sheet's own ground is painted over the video with the word masked out
   of it, and the video survives only in the letters.
   The plate's fill has to stay the hero's ground (--list-2) or it will read as
   a rectangle sitting on the sheet. */
.stmt__knock {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* The mask's own copy of the word. Every property that decides a glyph's shape
   or its position must match the visible wordmark exactly — face, weight,
   size, tracking — or the knockout lands off the letters. Black in a mask
   means "hide", so the letters are what the plate does not cover.

   THE BASELINE IS THE ONE DERIVED NUMBER. SVG text is positioned from its
   baseline, and the HTML wordmark's baseline sits at
   (lineHeight − (ascent + descent)) / 2 + ascent from the top of its box —
   for Geist's metrics at line-height 0.8 that is 0.7389em, and the mask text's
   own bbox confirms its baseline is at y = 0 before the translate.
   Re-derive if the face, the weight or the line-height changes. */
.stmt__masktext {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: min(calc(var(--mon-span) / 4.125), calc(var(--mon-cap) * 1.0788));
  letter-spacing: -0.02em;
  fill: #000;
  transform: translateY(0.7389em);
}

/* The contour reuses the mask text's geometry wholesale — same class, so the
   two can never disagree about where a letter is — and only swaps the paint.
   0.012em matches »SPLETNA«'s stroke above the cut; text-stroke centres its
   width on the outline while SVG's stroke does too, so the two read as the
   same hairline at the same size. */
.stmt__contour {
  fill: none;
  stroke: var(--grafit);
  stroke-width: 0.012em;
}

/* --- the title block --------------------------------------------------------
   The sheet's register strip: a ruled band along the bottom edge, spanning the
   frame's full inner width, carrying the claim. */
.stmt__block {
  margin-top: auto;
  margin-inline: calc(var(--space-4) * -1);
  padding: var(--space-4) var(--space-4) 0;
  border-top: var(--divider-width) solid var(--mreza-strong);
}

.stmt__title {
  font-size: clamp(1.5rem, 1.05rem + 1.1vw, 2rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--grafit);
  max-width: 26ch;
}

.stmt__hl {
  /* Display-adjacent size, so the 3:1 floor applies — 5.37:1 on paper. */
  color: var(--rez);
}

/* --- desktop ---------------------------------------------------------------
   The sheet takes the whole first screen (less the masthead's in-flow strip),
   the courses stop short of the frame's right edge, and the leftover column is
   the composition's void — marked by the construction line where the type
   ends.

   78%, and the number is arithmetic rather than taste: at 1440×900 the sheet
   has 713px to work in, and everything that is NOT the two courses (the mark's
   clearance, the cut's gaps, the drawing's padding, the title block, the
   sheet's own frame padding) costs ~290px of it. That leaves ~420px for the
   pair, which is a 228px first course — and 78cqw lands there. Re-derive if
   any of those fixed costs change. */
/* Phones give BOTH top corners to marks: the pd stamp on the left and the menu
   control mirroring it on the right (SiteMasthead). The crop mark that would
   sit under the control overlaps it — the mark spans 24px down from the corner
   and the glyph's ink sits 29.6–45.6px down — so it stands down there, exactly
   as the stamp's own corner has no crop mark. Desktop has no such control and
   keeps all three. */
@media (max-width: 899.98px) {
  .stmt__crop--tr {
    display: none;
  }

  /* HALF THE AIR. The two `margin-top: auto`s split whatever the sheet has
     left over after its fixed costs equally above and below the drawing, so
     the free space IS the spacing and shrinking the sheet is what halves it.
     Measured at 375×812: the sheet stood at 585 (72svh) against 326px of fixed
     content — stamp clearance 51, drawing 170, title block 89, bottom padding
     16 — leaving 259 of free space, 129 above and 129 below. 56svh puts the
     sheet at 455, which is that same 326 plus 129: half the air, still split
     evenly. Desktop keeps its own min-height below and is untouched. */
  .stmt__sheet {
    min-height: 56svh;
  }
}

@media (min-width: 1200px) {
  .stmt__sheet {
    min-height: calc(100svh - 45px - 2 * var(--hero-inset));
    padding: calc(0.55 * var(--hero-display) + var(--space-6)) var(--space-8) var(--space-8);
  }

  .stmt__elevation {
    --mon-span: 78cqw;
    padding-block: var(--space-4);
  }

  .stmt__edge {
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: var(--mon-w);
    border-right: var(--divider-width) solid var(--mreza);
    pointer-events: none;
  }

  .stmt__block {
    margin-inline: calc(var(--space-8) * -1);
    padding: var(--space-6) var(--space-8) 0;
  }

  /* 30ch keeps the claim in two lines, which is what lets the sheet finish
     above the fold (measured). */
  .stmt__title {
    max-width: 30ch;
  }
}
</style>
