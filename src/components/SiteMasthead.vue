<script setup lang="ts">
/**
 * The masthead sits inside the opening band rather than as a bar above it:
 * a large wordmark anchoring the top-left, the nav and the domain readout
 * riding the same line to the right. Transparent, so the band's paper ground
 * runs unbroken from the very top of the page down to the stage.
 */
import { nav } from '@/content/home'
</script>

<template>
  <header class="masthead">
    <div class="container masthead__row">
      <a href="/" class="masthead__brand" aria-label="SpletnaPovsod — domov">
        <!-- Brand mark: the sheet cut by the plane, the site's own motif -->
        <svg
          class="masthead__mark"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
          fill="none"
        >
          <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor"
            stroke-width="1.5" />
          <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
          <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
        </svg>
        <span class="masthead__wordmark">SpletnaPovsod</span>
      </a>

      <nav class="masthead__nav" aria-label="Glavna navigacija">
        <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="masthead__link">
          {{ item.label }}
        </a>
      </nav>

      <span class="masthead__domain emisija" aria-hidden="true">spletnapovsod.si</span>
    </div>
  </header>
</template>

<style scoped>
/* Transparent: the wash painted on #app runs unbroken through the chrome. */
.masthead {
  color: var(--grafit);
}

.masthead__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 3.5rem;
  padding-top: 0.5rem;
}

.masthead__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px; /* tap target */
  text-decoration: none;
}

.masthead__wordmark {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.005em;
}

.masthead__nav {
  display: none;
}

.masthead__domain {
  display: none;
  color: var(--grafit-2);
}

@media (min-width: 900px) {
  /* The wordmark carries the top-left corner at display scale — the band's
     anchor, not a logo in a bar. */
  .masthead__row {
    align-items: flex-start;
    padding-top: 1.25rem;
  }

  .masthead__brand {
    gap: 0.9rem;
  }

  .masthead__mark {
    width: 34px;
    height: 34px;
    margin-top: 0.35rem;
  }

  .masthead__wordmark {
    font-family: var(--font-display);
    font-stretch: var(--wdth-monument);
    font-weight: 300;
    font-size: clamp(2rem, 1.2rem + 2.6vw, 3.4rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .masthead__nav {
    display: flex;
    gap: 2rem;
    padding-top: 0.75rem;
  }

  .masthead__link {
    font-family: var(--font-display);
    font-stretch: var(--wdth-datum);
    font-weight: 500;
    font-size: var(--fs-kicker);
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: var(--grafit-2);
    text-decoration: none;
    padding: 0.5rem 0;
  }

  .masthead__link:hover {
    color: var(--rez);
  }

  .masthead__domain {
    display: inline;
    padding-top: 0.8rem;
  }
}
</style>
