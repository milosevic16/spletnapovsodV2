<script setup lang="ts">
/**
 * The centerpiece: the owner's thesis sentence made into an instrument.
 * Human layer and machine layer BOTH live in the static HTML (stacked on
 * phones, side-by-side on desktop). The machine layer's strings derive from
 * the same modules that emit the real <head> — a build guard asserts they
 * stay equal. JS only adds the phone toggle + wipe.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { hero, invisible, meta } from '@/content/home'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const machineLines = [
  `<html lang="sl">`,
  `<title>${meta.title}</title>`,
  `<meta name="description" content="${meta.description}">`,
  `<link rel="canonical" href="${SITE_ORIGIN}/">`,
  `{ "@type": "Organization", "name": "${SITE_NAME}" }`,
]

const humanLayer = ref<HTMLElement | null>(null)
const machineLayer = ref<HTMLElement | null>(null)
const controlEl = ref<HTMLElement | null>(null)
const host = ref<HTMLElement | null>(null)
const active = ref<'human' | 'machine'>('human')
const hydrated = ref(false)
const fx = createFx()

/** Wipe duration — single source for BOTH the CSS transition and the JS
 *  visibility timeout, so the two can never drift. */
const WIPE_MS = 300
/** Delay between the band arriving and the first attention swell. */
const SETTLE_MS = 600

let pulse: Animation | null = null
let pulsed = false

function applyState(instant = false) {
  const layers = { human: humanLayer.value, machine: machineLayer.value }
  for (const key of ['human', 'machine'] as const) {
    const el = layers[key]
    if (!el) continue
    const isActive = active.value === key
    el.style.transition = instant ? '' : `clip-path ${WIPE_MS}ms ease-out`
    el.style.clipPath = isActive ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)'
    el.setAttribute('aria-hidden', String(!isActive))
    if (isActive) {
      el.style.visibility = ''
      el.style.position = ''
    } else {
      // Collapse the inactive layer out of flow AFTER the wipe (same constant).
      fx.setTimeout(() => {
        if (active.value !== key) {
          el.style.visibility = 'hidden'
          el.style.position = 'absolute'
          el.style.inset = '0'
        }
      }, instant ? 0 : WIPE_MS)
    }
  }
}

function select(which: 'human' | 'machine') {
  if (pulse) {
    pulse.cancel()
    pulse = null
  }
  pulsed = true
  if (active.value === which) return
  active.value = which
  applyState()
}

onMounted(() => {
  // The toggle is a phone affordance; desktop shows both layers statically.
  // Tracked live: a resized/rotated viewport swaps modes cleanly either way.
  const mql = window.matchMedia('(max-width: 1023px)')
  fx.on(mql, 'change', () => {
    if (mql.matches) {
      hydrated.value = true
      applyState(true)
    } else {
      // Desktop CSS force-shows both layers; clear the phone inline state.
      for (const el of [humanLayer.value, machineLayer.value]) {
        if (!el) continue
        el.style.cssText = ''
        el.removeAttribute('aria-hidden')
      }
    }
  })
  if (!mql.matches) return
  hydrated.value = true
  applyState(true)

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  const el = host.value
  const control = controlEl.value
  if (!el || !control) return
  const io = fx.io(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      if (pulsed) return
      fx.setTimeout(() => {
        if (pulsed) return
        // Finite sinusoidal attention pulse: 2 swells, peak at keyframe
        // midpoint, resting transform restated in every keyframe.
        pulse = fx.anim(
          control,
          [
            { transform: 'scale(1)', easing: 'ease-in-out' },
            { transform: 'scale(1.012)', easing: 'ease-in-out' },
            { transform: 'scale(1)' },
          ],
          { duration: 1800, iterations: 2, fill: 'none' },
        )
      }, SETTLE_MS)
    },
    { threshold: 0.35 },
  )
  io.observe(el)
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section id="nevidno" ref="host" class="xray">
    <div class="container">
      <p class="kicker kicker--on-dark">{{ invisible.kicker }}</p>
      <h2 class="xray__title">{{ invisible.title }}</h2>
      <blockquote class="xray__quote">
        <p>{{ invisible.quote }}</p>
      </blockquote>
      <p class="xray__intro">{{ invisible.intro }}</p>

      <div
        ref="controlEl"
        class="xray__control"
        :class="{ 'xray__control--live': hydrated }"
        role="group"
        aria-label="Preklop med vidno in strojno plastjo strani"
      >
        <button
          type="button"
          class="xray__segment"
          :class="{ 'xray__segment--active': active === 'human' }"
          :aria-pressed="active === 'human'"
          @click="select('human')"
        >
          {{ invisible.humanLabel }}
        </button>
        <button
          type="button"
          class="xray__segment"
          :class="{ 'xray__segment--active': active === 'machine' }"
          :aria-pressed="active === 'machine'"
          @click="select('machine')"
        >
          {{ invisible.machineLabel }}
        </button>
      </div>

      <div class="xray__instrument">
        <div ref="humanLayer" class="xray__layer xray__layer--human">
          <p class="xray__mini-kicker kicker">{{ hero.kicker }}</p>
          <p class="xray__mini-title">{{ hero.title }}</p>
          <p class="xray__mini-lead">{{ hero.lead }}</p>
          <span class="xray__mini-btn">{{ hero.ctaPrimary.label }}</span>
        </div>
        <div class="xray__seam" aria-hidden="true"></div>
        <div ref="machineLayer" class="xray__layer xray__layer--machine">
          <p v-for="line in machineLines" :key="line" class="xray__code annot">{{ line }}</p>
          <p class="xray__machine-gloss">{{ invisible.machineGloss }}</p>
        </div>
      </div>

      <ul class="xray__items">
        <li v-for="item in invisible.items" :key="item.id" class="xray__item">
          <span class="xray__item-label">{{ item.label }}</span>
          <span class="xray__item-detail">{{ item.detail }}</span>
        </li>
      </ul>
      <p class="xray__outro">{{ invisible.outro }}</p>
    </div>
  </section>
</template>

<style scoped>
.xray {
  background: var(--panel);
  color: var(--surface);
  padding-block: var(--section-y);
}

.xray__title {
  margin-top: 1rem;
  color: var(--surface);
}

.xray__quote {
  margin-top: 1.75rem;
  border-left: 3px solid var(--accent-on-dark);
  padding-left: 1.25rem;
}

.xray__quote p {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 1.1rem + 0.9vw, 1.7rem);
  font-weight: 500;
  line-height: 1.35;
  max-width: 30ch;
}

