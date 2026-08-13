<script setup lang="ts">
/**
 * The opening band — A TITLE SHEET, and by now a sheet with nothing ruled on
 * it. It carried a hairline frame, crop marks at every corner, a construction
 * line down the right of the courses and a rule under the claim; all four are
 * gone on the owner's call, in that order. Over a film that furniture was
 * competing with the one line that carries meaning. What draws the band now is
 * the mark, the two courses, the red cut plane between them, and the claim —
 * the sheet is a measure and a padding rather than a box.
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
 * THE DRAWING. Two courses of monumental type in one flat ink, and nothing
 * else. They carried the page's press screen clipped into the letterforms, and
 * »Povsod« was a window onto this same clip seen through its glyphs; a red cut
 * plane with square end ticks divided them. All three devices are cancelled on
 * the owner's call — uniform colour, no texture, no knockout, no rule. The
 * band is the film, the mark, the two words and the claim.
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
      <!-- The corner stamp: the pd mark, punched into the frame. Two
           overlapping discs carrying Povsod's first and last letters; the d is
           the p rotated 180° (the mark's point symmetry). THE VEIL LANDS HERE
           — see the header comment before touching its size or position. -->
      <span class="stmt__stamp">
        <!-- THE CONSTRUCTION, redrawn against the owner's reference artwork:
             MEASURED OFF THE OWNER'S OWN ARTWORK (povsod.si/static/img/
             logo.png, 8× upscaled, subpixel edge scans, a least-squares circle
             fit on 66 arc points) — no more proportional guessing, which is
             what two earlier passes did and both were wrong. The numbers, with
             R the disc radius: box 312.4 × 200 (1.562 : 1); disc centres
             1.124 R apart; each bowl 0.108 R INSIDE its disc — toward the
             centre, not outward — mid radius 0.533 R under a 0.245 R stroke
             (outer 0.655, counter 0.410), so the two rings INTERLOCK, their
             arcs crossing at mid-height. Each bar stands left of its bowl at
             −0.634 R, one stroke wide, its foot FLUSH with the bowl's bottom —
             the real letters have no descender. The d is the p rotated 180°
             about the mark's centre (156.2, 100), so the pair shares a height
             by construction. The d is the
             p turned 180° about the mark's centre, so the two share a height
             by construction. Copied verbatim in SiteMasthead, ContactSection's
             seal, the intro veil and both icons — change one, change all. -->
        <svg class="stmt__mark" viewBox="0 0 312.4 200" aria-hidden="true">
          <circle cx="100" cy="100" r="100" fill="var(--rez)" />
          <circle cx="212.4" cy="100" r="100" fill="var(--rez)" />
          <circle cx="110.8" cy="100" r="53.3" fill="none" stroke="var(--list)" stroke-width="24.5" />
          <rect x="36.6" y="70" width="24.5" height="95.5" rx="12.25" fill="var(--list)" />
          <g transform="rotate(180 156.2 100)">
            <circle cx="110.8" cy="100" r="53.3" fill="none" stroke="var(--list)" stroke-width="24.5" />
            <rect x="36.6" y="70" width="24.5" height="95.5" rx="12.25" fill="var(--list)" />
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
  /* NO FRAME. The sheet was drawn as a ruled rectangle with crop marks at its
     corners and a rule under the claim — drafting furniture that made sense
     when the band was paper. Over the film it was three kinds of line competing
     with the one line that means something, and it is all gone on the owner's
     call. What is left draws itself: the mark, the two courses, the red cut,
     the claim. The sheet is now a measure and a padding, not a box.

     The padding stays: it is what holds the ink off the band's edges, and the
     stamp's clearance term is what the veil's landing formula reads. */
  padding: calc(0.55 * var(--hero-display) + var(--space-4)) var(--space-4) var(--space-4);
  /* Short of the fold ON PURPOSE (phones): the work below has to show through,
     so the hero ends where the next thing begins. Desktop takes the full
     screen below. */
  min-height: 72svh;
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
  /* Flush with the corner, full stop. It used to be pulled out by the frame's
     own border width, because an absolute box resolves against the PADDING box
     and the veil lands on --hero-inset — the frame's OUTER corner. With the
     frame gone the padding box IS that corner, so the compensation goes with
     it or the mark sits 1px outside the formula the veil copies. */
  left: 0;
  top: 0;
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
  /* The ONE flexible margin on the sheet: all free space collects above, so
     the drawing and its claim stand together at the foot (the title block's
     margin is a fixed step — see .stmt__block). */
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
  /* A deliberate step, not a flexible one (owner's call): the drawing stands
     close over its claim at every width, and the sheet's free space pools
     above the pair. This used to be `auto`, splitting the void with the
     elevation's auto and floating the drawing mid-band — phones dropped that
     first, and the owner then asked the title down to the claim everywhere. */
  margin-top: var(--space-6);
  margin-inline: calc(var(--space-4) * -1);
  padding: var(--space-4) var(--space-4) 0;
}

