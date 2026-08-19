<script setup lang="ts">
/**
 * The privacy page's opening band: kicker, the page's single h1 and a short
 * lead. Static by design, same contract as the nastanitve hero.
 */
import { hero } from '@/content/zasebnost'
</script>

<template>
  <section class="zash press press--light">
    <div class="container">
      <p class="kicker zash__kicker">{{ hero.kicker }}</p>
      <h1 class="zash__title">{{ hero.title }}</h1>
      <p class="zash__lead">{{ hero.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
.zash {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.zash__kicker {
  color: var(--grafit-2);
}

/* The page's monument, in the same display role the section titles use. */
.zash__title {
  margin-top: var(--space-4);
  margin-bottom: 0;
  font-family: var(--font-display);
  font-size: var(--type-display-l-size);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--grafit);
}

.zash__lead {
  max-width: 60ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .zash__lead {
    max-width: none;
  }
}
</style>
