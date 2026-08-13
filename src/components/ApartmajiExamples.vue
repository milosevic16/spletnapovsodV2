<script setup lang="ts">
/**
 * »Videz« — pick a starting point, or describe your own.
 *
 * THE EMPTY STATE IS DELIBERATE AND HONEST. The source document names three
 * generated example sites to choose between; those assets do not exist yet,
 * and this project does not ship fabricated preview cards to fill a grid
 * (placeholder content in permanent static HTML is worse than nothing). So the
 * section ships its copy and one plain line saying the examples are being
 * prepared, which is true and useful, instead of three empty frames pretending
 * to be a gallery.
 *
 * WHEN THE THREE EXAMPLES ARRIVE: put them through
 * scripts/build-reference-images.mjs so they get the same AVIF/WebP/JPEG
 * variants and versioned filenames as the portfolio shots (the /img/* cache
 * header is immutable for a year, so a same-name refresh never reaches a
 * repeat visitor), then replace the note below with a figure list. Nothing
 * else in this file has to change.
 */
import { examples } from '@/content/apartmaji'
</script>

<template>
  <section id="videz" class="apte press press--light">
    <div class="container">
      <p class="kicker apte__kicker">{{ examples.kicker }}</p>
      <h2 class="apte__title">{{ examples.title }}</h2>
      <p class="apte__body">{{ examples.body }}</p>

      <!-- Not a card and not a frame: a ruled note on the sheet, so it cannot
           be mistaken for a gallery that failed to load. -->
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
  font-weight: var(--type-statement-weight);
  line-height: var(--type-statement-lh);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
}

.apte__body {
  max-width: 58ch;
  line-height: 1.65;
  color: var(--grafit-2);
}

.apte__pending {
  max-width: 58ch;
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--mreza-strong);
  font-size: var(--fs-annot);
  line-height: 1.6;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .apte__body,
  .apte__pending {
    max-width: none;
  }
}
</style>
