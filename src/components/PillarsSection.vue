<script setup lang="ts">
/**
 * "Kaj vsebujejo vsi paketi?" — three pillars as a native <details> ledger
 * (spec-sheet rows, not cards). Content is in the DOM closed — crawlers read
 * everything; JS adds two courtesies on top: one row open at a time (phones)
 * and a scroll correction so collapsing content above the tapped summary
 * never yanks the page.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { pillars } from '@/content/home'
import { createFx } from '@/lib/fx'
import PrerezLine from './PrerezLine.vue'

const host = ref<HTMLElement | null>(null)
const fx = createFx()

onMounted(() => {
  const root = host.value
  if (!root) return
  const rows = Array.from(root.querySelectorAll<HTMLDetailsElement>('details'))
  const isPhone = window.matchMedia('(max-width: 899px)').matches

  for (const row of rows) {
    fx.on(row, 'toggle', () => {
      if (!row.open) return
      if (!isPhone) return
      // Courtesy, not markup: only one row open at a time on phones.
      for (const other of rows) {
        if (other !== row && other.open) {
          const summary = row.querySelector('summary')
          const before = summary?.getBoundingClientRect().top ?? 0
          other.open = false
          const after = summary?.getBoundingClientRect().top ?? 0
          const drift = after - before
          if (drift !== 0) {
            // Hold the tapped summary still (instant — never a glide).
            window.scrollBy({ top: drift, behavior: 'instant' as ScrollBehavior })
          }
        }
      }
    })
  }
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section id="paketi" ref="host" class="pillars">
    <div class="container">
      <p class="kicker">{{ pillars.kicker }}</p>
      <h2 class="pillars__title">{{ pillars.title }}</h2>
      <p class="pillars__intro">{{ pillars.intro }}</p>

      <div class="pillars__ledger">
        <details v-for="p in pillars.items" :key="p.id" class="pillar">
          <summary class="pillar__summary">
            <span class="pillar__name">{{ p.title }}</span>
            <span class="pillar__artifact annot" aria-hidden="true">{{ p.artifact }}</span>
            <span class="pillar__indicator" aria-hidden="true"></span>
          </summary>
          <div class="pillar__body">
            <p class="pillar__summary-text">{{ p.summary }}</p>
            <dl class="pillar__points">
              <div v-for="pt in p.points" :key="pt.label" class="pillar__point">
                <dt class="pillar__point-label">{{ pt.label }}</dt>
                <dd class="pillar__point-detail">{{ pt.detail }}</dd>
              </div>
            </dl>
            <div v-if="p.prerez" class="pillar__prerez">
              <PrerezLine :annotation="p.prerez.annotation" :gloss="p.prerez.gloss" />
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pillars {
  background: var(--list-2);
  padding-block: var(--section-y);
}

.pillars__title {
  margin-top: 1rem;
}

.pillars__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

.pillars__ledger {
  margin-top: 2.5rem;
  border-top: 1px solid var(--mreza-strong);
}

.pillar {
  border-bottom: 1px solid var(--mreza-strong);
}

.pillar__summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 4rem;
  padding-block: 0.9rem;
  cursor: pointer;
  list-style: none;
}

.pillar__summary::-webkit-details-marker {
  display: none;
}

.pillar__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.15rem, 1.05rem + 0.6vw, 1.5rem);
  flex: 1;
}

.pillar__artifact {
  display: none;
  color: var(--grafit-2);
}

/* +/− indicator drawn as two accent strokes — no dingbat glyph. */
.pillar__indicator {
  position: relative;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
}
.pillar__indicator::before,
.pillar__indicator::after {
  content: '';
  position: absolute;
  background: var(--rez);
}
.pillar__indicator::before {
  left: 0;
  right: 0;
  top: 6px;
  height: 2px;
}
.pillar__indicator::after {
  top: 0;
  bottom: 0;
  left: 6px;
  width: 2px;
  transition: transform 200ms var(--ease-out);
}
.pillar[open] .pillar__indicator::after {
  transform: scaleY(0);
}

.pillar__body {
  padding: 0.25rem 0 1.75rem;
  border-left: 3px solid var(--rez);
  padding-left: 1.25rem;
  background: var(--rez-vodni);
  margin-bottom: 1.25rem;
  padding-top: 1.25rem;
  padding-right: 1.25rem;
}

.pillar__summary-text {
  max-width: var(--measure);
}

.pillar__points {
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;
}

.pillar__point-label {
  font-weight: 600;
}

.pillar__point-detail {
  color: var(--grafit-2);
  max-width: 58ch;
}

.pillar__prerez {
  margin-top: 1.75rem;
  max-width: 28rem;
}

@media (min-width: 640px) {
  .pillar__artifact {
    display: inline;
  }

  .pillar__points {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1.25rem 2rem;
  }
}
</style>
