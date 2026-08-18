<script setup lang="ts">
/**
 * »Primeri« — a few starting layouts, or describe your own.
 *
 * THE EMPTY STATE IS DELIBERATE AND HONEST. The example template pages named in
 * the owner's notes ("iz Gašprovega repota") do not exist as assets yet, and
 * this project does not ship fabricated preview cards to fill a grid. So the
 * section ships its copy and one plain line saying the examples are coming,
 * which is true and useful, instead of empty frames pretending to be a gallery.
 *
 * WHEN THE EXAMPLES ARRIVE: run them through scripts/build-reference-images.mjs
 * for the same AVIF/WebP/JPEG variants and versioned filenames as the portfolio
 * (the /img/* cache header is immutable for a year, so a same-name refresh
 * never reaches a repeat visitor), then replace the note below with a figure
 * list. Nothing else in this file changes.
 */
import { examples } from '@/content/apartmaji'
</script>

<template>
  <section id="primeri" class="apte press press--light">
    <div class="container">
      <p class="kicker apte__kicker">{{ examples.kicker }}</p>
      <h2 class="apte__title">{{ examples.title }}</h2>
      <p class="apte__body">{{ examples.body }}</p>
      <p class="apte__pending">{{ examples.pending }}</p>
    </div>
  </section>
</template>

<style scoped>
.apte {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.apte__kicker {
  color: var(--grafit-2);
}

.apte__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.apte__body {
  max-width: 56ch;
  line-height: 1.6;
  color: var(--grafit-2);
}

/* A ruled note on the sheet, not a card: it cannot be mistaken for a gallery
   that failed to load. */
.apte__pending {
  max-width: 56ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--mreza-strong);
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .apte__body,
  .apte__pending {
    max-width: none;
  }
}
</style>
