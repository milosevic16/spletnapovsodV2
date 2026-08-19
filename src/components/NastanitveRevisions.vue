<script setup lang="ts">
/**
 * »Krog popravkov« — what a round of revisions is, and its bounds.
 *
 * An intro plus a short ruled list of conditions. The list is three items
 * because that is what the content is, not by reflex. It states an honest
 * limit (a round is bounded, and out-of-scope work is priced), which the house
 * voice rules ask for over an open-ended promise.
 */
import { revisions } from '@/content/nastanitve'
</script>

<template>
  <section id="popravki" class="aptv press press--light">
    <div class="container aptv__grid">
      <div class="aptv__head">
        <p class="kicker aptv__kicker">{{ revisions.kicker }}</p>
        <h2 class="aptv__title">{{ revisions.title }}</h2>
      </div>

      <div class="aptv__body">
        <p class="aptv__intro">{{ revisions.intro }}</p>
        <ul class="aptv__conds">
          <li v-for="c in revisions.conditions" :key="c" class="aptv__cond">{{ c }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.aptv {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

/* An editorial two-column block: the head sits beside the prose on wide
   screens, stacks on phones. */
.aptv__grid {
  display: grid;
  grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
  gap: var(--space-8) var(--space-16);
  align-items: start;
}

.aptv__kicker {
  color: var(--grafit-2);
}

.aptv__title {
  margin-top: var(--space-4);
  margin-bottom: 0;
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.aptv__intro {
  max-width: 60ch;
  margin: 0;
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit);
}

.aptv__conds {
  margin: var(--space-8) 0 0;
  padding: 0;
  list-style: none;
}

.aptv__cond {
  max-width: 62ch;
  padding: var(--space-4) 0 0;
  margin-top: var(--space-4);
  border-top: 1px solid var(--mreza-strong);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptv__cond:first-child {
  margin-top: 0;
}

@media (max-width: 809px) {
  .aptv__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }

  .aptv__intro,
  .aptv__cond {
    max-width: none;
  }
}
</style>
