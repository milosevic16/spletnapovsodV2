<script setup lang="ts">
/**
 * Specifikacije — the differentiators as a boxed spec panel on the sheet:
 * four deliberately unequal rows (value cells alternate sides and widths so
 * the panel can never read as a 2×2 card grid). Values are claims → Archivo
 * Narrow caps, never mono (honesty contract). The 3-day row carries the
 * PON · TOR · SRE ticks — genuinely sequential, the one earned sequence here.
 */
import { differentiators } from '@/content/home'
</script>

<template>
  <section id="razlike" class="spec">
    <div class="container">
      <p class="datum">{{ differentiators.kicker }}</p>
      <h2 class="spec__title">{{ differentiators.title }}</h2>

      <ul class="spec__panel">
        <li
          v-for="(d, i) in differentiators.items"
          :key="d.id"
          class="spec__row"
          :class="{ 'spec__row--flip': i % 2 === 1 }"
        >
          <div class="spec__value-cell">
            <span class="spec__value">{{ d.measure.annotation }}</span>
            <span v-if="d.measure.ticks" class="spec__ticks" aria-hidden="true">
              <span v-for="t in d.measure.ticks" :key="t" class="spec__tick">
                <span class="spec__tick-mark"></span>{{ t }}
              </span>
            </span>
            <span class="spec__gloss">{{ d.measure.gloss }}</span>
          </div>
          <div class="spec__claim">
            <h3 class="spec__claim-title">{{ d.title }}</h3>
            <p class="spec__claim-body">{{ d.body }}</p>
            <p v-if="d.footnote" class="spec__footnote">{{ d.footnote }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.spec {
  padding-block: var(--section-y);
}

.spec__title {
  margin-top: 1rem;
}

/* The drawn spec box. */
.spec__panel {
  list-style: none;
  margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
  border: 2px solid var(--grafit);
}

.spec__row {
  display: grid;
  gap: 1rem;
  padding: clamp(1.25rem, 1rem + 1.5vw, 2.25rem);
}

.spec__row + .spec__row {
  border-top: 1px solid var(--mreza-strong);
}

.spec__value-cell {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

/* The value — a claim at instrument scale: Narrow caps, never mono. */
.spec__value {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: clamp(1.5rem, 1.2rem + 1.6vw, 2.4rem);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rez);
  line-height: 1.1;
}

.spec__ticks {
  display: flex;
  gap: 1rem;
}

.spec__tick {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 500;
  font-size: var(--fs-datum);
  letter-spacing: 0.13em;
  color: var(--grafit-2);
}

.spec__tick-mark {
  width: 6px;
  height: 6px;
  background: var(--rez);
}

.spec__gloss {
  font-size: 0.9rem;
  color: var(--grafit-2);
  max-width: 34ch;
}

.spec__claim-title {
  font-size: 1.15rem;
}

.spec__claim-body {
  margin-top: 0.5rem;
  max-width: 52ch;
}

.spec__footnote {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--grafit-2);
  max-width: 52ch;
}

/* Desktop: unequal rows — value cells alternate side AND width. */
@media (min-width: 900px) {
  .spec__row {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: 3rem;
    align-items: start;
  }

  .spec__row--flip {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }

  .spec__row--flip .spec__value-cell {
    order: 2;
    justify-items: end;
    text-align: right;
  }

  .spec__row--flip .spec__claim {
    order: 1;
  }
}
</style>
