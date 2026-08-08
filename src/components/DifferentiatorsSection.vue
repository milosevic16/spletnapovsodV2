<script setup lang="ts">
/**
 * Kje se ločimo — the SPECIMEN SHEET.
 *
 * Four claims, and each one already owns a measured value ("100 % po meri",
 * "3 delovni dnevi", "24 h"). Those values are set as the sheet's specimens:
 * display type at full size, one per band, walking across the sheet in a
 * zigzag while the claim and its explanation hang beside them. No drawing, no
 * plate, no picture — the type IS the image, which is the one register the
 * page has not used yet and the plainest way to say "here is the number".
 *
 * THE VALUES RESOLVE OUT OF NOISE. On arrival each specimen scrambles through
 * the symbol alphabet and settles, left to right, in the extracted system's
 * own measured cycle (800ms; motion.md #7 — "text is signal, not paint"). The
 * rule above each band draws itself across at the same moment. Both are
 * one-shot, per band, and the effect READS the text the template already
 * rendered — it never authors it, so the prerendered HTML carries every value
 * and a crawler sees the finished sheet.
 *
 * Accessibility of a scrambling string: the element is marked aria-hidden for
 * the length of its own cycle and unmarked when it settles, so assistive tech
 * is never handed a line of symbols — it either reads the value before the
 * effect or after it, never during. The unmount path restores the captured
 * text and clears the flag together.
 *
 * THIS BAND JOINS THE DARK HALF. The page flips once at Tradicija and stays
 * flipped; this section used to be pinned light against that, which left a
 * paper island between two dark bands. It now paints the ink ground (one step
 * off the black above and below it), so the second half of the page reads as
 * one continuous world — and the pin is gone.
 *
 * NOT NUMBERED, deliberately: four claims are not a sequence, and decorative
 * 01/02/03 eyebrows on unordered content are exactly the scaffolding the house
 * rules ban. The ticks under the three-day specimen are the one ordinal thing
 * here, and they are real content (PON · TOR · SRE).
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { differentiators } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const root = ref<HTMLElement | null>(null)

/** The reference's measured scramble: one 800ms cycle, symbol alphabet. */
const ALPHABET = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const SCRAMBLE_MS = 800
/** The system's explicit delay ladder — 0.1s steps, never staggerChildren. */
const STAGGER_MS = 90
/** The rule draws in the same beat as the value it introduces. */
const DRAW_MS = 620

/** Captured DOM text, restored on unmount (an effect must be able to undo
 *  every string it touched). */
const captured: Array<[HTMLElement, string]> = []

function scramble(el: HTMLElement, text: string, delayMs: number) {
  const chars = [...text]
  // Symbols in place of a real value must never reach assistive tech.
  el.setAttribute('aria-hidden', 'true')
  const settle = () => {
    el.textContent = text
    el.removeAttribute('aria-hidden')
  }
  const t0 = performance.now() + delayMs
  const step = (now: number) => {
    // A hidden tab suspends rAF; land on the value rather than leaving the
    // sheet scrambled until the tab returns.
    if (document.hidden) {
      settle()
      return
    }
    const t = (now - t0) / SCRAMBLE_MS
    if (t < 0) {
      fx.raf(step)
      return
    }
    if (t >= 1) {
      settle()
      return
    }
    const resolved = Math.floor(t * chars.length)
    let out = ''
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i]!
      out += i < resolved || c === ' ' ? c : ALPHABET[(Math.random() * ALPHABET.length) | 0]
    }
    el.textContent = out
    fx.raf(step)
  }
  fx.raf(step)
}

onMounted(() => {
  const host = root.value
  if (!host) return
  // Reduced motion: the settled sheet IS the design — nothing is created, no
  // text is touched, no observer is armed.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

  const bands = Array.from(host.querySelectorAll<HTMLElement>('.dif__spec'))
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const band = e.target as HTMLElement
        io.unobserve(band)
        const i = bands.indexOf(band)
        const delay = Math.min(i, 3) * STAGGER_MS

        const value = band.querySelector<HTMLElement>('.dif__value')
        if (value) {
          const text = value.textContent ?? ''
          captured.push([value, text])
          scramble(value, text, delay)
        }

        const rule = band.querySelector<HTMLElement>('.dif__rule')
        if (rule) {
          // Last keyframe equals the stylesheet's rest, fill:'none' — nothing
          // to defend afterwards and cancel-safe at any instant.
          fx.anim(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
            duration: DRAW_MS,
            delay,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'none',
          })
        }
      }
    },
    { threshold: 0.35 },
  )
  for (const b of bands) io.observe(b)
})

