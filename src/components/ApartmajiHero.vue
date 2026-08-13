<script setup lang="ts">
/**
 * The subpage's opening band: breadcrumb, kicker, the page's single h1, the
 * lead and the one call to action.
 *
 * Static by design. Nothing here is built by JS, so a crawler and a reader
 * with JS off get the whole opening, which is the same contract the home
 * page's statement band keeps.
 *
 * The breadcrumb is VISIBLE and is the page's only route back to the home
 * page (this page is deliberately not linked from the main nav, so without it
 * the subpage would be a dead end). It is also what earns the BreadcrumbList
 * in the view's JSON-LD: that markup mirrors a real trail rather than
 * inventing one.
 */
import { hero, breadcrumb } from '@/content/apartmaji'
</script>

<template>
  <section class="apth press press--light">
    <div class="container">
      <nav class="apth__crumbs" aria-label="Drobtinice">
        <ol class="apth__crumb-list">
          <li class="apth__crumb"><a href="/" class="apth__crumb-link">{{ breadcrumb.homeLabel }}</a></li>
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

/* The trail sits above everything, in the label register — small caps, not
   mono: mono is reserved for genuine machine emissions (honesty contract). */
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
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  color: var(--grafit-2);
}

/* The separator is drawn, not typed: a raw dingbat codepoint can carry emoji
   presentation on iOS and would render as a colour glyph mid-line. */
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
  color: var(--grafit-2);
  text-decoration: none;
  border-bottom: 1px solid var(--mreza-strong);
  /* The trail is small text, so the tap target is grown with padding rather
     than by inflating the type. */
  display: inline-block;
  padding-block: var(--space-2);
}

.apth__crumb-link:hover,
.apth__crumb-link:focus-visible {
  color: var(--rez);
  border-bottom-color: var(--rez);
}

.apth__kicker {
  color: var(--grafit-2);
}

/* THE MONUMENT. On the home page the brand wordmark is the page's largest
   thing; a subpage has no wordmark band, so its subject takes that role and
   the h1 is set in the display-L role the section heads use. Fluid below
   ~370px (tokens.css) so the longest word still fits a 320px line. */
.apth__title {
  margin-top: var(--space-4);
  margin-bottom: 0;
  font-family: var(--font-display);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--grafit);
}

.apth__lead {
  max-width: 54ch;
  margin-top: var(--space-8);
  font-size: var(--fs-lead);
  line-height: 1.65;
  color: var(--grafit-2);
}

.apth__cta-wrap {
  margin-top: var(--space-10);
}

/* The single red element on this band. Square, flat, no shadow: the system
   draws depth with line weight, never with blur. */
.apth__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white); /* 6.01:1 on the cut — measured, tokens.css */
  font-family: var(--font-display);
  font-size: var(--type-label-size);
  font-weight: var(--type-label-weight);
  letter-spacing: var(--type-label-ls);
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid var(--rez);
  transition:
    background-color 200ms var(--ease-out),
    color 200ms var(--ease-out);
}

/* Hover is wired for pointers only — on touch, mouseleave never fires and an
   applied hover state sticks. Focus stays available on every device. */
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
