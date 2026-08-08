<script setup lang="ts">
/**
 * The opening band — the brand name as an ARCHITECTURAL ELEVATION.
 *
 * Two courses of monumental type, flush to each other, separated by the site's
 * own cut plane: above the cut »Spletna« is DRAWN (outlined letterforms — the
 * elevation, what you see), below it »Povsod« is BUILT (solid ink — the poché,
 * the cut matter that holds it up). One red rule with square end ticks divides
 * them. That is the whole thesis of the site stated in its own name, with no
 * animation, no second layer and nothing to reveal.
 *
 * THE COURSES ARE FLUSH BY ARITHMETIC, not by eye. Measured once at 100px in
 * the real faces (Geist 400, uppercase, ls −0.02em, with the script splice on
 * the »od« tail): »Spletna« sets 4.218em wide, »Povsod« 3.118em. That ratio is
 * a property of the strings, not of the size, so dividing one target width by
 * each constant makes the two words span EXACTLY the same measure at every
 * viewport. Re-measure both constants if the lettering, the tracking or either
 * face ever changes.
 *
 * THE MARK is the intro veil's landing target and the composition's datum. It
 * stands alone on the section's inset, so its SVG box IS its ink: ink-left =
 * ink-top = --hero-inset (+ the 45px desktop masthead strip), ink-height =
 * 0.55em of --hero-display. The veil (index.html) copies those as literals —
 * change either, change both. --hero-display now sizes NOTHING ELSE, which is
 * what keeps that pairing safe from the monument's own sizing.
 *
 * There is no JavaScript in this section and nothing to reveal: no scan, no
 * x-ray, no drift, no hover ornament. The rendered composition is the whole
 * design, identical with JS off and under reduced motion. (The page's arrival
 * settle still applies through base.css's html[data-intro] hooks, which is the
 * veil handoff, not an effect of this component.)
 */
import { hero } from '@/content/home'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

/** The two courses. The script splice takes the »od« tail of the second word —
 *  one run, never the first glyph (the art direction's rule), derived from the
 *  literal so a lettering change degrades to the plain word. */
const WORD_1 = 'Spletna'
const WORD_2 = 'Povsod'
const SPLICE_RUN = 'od'
const spliceAt = WORD_2.endsWith(SPLICE_RUN) ? WORD_2.length - SPLICE_RUN.length : -1
const word2Head = spliceAt > 0 ? WORD_2.slice(0, spliceAt) : WORD_2
const word2Run = spliceAt > 0 ? SPLICE_RUN : ''
</script>

<template>
  <section class="stmt">
    <!-- data-brand-sentinel is a contract with SiteMasthead: the phone bar
         appears exactly when this element leaves the screen, so the brand is
         never absent from the page. -->
    <div class="stmt__brand" data-brand-sentinel>
      <!-- The pd mark: two overlapping discs carrying Povsod's first and last
           letters; the d is the p rotated 180° (the mark's point symmetry).
           THE VEIL'S LANDING FORMULA copies this box exactly — see the header
           comment before touching its size or its position. -->
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
    </div>

    <!-- The datum: the drawing's first rule, full bleed. -->
    <span class="stmt__rule stmt__rule--datum" aria-hidden="true"></span>

    <!-- THE ELEVATION. A container query context: both courses size themselves
         from THIS box's inline width, so they are flush to each other and to
         the measure without measuring anything at runtime. -->
    <div class="stmt__elevation">
      <!-- The construction line: a box exactly as wide as the courses, showing
           only its right edge — the line the type stops on. A CHILD, not a
           pseudo-element of the container: container-query units cannot query
           the container they are declared on, so `cqw` inside
           `.stmt__elevation::after` silently fell back to the viewport. -->
      <span class="stmt__edge" aria-hidden="true"></span>

      <p class="stmt__course stmt__course--drawn">
        <span class="stmt__wordmark">{{ WORD_1 }}</span>
      </p>

      <!-- The cut plane: the site's signature — one red rule, square end
           ticks, exactly as wide as the courses it divides. -->
      <span class="stmt__cut" aria-hidden="true"></span>

      <p class="stmt__course stmt__course--solid">
        <span class="stmt__wordmark"
          >{{ word2Head }}<span v-if="word2Run" class="stmt__script">{{ word2Run }}</span></span
        >
      </p>
    </div>

    <!-- The claim, hung under its own rule in the void at the foot. -->
    <div class="stmt__foot">
      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>
    </div>
  </section>
</template>

<style scoped>
/* PINNED light: the page root flips with the ground switch and this section's
   inks are the paper world's. `overflow: clip` is load-bearing, not tidiness:
   the courses are sized so the REAL faces span the measure exactly, and for
   the instant before the webfont swaps, the metric-matched fallback's wider
   advances would push the ink past the margin. */
.stmt {
  position: relative;
  overflow: clip;
  background: var(--list);
  padding: var(--hero-inset);
  /* Clear the desktop masthead's in-flow strip (paired with the veil's
     landing formula, which carries the same 45px). */
  min-height: calc(100svh - 45px);
  display: flex;
  flex-direction: column;
}

/* --- the datum ------------------------------------------------------------- */
/* The mark stands alone: its box IS its ink, which is what makes the veil's
   landing exact. Nothing else may share this row — a sibling would change the
   mark's own top. */
.stmt__brand {
  display: flex;
  /* Clear the phone menu button standing in the top-right corner. */
  padding-right: 3rem;
}

.stmt__mark {
  height: 0.55em;
  width: auto;
  font-size: var(--hero-display);
}

/* Full-bleed rules: they escape the section's inset so the elevation reads as
   courses in a wall rather than boxes on a page. */
.stmt__rule {
  display: block;
  height: var(--divider-width);
  background: var(--mreza-strong);
  margin-inline: calc(var(--hero-inset) * -1);
}

.stmt__rule--datum {
  margin-top: clamp(0.75rem, 1.1vw, 1rem);
}

/* --- the elevation ---------------------------------------------------------
   THE SIZING. `--mon-span` is the width both courses span; each course divides
   it by its own measured em-width (see the header comment), so both land on
   exactly that width. cqw, not vw: the container's inline size excludes the
   scrollbar and the section's padding, so the ink lands inside the margin by
   construction rather than by subtraction.

   The cap stops the type growing without bound on very wide screens; because
   both caps carry the same 4.218 : 3.118 relation, capping never breaks the
   flush. */
.stmt__elevation {
  position: relative;
  container-type: inline-size;
  --mon-span: 100cqw;
  --mon-cap: 15rem;
  /* The courses' shared width, for anything that must align to where the type
     ends. Declared here but RESOLVED in the children that use it, which is the
     only context where cqw can see this container. */
  --mon-w: calc(min(calc(var(--mon-span) / 4.218), var(--mon-cap)) * 4.218);
  /* auto ABOVE and auto on the foot below: the free space divides equally, so
     the elevation floats centred in its own field instead of the void pooling
     in one place. The padding is the floor the auto margin cannot give — an
     auto margin resolves to 0 when space runs out. */
  margin-top: auto;
  padding-top: clamp(1rem, 1.8vw, 1.75rem);
}

/* Hidden by default: on a phone the courses already reach both margins, so a
   line at their right edge would just double the margin. Desktop turns it on. */
.stmt__edge {
  display: none;
}

.stmt__course {
  margin: 0;
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--grafit);
  /* The 0.8 line-height crops the caps' own box; a hair of leading keeps the
     rule off the letterforms. */
  padding-block: 0.04em;
}

