<script setup lang="ts">
/**
 * "Zakaj ne WordPress?" — the architecture comparison that closes the
 * invisible-work band. Deliberately NOT a <table>: the responsive pattern that
 * stacks a table on phones destroys its semantics in most screen readers.
 * Instead each row is a list item whose two sides carry their own label — shown
 * on phones, visually hidden on desktop where the column head does that job, so
 * the association is correct at every width without any ARIA gymnastics.
 *
 * Every cell states a STRUCTURAL fact (see the content module's house note):
 * no speed numbers, because we have no field data to back them.
 */
import { comparison } from '@/content/home'
</script>

<template>
  <div class="cmp">
    <p class="kicker kicker--on-dark">{{ comparison.kicker }}</p>
    <h3 class="cmp__title">{{ comparison.title }}</h3>
    <p class="cmp__intro">{{ comparison.intro }}</p>

    <!-- Column head: desktop only, and purely visual — every cell below still
         carries its own label for assistive tech. -->
    <div class="cmp__head" aria-hidden="true">
      <span class="cmp__head-cell"></span>
      <span class="cmp__head-cell cmp__head-cell--ours">{{ comparison.oursLabel }}</span>
      <span class="cmp__head-cell">{{ comparison.theirsLabel }}</span>
    </div>

    <ul class="cmp__rows">
      <li v-for="row in comparison.rows" :key="row.id" class="cmp__row">
        <span class="cmp__criterion">{{ row.criterion }}</span>
        <span class="cmp__side cmp__side--ours">
          <span class="cmp__side-label">{{ comparison.oursLabel }}</span>
          <span class="cmp__value">{{ row.ours }}</span>
        </span>
        <span class="cmp__side">
          <span class="cmp__side-label">{{ comparison.theirsLabel }}</span>
          <span class="cmp__value cmp__value--theirs">{{ row.theirs }}</span>
        </span>
      </li>
    </ul>

    <p class="cmp__footnote">{{ comparison.footnote }}</p>
  </div>
</template>

<style scoped>
.cmp {
  margin-top: clamp(3rem, 2.5rem + 2.5vw, 5rem);
  border-top: 1px solid var(--underlay-line);
  padding-top: clamp(2.5rem, 2rem + 2vw, 4rem);
}

.cmp__title {
  margin-top: 1rem;
  color: var(--surface);
  font-size: clamp(1.35rem, 1.15rem + 1vw, 1.8rem);
  font-weight: 500;
}

.cmp__intro {
  margin-top: 1.25rem;
  color: var(--paper-dim);
  max-width: 62ch;
}

.cmp__head {
  display: none;
}

.cmp__rows {
  list-style: none;
  margin-top: 2rem;
}

.cmp__row {
  display: grid;
  gap: 0.75rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--underlay-line);
}

.cmp__row:last-child {
  border-bottom: 1px solid var(--underlay-line);
}

.cmp__criterion {
  font-family: var(--font-mono);
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--paper-dim);
}

.cmp__side {
  display: grid;
  gap: 0.2rem;
}

/* On phones the accent side gets a rule so the two are told apart by
   position and weight, never by color alone. */
.cmp__side--ours {
  border-left: 2px solid var(--accent-on-dark);
  padding-left: 0.85rem;
}

.cmp__side-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-on-dark);
}

.cmp__side:not(.cmp__side--ours) .cmp__side-label {
  color: var(--paper-dim);
}

.cmp__value {
  color: var(--surface);
  max-width: 46ch;
}

.cmp__value--theirs {
  color: var(--paper-dim);
}

.cmp__footnote {
  margin-top: 1.75rem;
  font-size: 0.9rem;
  color: var(--paper-dim);
  max-width: 62ch;
}

@media (min-width: 900px) {
  .cmp__head {
    display: grid;
    grid-template-columns: 14rem 1fr 1fr;
    gap: 2rem;
    margin-top: 2.5rem;
    padding-bottom: 0.75rem;
  }

  .cmp__head-cell {
    font-family: var(--font-mono);
    font-size: var(--fs-kicker);
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: var(--paper-dim);
  }

  .cmp__head-cell--ours {
    color: var(--accent-on-dark);
  }

  .cmp__rows {
    margin-top: 0;
  }

  .cmp__row {
    grid-template-columns: 14rem 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .cmp__criterion {
    padding-top: 0.15rem;
  }

  .cmp__side--ours {
    border-left: 0;
    padding-left: 0;
  }

  /* The column head names the sides here, so the per-row labels go
     visually hidden — still present for assistive tech. */
  .cmp__side-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