onUnmounted(() => {
  for (const [el, text] of captured) {
    el.textContent = text
    el.removeAttribute('aria-hidden')
  }
  captured.length = 0
  fx.dispose()
})
</script>

<template>
  <section id="razlike" ref="root" class="dif">
    <div class="container dif__head">
      <p class="kicker kicker--on-dark">{{ differentiators.kicker }}</p>
      <h2 class="dif__title">{{ differentiators.title }}</h2>
    </div>

    <ul class="dif__sheet">
      <li v-for="d in differentiators.items" :key="d.id" class="dif__spec">
        <span class="dif__rule" aria-hidden="true"></span>

        <div class="container dif__grid">
          <div class="dif__measure">
            <p class="dif__value">{{ d.measure.annotation }}</p>
            <!-- The one ordinal thing on the sheet, and it is real content:
                 the three working days the claim promises. -->
            <ul v-if="d.measure.ticks" class="dif__ticks">
              <li v-for="t in d.measure.ticks" :key="t" class="dif__tick">{{ t }}</li>
            </ul>
            <p class="dif__gloss emisija">{{ d.measure.gloss }}</p>
          </div>

          <div class="dif__caption">
            <h3 class="dif__claim">{{ d.title }}</h3>
            <p class="dif__body">{{ d.body }}</p>
            <p v-if="d.footnote" class="dif__footnote">{{ d.footnote }}</p>
          </div>
        </div>
      </li>
    </ul>

    <!-- The sheet closes on its own rule. -->
    <span class="dif__rule dif__rule--close" aria-hidden="true"></span>
  </section>
</template>

<style scoped>
/* The ink ground: one step off the black above (Tradicija) and below
   (Kontakt), so the page's dark half reads as one world with this band
   lifted slightly out of it. Paper on it 13.9:1, papir-dim 10.4:1. */
.dif {
  background: var(--grafit);
  color: var(--list);
  padding-block: var(--section-block);
}

.dif__head {
  margin-bottom: var(--space-16);
}

/* The title holds the left two thirds; the right third is left empty on
   purpose — the system's own asymmetry, spent rather than filled. */
.dif__title {
  margin-top: var(--space-3);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--list);
  max-width: 16ch;
}

.dif__sheet {
  list-style: none;
}

.dif__spec {
  display: block;
}

/* Full-bleed hairlines: the sheet's own ruling, drawn from the left when the
   band arrives (JS animates from scaleX(0); this IS the rest state). */
.dif__rule {
  display: block;
  height: var(--divider-width);
  background: var(--crta-na-temnem);
  transform-origin: left center;
}

.dif__grid {
  padding-block: var(--space-12);
  display: grid;
  gap: var(--space-8);
  align-items: start;
}

/* --- the specimen ------------------------------------------------------------ */
.dif__value {
  font-family: var(--font-sans);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: 0.85;
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--list);
  max-width: none;
  overflow-wrap: anywhere;
}

.dif__ticks {
  list-style: none;
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-5);
}

/* Each day gets its own tick above it — a sequence drawn, not numbered. */
.dif__tick {
  position: relative;
  padding-top: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: 0.12em;
  color: var(--papir-dim);
}

.dif__tick::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--rez-na-temnem);
}

.dif__gloss {
  margin-top: var(--space-5);
  color: var(--papir-dim); /* 10.4:1 on the ink ground */
  max-width: 40ch;
}

/* --- the caption -------------------------------------------------------------- */
.dif__claim {
  font-family: var(--font-sans);
  font-stretch: normal;
  font-size: clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem);
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--list);
}

.dif__body {
  margin-top: var(--space-4);
  color: var(--papir-dim);
  max-width: 52ch;
}

.dif__footnote {
  margin-top: var(--space-3);
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--papir-dim);
  max-width: 52ch;
  padding-left: var(--space-4);
  border-left: var(--divider-width) solid var(--crta-na-temnem);
}

/* --- desktop: the zigzag ------------------------------------------------------
   The specimen and its caption swap sides band to band, so the values walk
   across the sheet instead of stacking in a column. */
@media (min-width: 900px) {
  .dif__grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    column-gap: var(--space-16);
  }

  .dif__spec:nth-child(even) .dif__measure {
    grid-column: 2;
    grid-row: 1;
  }

  .dif__spec:nth-child(even) .dif__caption {
    grid-column: 1;
    grid-row: 1;
  }

  /* The caption's text hangs from the specimen's baseline rather than its
     box top — the specimen is display type with a 0.85 line box, so a plain
     start-alignment leaves the claim floating high. */
  .dif__caption {
    padding-top: 0.35em;
  }
}
</style>
