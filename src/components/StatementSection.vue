<script setup lang="ts">
/**
 * The opening band: headline left, the lead and the calls to action stacked
 * on the right. Deliberately SHORT, so the work stage below is already in the
 * first screen — the page's subject is the client sites, not this paragraph.
 *
 * No JS: the only motion here is the arrival settle in base.css, once per
 * hard load. The warm top wash it sits in is painted on #app (base.css).
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

.stmt__title {
  max-width: 18ch;
}

.stmt__hl {
  /* Display size, so the 3:1 large-text floor applies — 3.78:1 at the wash's
     full strength, and only improves down the fade. */
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

/* Desktop: the claim holds the left column across both rows; the qualifier
   and the actions stack on the right, so the eye reads claim → detail → act. */
@media (min-width: 900px) {
  .stmt {
    padding-top: 2.5rem;
    padding-bottom: clamp(2.5rem, 2rem + 2vw, 4rem);
  }

  /* 24 columns want a SMALL column gap: at 2.5rem the 23 gutters ate 920 of
     1312px and left ~16px per column, which crushed the CTA onto two lines. */
  .stmt__grid {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 2.25rem;
    align-items: start;
  }

  .stmt__title {
    grid-column: 1 / span 12;
    grid-row: 1 / span 2;
    max-width: none;
    font-size: clamp(2.2rem, 0.9rem + 2.8vw, 3.2rem);
  }

  .stmt__lead {
    grid-column: 14 / span 11;
    grid-row: 1;
    font-size: 1rem;
    line-height: 1.65;
  }

  .stmt__cta {
    grid-column: 14 / span 11;
    grid-row: 2;
    margin-top: 0;
  }
}
</style>
