<script setup lang="ts">
/**
 * The opening band — A TITLE SHEET. The whole hero is one drafting sheet: a
 * hairline frame inset from the page edges, crop marks at its corners, and a
 * title block along the bottom carrying the claim. The brand name is the
 * drawing on it. (A construction line used to run down the right of the
 * courses, where the type stops; it is gone on the owner's call — the frame,
 * the crop marks and the cut plane are enough furniture for one sheet.)
 *
 * THE BAND IS A FILM. The clip fills the whole hero, edge to edge, untreated —
 * its own brightness, its own colour — and the sheet is drawn on top of it.
 * That is the owner's call and it has a cost, measured and recorded on
 * .stmt__wordmark: this footage carries near-white wall and a near-black block
 * in the same frame, so no flat ink clears AA against every part of it.
 *
 * THE MARK IS THE SHEET'S CORNER STAMP, and which corner depends on the screen.
 * DESKTOP: the top-RIGHT, because the two courses are left-aligned and stop
 * well short of the frame, so the right of the sheet is the composition's void
 * and the mark is what fills it; the crop mark that stood there steps aside.
 * PHONES: the top-LEFT, unchanged — there is no header over the hero on a
 * phone, only the menu control floating in the opposite corner, so the sheet's
 * own stamp is the brand and the control mirrors it.
 * Both positions are CORNERS on purpose, because that is what keeps the intro
 * veil's landing expressible as a formula rather than a measurement: every
 * coordinate is an inset from a viewport edge. index.html copies them as
 * literals — change either, change both.
 *
 * THE DRAWING. Two courses of monumental type divided by the site's cut plane,
 * set in one flat ink. They carried the page's press screen clipped into the
 * letterforms, and below the cut »Povsod« was a window onto this same clip seen
 * through its glyphs; both devices are cancelled — uniform colour, no texture,
 * no knockout. One red rule with square end ticks, exactly as wide as the
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
 * The only JavaScript is the one that starts the film, and it is not load-
 * bearing: the <video> ships in the markup with its poster and no autoplay, so
 * a JS-off or reduced-motion visitor gets the same composition with the film
 * held on one frame. Nothing is hidden and nothing is revealed. On phones the
 * sheet deliberately stops short of the fold so the work below shows through —
 * a hero that ends where the next thing begins; on desktop --hero-reveal does
 * the same job deliberately, standing the band clear of the fold.
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

/** PAIRED with BANDS['hero-fill'] in scripts/build-pillar-videos.mjs.
 *  /video/* is immutable-cached, so a re-encode must bump both. */
const CLIP_VERSION = 'v1'
const clip = (ext: string) => `/video/hero-fill-${CLIP_VERSION}.${ext}`

const fx = createFx()
const rootEl = ref<HTMLElement | null>(null)

