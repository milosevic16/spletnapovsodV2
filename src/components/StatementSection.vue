<script setup lang="ts">
/**
 * The opening band, composed to its own corners: the wordmark hard into the
 * top-left across TWO lines ([mark] Spletna / Povsod), the claim hard into the
 * bottom-right. One inset — `--hero-inset` — is the margin on all four sides,
 * so the two anchors sit diagonally opposite at the same distance from the
 * page edge.
 *
 * The band deliberately does NOT use `.container`: a centred 72rem measure
 * makes the left margin the page gutter PLUS half the leftover viewport (107px
 * at a 1265px screen, against ~17px above the wordmark), which is exactly the
 * mismatch this composition is meant to remove. The inset is measured from the
 * viewport instead, so left and top are the same number by construction.
 *
 * No JS: the only motion here is the arrival settle in base.css, once per
 * hard load.
 */
import { hero } from '@/content/home'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title
</script>

<template>
  <section class="stmt">
    <div class="stmt__grid">
      <!-- data-brand-sentinel is a contract with SiteMasthead: the phone bar
           appears exactly when this element leaves the screen, so the brand is
           never absent from the page. -->
      <p class="stmt__brand" data-brand-sentinel>
        <!-- The pd mark: two overlapping discs carrying Povsod's first and
             last letters; the d is the p rotated 180° (the mark's point
             symmetry). Sized in em, so it scales with the wordmark by
             construction; the left disc's edge is the viewBox edge, so the
             SVG's own left edge IS the composition's leftmost ink. Geometry
             pairs with the intro veil in index.html, whose flying mark lands
             exactly on this one — change either, change both. -->
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
        <span class="stmt__wordmark">Spletna</span>
        <span class="stmt__wordmark stmt__wordmark--2">Povsod</span>
      </p>

      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>
    </div>
  </section>
</template>

<style scoped>
/* The one margin — left, top, right and bottom — defined in tokens.css so the
   phone menu button can sit on the same inset as the wordmark beside it.
   PINNED light for now: the page root flips with the ground switch
   (tokens.css) and this section's inks are still the legacy constants — the
   pin comes off when the section joins the flip in its own redesign. */
.stmt {
  padding: var(--hero-inset);
  background: var(--list);
}

.stmt__grid {
  display: grid;
  gap: 1.35rem;
}

/* Two lines: [mark] Spletna / Povsod. A wrapping flex row breaks on each
   item's flex BASIS, so the break is forced rather than left to spare pixels
   (house rule) — the mark and »Spletna« share row one, »Povsod« takes row two
   at 100% basis. The font-size lives on the row, so the mark's em width tracks
   the wordmark. */
.stmt__brand {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
  row-gap: 0;
  /* Optical correction, not a nudge: the mark is 0.78em inside a 1em line box
     and centred, so its ink starts 0.11em below the padding edge — measured
     9.2px against a 62.7px left inset. Pulling the row up by exactly that puts
     the topmost ink on the same number as the leftmost ink, at every size. */
  margin-top: -0.11em;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 500;
  /* Cut and size come from tokens.css, because the masthead renders the same
     lettering when the menu is open and the two must be indistinguishable. */
  font-stretch: var(--hero-wordmark-wdth);
  font-size: var(--hero-wordmark);
  line-height: 1;
  letter-spacing: -0.025em;
  /* Keep the wordmark clear of the fixed menu button in the hero's corner. */
  padding-right: 3rem;
  /* The vertical stretch is a transform, so it adds no layout height of its
     own — this gives the extra half-em back at each end. */
  padding-block: calc((var(--hero-wordmark-scaley) - 1) * 0.5em);
}

/* Height carries the scale; the width follows the mark's own 244:144 ratio. */
.stmt__mark {
  height: 0.78em;
  width: auto;
  flex: 0 0 auto;
}

.stmt__wordmark {
  white-space: nowrap;
  /* Stretched about the centre, so the row's optical middle does not move and
     the mark stays centred on it. */
  transform: scaleY(var(--hero-wordmark-scaley));
  transform-origin: left center;
}

/* »Povsod« takes the whole second line — a deterministic basis, never a
   dependence on spare pixels. Its left edge lines up with the MARK's, so the
   two lines and the mark share one leading edge. */
.stmt__wordmark--2 {
  flex: 0 0 100%;
}

.stmt__hl {
  /* Display size, so the 3:1 large-text floor applies — 5.37:1 on paper. */
  color: var(--rez);
}

/* Phones: the claim and its qualifier step DOWN so the wordmark is
   unambiguously the largest thing on the screen — before this the h1 rendered
   34.3px against a 30.4px wordmark and the brand lost its own hero. */
.stmt__title {
  font-size: clamp(1.35rem, 0.95rem + 2.6vw, 2.4rem);
}

/* Desktop: the two anchors take opposite corners. The claim is right-aligned
   so its edge actually reaches the inset — left-aligned it rags ~80px short
   and stops reading as a corner. */
@media (min-width: 900px) {
  .stmt__grid {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: clamp(3rem, 9vw, 8rem);
    align-items: end;
  }

  .stmt__brand {
    grid-column: 1 / -1;
    grid-row: 1;
    align-self: start;
    /* No button in the row here — the wordmark takes the full measure. */
    padding-right: 0;
  }

  .stmt__title {
    grid-column: 13 / -1;
    grid-row: 2;
    text-align: right;
    font-size: clamp(2.2rem, 0.9rem + 2.8vw, 3.2rem);
    /* The mirror of the brand's correction: the last line's half-leading plus
       the font's descent leave the type sitting 5.6px inside a 62.7px inset.
       Keyed to the FONT's descent, not to this copy's glyphs — a last line
       with no descender must not shift the whole block. */
    margin-bottom: -0.11em;
  }
}
</style>
