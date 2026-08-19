<script setup lang="ts">
/**
 * The three packages, set as a SCHEDULE rather than three cards. Three
 * symmetrical price cards is the template tell this system bans, and the site's
 * idiom for enumerated content is already a ruled register (DifferentiatorsSection):
 * a sheet with entries, each carrying its datum on the left and its detail on
 * the right. The tiers ascend, so an <ol>: the order is the meaning.
 *
 * NO PRICES (owner's call): the datum is the tier name, and the CTA sends the
 * visitor to ask for a quote.
 */
import { packages, type NastInclude, type NastEmphasis, type NastSeo } from '@/content/nastanitve'

/**
 * Template type guards. The include union is discriminated by shape: a plain
 * string, an emphasis line (has `strong`), or an SEO disclosure (has
 * `points`). vue-tsc narrows each v-if/v-else branch from these.
 */
const isString = (i: NastInclude): i is string => typeof i === 'string'
const isEmphasis = (i: NastInclude): i is NastEmphasis =>
  typeof i === 'object' && 'strong' in i
const isSeo = (i: NastInclude): i is NastSeo => typeof i === 'object' && 'points' in i
</script>

<template>
  <section id="paketi" class="aptp press press--light">
    <div class="container">
      <p class="kicker aptp__kicker">{{ packages.kicker }}</p>
      <h2 class="aptp__title">{{ packages.title }}</h2>

      <ol class="aptp__register">
        <li v-for="p in packages.items" :key="p.id" class="aptp__row" :class="`aptp__row--${p.id}`">
          <div class="aptp__datum">
            <h3 class="aptp__name">{{ p.name }}</h3>
          </div>

          <div class="aptp__detail">
            <p class="aptp__summary">{{ p.summary }}</p>
            <ul class="aptp__includes">
              <li
                v-for="(inc, i) in p.includes"
                :key="i"
                class="aptp__include"
                :class="{ 'aptp__include--seo': isSeo(inc) }"
              >
                <template v-if="isString(inc)">{{ inc }}</template>
                <template v-else-if="isEmphasis(inc)">{{ inc.lead }}<strong>{{ inc.strong }}</strong>{{ inc.tail }}</template>
                <details v-else class="aptp__seo">
                  <summary class="aptp__seo-summary">{{ inc.summary }}</summary>
                  <div class="aptp__seo-panel">
                    <p class="aptp__seo-intro">{{ inc.intro }}</p>
                    <ul class="aptp__seo-list">
                      <li v-for="pt in inc.points" :key="pt" class="aptp__seo-point">{{ pt }}</li>
                    </ul>
                  </div>
                </details>
              </li>
            </ul>
            <p v-if="p.footnote" class="aptp__foot">{{ p.footnote }}</p>
          </div>
        </li>
      </ol>

      <p class="aptp__cta-wrap">
        <a :href="`#${packages.ctaTarget}`" class="aptp__cta">{{ packages.ctaLabel }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.aptp {
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.aptp__kicker {
  color: var(--grafit-2);
}

.aptp__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-12);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.aptp__register {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Entries on one sheet: a hairline per row, the last one closes the schedule.
   The fill runs wider than the text column — inline padding pulled back out by
   an equal negative margin — so the text stays on the container's own left
   edge (aligned with the kicker, title and CTA) while the band reads as a
   band. At the phone gutter the two cancel exactly, so the bands go
   full-bleed there; no overflow either way, since the container's padding is
   what the margin borrows against. */
.aptp__row {
  display: grid;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  gap: var(--space-4) var(--space-16);
  padding-block: var(--space-10);
  padding-inline: var(--space-5);
  margin-inline: calc(var(--space-5) * -1);
  border-top: 1px solid var(--mreza-strong);
}

.aptp__row:last-child {
  border-bottom: 1px solid var(--mreza-strong);
}

/* THE TIER LADDER: each entry a step darker than the one above, so the three
   separate without a second device. The values are not invented — they are
   interpolated along the paper family's own line, --list (#f5f2eb) to
   --mreza (#d9d3c6), at t = 0.22 / 0.55 / 0.88, which keeps them in the
   family by construction and lands near-even perceptual steps (1.06, 1.10,
   1.10 against each other). Measured on the darkest, --grafit reads 10.80:1
   and --grafit-2 6.99:1 — every tier is far above AA, and the hairlines
   still carry the structure (1.57-1.90). */
.aptp__row--basic {
  background-color: #efebe3;
}

.aptp__row--advanced {
  background-color: #e6e1d7;
}

.aptp__row--profi {
  background-color: #dcd7ca;
}

.aptp__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.aptp__summary {
  margin: 0;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--grafit);
}

.aptp__includes {
  margin: var(--space-5) 0 0;
  padding: 0;
  list-style: none;
}

/* Drawn marker, never a dingbat or an emoji bullet. */
.aptp__include {
  position: relative;
  padding-left: var(--space-6);
  margin-top: var(--space-3);
  line-height: 1.5;
  color: var(--grafit-2);
}

.aptp__include::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 12px;
  height: 1px;
  background: var(--mreza-strong);
}

