<script setup lang="ts">
/**
 * Plošče — the portfolio as sticky-stacked drawing plates: LIST 2/3/4, each a
 * full-viewport sheet burying the last (native scroll, zero touch listeners,
 * touch-native by construction). The compact index above is the hurried
 * owner's scan path AND the keyboard/SR-canonical route to all three live
 * sites — so the theatre below can never trap anyone.
 *
 * Client-ink grounding: each plate's edge band + material legend derive from
 * that client's REAL sampled palette (`inks` in content) — »vsaka stran je
 * oblikovana posebej« demonstrated, not asserted. Inks never sit under text.
 *
 * Buried plates get `inert` (focus can never land under a later sheet); the
 * cover test runs on a rAF-throttled scroll read, desktop only.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { references } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const fx = createFx()
const stack = ref<HTMLElement | null>(null)

const sizes = '(min-width: 900px) min(62vw, 56rem), calc(100vw - 2.5rem)'

function goTo(refId: string) {
  const slot = document.getElementById(`plate-${refId}`)
  slot?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth', block: 'start' })
}

onMounted(() => {
  // inert-on-buried — desktop sticky theatre only; the index carries every
  // link in normal flow, so this can only ever remove redundant tab stops.
  if (!('inert' in HTMLElement.prototype)) return
  const mq = matchMedia('(min-width: 900px)')
  const plates = Array.from(stack.value?.querySelectorAll<HTMLElement>('.plate') ?? [])
  if (plates.length < 2) return
  let scheduled = false
  const applyCover = () => {
    scheduled = false
    for (let i = 0; i < plates.length - 1; i++) {
      const covered = mq.matches && plates[i + 1]!.getBoundingClientRect().top <= 1
      plates[i]!.inert = covered
    }
  }
  const onScroll = () => {
    if (scheduled) return
    scheduled = true
    fx.raf(applyCover)
  }
  fx.on(window, 'scroll', onScroll, { passive: true })
  fx.on(mq as unknown as EventTarget, 'change', applyCover as EventListener)
  applyCover()
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <section id="reference" class="plates">
    <header class="container plates__head">
      <p class="datum">{{ references.kicker }}</p>
      <h2 class="plates__title">{{ references.title }}</h2>
      <p class="plates__intro">{{ references.intro }}</p>

      <!-- The index: all three live sites, one screen, plain rows. -->
      <div class="plates__index">
        <p class="datum plates__index-title">{{ references.indexTitle }}</p>
        <ol class="plates__index-list">
          <li v-for="(r, i) in references.items" :key="r.id" class="plates__index-row">
            <a :href="r.url" target="_blank" rel="noopener" class="plates__index-link">
              <span class="datum plates__index-sheet" aria-hidden="true"
                >{{ references.sheetLabel }} {{ i + 2 }}</span
              >
              <span class="plates__index-name">{{ r.name }}</span>
              <span class="emisija plates__index-url" aria-hidden="true">{{ r.urlLabel }}</span>
              <span class="visually-hidden">— {{ r.urlLabel }}, {{ references.newWindowNote }}</span>
            </a>
          </li>
        </ol>
      </div>
    </header>

    <ul ref="stack" class="plates__stack">
      <li
        v-for="(r, i) in references.items"
        :id="`plate-${r.id}`"
        :key="r.id"
        class="plates__slot"
      >
        <article class="plate">
          <!-- The client's real sampled palette as the plate's edge band. -->
          <span class="plate__band" aria-hidden="true">
            <span
              v-for="ink in r.inks"
              :key="ink"
              class="plate__band-seg"
              :style="{ background: ink }"
            ></span>
          </span>

          <div class="plate__sheet">
            <div class="plate__media">
              <picture>
                <source
                  type="image/avif"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.avif ${w}w`).join(', ')"
                  :sizes="sizes"
                />
                <source
                  type="image/webp"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.webp ${w}w`).join(', ')"
                  :sizes="sizes"
                />
                <img
                  :src="`/img/refs/${r.id}-${r.image.widths[0]}.jpg`"
                  :srcset="r.image.widths.map((w) => `/img/refs/${r.id}-${w}.jpg ${w}w`).join(', ')"
                  :sizes="sizes"
                  :width="r.image.width"
                  :height="r.image.height"
                  :alt="r.alt"
                  loading="lazy"
                  decoding="async"
                  class="plate__shot"
                />
              </picture>
            </div>

            <div class="plate__body">
              <!-- Stretched link: only the name is the link; the ::after makes
                   the whole sheet clickable without a 200-char accessible name. -->
              <h3 class="plate__name">
                <a :href="r.url" target="_blank" rel="noopener" class="plate__link">
                  {{ r.name }}
                  <span class="visually-hidden">
                    — {{ r.urlLabel }}, {{ references.newWindowNote }}
                  </span>
                </a>
              </h3>
              <p class="datum plate__sector">{{ r.sector }}</p>
              <p class="plate__desc">{{ r.description }}</p>
              <p class="plate__proof">{{ r.proof }}</p>
            </div>

            <footer class="plate__tb">
              <span class="datum plate__tb-sheet" aria-hidden="true"
                >{{ references.sheetLabel }} {{ i + 2 }} · {{ r.name }}</span
              >
              <span class="emisija plate__tb-url" aria-hidden="true">{{ r.urlLabel }}</span>
              <span class="plate__legend" aria-hidden="true">
                <span class="datum plate__legend-title">{{ references.inksLabel }}</span>
                <span v-for="ink in r.inks" :key="ink" class="plate__chip">
                  <span class="plate__chip-swatch" :style="{ background: ink }"></span>
                  <span class="emisija plate__chip-hex">{{ ink }}</span>
                </span>
              </span>
              <span class="plate__tb-nav">
                <button
                  v-if="i > 0"
                  type="button"
                  class="datum plate__nav-btn"
                  @click="goTo(references.items[i - 1]!.id)"
                >
                  {{ references.prevLabel }}
                </button>
                <button
                  v-if="i < references.items.length - 1"
                  type="button"
                  class="datum plate__nav-btn"
                  @click="goTo(references.items[i + 1]!.id)"
                >
                  {{ references.nextLabel }}
                </button>
              </span>
            </footer>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.plates {
  padding-top: var(--section-y);
}

.plates__title {
  margin-top: 1rem;
}

.plates__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

/* --- the index ------------------------------------------------------------ */
.plates__index {
  margin-top: 2.5rem;
  border-top: 1px solid var(--mreza-strong);
}

