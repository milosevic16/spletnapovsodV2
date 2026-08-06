<script setup lang="ts">
/**
 * Dva načina gradnje — the WordPress argument, DRAWN. Two section drawings:
 * the static site as one monolithic poché slab on clean footings; the
 * WordPress template as an assembly of bolted-on plugin boxes resting on a
 * database chamber. The drawings depict ONLY the structural facts already in
 * the copy (house rule: architecture, never benchmarks) and are aria-hidden —
 * the accessible argument is the row list below, which keeps the proven
 * pattern: deliberately NOT a <table> (stacked-table responsive patterns
 * destroy semantics in screen readers); each side carries its own label,
 * visually hidden on desktop where the column head does that job.
 *
 * Stroke draw: one-shot on arrival. Rest state in the stylesheet is DRAWN —
 * JS hides via inline style only, so crawlers, JS-off and reduced-motion all
 * see the finished drawing.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { comparison } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const host = ref<HTMLElement | null>(null)

const DRAW_MS = 900
const FILL_MS = 350
const STAGGER_MS = 70

onMounted(() => {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  const root = host.value
  if (!root) return
  // Dashed shapes keep their visual dash — they fade in with the fills
  // instead of stroke-drawing (a draw would stomp their dasharray).
  const strokes = Array.from(root.querySelectorAll<SVGElement>('.cmp__stroke:not(.cmp__dashed)'))
  const fills = Array.from(root.querySelectorAll<SVGElement>('.cmp__fill, .cmp__dashed'))
  if (!strokes.length && !fills.length) return

  // Hide via inline style only — the stylesheet rest state stays finished.
  for (const s of strokes) {
    s.style.strokeDasharray = '1'
    s.style.strokeDashoffset = '1'
  }
  for (const f of fills) f.style.opacity = '0'

  const io = fx.io(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      strokes.forEach((s, i) => {
        fx.anim(s, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: DRAW_MS,
          delay: i * STAGGER_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'none',
        })
        fx.setTimeout(() => {
          s.style.strokeDashoffset = '0'
        }, DRAW_MS + i * STAGGER_MS)
      })
      const fillDelay = DRAW_MS + strokes.length * STAGGER_MS - 200
      fills.forEach((f) => {
        fx.anim(f, [{ opacity: 0 }, { opacity: 1 }], {
          duration: FILL_MS,
          delay: fillDelay,
          easing: 'ease-out',
          fill: 'none',
        })
        fx.setTimeout(() => {
          f.style.opacity = '1'
        }, fillDelay + FILL_MS)
      })
      // Safety net: restore everything if the tab was throttled mid-draw.
      fx.setTimeout(() => {
        for (const s of strokes) s.style.cssText = ''
        for (const f of fills) f.style.cssText = ''
      }, fillDelay + FILL_MS + 1200)
    },
    { threshold: 0.35 },
  )
  io.observe(root)
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section ref="host" class="cmp">
    <div class="container">
      <p class="datum">{{ comparison.kicker }}</p>
      <h2 class="cmp__title">{{ comparison.title }}</h2>
      <p class="cmp__intro">{{ comparison.intro }}</p>

      <!-- The drawn argument — decorative twin of the row list below. -->
      <div class="cmp__drawings" aria-hidden="true">
        <figure class="cmp__figure">
          <svg viewBox="0 0 220 170" class="cmp__svg">
            <!-- ground -->
            <line x1="6" y1="132" x2="214" y2="132" class="cmp__stroke" pathLength="1" />
            <!-- below-ground hatch -->
            <g class="cmp__hatch">
              <line x1="14" y1="146" x2="28" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="44" y1="146" x2="58" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="74" y1="146" x2="88" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="104" y1="146" x2="118" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="134" y1="146" x2="148" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="164" y1="146" x2="178" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="194" y1="146" x2="208" y2="132" class="cmp__stroke" pathLength="1" />
            </g>
            <!-- one monolithic slab on two clean footings -->
            <rect x="58" y="28" width="104" height="92" class="cmp__fill" />
            <rect x="64" y="120" width="26" height="12" class="cmp__fill" />
            <rect x="130" y="120" width="26" height="12" class="cmp__fill" />
          </svg>
          <figcaption class="datum cmp__caption cmp__caption--ours">
            {{ comparison.oursLabel }}
          </figcaption>
        </figure>

        <figure class="cmp__figure">
          <svg viewBox="0 0 220 170" class="cmp__svg">
            <line x1="6" y1="132" x2="214" y2="132" class="cmp__stroke" pathLength="1" />
            <!-- template box -->
            <rect x="62" y="34" width="96" height="46" class="cmp__stroke cmp__dashed" pathLength="1" fill="none" />
            <!-- bolted-on plugin boxes -->
            <rect x="38" y="40" width="18" height="18" class="cmp__stroke" pathLength="1" fill="none" />
            <circle cx="60" cy="49" r="2.5" class="cmp__fill" />
            <rect x="164" y="48" width="18" height="18" class="cmp__stroke" pathLength="1" fill="none" />
            <circle cx="161" cy="57" r="2.5" class="cmp__fill" />
            <rect x="38" y="66" width="18" height="18" class="cmp__stroke" pathLength="1" fill="none" />
            <circle cx="60" cy="75" r="2.5" class="cmp__fill" />
            <rect x="164" y="74" width="18" height="18" class="cmp__stroke" pathLength="1" fill="none" />
            <circle cx="161" cy="83" r="2.5" class="cmp__fill" />
            <!-- legs down to the database chamber everything rests on -->
            <line x1="86" y1="80" x2="86" y2="96" class="cmp__stroke" pathLength="1" />
            <line x1="134" y1="80" x2="134" y2="96" class="cmp__stroke" pathLength="1" />
            <rect x="70" y="96" width="80" height="30" class="cmp__stroke cmp__dashed" pathLength="1" fill="none" />
            <!-- below-ground hatch -->
            <g class="cmp__hatch">
              <line x1="14" y1="146" x2="28" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="44" y1="146" x2="58" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="74" y1="146" x2="88" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="104" y1="146" x2="118" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="134" y1="146" x2="148" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="164" y1="146" x2="178" y2="132" class="cmp__stroke" pathLength="1" />
              <line x1="194" y1="146" x2="208" y2="132" class="cmp__stroke" pathLength="1" />
            </g>
          </svg>
          <figcaption class="datum cmp__caption">{{ comparison.theirsLabel }}</figcaption>
        </figure>
      </div>

      <!-- Column head: desktop only, purely visual — every cell below still
           carries its own label for assistive tech. -->
      <div class="cmp__head" aria-hidden="true">
        <span class="datum cmp__head-cell"></span>
        <span class="datum cmp__head-cell cmp__head-cell--ours">{{ comparison.oursLabel }}</span>
        <span class="datum cmp__head-cell">{{ comparison.theirsLabel }}</span>
      </div>

      <ul class="cmp__rows">
        <li v-for="row in comparison.rows" :key="row.id" class="cmp__row">
          <span class="datum cmp__criterion">{{ row.criterion }}</span>
          <span class="cmp__side cmp__side--ours">
            <span class="datum cmp__side-label">{{ comparison.oursLabel }}</span>
            <span class="cmp__value">{{ row.ours }}</span>
          </span>
          <span class="cmp__side">
            <span class="datum cmp__side-label">{{ comparison.theirsLabel }}</span>
            <span class="cmp__value cmp__value--theirs">{{ row.theirs }}</span>
          </span>
        </li>
      </ul>

      <p class="cmp__footnote">{{ comparison.footnote }}</p>
    </div>
  </section>
</template>

<style scoped>
.cmp {
  background: var(--list-2);
  border-top: 1px solid var(--mreza-strong);
  padding-block: var(--section-y);
}

.cmp__title {
  margin-top: 1rem;
}

.cmp__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

/* --- the drawings --------------------------------------------------------- */
.cmp__drawings {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  max-width: 40rem;
}

