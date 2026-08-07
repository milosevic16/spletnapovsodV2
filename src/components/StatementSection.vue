<script setup lang="ts">
/**
 * The opening band, composed to its own corners: the wordmark hard into the
 * top-left, the claim hard into the bottom-right, the qualifier to the claim's
 * left. One inset — `--hero-inset` — is the margin on all four sides, so the
 * two anchors sit diagonally opposite at the same distance from the page edge.
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
        <!-- Brand mark: the sheet cut by the plane, the site's own motif.
             Sized in em, so it scales with the wordmark by construction. Its
             red rule spans the full viewBox, so the SVG's own left edge IS the
             composition's leftmost ink — no optical correction needed. -->
        <svg class="stmt__mark" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor"
            stroke-width="1.5" />
          <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
          <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
        </svg>
        <span class="stmt__wordmark">SpletnaPovsod</span>
      </p>

      <!-- DOM order is the logical one — claim, then qualifier — while the
           grid seats the qualifier to its left. Assistive tech reads the h1
           first; the eye meets the lead first. -->
      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>

      <p class="stmt__lead">{{ hero.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
/* The one margin — left, top, right and bottom — defined in tokens.css so the
   phone menu button can sit on the same inset as the wordmark beside it. */
.stmt {
  padding: var(--hero-inset);
}

.stmt__grid {
  display: grid;
  gap: 1.35rem;
}

/* The font-size lives on the row, so the mark's em width tracks the wordmark. */
.stmt__brand {
  display: flex;
  align-items: center;
  gap: 0.5em;
  /* Optical correction, not a nudge: the mark is 0.78em inside a 1em line box
     and centred, so its ink starts 0.11em below the padding edge — measured
     9.2px against a 62.7px left inset. Pulling the row up by exactly that puts
     the topmost ink on the same number as the leftmost ink, at every size. */
  margin-top: -0.11em;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  /* Phones: fitted to the width left once the menu button has taken the
     corner (viewport − 2 insets − 3rem), with margin at every step — the mark
     and wordmark never wrap, so an overflow here is permanent. Desktop
     overrides this below, where there is no button in the row. */
  font-size: clamp(1.5rem, -0.49rem + 10.6vw, 5rem);
  line-height: 1;
  letter-spacing: -0.025em;
  /* Keep the wordmark clear of the fixed menu button in the hero's corner. */
  padding-right: 3rem;
}

.stmt__mark {
  width: 0.78em;
  height: 0.78em;
  flex: 0 0 auto;
}

.stmt__wordmark {
  white-space: nowrap;
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

.stmt__lead {
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 46ch;
  color: var(--grafit-2);
}

/* Desktop: the two anchors take opposite corners. Row 2 bottom-aligns, so the
   claim's last line and the lead's last line share a baseline band, and the
   claim is right-aligned so its edge actually reaches the inset — left-aligned
   it rags ~80px short and stops reading as a corner. */
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
    font-size: clamp(1.6rem, 0.52rem + 5.9vw, 6rem);
  }

  .stmt__lead {
    font-size: 1rem;
    line-height: 1.65;
  }

  .stmt__lead {
    grid-column: 1 / span 10;
    grid-row: 2;
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