.xray__intro {
  margin-top: 1.25rem;
  color: var(--paper-dim);
  max-width: 58ch;
}

/* --- segmented control (phone instrument) -------------------------------- */
.xray__control {
  display: none;
  margin-top: 2rem;
  border: 1px solid var(--underlay-line);
  border-radius: 999px; /* a genuine pill */
  padding: 0.25rem;
  width: fit-content;
  gap: 0.25rem;
}

.xray__control--live {
  display: flex;
}

.xray__segment {
  border: 0;
  background: transparent;
  color: var(--paper-dim);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  min-height: 2.75rem;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  cursor: pointer;
}

.xray__segment--active {
  background: var(--panel-inset);
  color: var(--accent-on-dark);
}

/* --- the instrument ------------------------------------------------------ */
.xray__instrument {
  position: relative;
  margin-top: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.xray__layer--human {
  background: var(--surface-2);
  border: 1px solid var(--hairline);
  color: var(--ink);
  padding: 1.5rem;
  display: grid;
  gap: 0.9rem;
  align-content: start;
}

.xray__mini-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.35rem;
  line-height: 1.2;
  max-width: 18ch;
}

.xray__mini-lead {
  font-size: 0.85rem;
  color: var(--ink-2);
  max-width: 42ch;
}

.xray__mini-btn {
  justify-self: start;
  background: var(--accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
}

.xray__seam {
  display: none;
}

.xray__layer--machine {
  background: var(--panel-inset);
  border: 1px solid var(--underlay-line);
  padding: 1.5rem;
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.xray__code {
  color: var(--accent-on-dark);
  overflow-wrap: anywhere;
}

.xray__machine-gloss {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--paper-dim);
  max-width: 40ch;
}

/* --- inclusion ledger ---------------------------------------------------- */
.xray__items {
  list-style: none;
  margin-top: 2.5rem;
  display: grid;
  gap: 0;
}

.xray__item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  padding-block: 0.85rem;
  border-top: 1px solid var(--underlay-line);
}

.xray__item:last-child {
  border-bottom: 1px solid var(--underlay-line);
}

.xray__item-label {
  font-weight: 600;
  flex: 0 0 100%;
}

.xray__item-detail {
  color: var(--paper-dim);
  max-width: 52ch;
}

.xray__outro {
  margin-top: 1.5rem;
  color: var(--surface);
  font-weight: 600;
  max-width: 52ch;
}

@media (min-width: 640px) {
  .xray__item-label {
    flex: 0 0 14rem;
  }
  .xray__item-detail {
    flex: 1;
  }
}

@media (min-width: 1024px) {
  .xray__control {
    display: none !important; /* desktop shows both layers statically */
  }

  .xray__instrument {
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    margin-top: 2.5rem;
  }

  /* Desktop always shows both layers — neutralize any phone inline state. */
  .xray__layer {
    clip-path: none !important;
    visibility: visible !important;
    position: static !important;
  }

  .xray__seam {
    display: block;
    position: relative;
    width: 1px;
    background: var(--underlay-line);
  }

  .xray__seam::before,
  .xray__seam::after {
    content: '';
    position: absolute;
    left: -2.5px;
    width: 6px;
    height: 2px;
    background: var(--accent-on-dark);
  }
  .xray__seam::before {
    top: 0;
  }
  .xray__seam::after {
    bottom: 0;
  }
}
</style>
