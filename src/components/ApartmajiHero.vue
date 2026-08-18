<script setup lang="ts">
/**
 * The subpage's opening band: kicker, the page's single h1, a short lead and
 * the one call to action.
 *
 * Static by design. Nothing here is built by JS, so a crawler and a JS-off
 * reader get the whole opening, the same contract the home statement band
 * keeps.
 */
import { hero } from '@/content/apartmaji'
</script>

<template>
  <section class="apth press press--light">
    <div class="container">
      <p class="kicker apth__kicker">{{ hero.kicker }}</p>
      <h1 class="apth__title">{{ hero.title }}</h1>
      <p class="apth__lead">{{ hero.lead }}</p>

      <p class="apth__cta-wrap">
        <a :href="`#${hero.ctaTarget}`" class="apth__cta">{{ hero.ctaLabel }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.apth {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.apth__kicker {
  color: var(--grafit-2);
}

/* The page's monument, in the same display role the section titles use. */
.apth__title {
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

.apth__lead {
  max-width: 52ch;
  margin-top: var(--space-8);
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit-2);
}

.apth__cta-wrap {
  margin-top: var(--space-10);
  margin-bottom: 0;
}

/* The one red element on the band. Square, flat, no shadow. */
.apth__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white); /* 6.01:1 on the cut — measured, tokens.css */
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid var(--rez);
  transition:
    background-color 200ms var(--ease-out),
    color 200ms var(--ease-out);
}

/* Hover wired for pointers only: on touch mouseleave never fires and the state
   would stick. Focus stays on every device. */
@media (hover: hover) {
  .apth__cta:hover {
    background-color: transparent;
    color: var(--rez);
  }
}

.apth__cta:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

@media (max-width: 809px) {
  .apth__lead {
    max-width: none;
  }
}
</style>