/* An emphasised phrase inside an include line: heavier and a step darker than
   the body. Never a colour change — the one red stays on the CTA. */
.aptp__include strong {
  font-weight: 600;
  color: var(--grafit);
}

/* An SEO line that opens to its detail. Native <details>: the points are in the
   DOM even when closed, so a crawler and a JS-off reader get all of them;
   clicking only toggles visibility. */
.aptp__seo-summary {
  position: relative;
  padding-right: var(--space-8);
  cursor: pointer;
  list-style: none;
  color: var(--grafit);
}

/* Kill the native disclosure triangle; the +/- below is the affordance. */
.aptp__seo-summary::-webkit-details-marker {
  display: none;
}

/* A +/- drawn from two hairlines, never a dingbat or an emoji. The bars cross
   at a fixed point on the right; the vertical one fades out when the row opens,
   leaving a minus. */
.aptp__seo-summary::after,
.aptp__seo-summary::before {
  content: '';
  position: absolute;
  background: var(--grafit-2);
}

.aptp__seo-summary::after {
  right: 0;
  top: 0.7em;
  width: 12px;
  height: 1.5px;
}

.aptp__seo-summary::before {
  right: 5.25px;
  top: calc(0.7em - 5.25px);
  width: 1.5px;
  height: 12px;
  transition: opacity 200ms var(--ease-out);
}

.aptp__seo[open] .aptp__seo-summary::before {
  opacity: 0;
}

@media (hover: hover) {
  .aptp__seo-summary:hover::after,
  .aptp__seo-summary:hover::before {
    background: var(--grafit);
  }
}

.aptp__seo-summary:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

.aptp__seo-panel {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--mreza);
}

.aptp__seo-intro {
  max-width: 60ch;
  margin: 0;
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptp__seo-list {
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}

.aptp__seo-point {
  position: relative;
  max-width: 60ch;
  padding-left: var(--space-5);
  margin-top: var(--space-3);
  font-size: var(--fs-annot);
  line-height: 1.5;
  color: var(--grafit-2);
}

.aptp__seo-point::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 8px;
  height: 1px;
  background: var(--mreza-strong);
}

/* One-shot reveal on open; nothing on close (native removes the panel). Gated
   off reduced motion, where the panel simply appears. */
@media (prefers-reduced-motion: no-preference) {
  .aptp__seo[open] .aptp__seo-panel {
    animation: aptp-seo-reveal 300ms var(--ease-out);
  }
}

@keyframes aptp-seo-reveal {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.aptp__foot {
  max-width: 62ch;
  margin-top: var(--space-5);
  margin-bottom: 0;
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

.aptp__cta-wrap {
  margin-top: var(--space-12);
  margin-bottom: 0;
}

.aptp__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-inline: var(--space-8);
  background-color: var(--rez);
  color: var(--color-white);
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

@media (hover: hover) {
  .aptp__cta:hover {
    background-color: transparent;
    color: var(--rez);
  }
}

.aptp__cta:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 3px;
}

@media (max-width: 809px) {
  .aptp__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    padding-block: var(--space-8);
  }

  .aptp__foot {
    max-width: none;
  }
}
</style>
