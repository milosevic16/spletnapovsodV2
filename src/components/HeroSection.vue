<script setup lang="ts">
/**
 * Fasada — the monumental opening sheet the veil parts onto. Calm by design:
 * zero JS, zero effects; the drama is scale, width-axis type and the one red
 * poché block. The vodni znak (watermark) prints the page's REAL <title> at
 * watermark opacity — a checkable fact planting the invisible-layer thesis
 * before the cut scene arrives (aria-hidden: pure decoration).
 */
import { hero, meta } from '@/content/home'

// h1 renders from the content module — the accent span is derived, so a copy
// edit can never silently diverge from the real title.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title
</script>

<template>
  <section class="hero">
    <div class="container hero__wrap">
      <p class="datum hero__kicker">{{ hero.kicker }}</p>
      <h1 class="hero__title">
        <span v-if="titleAccent" class="hero__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>
      <p class="hero__lead">{{ hero.lead }}</p>
      <div class="hero__cta">
        <a :href="`#${hero.ctaPrimary.target}`" class="hero__btn">{{ hero.ctaPrimary.label }}</a>
        <a :href="`#${hero.ctaSecondary.target}`" class="hero__more">{{
          hero.ctaSecondary.label
        }}</a>
      </div>
    </div>
    <p class="hero__watermark" aria-hidden="true">{{ meta.title }}</p>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  min-height: 88svh;
  display: flex;
  align-items: center;
  padding-block: clamp(5rem, 4rem + 6vw, 8rem) clamp(3rem, 2rem + 4vw, 6rem);
  border-bottom: 1px solid var(--mreza);
}

.hero__wrap {
  width: 100%;
}

.hero__kicker {
  margin-bottom: clamp(1.25rem, 1rem + 1.5vw, 2.5rem);
}

.hero__title {
  max-width: 16ch;
}

.hero__hl {
  color: var(--rez);
}

.hero__lead {
  margin-top: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
  font-size: var(--fs-lead);
  line-height: 1.6;
  max-width: 56ch;
  color: var(--grafit);
}

.hero__cta {
  margin-top: clamp(2rem, 1.5rem + 2vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* The one solid red poché block on the sheet. */
.hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 0.85rem 2.25rem;
  background: var(--rez);
  color: #fff; /* 6.01:1 on --rez — measured */
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--t-micro) var(--ease-out);
}

.hero__btn:hover {
  background: var(--rez-deep);
}

.hero__more {
  align-self: flex-start;
  padding: 0.65rem 0; /* 44px+ tap target with the 1rem line box */
  font-weight: 600;
  color: var(--rez);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

/* Vodni znak — the real <title>, printed into the paper along the sheet edge.
   Decorative watermark (aria-hidden), deliberately below any contrast duty. */
.hero__watermark {
  position: absolute;
  top: 50%;
  right: calc(-1 * clamp(0.5rem, 1.5vw, 1rem));
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 275;
  font-size: clamp(3rem, 2rem + 6vw, 7rem);
  line-height: 1;
  white-space: nowrap;
  color: var(--grafit);
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
  max-width: none;
}

@media (min-width: 640px) {
  .hero__cta {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
  .hero__btn {
    align-self: flex-start;
  }
  .hero__more {
    align-self: center;
  }
}
</style>
