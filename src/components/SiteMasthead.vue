<script setup lang="ts">
/**
 * The masthead is the four section buttons plus the page's single call to
 * action, on a really narrow strip — no logo, no domain readout. The brand
 * lives in the opening band below (StatementSection), REF-style. Transparent,
 * so the paper runs unbroken from the very top of the page down to the stage.
 *
 * The strip's height is the 44px tap floor and nothing more: the CTA is a
 * 44px-tall button, so carrying it costs no height.
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

      <a :href="`#${hero.ctaPrimary.target}`" class="masthead__cta">{{ hero.ctaPrimary.label }}</a>
    </div>
  </header>
</template>

<style scoped>
/* Transparent: the page's own paper runs unbroken through the chrome. */
.masthead {
  color: var(--grafit);
  border-bottom: 1px solid var(--mreza);
}

/* Phones cannot fit four links and the CTA on one 44px row without breaking
   the tap floor, so they get two centred rows — composed, not a stray wrap.
   The row gap stays 0, which keeps the strip at exactly two tap targets. */
.masthead__row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0 1.5rem;
}

.masthead__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: clamp(1rem, 4vw, 3rem);
}

/* One row from here up: nav to the left edge, CTA to the right. */
@media (min-width: 900px) {
  .masthead__row {
    justify-content: space-between;
  }
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
  color: var(--grafit-2);
  text-decoration: none;
}

.masthead__link:hover {
  color: var(--rez);
}

/* The one conversion element on the page. 44px tall, so it sets the strip's
   height rather than adding to it. */
.masthead__cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 1.1rem;
  background: var(--rez);
  color: #fff; /* 6.01:1 on --rez — measured */
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--t-lift) var(--ease-out);
}

.masthead__cta:hover {
  background: var(--rez-deep);
}
</style>
