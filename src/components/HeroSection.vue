<script setup lang="ts">
import { hero, nav, meta } from '@/content/home'
import { SITE_ORIGIN } from '@/lib/constants'
import PrerezLine from './PrerezLine.vue'

const titleTag = `<title>${meta.title}</title>`
const canonicalLabel = SITE_ORIGIN.replace('https://', '')

// h1 renders from the content module — the accent span is derived, so a copy
// edit can never silently diverge from the real title.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title
</script>

<template>
  <section class="hero">
    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="kicker hero__kicker">{{ hero.kicker }}</p>
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

      <!-- Honest self-map: this page's own sections as a wireframe, on the
           two-layer card whose seam prints the real domain. Decorative for
           screen readers (the masthead nav carries the same links). -->
      <div class="hero__aside" aria-hidden="true">
        <div class="layercard">
          <div class="layercard__under">
            <span class="layercard__seam annot">{{ canonicalLabel }}</span>
          </div>
          <div class="layercard__paper">
            <div class="wireframe">
              <div class="wireframe__block wireframe__block--hero">
                <span class="wireframe__label">Domov</span>
                <span class="wireframe__bar wireframe__bar--wide"></span>
                <span class="wireframe__bar"></span>
                <span class="wireframe__chip"></span>
              </div>
              <div class="wireframe__row">
                <div v-for="i in 3" :key="i" class="wireframe__block wireframe__block--card">
                  <span v-if="i === 1" class="wireframe__label">{{ nav[0]!.label }}</span>
                  <span class="wireframe__bar wireframe__bar--thin"></span>
                </div>
              </div>
              <div class="wireframe__block">
                <span class="wireframe__label">{{ nav[1]!.label }}</span>
                <span class="wireframe__bar"></span>
                <span class="wireframe__bar wireframe__bar--wide"></span>
              </div>
              <div class="wireframe__block wireframe__block--accent">
                <span class="wireframe__label">{{ nav[3]!.label }}</span>
                <span class="wireframe__bar wireframe__bar--thin"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container hero__fold">
      <PrerezLine :annotation="titleTag" :gloss="hero.foldGloss" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: clamp(2.5rem, 2rem + 4vw, 5.5rem);
}

.hero__grid {
  display: grid;
  gap: 2.5rem;
}

.hero__kicker {
  margin-bottom: 1.25rem;
}

.hero__title {
  max-width: 16ch;
}

.hero__hl {
  font-style: normal;
  color: var(--accent);
}

.hero__lead {
  margin-top: 1.5rem;
  font-size: var(--fs-lead);
  max-width: 62ch;
}

.hero__cta {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: 0.75rem 1.75rem;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--t-lift) var(--ease-out);
}

.hero__btn:hover {
  background: var(--accent-deep);
}

.hero__more {
  align-self: flex-start;
  padding: 0.65rem 0; /* 44px+ tap target with the 1rem line box */
  font-weight: 600;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

/* The <title> dimension line is a desktop device: on a phone it costs a whole
   screen before the reader reaches the work. Still in the markup for crawlers. */
.hero__fold {
  display: none;
}

.hero__aside {
  display: none;
}

/* --- the two-layer card (Dvojna plast) ----------------------------------- */
.layercard {
  position: relative;
  padding: 0 4px 28px 0;
}

.layercard__under {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 0;
  bottom: 0;
  background: var(--panel);
}

.layercard__seam {
  position: absolute;
  left: 0.75rem;
  bottom: 0;
  height: 28px;
  line-height: 28px;
  color: var(--accent-on-dark);
  white-space: nowrap;
}

.layercard__paper {
  position: relative;
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  padding: 1.5rem;
}

/* --- wireframe self-map -------------------------------------------------- */
.wireframe {
  display: grid;
  gap: 0.9rem;
}

.wireframe__block {
  border: 1px solid var(--hairline-strong);
  padding: 0.7rem 0.8rem;
  display: grid;
  gap: 0.45rem;
}

.wireframe__block--accent {
  border-color: var(--accent);
}

.wireframe__row {
  display: flex;
  gap: 0.6rem;
}
.wireframe__row .wireframe__block {
  flex: 1;
}

.wireframe__label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-2);
}

.wireframe__bar {
  height: 3px;
  width: 55%;
  background: var(--hairline-strong);
}
.wireframe__bar--wide {
  width: 80%;
}
.wireframe__bar--thin {
  width: 40%;
}

.wireframe__chip {
  width: 34%;
  height: 12px;
  background: var(--accent);
}

@media (min-width: 640px) {
  .hero__cta {
    flex-direction: row;
    align-items: center;
    gap: 1.75rem;
  }
  .hero__btn {
    align-self: flex-start;
  }
  .hero__more {
    align-self: center;
  }
}

@media (min-width: 900px) {
  .hero__grid {
    grid-template-columns: 7fr 5fr;
    gap: 4rem;
    align-items: start;
  }
  .hero__aside {
    display: block;
    padding-top: 1rem;
  }
  .hero__fold {
    display: block;
    margin-top: clamp(2.5rem, 2rem + 3vw, 4.5rem);
  }
}
</style>