.cmp__svg {
  width: 100%;
  height: auto;
}

/* Rest state = DRAWN. JS hides via inline style only. */
.cmp__stroke {
  stroke: var(--grafit);
  stroke-width: 1.6;
}

.cmp__dashed {
  stroke-dasharray: 4 3;
}

.cmp__hatch .cmp__stroke {
  stroke: var(--mreza-strong);
  stroke-width: 1.2;
}

.cmp__fill {
  fill: var(--grafit);
}

.cmp__caption {
  margin-top: 0.5rem;
}

.cmp__caption--ours {
  color: var(--rez);
}

/* --- the accessible argument ---------------------------------------------- */
.cmp__head {
  display: none;
}

.cmp__rows {
  list-style: none;
  margin-top: 2rem;
}

.cmp__row {
  display: grid;
  gap: 0.75rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--mreza-strong);
}

.cmp__row:last-child {
  border-bottom: 1px solid var(--mreza-strong);
}

.cmp__side {
  display: grid;
  gap: 0.25rem;
}

/* On phones the sides are told apart by position, label and line style —
   solid poché edge for ours, dashed for the assembly — never color alone. */
.cmp__side--ours {
  border-left: 3px solid var(--grafit);
  padding-left: 0.85rem;
}

.cmp__side:not(.cmp__side--ours) {
  border-left: 1px dashed var(--mreza-strong);
  padding-left: 0.85rem;
}

.cmp__side-label {
  font-size: 0.62rem;
}

.cmp__side--ours .cmp__side-label {
  color: var(--rez);
}

.cmp__value {
  max-width: 46ch;
}

.cmp__value--theirs {
  color: var(--grafit-2);
}

.cmp__footnote {
  margin-top: 1.75rem;
  font-size: 0.9rem;
  color: var(--grafit-2);
  max-width: 62ch;
}

@media (min-width: 900px) {
  .cmp__head {
    display: grid;
    grid-template-columns: 13rem 1fr 1fr;
    gap: 2.5rem;
    margin-top: 3rem;
    padding-bottom: 0.75rem;
  }

  .cmp__head-cell--ours {
    color: var(--rez);
  }

  .cmp__rows {
    margin-top: 0;
  }

  .cmp__row {
    grid-template-columns: 13rem 1fr 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .cmp__side--ours,
  .cmp__side:not(.cmp__side--ours) {
    border-left: 0;
    padding-left: 0;
  }

  /* The column head names the sides here — per-row labels go visually hidden,
     still present for assistive tech. */
  .cmp__side-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