/* »Spletna« — 4.218em wide in the real face (measured). */
.stmt__course--drawn {
  font-size: min(calc(var(--mon-span) / 4.218), var(--mon-cap));
}

/* »Povsod« with the script tail — 3.118em wide (measured). The cap carries the
   same ratio (15rem × 4.218 / 3.118 = 20.29rem) so the two stay flush. */
.stmt__course--solid {
  font-size: min(calc(var(--mon-span) / 3.118), calc(var(--mon-cap) * 1.353));
}

/* ABOVE THE CUT the word is DRAWN: outlined letterforms, the elevation. The
   stroke is in em so its weight tracks the type at every size. Gated on
   @supports because the fill only goes transparent where a stroke will
   actually be painted — without the guard an unsupporting engine would render
   the brand name invisible. */
@supports (-webkit-text-stroke: 1px currentColor) {
  .stmt__course--drawn .stmt__wordmark {
    -webkit-text-stroke: 0.013em var(--grafit);
    color: transparent;
  }
}

/* BELOW THE CUT it is BUILT: solid ink poché. */
.stmt__course--solid {
  color: var(--grafit);
}

/* The cut plane, exactly as wide as the courses: the red rule and its two
   square end ticks — the site's own motif, at the composition's centre. */
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
}

/* The splice: the script face at the same size, lowercase against the caps,
   lh 1 / ls 0 — the measured convention. */
.stmt__script {
  font-family: var(--font-script);
  font-weight: 400;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
}

/* --- the claim -------------------------------------------------------------
   The void between the elevation and the foot is RULED, which is what makes it
   read as a composed field rather than a gap. */
.stmt__foot {
  margin-top: auto;
  padding-top: clamp(1rem, 1.8vw, 1.5rem);
  border-top: var(--divider-width) solid var(--mreza-strong);
  margin-inline: calc(var(--hero-inset) * -1);
  padding-inline: var(--hero-inset);
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
   The courses stop short of the right margin and the leftover column is the
   composition's void — the archetype's empty spacer, marked by one vertical
   construction line where the type ends. */
@media (min-width: 1200px) {
  /* The courses stop short of the right margin and the leftover column is the
     composition's void — the archetype's empty spacer.

     64%, not more: the whole band has to fit the first screen, and the courses
     are the only elastic part of it. Measured at 1440×900 — everything that is
     NOT the two courses (inset, mark, rules, gaps, claim) costs ~450px of the
     855px available, which leaves room for a 195px first course. 64cqw lands
     at 195. Re-measure that fixed cost if the mark, the claim or the gaps
     change. */
  .stmt__elevation {
    --mon-span: 64cqw;
  }

  /* The line the type stops on: a box the courses' own width, showing only its
     right edge. It states a real fact about the composition (where the type
     ends and the void begins) rather than decorating it. */
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

  /* 30ch, not tighter: it is what sets the claim in TWO lines instead of
     three, and that one line is the last 32px the band needs to finish above
     the fold (measured — 880px at a 22ch measure against an 855px budget). */
  .stmt__title {
    max-width: 30ch;
  }
}

/* --- phone -----------------------------------------------------------------
   Same composition, no reflow of its logic: the courses simply span the whole
   measure (--mon-span is already 100cqw), which is what makes a 375px screen
   read as monumental rather than as a shrunken desktop. */
@media (max-width: 899.98px) {
  .stmt {
    min-height: 100svh;
  }
}
</style>