.stmt__title {
  /* One notch under the original clamp(1.5rem, 1.05rem + 1.1vw, 2rem) —
     "scale down the subtitle just a bit" (owner), ~10% across the range. */
  font-size: clamp(1.35rem, 0.95rem + 1vw, 1.8rem);
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
  /* HALF THE AIR, restored (owner's call, second reversal — seen on a phone,
     the 72% band read too tall and the previous proportions came back). The
     sheet's fixed costs plus half the free space land it at 56svh; the 72svh
     reference-ratio experiment lived here for one round and is in the history
     if it is ever wanted again. */
  .stmt__sheet {
    min-height: 56svh;
  }

  /* THE DRAWING DROPS TO THE CLAIM (owner's call — phones first, the base
     followed with a wider step, and the owner then asked the phone TIGHTER
     still). The gap between the glyphs and the claim is three stacked
     spacings, and all three shrink here: the flexible step goes to zero, and
     the two paddings either side of the boundary drop to space-2 — measured
     40px of visual gap at 375 before this pass, ~16px after. The film keeps
     the void above, which is the right thing for a band that IS the film. */
  .stmt__block {
    margin-top: 0;
    padding-top: var(--space-2);
  }

  /* SPLETNA STEPS BACK A SIZE, restored with the rest of the previous
     proportions (the flush full-measure pair lived one round and was reversed
     with the 72% hero). The upper course takes 0.85 of the span and stops
     short from the shared left edge, the void opening on its right — the
     composition the desktop band also uses. 1 restores the flush exactly. */
  .stmt__elevation {
    --drawn-share: 0.85;
    /* The second of the three spacings between the glyphs and the claim (the
       other two live on .stmt__block above) — the base clamp resolves to 16px
       here, and the owner asked the pair tighter. */
    padding-block-end: var(--space-2);
  }

  .stmt__course--drawn {
    font-size: min(
      calc(var(--mon-span) * var(--drawn-share) / 4.4502),
      calc(var(--mon-cap) * var(--drawn-share))
    );
  }

  /* No phone size of its own any more: the 18px "between" step was reversed
     with the rest — the base clamp's floor (21.6px at phone widths) is the
     previous proportion the owner asked back. */
}

/* THE MARK STANDS AT THE SHEET'S TOP-RIGHT on desktop, not its top-left. The
   two courses are left-aligned and stop well short of the frame, so the right
   of the sheet is the composition's void; the mark fills it, and the corner it
   takes is the one corner the drawing never reaches. The crop mark that stood
   there steps aside for it, exactly as the top-left one used to.

   IT IS STILL A CORNER, and that is what keeps the intro veil expressible: both
   of its coordinates are insets from a viewport edge, so index.html can copy
   them as a formula (left = 100% − inset − the mark's own width, which is
   312.4/200 of its height). A position hung off the drawing's own centre would
   not be — change this and the veil's desktop landing changes with it. */
@media (min-width: 900px) {
  .stmt__stamp {
    left: auto;
    right: calc(var(--divider-width) * -1);
    padding: 0 0 var(--space-3) var(--space-3);
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