.plates__index-title {
  padding-top: 0.75rem;
}

.plates__index-list {
  list-style: none;
  margin-top: 0.5rem;
}

.plates__index-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  min-height: 44px;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--mreza);
  text-decoration: none;
  transition: color var(--t-micro) var(--ease-out);
}

.plates__index-link:hover .plates__index-name {
  color: var(--rez);
}

.plates__index-sheet {
  flex: 0 0 3.6rem;
}

.plates__index-name {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.05rem;
  transition: color var(--t-micro) var(--ease-out);
}

.plates__index-url {
  margin-left: auto;
  color: var(--grafit-2);
}

/* --- the sticky stack ----------------------------------------------------- */
.plates__stack {
  list-style: none;
  margin-top: 3rem;
}

.plates__slot {
  /* phone: plain flow */
}

.plate {
  position: relative;
  display: flex;
  background: var(--list);
  border-top: 1px solid var(--grafit);
}

.plate__band {
  flex: 0 0 8px;
  display: flex;
  flex-direction: column;
}

.plate__band-seg {
  flex: 1;
}

.plate__sheet {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.25rem 0;
}

.plate__media {
  border: 1px solid var(--mreza-strong);
}

.plate__shot {
  width: 100%;
  height: auto;
}

.plate__body {
  padding: 1.25rem 0 1.5rem;
  display: grid;
  gap: 0.5rem;
}

.plate__name {
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.6rem, 1.2rem + 2vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.plate__link {
  text-decoration: none;
}

/* Stretched link — whole sheet clickable, name announces cleanly. */
.plate__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

.plate__sector {
  margin-top: 0.25rem;
}

.plate__desc {
  margin-top: 0.5rem;
  max-width: 44ch;
}

/* The plate's single red annotation. */
.plate__proof {
  margin-top: 0.35rem;
  font-size: 0.92rem;
  font-style: italic;
  color: var(--rez);
  max-width: 44ch;
}

/* --- title block ---------------------------------------------------------- */
.plate__tb {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--mreza-strong);
}

.plate__tb-url {
  color: var(--grafit-2);
}

.plate__legend {
  display: none;
  align-items: center;
  gap: 0.6rem;
}

.plate__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.plate__chip-swatch {
  width: 12px;
  height: 12px;
  border: 1px solid rgb(26 28 30 / 0.25);
}

.plate__chip-hex {
  font-size: 0.62rem;
  color: var(--grafit-2);
}

.plate__tb-nav {
  margin-left: auto;
  display: none;
  gap: 0.5rem;
  position: relative;
  z-index: 2; /* above the stretched link */
}

.plate__nav-btn {
  min-height: 44px;
  padding: 0 0.9rem;
  background: none;
  border: 1px solid var(--mreza-strong);
  color: var(--grafit);
  cursor: pointer;
  transition: border-color var(--t-micro) var(--ease-out), color var(--t-micro) var(--ease-out);
}

.plate__nav-btn:hover {
  border-color: var(--rez);
  color: var(--rez);
}

/* --- desktop: the sticky theatre ------------------------------------------ */
@media (min-width: 900px) {
  /* Each slot is taller than its plate, so the plate pins while the next
     sheet arrives to bury it — the REF mechanism, pure CSS. */
  .plates__slot {
    height: 150svh;
  }
  .plates__slot:last-child {
    height: 100svh;
  }

  .plate {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }

  .plate__sheet {
    display: grid;
    grid-template-columns: minmax(0, 62fr) minmax(0, 38fr);
    grid-template-rows: 1fr auto;
    gap: 1.5rem 3rem;
    align-items: center;
    padding: 2rem clamp(1.5rem, 3vw, 3.5rem) 0;
  }

  .plate__media {
    grid-column: 1;
    grid-row: 1;
    max-width: 56rem;
  }

  .plate__body {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
    padding: 0;
  }

  .plate__tb {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .plate__legend {
    display: inline-flex;
  }

  .plate__tb-nav {
    display: inline-flex;
  }
}
</style>
