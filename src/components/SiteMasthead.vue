<script setup lang="ts">
/**
 * The masthead is ONLY the four section buttons on a really narrow strip —
 * no logo, no domain readout. The brand lives in the opening band below
 * (StatementSection), REF-style. Transparent, so the paper runs unbroken
 * from the very top of the page down to the stage.
 */
import { nav } from '@/content/home'
</script>

<template>
  <header class="masthead">
    <div class="container masthead__row">
      <nav class="masthead__nav" aria-label="Glavna navigacija">
        <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="masthead__link">
          {{ item.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* Transparent: the page's own paper runs unbroken through the chrome. */
.masthead {
  color: var(--grafit);
  border-bottom: 1px solid var(--mreza);
}

.masthead__row {
  display: flex;
  justify-content: center;
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
  color: var(--grafit-2);
  text-decoration: none;
}

.masthead__link:hover {
  color: var(--rez);
}
</style>
