<script setup lang="ts">
/**
 * The opening band, carrying the brand: the SpletnaPovsod mark sits above the
 * h1 on the left; the lead and the calls to action stack on the right.
 *
 * Two alignment locks, both the owner's spec:
 *   — the wordmark's TOP is the lead's top (row 1, both align-start);
 *   — the CTA row's BOTTOM is the h1's bottom (row 2, both align-end).
 *
 * No JS: the only motion here is the arrival settle in base.css, once per
 * hard load.
 */
import { hero } from '@/content/home'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title
</script>

<template>
  <section class="stmt">
    <div class="container stmt__grid">
      <p class="stmt__brand">
        <!-- Brand mark: the sheet cut by the plane, the site's own motif -->
        <svg
          class="stmt__mark"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
        >
          <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor"
            stroke-width="1.5" />
          <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
          <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
        </svg>
        <span class="stmt__wordmark">SpletnaPovsod</span>
      </p>

      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>

      <p class="stmt__lead">{{ hero.lead }}</p>

      <div class="stmt__cta">
        <a :href="`#${hero.ctaPrimary.target}`" class="stmt__btn">{{ hero.ctaPrimary.label }}</a>
        <a :href="`#${hero.ctaSecondary.target}`" class="stmt__more">{{
          hero.ctaSecondary.label
        }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stmt {
  padding-top: 1.75rem;
  padding-bottom: clamp(2rem, 1.5rem + 2vw, 3.25rem);
}

.stmt__grid {
  display: grid;
  gap: 1.35rem;
}

.stmt__brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  line-height: 1;
}

.stmt__mark {
  width: 1.7rem;
  height: 1.7rem;
  flex: 0 0 auto;
}

.stmt__wordmark {
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.6rem, 1.1rem + 2.4vw, 2.9rem);
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.stmt__title {
  max-width: 18ch;
}

.stmt__hl {
  /* Display size, so the 3:1 large-text floor applies — 5.37:1 on paper. */
  color: var(--rez);
}

.stmt__lead {
  font-size: var(--fs-lead);
  line-height: 1.55;
  max-width: 46ch;
  color: var(--grafit-2);
}

.stmt__cta {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stmt__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: 0.75rem 1.75rem;
  background: var(--rez);
  color: #fff; /* 6.01:1 on --rez — measured */
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--t-lift) var(--ease-out);
}

.stmt__btn:hover {
  background: var(--rez-deep);
}

.stmt__more {
  align-self: flex-start;
  padding: 0.65rem 0; /* 44px+ tap target with the 1rem line box */
  font-weight: 600;
  color: var(--rez); /* 5.37:1 on --list — measured */
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

@media (min-width: 640px) {
  .stmt__cta {
    flex-direction: row;
    align-items: center;
    gap: 1.75rem;
  }
  .stmt__more {
    align-self: center;
  }
}

/* Desktop: two columns, two rows. Row 1 aligns START (wordmark top == lead
   top); row 2 aligns END (h1 bottom == CTA bottom) — the two locks. */
@media (min-width: 900px) {
  .stmt {
    padding-top: 2.5rem;
    padding-bottom: clamp(2.5rem, 2rem + 2vw, 4rem);
  }

  .stmt__grid {
    grid-template-columns: minmax(0, 12fr) minmax(0, 11fr);
    column-gap: clamp(2rem, 5vw, 5rem);
    row-gap: 2rem;
  }

  .stmt__brand {
    grid-column: 1;
    grid-row: 1;
    align-self: start;
  }

  .stmt__lead {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    font-size: 1rem;
    line-height: 1.65;
  }

  .stmt__title {
    grid-column: 1;
    grid-row: 2;
    align-self: end;
    max-width: none;
    font-size: clamp(2.2rem, 0.9rem + 2.8vw, 3.2rem);
  }

  .stmt__cta {
    grid-column: 2;
    grid-row: 2;
    align-self: end;
    margin-top: 0;
  }

  .stmt__mark {
    width: 2.1rem;
    height: 2.1rem;
  }
}
</style>
