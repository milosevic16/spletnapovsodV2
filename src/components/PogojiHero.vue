<script setup lang="ts">
/**
 * Opening band for a terms document. Prop-driven, because both terms pages use
 * it and the only difference between them is their words: the same instrument
 * with per-page content, the pattern the masthead and footer already follow.
 *
 * Optionally renders a standing note pointing at a RELATED document. Since
 * avgust 2026 the two terms documents are independent of each other, so this is
 * no longer a precedence note: it is the general document telling a reader who
 * came in on an apartment promotion that a different document governs them.
 */
defineProps<{
  hero: { kicker: string; title: string; lead: string }
  related?: { label: string; href: string; note: string }
}>()
</script>

<template>
  <section class="pgh press press--light">
    <div class="container">
      <p class="kicker pgh__kicker">{{ hero.kicker }}</p>
      <h1 class="pgh__title">{{ hero.title }}</h1>
      <p class="pgh__lead">{{ hero.lead }}</p>

      <p v-if="related" class="pgh__base">
        <span class="pgh__base-note">{{ related.note }}</span>
        <a :href="related.href" class="pgh__base-link">{{ related.label }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.pgh {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.pgh__kicker {
  color: var(--grafit-2);
}

/* The page's monument, in the same display role the section titles use. */
.pgh__title {
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

.pgh__lead {
  max-width: 60ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit-2);
}

/* The pointer back to the base document: a drawn block, not a loose sentence,
   because the precedence rule is load-bearing for both documents. */
.pgh__base {
  display: grid;
  gap: var(--space-2);
  max-width: 60ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  padding: var(--space-4) var(--space-5);
  background: var(--list-2);
  border-left: 3px solid var(--rez);
  font-size: 0.95rem;
  line-height: 1.55;
}

.pgh__base-note {
  color: var(--grafit-2);
}

.pgh__base-link {
  justify-self: start;
  color: var(--rez);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  padding-block: 0.35rem;
}

.pgh__base-link:hover,
.pgh__base-link:focus-visible {
  color: var(--rez-deep, var(--rez));
}

@media (max-width: 809px) {
  .pgh__lead {
    max-width: none;
  }
}
</style>
