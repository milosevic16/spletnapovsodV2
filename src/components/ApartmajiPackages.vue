<script setup lang="ts">
/**
 * The three packages, set as a SCHEDULE rather than three cards.
 *
 * Deliberate: three symmetrical price cards is the template tell this system
 * bans, and the site's own idiom for enumerated content is already a register
 * (DifferentiatorsSection) — a sheet with ruled entries, each carrying a datum
 * on the left and its detail on the right. It also degrades honestly, because
 * the tiers are not equivalent: one has a confirmed price, one does not have a
 * price yet, and one is quoted per job. Cards would flatten that difference;
 * a schedule shows it.
 *
 * An <ol>, because the tiers ascend and the order is the meaning.
 *
 * The Prerez line carries the tax fact. It is the section's one structural red
 * element, which is the whole of the accent's job here.
 */
import { packages } from '@/content/apartmaji'
import PrerezLine from './PrerezLine.vue'
</script>

<template>
  <section id="paketi" class="aptp press press--light">
    <div class="container">
      <p class="kicker aptp__kicker">{{ packages.kicker }}</p>
      <h2 class="aptp__title">{{ packages.title }}</h2>

      <PrerezLine :annotation="packages.taxAnnotation" :gloss="packages.taxNote" />

      <ol class="aptp__register">
        <li v-for="p in packages.items" :key="p.id" class="aptp__row">
          <div class="aptp__datum">
            <h3 class="aptp__name">{{ p.name }}</h3>
            <p class="aptp__price">{{ p.price }}</p>
          </div>

          <div class="aptp__detail">
            <p class="aptp__summary">{{ p.summary }}</p>
            <ul class="aptp__includes">
              <li v-for="inc in p.includes" :key="inc" class="aptp__include">{{ inc }}</li>
            </ul>
            <p v-if="p.footnote" class="aptp__foot">{{ p.footnote }}</p>
          </div>
        </li>
      </ol>

      <p class="aptp__scope">{{ packages.scopeNote }}</p>
    </div>
  </section>
</template>

<style scoped>
.aptp {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.aptp__kicker {
  color: var(--grafit-2);
}

.aptp__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: var(--type-statement-weight);
  line-height: var(--type-statement-lh);
  letter-spacing: var(--type-statement-ls);
  text-transform: uppercase;
}

.aptp__register {
  margin: var(--space-12) 0 0;
  padding: 0;
  list-style: none;
}

/* Entries on one sheet: a hairline per row, and the last one closes the
   schedule so it does not bleed into the section below. */
.aptp__row {
  display: grid;
  grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
  gap: var(--space-6) var(--space-16);
  padding-block: var(--space-10);
  border-top: 1px solid var(--mreza-strong);
}

.aptp__row:last-child {
  border-bottom: 1px solid var(--mreza-strong);
}

.aptp__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  color: var(--grafit-2);
}

/* The price is the row's datum, so it carries the weight. Tiers without a
   confirmed figure carry a sentence in the same slot and are set a step down,
   because a placeholder must not read with the authority of a real number. */
.aptp__price {
  margin-top: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--type-cta-size);
  font-weight: var(--type-cta-weight);
  line-height: 1.1;
  letter-spacing: var(--type-cta-ls);
  color: var(--grafit);
}

.aptp__summary {
  margin: 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
}

.aptp__includes {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
}

/* The marker is a drawn rule, never a dingbat or an emoji bullet. */
.aptp__include {
  position: relative;
  padding-left: var(--space-6);
  margin-top: var(--space-3);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptp__include::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 12px;
  height: 1px;
  background: var(--mreza-strong);
}

.aptp__foot {
  max-width: 60ch;
  margin-top: var(--space-5);
  font-size: var(--fs-annot);
  line-height: 1.6;
  color: var(--grafit-2);
}

.aptp__scope {
  max-width: 60ch;
  margin-top: var(--space-8);
  font-size: var(--fs-annot);
  line-height: 1.6;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .aptp__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
    padding-block: var(--space-8);
  }

  .aptp__foot,
  .aptp__scope {
    max-width: none;
  }
}
</style>
