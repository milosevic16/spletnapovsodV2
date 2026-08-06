<script setup lang="ts">
/**
 * Portfolio references on two-layer cards (Dvojna plast): paper card over a
 * dark under-layer whose exposed bottom strip prints the site's REAL live URL.
 * Phone: scroll-snap touch strip, trailing-edge fade only. Desktop: staggered
 * editorial grid. Touch gets the hover-lift as a one-shot on arrival.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion, canHover } from '@/lib/fx'

const strip = ref<HTMLElement | null>(null)
const fx = createFx()

const LIFT_STAGGER_MS = 90

onMounted(() => {
  // One-shot arrival lift = the touch twin of the pointer hover. Never wired
  // where hover exists; never hides anything (cards rest complete).
  if (canHover() || prefersReducedMotion() || !('IntersectionObserver' in window)) return
  const host = strip.value
  if (!host) return
  const cards = Array.from(host.querySelectorAll<HTMLElement>('.refcard__paper'))
  if (!cards.length) return
  const io = fx.io(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      cards.forEach((card, i) => {
        fx.setTimeout(() => {
          fx.anim(
            card,
            [
              { transform: 'translate(0, 0)' },
              { transform: 'translate(-3px, -3px)' },
              { transform: 'translate(0, 0)' },
            ],
            { duration: 600, easing: 'ease-in-out', fill: 'none' },
          )
        }, i * LIFT_STAGGER_MS)
      })
    },
    { threshold: 0.25 },
  )
  io.observe(host)
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section id="reference" class="refs">
    <div class="container">
      <p class="kicker">{{ references.kicker }}</p>
      <h2 class="refs__title">{{ references.title }}</h2>
      <p class="refs__intro">{{ references.intro }}</p>
    </div>

    <div ref="strip" class="refs__strip-wrap">
      <ul class="container refs__grid">
        <li v-for="r in references.items" :key="r.id" class="refs__cell" :data-ref="r.id">
          <a :href="r.url" target="_blank" rel="noopener" class="refcard">
            <span class="refcard__under" aria-hidden="true">
              <span class="refcard__seam annot">{{ r.urlLabel }}</span>
            </span>
            <span class="refcard__paper">
              <picture>
                <source
                  type="image/avif"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.avif ${w}w`).join(', ')"
                  sizes="(min-width: 900px) 560px, min(82vw, 26rem)"
                />
                <source
                  type="image/webp"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.webp ${w}w`).join(', ')"
                  sizes="(min-width: 900px) 560px, min(82vw, 26rem)"
                />
                <img
                  :src="`/img/refs/${r.id}-${r.image.widths[0]}.jpg`"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.jpg ${w}w`).join(', ')"
                  sizes="(min-width: 900px) 560px, min(82vw, 26rem)"
                  :width="r.image.width"
                  :height="r.image.height"
                  :alt="r.alt"
                  loading="lazy"
                  decoding="async"
                  class="refcard__shot"
                />
              </picture>
              <span class="refcard__body">
                <span class="refcard__name">{{ r.name }}</span>
                <span class="refcard__sector">{{ r.sector }}</span>
                <span class="refcard__desc">{{ r.description }}</span>
                <span class="refcard__inks" aria-hidden="true">
                  <span
                    v-for="ink in r.inks"
                    :key="ink"
                    class="refcard__ink"
                    :style="{ background: ink }"
                  ></span>
                </span>
                <span class="refcard__proof">{{ r.proof }}</span>
              </span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.refs {
  padding-block: var(--section-y);
}

.refs__title {
  margin-top: 1rem;
}

.refs__intro {
  margin-top: 1.25rem;
  color: var(--ink-2);
}

/* --- phone: scroll-snap touch strip -------------------------------------- */
.refs__strip-wrap {
  position: relative;
  margin-top: 2.5rem;
}

.refs__grid {
  list-style: none;
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.refs__cell {
  flex: 0 0 82vw;
  max-width: 26rem;
  scroll-snap-align: start;
}

/* Trailing-edge fade only — the leading edge never eats the card just
   scrolled to. Pure decoration, ignores pointer events. */
.refs__strip-wrap::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 2.5rem;
  /* fallback literal = --surface at alpha 0; the relative-color line below
     tracks the token where supported */
  background: linear-gradient(to right, rgb(247 244 238 / 0), var(--surface));
  background: linear-gradient(to right, rgb(from var(--surface) r g b / 0), var(--surface));
  pointer-events: none;
}

/* --- the two-layer card -------------------------------------------------- */
.refcard {
  position: relative;
  display: block;
  height: 100%;
  padding: 0 4px 28px 0;
  text-decoration: none;
}

.refcard__under {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 0;
  bottom: 0;
  background: var(--panel);
}

.refcard__seam {
  position: absolute;
  left: 0.75rem;
  right: 0.5rem;
  bottom: 0;
  height: 28px;
  line-height: 28px;
  color: var(--accent-on-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.refcard__paper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-2);
  border: 1px solid var(--hairline);
}

.refcard__shot {
  width: 100%;
  height: auto;
  border-bottom: 1px solid var(--hairline);
}

.refcard__body {
  display: grid;
  gap: 0.5rem;
  padding: 1.25rem;
}

.refcard__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--ink);
}

.refcard__sector {
  font-family: var(--font-mono);
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--ink-2);
}

.refcard__desc {
  font-size: 0.95rem;
  color: var(--ink);
  max-width: 38ch;
}

.refcard__inks {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.35rem;
}

.refcard__ink {
  width: 14px;
  height: 14px;
  border: 1px solid rgb(35 38 32 / 0.18);
}

.refcard__proof {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--ink-2);
  max-width: 38ch;
}

/* Pointer devices: the motif's lift on hover (CSS-only, media-gated). */
@media (hover: hover) {
  .refcard__paper {
    transition:
      transform var(--t-lift) var(--ease-out),
      border-color var(--t-lift) var(--ease-out);
  }
  .refcard:hover .refcard__paper,
  .refcard:focus-visible .refcard__paper {
    transform: translate(-3px, -3px);
    border-color: var(--accent);
  }
}

/* --- desktop: staggered editorial grid ----------------------------------- */
@media (min-width: 900px) {
  .refs__strip-wrap::after {
    display: none;
  }

  .refs__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2.5rem 3rem;
    overflow: visible;
    padding-bottom: 0;
  }

  .refs__cell {
    flex: none;
    max-width: none;
  }

  .refs__cell[data-ref='mercpeter'] {
    grid-column: 1;
    grid-row: 1 / span 2;
    /* natural height — the card must not stretch to the combined row height */
    align-self: start;
  }
  .refs__cell[data-ref='lemur'] {
    grid-column: 2;
    grid-row: 1;
    margin-top: 4.5rem;
  }
  .refs__cell[data-ref='bloctopus'] {
    grid-column: 2;
    grid-row: 2;
  }
}
</style>
