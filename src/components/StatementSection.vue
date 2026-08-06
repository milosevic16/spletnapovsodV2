<script setup lang="ts">
/**
 * The opening band: deliberately SHORT, so the work stage below is already in
 * the first screen rather than a scroll away. The page's subject is the client
 * sites, not this paragraph.
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
      <p class="kicker stmt__kicker">{{ hero.kicker }}</p>
      <p class="stmt__lead">{{ hero.lead }}</p>

      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>

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

.stmt__lead {
  font-size: var(--fs-lead);
  line-height: 1.55;
  max-width: 46ch;
  color: var(--grafit-2);
}

.stmt__title {
  max-width: 18ch;
}

.stmt__hl {
  color: var(--rez);
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
  color: var(--rez);
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

/* Desktop: lead high on the right, headline beneath it, CTA anchored left.
   The band stays short, but every element gets its own air — the kicker is
   pushed clear of the wordmark above it, and the two columns never crowd. */
@media (min-width: 900px) {
  .stmt {
    padding-top: 2.5rem;
    padding-bottom: clamp(2.5rem, 2rem + 2vw, 4rem);
  }

  /* 24 columns want a SMALL column gap: at 2.5rem the 23 gutters ate 920 of
     1312px and left ~16px per column, which is what crushed the CTA onto two
     lines. Air belongs in the row gap. */
  .stmt__grid {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 2.75rem;
    align-items: start;
  }

  .stmt__kicker {
    grid-column: 1 / span 9;
    grid-row: 1;
    align-self: start;
    padding-top: 0.4rem;
  }

  .stmt__lead {
    grid-column: 13 / span 11;
    grid-row: 1;
    font-size: 1rem;
    line-height: 1.65;
  }

  .stmt__title {
    grid-column: 10 / span 15;
    grid-row: 2;
    max-width: none;
    font-size: clamp(2.2rem, 0.9rem + 2.8vw, 3.2rem);
  }

  .stmt__cta {
    grid-column: 1 / span 9;
    grid-row: 2;
    align-self: end;
    margin-top: 0;
    padding-bottom: 0.4rem;
  }
}
</style>
