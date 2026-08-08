<script setup lang="ts">
/**
 * "Kje se ločimo" — four claims, each measured by its own Prerez line whose
 * annotation is the claim's real value (typed into the content module, so a
 * new differentiator without a measure fails typecheck). The 3-day row carries
 * PON · TOR · SRE ticks (genuinely sequential — the one place numbering is earned).
 */
import { differentiators } from '@/content/home'
import PrerezLine from './PrerezLine.vue'
</script>

<template>
  <section id="razlike" class="diffs">
    <div class="container">
      <p class="kicker">{{ differentiators.kicker }}</p>
      <h2 class="diffs__title">{{ differentiators.title }}</h2>

      <ul class="diffs__rows">
        <li
          v-for="(d, i) in differentiators.items"
          :key="d.id"
          class="diffs__row"
          :class="{ 'diffs__row--indent': i % 2 === 1 }"
        >
          <PrerezLine :annotation="d.measure.annotation" :gloss="d.measure.gloss" :ticks="d.measure.ticks" />
          <h3 class="diffs__claim">{{ d.title }}</h3>
          <p class="diffs__body">{{ d.body }}</p>
          <p v-if="d.footnote" class="diffs__footnote">{{ d.footnote }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* PINNED light for now: this band sits directly below the Tradicija section,
   so it is on screen while the page-wide ground switch (tokens.css) is dark —
   without the pin its legacy ink text would land on the flipped dark root.
   The pin comes off when the section joins the flip in its own redesign. */
.diffs {
  padding-block: var(--section-y);
  background: var(--list);
}

.diffs__title {
  margin-top: 1rem;
}

.diffs__rows {
  list-style: none;
  margin-top: 3rem;
  display: grid;
  gap: 3rem;
}

.diffs__row {
  max-width: 34rem;
}

.diffs__claim {
  margin-top: 1.1rem;
}

.diffs__body {
  margin-top: 0.6rem;
  color: var(--grafit);
}

.diffs__footnote {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--grafit-2);
}

/* Desktop: stepped ledger — odd rows indent, so the four rows never read as
   a 2×2 card grid. */
@media (min-width: 900px) {
  .diffs__rows {
    gap: 4rem;
  }
  .diffs__row {
    width: 58%;
    max-width: none;
  }
  .diffs__row--indent {
    margin-left: 42%;
  }
}
</style>
