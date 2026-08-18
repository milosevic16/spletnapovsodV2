<script setup lang="ts">
/**
 * The three packages, set as a SCHEDULE rather than three cards. Three
 * symmetrical price cards is the template tell this system bans, and the site's
 * idiom for enumerated content is already a ruled register (DifferentiatorsSection):
 * a sheet with entries, each carrying its datum on the left and its detail on
 * the right. The tiers ascend, so an <ol>: the order is the meaning.
 *
 * NO PRICES (owner's call): the datum is the tier name, and the CTA sends the
 * visitor to ask for a quote.
 */
import { packages } from '@/content/apartmaji'
</script>

<template>
  <section id="paketi" class="aptp press press--light">
    <div class="container">
      <p class="kicker aptp__kicker">{{ packages.kicker }}</p>
      <h2 class="aptp__title">{{ packages.title }}</h2>

      <ol class="aptp__register">
        <li v-for="p in packages.items" :key="p.id" class="aptp__row">
          <div class="aptp__datum">
            <h3 class="aptp__name">{{ p.name }}</h3>
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

      <p class="aptp__cta-wrap">
        <a :href="`#${packages.ctaTarget}`" class="aptp__cta">{{ packages.ctaLabel }}</a>
      </p>
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
  margin-bottom: var(--space-12);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.aptp__register {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Entries on one sheet: a hairline per row, the last one closes the schedule. */
.aptp__row {
  display: grid;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  gap: var(--space-4) var(--space-16);
  padding-block: var(--space-10);
  border-top: 1px solid var(--mreza-strong);
}

.aptp__row:last-child {
  border-bottom: 1px solid var(--mreza-strong);
}

.aptp__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.aptp__summary {
  margin: 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--grafit);
}

.aptp__includes {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
}

/* Drawn marker, never a dingbat or an emoji bullet. */
.aptp__include {
  position: relative;
  padding-left: var(--space-6);
  margin-top: var(--space-3);
  line-height: 1.5;
  color: var(--grafit-2);
}

.aptp__include::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 12px;
  height: 1px;
  background: var(--mreza-strong);
}

.aptp__foot {
  max-width: 62ch;
  margin-top: var(--space-5);
  margin-bottom: 0;
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptp__cta-wrap {
  margin-top: var(--space-12);
  margin-bottom: 0;
}

.aptp__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white);
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

@media (hover: hover) {
  .aptp__cta:hover {
    background-color: transparent;
    color: var(--rez);
  }
}

.aptp__cta:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

@media (max-width: 809px) {
  .aptp__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    padding-block: var(--space-8);
  }

  .aptp__foot {
    max-width: none;
  }
}
</style>
