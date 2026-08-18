<script setup lang="ts">
/**
 * The subpage's opening band: breadcrumb, kicker, the page's single h1, a short
 * lead and the one call to action.
 *
 * Static by design. Nothing here is built by JS, so a crawler and a JS-off
 * reader get the whole opening, the same contract the home statement band
 * keeps.
 *
 * The breadcrumb is VISIBLE and is the page's only route back to the home page
 * (this subpage is deliberately not in the main nav). It is also what earns the
 * BreadcrumbList in the view's JSON-LD, which mirrors a real trail.
 */
import { hero, breadcrumb } from '@/content/apartmaji'
</script>

<template>
  <section class="apth press press--light">
    <div class="container">
      <nav class="apth__crumbs" aria-label="Drobtinice">
        <ol class="apth__crumb-list">
          <li class="apth__crumb">
            <a href="/" class="apth__crumb-link">{{ breadcrumb.homeLabel }}</a>
          </li>
          <li class="apth__crumb" aria-current="page">{{ breadcrumb.currentLabel }}</li>
        </ol>
      </nav>

      <p class="kicker apth__kicker">{{ hero.kicker }}</p>
      <h1 class="apth__title">{{ hero.title }}</h1>
      <p class="apth__lead">{{ hero.lead }}</p>

      <p class="apth__cta-wrap">
        <a :href="`#${hero.ctaTarget}`" class="apth__cta">{{ hero.ctaLabel }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.apth {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

/* The trail is in the label register (small caps), never mono: mono is
   reserved for genuine machine emissions (the honesty contract). */
.apth__crumbs {
  margin-bottom: var(--space-8);
}

.apth__crumb-list {
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
.apth__crumb + .apth__crumb::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 1px;
  margin-right: var(--space-2);
  vertical-align: middle;
  background: var(--mreza-strong);
}

.apth__crumb-link {
  display: inline-block;
  padding-block: var(--space-2);
  color: var(--grafit-2);
  text-decoration: none;
  border-bottom: 1px solid var(--mreza-strong);
}

.apth__crumb-link:hover,
.apth__crumb-link:focus-visible {
  color: var(--rez);
  border-bottom-color: var(--rez);
}

.apth__kicker {
  color: var(--grafit-2);
}

/* The page's monument, in the same display role the section titles use. */
.apth__title {
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

.apth__lead {
  max-width: 52ch;
  margin-top: var(--space-8);
  font-size: var(--fs-lead);
  line-height: 1.6;
  color: var(--grafit-2);
}

.apth__cta-wrap {
  margin-top: var(--space-10);
  margin-bottom: 0;
}

/* The one red element on the band. Square, flat, no shadow. */
.apth__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white); /* 6.01:1 on the cut — measured, tokens.css */
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

/* Hover wired for pointers only: on touch mouseleave never fires and the state
   would stick. Focus stays on every device. */
@media (hover: hover) {
  .apth__cta:hover {
    background-color: transparent;
    color: var(--rez);
  }
}

.apth__cta:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

@media (max-width: 809px) {
  .apth__lead {
    max-width: none;
  }
}
</style>
