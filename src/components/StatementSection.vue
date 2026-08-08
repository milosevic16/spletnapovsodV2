<script setup lang="ts">
/**
 * The opening band, recomposed to the design system's DIAGONAL HERO archetype:
 * the wordmark as display-XL monument hard top-left (two stacked lines under
 * the standalone pd mark), then a bottom row of empty spacer · media plate ·
 * caption — the diagonal reads mark/wordmark top-left → plate centre-right →
 * claim bottom-right. The empty spacer is the archetype's own device (the
 * asymmetry is spent as width runs out and the row stacks on phones).
 *
 * THE MARK is the intro veil's landing target. It stands alone above the
 * lines, flush with the section's padding, so the landing formula is exact by
 * construction: ink-left = --hero-inset, ink-top = --hero-inset (+ the 45px
 * desktop masthead strip), ink-height = 0.55em of --hero-display. The veil
 * (index.html) copies those as literals — change either, change both.
 *
 * THE TWO LINES drift at different speeds as the page scrolls away (Spletna
 * leads, Povsod lags — the seam between them opens). Scroll-linked transform
 * on a custom property, rAF-throttled, bounded to the first 1.3 viewports,
 * compositor-only; with reduced motion the wiring never happens. The mark
 * does NOT drift: it is the landing target and the composition's datum.
 *
 * »Povsod« carries the register's script splice (the »od« tail in
 * Inspiration against the machined caps) — same device as the section
 * titles, set by eye, derived from the literal so it degrades to the plain
 * word if the lettering ever changes.
 *
 * The media plate is the site's own abstract package drawing (the design
 * pillar plate — the identity element recurring, per the art direction's
 * "the motif recurs rather than appears once"). Decorative here (aria-hidden,
 * empty alt): the Paketi section below carries its meaningful rendering.
 * It deliberately overflows its column by 3.5% — the reference's measured
 * plate behaviour (414px in a 400px slot).
 *
 * The small mono line is the honesty register's data widget: the site's own
 * host, a checkable machine identifier (never prose, never a claim).
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { hero } from '@/content/home'
import { SITE_ORIGIN } from '@/lib/constants'
import { createFx, prefersReducedMotion } from '@/lib/fx'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

/** The script splice on the second line: the »od« tail, one run, never the
 *  first glyph. Derived so a lettering change degrades to the plain word. */
const WORD_1 = 'Spletna'
const WORD_2 = 'Povsod'
const SPLICE_RUN = 'od'
const spliceAt = WORD_2.endsWith(SPLICE_RUN) ? WORD_2.length - SPLICE_RUN.length : -1
const word2Head = spliceAt > 0 ? WORD_2.slice(0, spliceAt) : WORD_2
const word2Run = spliceAt > 0 ? SPLICE_RUN : ''

/** The data widget: the site's own host — a real, checkable machine byte. */
const host = new URL(SITE_ORIGIN).host

/**
 * The differential drift. Negative = the line climbs as the page scrolls
 * away; Spletna leads, Povsod lags, so the gap between them OPENS. Bounded to
 * the hero's own exit so the numbers never grow unwatched.
 */
const RATE_1 = -0.16
const RATE_2 = -0.05
const DRIFT_LIMIT_VH = 1.3

const fx = createFx()
const live = ref(false)
const par1 = ref(0)
const par2 = ref(0)
let raf = 0

function measure() {
  raf = 0
  const y = Math.min(Math.max(window.scrollY, 0), window.innerHeight * DRIFT_LIMIT_VH)
  par1.value = y * RATE_1
  par2.value = y * RATE_2
}

function onScroll() {
  if (raf) cancelAnimationFrame(raf)
  raf = fx.raf(measure)
}

