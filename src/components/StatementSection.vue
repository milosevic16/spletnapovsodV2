<script setup lang="ts">
/**
 * The opening band. The wordmark is the page's anchor: enlarged, hard into the
 * top-left corner, on its own row so it has the container's full width to be
 * big in. The claim and its qualifier sit right, below and across from it.
 *
 * The call to action is NOT here — it lives in the masthead strip, so the
 * band is purely the brand and the claim.
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
    <div class="container stmt__grid">
      <p class="stmt__brand">
        <!-- Brand mark: the sheet cut by the plane, the site's own motif.
             Sized in em, so it scales with the wordmark by construction. -->
        <svg class="stmt__mark" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor"
            stroke-width="1.5" />
          <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
          <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
        </svg>
        <span class="stmt__wordmark">SpletnaPovsod</span>
      </p>

      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>

      <p class="stmt__lead">{{ hero.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
/* Tight to the corner: just enough air under the strip for the caps to breathe. */
.stmt {
  padding-top: 0.85rem;
  padding-bottom: clamp(2rem, 1.5rem + 2vw, 3.25rem);
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
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  /* Sized to fill ~70% of the container's width at desktop — the wordmark is
     the corner anchor, so it is the largest thing on the page. The curve is
     fitted through two measured points (320px -> 27px, 1265px -> 83px) rather
     than guessed: the mark and wordmark never wrap, so a 320px screen must
     have real margin, and the obvious curve left only 7px — inside the range a
     font swap can move. */
  font-size: clamp(1.6rem, 0.52rem + 5.9vw, 6rem);
  line-height: 1;
  letter-spacing: -0.025em;
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

.stmt__lead {
  font-size: var(--fs-lead);
  line-height: 1.55;
  max-width: 46ch;
  color: var(--grafit-2);
}

/* Desktop: the wordmark takes row 1 across the full width — that width is what
   lets it be this large — and the claim block sits right, in the rows under it. */
@media (min-width: 900px) {
  .stmt {
    padding-top: 0.5rem;
    padding-bottom: clamp(2.5rem, 2rem + 2vw, 4rem);
  }

  .stmt__grid {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 0;
  }

  .stmt__brand {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .stmt__title {
    grid-column: 13 / -1;
    grid-row: 2;
    margin-top: clamp(1.75rem, 1rem + 3vw, 3.5rem);
    font-size: clamp(2.2rem, 0.9rem + 2.8vw, 3.2rem);
  }

  .stmt__lead {
    grid-column: 13 / -1;
    grid-row: 3;
    margin-top: 1.15rem;
    font-size: 1rem;
    line-height: 1.65;
  }
}
</style>