onMounted(() => {
  // The film is NOT gated on hydration: it ships in the markup with its poster,
  // so with JS off the hero is that still frame under the same treatment — a
  // complete hero rather than an empty dark band. All JS does is start it.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  nextTick(() => {
    const v = rootEl.value?.querySelector<HTMLVideoElement>('.stmt__film')
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
    <!-- THE HERO IS THE FILM. The same clip that used to be seen through the
         word »POVSOD« now fills the whole band, edge to edge, and everything
         else is drawn on top of it. It ships in the markup rather than behind a
         hydration flag: a <video> with a poster and no autoplay IS a still
         image, so the JS-off hero is the same composition with the film held on
         one frame — which is also exactly what a reduced-motion visitor gets. -->
    <video
      class="stmt__film"
      :poster="clip('jpg')"
      muted
      loop
      playsinline
      preload="metadata"
      disablepictureinpicture
      aria-hidden="true"
      tabindex="-1"
    >
      <source :src="clip('webm')" type="video/webm" />
      <source :src="clip('mp4')" type="video/mp4" />
    </video>
    <!-- The sheet. data-brand-sentinel is a contract with SiteMasthead: the
         phone bar appears exactly when this element leaves the screen, so the
         brand is never absent from the page. -->
    <div class="stmt__sheet" data-brand-sentinel>
      <!-- Crop marks on the free corners. Desktop gives the top-right to the
           mark and keeps the other three; a phone has no stamp on the sheet at
           all and keeps all four. -->
      <span class="stmt__crop stmt__crop--tl" aria-hidden="true"></span>
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
        <p class="stmt__course stmt__course--drawn">
          <span class="stmt__wordmark">{{ WORD_1 }}</span>
        </p>

        <!-- The cut plane: one red rule, square end ticks, exactly as wide as
             the courses it divides. -->
        <span class="stmt__cut" aria-hidden="true"></span>

        <p class="stmt__course stmt__course--solid">
          <!-- The film used to be seen only through these letterforms; it is
               the whole band now, so the word is simply set in it. -->
          <span class="stmt__wordmark">{{ WORD_2 }}</span>
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
  /* ONE FLAT LINE COLOUR for the whole sheet — frame, crop marks, the rule
     under the claim. It was paper at 55% while the film was darkened, so that
     it composited into whatever passed behind it; with the film untreated the
     lines take the same ink the type does and stay one colour everywhere. */
  --sheet-line: var(--grafit);
  /* THE GROUND UNDER THE FILM, and it has to be a real one: it is what a
     visitor sees for the moment before the poster decodes, and what fills any
     part of the band `cover` cannot reach. The film runs untreated and this
     footage is paper-toned, so the ground is the page's own second paper —
     a light band that goes on being a light band if the film never arrives. */
  background: var(--list-2);
  padding: var(--hero-inset);
}

/* --- the film ---------------------------------------------------------------
   Edge to edge under everything. `cover` has two very different jobs here: a
   phone hero is roughly 0.55:1 against the clip's 0.60:1, so it shows very
   nearly the whole frame, while a desktop hero is about 2.4:1 and takes a
   horizontal band out of the middle. The encode is the full frame precisely so
   both have material to take (scripts/build-pillar-videos.mjs, BANDS.hero-fill).

   NO TREATMENT AT ALL, on the owner's call: the film runs at its own
   brightness and its own colour. What that costs is recorded on .stmt__wordmark
   — this footage carries both near-white wall and a near-black block in the
   same frame, so no single ink can clear AA against every part of it, and the
   type is set for the wall because that is what most of the band is. */
.stmt__film {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  pointer-events: none;
}

/* --- the sheet --------------------------------------------------------------
   The frame is inset by exactly --hero-inset, which is what puts its top-left
   corner where the veil lands the mark. */
.stmt__sheet {
  position: relative;
  /* Above the film and its tint. */
  z-index: 1;
  display: flex;
  flex-direction: column;
  /* The dark world's own hairline: the frame is drawn ON the film now, so it
     takes the line colour the rest of the page's dark bands use. */
  border: var(--divider-width) solid var(--sheet-line);
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
.stmt__crop--tl {
  top: 0;
  left: 0;
  border-top: var(--divider-width) solid var(--sheet-line);
  border-left: var(--divider-width) solid var(--sheet-line);
  margin: -1px 0 0 -1px;
}
.stmt__crop--tr {
  top: 0;
  right: 0;
  border-top: var(--divider-width) solid var(--sheet-line);
  border-right: var(--divider-width) solid var(--sheet-line);
  margin: -1px -1px 0 0;
}
.stmt__crop--bl {
  bottom: 0;
  left: 0;
  border-bottom: var(--divider-width) solid var(--sheet-line);
  border-left: var(--divider-width) solid var(--sheet-line);
  margin: 0 0 -1px -1px;
}
.stmt__crop--br {
  bottom: 0;
  right: 0;
  border-bottom: var(--divider-width) solid var(--sheet-line);
  border-right: var(--divider-width) solid var(--sheet-line);
  margin: 0 -1px -1px 0;
}

/* The stamp sits ON the corner: its own patch of paper punches the frame's
   two lines, so the mark reads as part of the sheet's furniture rather than as
   an object fenced above it. The padding extends the paper past the ink on the
   inside edges only — the ink's top-left stays exactly on the corner, which is
   the veil's landing formula. */
.stmt__stamp {
  /* The sheet's top-LEFT corner, which is where a phone keeps it. Desktop moves
     it across to the right — see the block at the end. */
  position: absolute;
  /* Pulled out by the border's own width: an absolute box is positioned
     against the PADDING box, so `0` would sit the ink one border inside the
     frame — and the veil lands on --hero-inset exactly, which is the frame's
     OUTER corner. Measured: 21px against a 20px inset before this. */
  left: calc(var(--divider-width) * -1);
  top: calc(var(--divider-width) * -1);
  padding: 0 var(--space-3) var(--space-3) 0;
  /* NO PATCH ON THE FILM. Punching the frame with a rectangle of the band's
     own fill was right while the band was flat paper; over a moving image any
     solid rectangle reads as exactly the patch that comment warned about. The
     frame's two lines run under the mark instead — which is what a stamp on a
     real sheet does anyway. */
  background: transparent;
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

   THE CAP HAS TWO JOBS AND SO IT HAS TWO TERMS. 16rem stops the type growing
   without bound on very wide screens. The svh term is the one that keeps the
   CLAIM ABOVE THE FOLD: the sheet is the viewport's height minus its fixed
   costs, and the drawing is the only part of it that scales, so on a short
   screen the courses are what push the title block past the bottom edge —
   measured at 1440×760, the claim's last line sat 6px below the fold. Tying
   the cap to viewport height makes the drawing give way instead of the claim.
   22svh was chosen against measurement, not taste: 25 still left the claim
   6px under the fold at 1280×650, which is the short-laptop case the report
   came from. At 22 the term is inert above ~970px of viewport height (the
   width term wins there, so a tall screen is unchanged) and the claim clears
   the fold with room at 650, 700 and 760. Both caps carry the same
   4.4502 : 4.125 relation, so capping — by either term — never breaks the
   flush. */
.stmt__elevation {
  position: relative;
  container-type: inline-size;
  --mon-span: 100cqw;
  --mon-cap: min(16rem, 22svh);
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

/* THE COURSES ARE FLAT INK, on the owner's call. They carried the press
   screen clipped into the letterforms — the page's own pressed stock showing
   through the glyphs — and that device is cancelled here: one uniform colour,
   no texture, which also retires the background-clip:text guard that existed
   only to carry it.

   WHICH ink is decided by the footage, not by the palette. The film is
   untreated and it is a paper-toned wall for most of its frame, so the type is
   the page's own graphite and reads as ink on that wall. Where the clip's
   graphite block passes behind a letter the two are near enough the same value
   that the letter stops reading — measured on the built page below. That is the
   cost of running the film untreated and it is stated rather than hidden. */

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

/* --- the title block --------------------------------------------------------
   The sheet's register strip: a ruled band along the bottom edge, spanning the
   frame's full inner width, carrying the claim. */
.stmt__block {
  margin-top: auto;
  margin-inline: calc(var(--space-4) * -1);
  padding: var(--space-4) var(--space-4) 0;
  border-top: var(--divider-width) solid var(--sheet-line);
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
  /* Display-adjacent size (24px+), so the 3:1 floor applies. */
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
/* A PHONE HAS NO HEADER OVER THE HERO — owner's call, and the film is the
   reason: a bar across the top cut the band off from the screen's edge, and the
   whole point of the film is that it runs to it. So the chrome up here is the
   menu control alone, floating on the sheet (SiteMasthead), and the brand stays
   where it was, stamped on the sheet's own top-left corner.

   That gives BOTH top corners to marks — the stamp on the left, the control
   mirroring it on the right — so both crop marks stand down there. The one
   under the control would overlap it (the mark spans 24px down from the corner
   and the glyph's ink sits 29.6–45.6px down), and the one under the stamp has
   the stamp on it. Desktop keeps its top-left mark and gives only the right
   corner away, because there the stamp has crossed the sheet. */
@media (max-width: 899.98px) {
  .stmt__crop--tl,
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

/* THE MARK STANDS AT THE SHEET'S TOP-RIGHT on desktop, not its top-left. The
   two courses are left-aligned and stop well short of the frame, so the right
   of the sheet is the composition's void; the mark fills it, and the corner it
   takes is the one corner the drawing never reaches. The crop mark that stood
   there steps aside for it, exactly as the top-left one used to.

   IT IS STILL A CORNER, and that is what keeps the intro veil expressible: both
   of its coordinates are insets from a viewport edge, so index.html can copy
   them as a formula (left = 100% − inset − the mark's own width, which is
   244/144 of its height). A position hung off the drawing's own centre would
   not be — change this and the veil's desktop landing changes with it. */
@media (min-width: 900px) {
  .stmt__stamp {
    left: auto;
    right: calc(var(--divider-width) * -1);
    padding: 0 0 var(--space-3) var(--space-3);
  }

  .stmt__crop--tr {
    display: none;
  }
}

@media (min-width: 1200px) {
  /* THE BAND STOPS SHORT OF THE FOLD. It used to end exactly on it — sheet +
     the section's two insets + the masthead's 45px strip summed to 100svh — so
     the band's own bottom edge was the last thing on the screen and the rule
     that opens the next section sat just under it, invisible until you
     scrolled. --hero-reveal is what it gives back: the height comes off the
     sheet, so the section ends that much higher and the next section's top
     shows as a band of what follows. It is the ONE number to turn if the hero
     should breathe more or less; nothing else is derived from it. */
  .stmt__sheet {
    --hero-reveal: 5rem;
    min-height: calc(100svh - 45px - 2 * var(--hero-inset) - var(--hero-reveal));
    padding: calc(0.55 * var(--hero-display) + var(--space-6)) var(--space-8) var(--space-8);
  }

  .stmt__elevation {
    --mon-span: 78cqw;
    padding-block: var(--space-4);
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
