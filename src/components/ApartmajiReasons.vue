<script setup lang="ts">
/**
 * »Zakaj sploh« — what an owner actually gains from a site of their own.
 *
 * The source document asked for this section to be researched rather than
 * asserted. What is written here is reasoning an owner can check against their
 * own experience: commission is charged per booking, platform rules change
 * without the host, a platform listing is a fixed form, and the same questions
 * repeat on every enquiry. Deliberately NO percentages or figures: platform
 * commission rates differ per platform, plan and country, and this project
 * does not publish a number it has not verified. If the owner wants the rates
 * named, they come with a source and a date.
 *
 * Four items, not the reflexive three: the count follows the content.
 */
import { reasons } from '@/content/apartmaji'
</script>

<template>
  <section id="zakaj" class="aptr press press--light">
    <div class="container">
      <p class="kicker aptr__kicker">{{ reasons.kicker }}</p>
      <h2 class="aptr__title">{{ reasons.title }}</h2>

      <ul class="aptr__list">
        <li v-for="r in reasons.items" :key="r.id" class="aptr__item">
          <h3 class="aptr__item-title">{{ r.title }}</h3>
          <p class="aptr__body">{{ r.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.aptr {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.aptr__kicker {
  color: var(--grafit-2);
}

.aptr__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-12);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: var(--type-statement-weight);
  line-height: var(--type-statement-lh);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
}

.aptr__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-12) var(--space-16);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The rule above each entry is the section-drawing hairline, not a card edge:
   these are entries on one sheet, not four boxes floating on it. */
.aptr__item {
  padding-top: var(--space-5);
  border-top: 1px solid var(--mreza-strong);
}

.aptr__item-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.aptr__body {
  max-width: 46ch;
  margin-top: var(--space-3);
  line-height: 1.65;
  color: var(--grafit-2);
}

/* One column below the tablet band: two columns of prose at 350px of
   container would leave a measure nobody can read. */
@media (max-width: 809px) {
  .aptr__list {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }

  .aptr__body {
    max-width: none;
  }
}
</style>
