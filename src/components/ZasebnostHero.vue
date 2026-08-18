<script setup lang="ts">
/**
 * The privacy page's opening band: breadcrumb, kicker, the page's single h1 and
 * a short lead. Static by design, same contract as the apartmaji hero.
 *
 * The breadcrumb is VISIBLE and is the page's route back to home (this subpage
 * is not in the main nav). It earns the BreadcrumbList in the view's JSON-LD.
 */
import { hero, breadcrumb } from '@/content/zasebnost'
</script>

<template>
  <section class="zash press press--light">
    <div class="container">
      <nav class="zash__crumbs" aria-label="Drobtinice">
        <ol class="zash__crumb-list">
          <li class="zash__crumb">
            <a href="/" class="zash__crumb-link">{{ breadcrumb.homeLabel }}</a>
          </li>
          <li class="zash__crumb" aria-current="page">{{ breadcrumb.currentLabel }}</li>
        </ol>
      </nav>

      <p class="kicker zash__kicker">{{ hero.kicker }}</p>
      <h1 class="zash__title">{{ hero.title }}</h1>
      <p class="zash__lead">{{ hero.lead }}</p>
    </div>
  </section>
</template>

<style scoped>
.zash {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

/* The trail is in the label register (small caps), never mono: mono is reserved
   for genuine machine emissions (the honesty contract). Mirrors ApartmajiHero. */
.zash__crumbs {
  margin-bottom: var(--space-8);
}

.zash__crumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--grafit-2);
}

/* Drawn separator, not a dingbat: a raw glyph can carry emoji presentation on
   iOS and render as a colour glyph mid-line. */
.zash__crumb + .zash__crumb::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 1px;
  margin-right: var(--space-2);
  vertical-align: middle;
  background: var(--mreza-strong);
}

.zash__crumb-link {
  display: inline-block;
  padding-block: var(--space-2);
  color: var(--grafit-2);
  text-decoration: none;
  border-bottom: 1px solid var(--mreza-strong);
}

.zash__crumb-link:hover,
.zash__crumb-link:focus-visible {
  color: var(--rez);
  border-bottom-color: var(--rez);
}

.zash__kicker {
  color: var(--grafit-2);
}

/* The page's monument, in the same display role the section titles use. */
.zash__title {
  margin-top: var(--space-4);
  margin-bottom: 0;
  font-family: var(--font-display);
  font-size: var(--type-display-l-size);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--grafit);
}

.zash__lead {
  max-width: 60ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .zash__lead {
    max-width: none;
  }
}
</style>
