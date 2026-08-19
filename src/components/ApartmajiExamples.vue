<script setup lang="ts">
/**
 * »Primeri« — three template renders to pick a starting point from.
 *
 * THE CARDS ARE A LABELLED DEMO. Each is a real render of a template pack
 * (SpehKing/register_nastanitev: atelier, veduta, mariven-stay) driven with a
 * fictional apartment — invented name, copy and reviews, abstract generated
 * plates instead of photographs — because the generator's own output is built
 * from scraped content of real operators, which must never appear here. The
 * visible demoNote says exactly that; provenance and the refresh ritual live
 * in scripts/build-primeri-images.mjs.
 *
 * Plain figures, not links: the demo pages are not hosted anywhere, and a
 * card that pretended to open one would be a dead link. The images are the
 * content here.
 */
import { examples } from '@/content/apartmaji'

/** Emitted by scripts/build-primeri-images.mjs — 2:1 crops at these widths. */
const WIDTHS = [560, 840, 1104]

const srcset = (id: string, ext: string) =>
  WIDTHS.map((w) => `/img/primeri/${id}-${w}.${ext} ${w}w`).join(', ')

/** Phone: one column at the container's width; desktop: three columns. */
const SIZES = '(max-width: 809px) calc(100vw - 40px), 368px'
</script>

<template>
  <section id="primeri" class="apte press press--light">
    <div class="container">
      <p class="kicker apte__kicker">{{ examples.kicker }}</p>
      <h2 class="apte__title">{{ examples.title }}</h2>
      <p class="apte__body">{{ examples.body }}</p>

      <ul class="apte__grid">
        <li v-for="ex in examples.items" :key="ex.id" class="apte__card">
          <figure class="apte__figure">
            <picture>
              <source type="image/avif" :srcset="srcset(ex.id, 'avif')" :sizes="SIZES" />
              <source type="image/webp" :srcset="srcset(ex.id, 'webp')" :sizes="SIZES" />
              <img
                class="apte__img"
                :src="`/img/primeri/${ex.id}-840.jpg`"
                :srcset="srcset(ex.id, 'jpg')"
                :sizes="SIZES"
                :alt="ex.alt"
                width="1104"
                height="552"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <figcaption class="apte__caption">
              <span class="apte__name">{{ ex.name }}</span>
              <span class="apte__gloss">{{ ex.gloss }}</span>
            </figcaption>
          </figure>
        </li>
      </ul>

      <!-- The honesty line: a ruled note on the sheet, same register as the
           old pending note it replaces. -->
      <p class="apte__demo-note">{{ examples.demoNote }}</p>
    </div>
  </section>
</template>

<style scoped>
.apte {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.apte__kicker {
  color: var(--grafit-2);
}

.apte__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.apte__body {
  max-width: 56ch;
  line-height: 1.6;
  color: var(--grafit-2);
}

.apte__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-8);
  margin: var(--space-10) 0 0;
  padding: 0;
  list-style: none;
}

.apte__figure {
  margin: 0;
}

/* A sheet on the sheet: hairline frame, square corners, no shadow — the same
   drawn-plate treatment the rest of the system uses for imagery. */
.apte__img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--mreza-strong);
}

.apte__caption {
  display: grid;
  gap: var(--space-1);
  padding-top: var(--space-3);
}

.apte__name {
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--grafit);
}

.apte__gloss {
  font-size: var(--fs-annot);
  line-height: 1.5;
  color: var(--grafit-2);
}

.apte__demo-note {
  max-width: 56ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--mreza-strong);
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .apte__body,
  .apte__demo-note {
    max-width: none;
  }

  .apte__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
