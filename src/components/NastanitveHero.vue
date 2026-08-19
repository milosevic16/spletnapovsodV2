<script setup lang="ts">
/**
 * The subpage's opening band: kicker, the page's single h1, a short lead and
 * the one call to action.
 *
 * Static by design. Nothing here is built by JS, so a crawler and a JS-off
 * reader get the whole opening, the same contract the home statement band
 * keeps.
 *
 * THE BACKDROP is the owner's interior photo reduced to the page's own paper
 * (one colour, faint, built by scripts/build-apartmaji-hero.mjs). It is plain
 * static markup: a <picture> with AVIF/WebP/JPEG width variants, decorative
 * (empty alt, aria-hidden), eager and fetchpriority=high so it is never the
 * lazy-loaded-LCP mistake. The .press dot screen is a sibling ABOVE it, so the
 * drafting texture stays; the content sits above both.
 */
import { hero } from '@/content/nastanitve'
</script>

<template>
  <section class="apth">
    <picture class="apth__bgpic">
      <source type="image/avif" srcset="/img/apt/apt-hero-v1-768.avif 768w, /img/apt/apt-hero-v1-1152.avif 1152w, /img/apt/apt-hero-v1-1536.avif 1536w, /img/apt/apt-hero-v1-2048.avif 2048w, /img/apt/apt-hero-v1-2560.avif 2560w, /img/apt/apt-hero-v1-3136.avif 3136w" sizes="100vw" />
      <source type="image/webp" srcset="/img/apt/apt-hero-v1-768.webp 768w, /img/apt/apt-hero-v1-1152.webp 1152w, /img/apt/apt-hero-v1-1536.webp 1536w, /img/apt/apt-hero-v1-2048.webp 2048w, /img/apt/apt-hero-v1-2560.webp 2560w, /img/apt/apt-hero-v1-3136.webp 3136w" sizes="100vw" />
      <img
        class="apth__bg"
        src="/img/apt/apt-hero-v1-1536.jpg"
        srcset="/img/apt/apt-hero-v1-768.jpg 768w, /img/apt/apt-hero-v1-1152.jpg 1152w, /img/apt/apt-hero-v1-1536.jpg 1536w, /img/apt/apt-hero-v1-2048.jpg 2048w, /img/apt/apt-hero-v1-2560.jpg 2560w, /img/apt/apt-hero-v1-3136.jpg 3136w"
        sizes="100vw"
        width="3136"
        height="1344"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchpriority="high"
      />
    </picture>
    <div class="apth__screen press press--light" aria-hidden="true"></div>

    <div class="container">
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-color: var(--list);
  color: var(--grafit);
  padding-block: var(--section-block);
}

/* The interior backdrop, reduced to the page's own paper: a faint monocolour
   wash, never a photograph. Full-bleed, cover-fit, behind everything. */
.apth__bgpic {
  display: contents;
}

.apth__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* A phone-width crop of this 2.33:1 room shows one narrow slice. Centred it
   lands on the empty wall over the sofa; the picture's own subject — the
   pendant lights and the dining table — sits at ~61–82% of the width, so the
   crop aims there (80% keeps the window centred on the lamps once cover's
   percentage mapping is accounted for). */
@media (max-width: 809px) {
  .apth__bg {
    object-position: 80% center;
  }
}

/* The .press dot screen, re-laid OVER the image so the drafting texture is not
   buried by it. Pure decoration. */
.apth__screen {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* Content rides above the backdrop and its texture. */
.apth > .container {
  position: relative;
  z-index: 2;
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
