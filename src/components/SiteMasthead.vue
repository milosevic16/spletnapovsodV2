<script setup lang="ts">
/**
 * The masthead is the four section buttons plus the call to action, centred on
 * a really narrow strip — no logo, no domain readout. The brand lives in the
 * opening band below (StatementSection), REF-style. Transparent, so the paper
 * runs unbroken from the very top of the page down to the stage.
 *
 * The CTA is a sibling of the nav, not a member of it: it points at the same
 * anchor as the »Kontakt« link, so it would be a duplicate stop inside a
 * navigation landmark. It carries the LINKS' styling, by the owner's call —
 * the page therefore has no filled-button emphasis anywhere above the fold.
 *
 * The strip's height is the 44px tap floor and nothing more.
 */
import { nav, hero } from '@/content/home'
</script>

<template>
  <header class="masthead">
    <div class="container masthead__row">
      <nav class="masthead__nav" aria-label="Glavna navigacija">
        <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="masthead__link">
          {{ item.label }}
        </a>
      </nav>

      <a :href="`#${hero.ctaPrimary.target}`" class="masthead__link masthead__cta">{{
        hero.ctaPrimary.label
      }}</a>
    </div>
  </header>
</template>

<style scoped>
/* Transparent: the page's own paper runs unbroken through the chrome. */
.masthead {
  color: var(--grafit);
  border-bottom: 1px solid var(--mreza);
}

/* Centred at every width. Phones cannot fit four links and the CTA on one
   44px row without breaking the tap floor, so they wrap to two centred rows —
   composed, not a stray wrap. The row gap stays 0, which keeps the strip at
   exactly two tap targets there and one here. */
.masthead__row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  /* Same as the nav's internal gap, so all five items are evenly spaced. */
  gap: 0 clamp(1rem, 4vw, 3rem);
}

.masthead__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: clamp(1rem, 4vw, 3rem);
}

/* The strip is visually narrow; the 44px tap floor lives on the links. */
.masthead__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.25rem;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 500;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--grafit-2); /* 6.74:1 on --list — measured */
  text-decoration: none;
}

.masthead__link:hover {
  color: var(--rez);
}

/* The CTA differs from the nav links in one respect only: it never breaks. */
.masthead__cta {
  white-space: nowrap;
}
</style>
