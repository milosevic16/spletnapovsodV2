<script setup lang="ts">
/**
 * The opening statement. Composition follows the agency convention the brief
 * asked for — a small lead set above a large, light headline, asymmetric on a
 * 24-column grid — but the scale, palette and voice are ours: our own type
 * tokens, our own copy, our own cut motif.
 *
 * Deliberately calm and JS-free: the drama in the first screen belongs to the
 * carousel below it. The only motion here is the arrival settle in base.css,
 * which plays once per hard load.
 */
import { hero, meta } from '@/content/home'
import PrerezLine from './PrerezLine.vue'

const titleTag = `<title>${meta.title}</title>`

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

      <!-- Lead above the headline, in the narrow measure — the eye reads the
           qualifier, then the claim. -->
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

    <!-- The cut closes the statement and hands off to the work below. Its
         annotation is the page's real <title>, so it renders as an emission. -->
    <div class="container stmt__fold">
      <PrerezLine emission :annotation="titleTag" :gloss="hero.foldGloss" />
    </div>
  </section>
</template>

<style scoped>
.stmt {
  padding-top: clamp(4rem, 3rem + 5vw, 7rem);
  padding-bottom: clamp(2rem, 1.5rem + 2vw, 3.5rem);
}

.stmt__grid {
  display: grid;
  gap: 1.25rem;
}

.stmt__kicker {
  margin-bottom: 0.5rem;
}

.stmt__lead {
  font-size: var(--fs-lead);
  line-height: 1.55;
  max-width: 46ch;
  color: var(--grafit-2);
}

/* Light and wide — monumentality through size and width, never boldness. */
.stmt__title {
  max-width: 18ch;
}

.stmt__hl {
  color: var(--rez);
}

.stmt__cta {
  margin-top: 0.75rem;
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

.stmt__fold {
  display: none;
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

/* Desktop: the asymmetric 24-column composition — lead in a narrow column on
   the right, the headline spanning wide beneath it, the CTA row anchored left
   so the eye travels lead → claim → action. */
@media (min-width: 900px) {
  .stmt__grid {
    grid-template-columns: repeat(24, minmax(0, 1fr));
    column-gap: 1rem;
    row-gap: 2.75rem;
    align-items: start;
  }

  .stmt__kicker {
    grid-column: 1 / span 8;
    grid-row: 1;
    margin-bottom: 0;
  }

  .stmt__lead {
    grid-column: 14 / span 9;
    grid-row: 1;
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .stmt__title {
    grid-column: 1 / span 21;
    grid-row: 2;
    max-width: none;
  }

  .stmt__cta {
    grid-column: 1 / span 14;
    grid-row: 3;
    margin-top: 0;
  }

  .stmt__fold {
    display: block;
    margin-top: clamp(2.5rem, 2rem + 3vw, 4rem);
  }
}
</style>