onMounted(() => {
  live.value = true
  // Reduced motion: the static composition IS the finished design — no
  // wiring, no drift, nothing to clean up.
  if (prefersReducedMotion()) return
  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(window, 'resize', onScroll, { passive: true })
  measure()
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section class="stmt">
    <!-- data-brand-sentinel is a contract with SiteMasthead: the phone bar
         appears exactly when this element leaves the screen, so the brand is
         never absent from the page. -->
    <div class="stmt__brand" data-brand-sentinel>
      <!-- The pd mark: two overlapping discs carrying Povsod's first and last
           letters; the d is the p rotated 180° (the mark's point symmetry).
           Standalone above the lines: its ink-top and ink-left ARE the
           section inset, which is what keeps the veil's landing formula
           exact (index.html — change either, change both). -->
      <svg class="stmt__mark" viewBox="0 0 244 144" aria-hidden="true">
        <circle cx="72" cy="72" r="72" fill="var(--rez)" />
        <circle cx="172" cy="72" r="72" fill="var(--rez)" />
        <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round">
          <circle cx="79" cy="79" r="33" />
          <line x1="46" y1="55" x2="46" y2="118" />
        </g>
        <g fill="none" stroke="var(--list)" stroke-width="18" stroke-linecap="round"
          transform="rotate(180 122 72)">
          <circle cx="79" cy="79" r="33" />
          <line x1="46" y1="55" x2="46" y2="118" />
        </g>
      </svg>
      <span class="stmt__line stmt__line--1" :style="live ? { '--par': par1 + 'px' } : undefined">
        <span class="stmt__wordmark">{{ WORD_1 }}</span>
      </span>
      <span class="stmt__line stmt__line--2" :style="live ? { '--par': par2 + 'px' } : undefined">
        <span class="stmt__wordmark"
          >{{ word2Head }}<span v-if="word2Run" class="stmt__script">{{ word2Run }}</span></span
        >
      </span>
    </div>

    <div class="stmt__foot">
      <p class="stmt__data emisija">{{ host }}</p>
      <!-- The plate: the abstract package drawing, cover-fitted, overflowing
           its slot by the reference's measured 3.5%. Decorative here. -->
      <picture class="stmt__plate" aria-hidden="true">
        <source
          type="image/avif"
          srcset="
            /img/pillars/design-480.avif   480w,
            /img/pillars/design-800.avif   800w,
            /img/pillars/design-1200.avif 1200w,
            /img/pillars/design-1600.avif 1600w
          "
          sizes="(min-width: 900px) 30vw, 92vw"
        />
        <source
          type="image/webp"
          srcset="
            /img/pillars/design-480.webp   480w,
            /img/pillars/design-800.webp   800w,
            /img/pillars/design-1200.webp 1200w,
            /img/pillars/design-1600.webp 1600w
          "
          sizes="(min-width: 900px) 30vw, 92vw"
        />
        <img
          src="/img/pillars/design-1200.jpg"
          srcset="
            /img/pillars/design-480.jpg   480w,
            /img/pillars/design-800.jpg   800w,
            /img/pillars/design-1200.jpg 1200w,
            /img/pillars/design-1600.jpg 1600w
          "
          sizes="(min-width: 900px) 30vw, 92vw"
          width="1200"
          height="900"
          alt=""
          fetchpriority="high"
          decoding="async"
        />
      </picture>
      <h1 class="stmt__title">
        <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
      </h1>
    </div>
  </section>
</template>

<style scoped>
/* The one margin — all four sides — is --hero-inset (tokens.css): the veil's
   landing formula and the masthead's corner button both stand on it. The band
   fills the first viewport less the desktop masthead strip, exactly like the
   reference hero owns its screen.
   PINNED light: the page root flips with the ground switch and this section's
   inks are still the paper world's — the pin comes off when the section joins
   the flip. */
.stmt {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(2rem, 6svh, 4rem);
  min-height: calc(100svh - 45px);
  padding: var(--hero-inset);
  background: var(--list);
}

/* --- the monument ---------------------------------------------------------- */
.stmt__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* Clear the phone menu button standing in the top-right corner. */
  padding-right: 3rem;
}

/* The mark: standalone, its box IS its ink (SVG), so ink-top = inset by
   construction. Height in em of the display size — the veil copies
   0.55 × the --hero-display clamps as its landing height. */
.stmt__mark {
  height: 0.55em;
  width: auto;
  font-size: var(--hero-display);
  margin-bottom: 0.12em;
}

/* The lines: display-XL, uppercase, lh 0.8, tight — monumentality is scale.
   Each line drifts on its own custom property (JS-fed, compositor-only);
   at rest and with JS off the var falls back to 0. */
.stmt__line {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--hero-display);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: translateY(var(--par, 0px));
}

.stmt__wordmark {
  display: inline-block;
}

/* The splice: the script face at the same size, lowercase against the caps,
   lh 1 / ls 0 — the measured convention. */
.stmt__script {
  font-family: var(--font-script);
  font-weight: 400;
  text-transform: none;
  line-height: 1;
  letter-spacing: 0;
}

.stmt__hl {
  /* Display-adjacent size, 3:1 floor applies — 5.37:1 on paper. */
  color: var(--rez);
}

/* --- the diagonal's bottom row --------------------------------------------- */
/* Phones: an honest single column (the spacer is deleted, per the measured
   reflow rule); the plate leads, the claim follows, the data line closes. */
.stmt__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-6);
}

.stmt__data {
  color: var(--grafit-2);
  order: 3;
}

.stmt__plate {
  width: 100%;
  overflow: visible;
}

.stmt__plate img {
  /* The reference's plates exceed their slot (414 in 400 measured) — the
     overflow is the point, so max-width yields to it. */
  width: 103.5%;
  max-width: none;
  height: auto;
}

.stmt__title {
  font-size: clamp(1.25rem, 1.05rem + 0.9vw, 2rem);
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  max-width: 24ch;
}

/* Desktop: spacer 28 · media 30 · caption 39 with 16px gaps — the archetype's
   measured row. The caption bottoms out against the plate (the diagonal's
   last step); the data line holds the spacer's top-left. */
@media (min-width: 900px) {
  .stmt__foot {
    flex-direction: row;
    align-items: flex-end;
    gap: var(--space-4);
  }

  .stmt__data {
    order: 0;
    flex: 0 1 28%;
    align-self: flex-start;
  }

  .stmt__plate {
    flex: 0 1 30%;
  }

  .stmt__title {
    flex: 0 1 39%;
    margin-left: auto;
  }
}
</style>
