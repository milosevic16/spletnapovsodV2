<script setup lang="ts">
/**
 * Trije stebri — three editorial chapters, fully open (Kononenko calm between
 * the cut scene and the spec panel). Three genuinely different compositions
 * with an INCREASING machine-annotation density, so the section's own layout
 * enacts the descent from surface to system:
 *   1. Unikaten dizajn — pure visible craft, zero machine margin.
 *   2. Varnost, hitrost, skladnost — the envelope; closes with two shipped
 *      header lines.
 *   3. Google in AI vidnost — the utilities riser; closes with the robots/
 *      sitemap lines and the CWV note callout.
 * Artifact strips show REAL bytes from machine-facts (data-fact nodes — the
 * guard verifies them like every other emission).
 */
import { computed } from 'vue'
import { pillars } from '@/content/home'
import { factsById } from '@/lib/machine-facts'

/** Chapter-closing evidence: each pillar ends with its own checkable proof. */
const artifactStrips: Record<string, string[]> = {
  design: [],
  security: ['header-hsts', 'header-nosniff'],
  seo: ['robots-gptbot', 'robots-sitemap', 'head-canonical'],
}

const chapters = computed(() =>
  pillars.items.map((p) => ({
    ...p,
    strip: (artifactStrips[p.id] ?? []).map((id) => factsById.get(id)!).filter(Boolean),
  })),
)
</script>

<template>
  <section id="paketi" class="pillars">
    <div class="container">
      <p class="datum">{{ pillars.kicker }}</p>
      <h2 class="pillars__title">{{ pillars.title }}</h2>
      <p class="pillars__intro">{{ pillars.intro }}</p>
    </div>

    <div class="container pillars__chapters">
      <article v-for="p in chapters" :key="p.id" class="chapter" :class="`chapter--${p.id}`">
        <header class="chapter__head">
          <p class="datum">{{ p.kicker }}</p>
          <h3 class="chapter__title">{{ p.title }}</h3>
          <p class="chapter__artifact">{{ p.artifact }}</p>
        </header>

        <p class="chapter__summary">{{ p.summary }}</p>

        <dl class="chapter__points">
          <div v-for="pt in p.points" :key="pt.label" class="chapter__point">
            <dt class="chapter__point-label">{{ pt.label }}</dt>
            <dd class="chapter__point-detail">{{ pt.detail }}</dd>
          </div>
        </dl>

        <p v-if="p.note" class="chapter__note">
          <span class="datum chapter__note-annot">{{ p.note.annotation }}</span>
          <span class="chapter__note-gloss">{{ p.note.gloss }}</span>
        </p>

        <ul v-if="p.strip.length" class="chapter__strip">
          <li v-for="f in p.strip" :key="f.id">
            <code class="emisija" :data-fact="f.id">{{ f.text }}</code>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.pillars {
  padding-block: var(--section-y);
}

.pillars__title {
  margin-top: 1rem;
}

.pillars__intro {
  margin-top: 1.25rem;
  color: var(--grafit-2);
}

.pillars__chapters {
  margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
  display: grid;
  gap: clamp(3rem, 2.5rem + 3vw, 5.5rem);
}

.chapter {
  border-top: 1px solid var(--grafit);
  padding-top: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.chapter__title {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 300;
  font-size: clamp(1.6rem, 1.2rem + 2vw, 2.7rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
}

/* The chapter's value line — a claim, so Narrow, never mono. No uppercase
   transform: machine names in the strings (sitemap.xml, JSON-LD) must keep
   their exact case. */
.chapter__artifact {
  margin-top: 0.75rem;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.07em;
  color: var(--rez);
}

.chapter__summary {
  max-width: 58ch;
}

.chapter__points {
  display: grid;
  gap: 1.1rem;
}

.chapter__point {
  border-left: 1px solid var(--mreza-strong);
  padding-left: 0.9rem;
}

.chapter__point-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.98rem;
}

.chapter__point-detail {
  margin-top: 0.25rem;
  font-size: 0.92rem;
  color: var(--grafit-2);
  max-width: 40ch;
}

.chapter__note {
  border: 1px solid var(--mreza-strong);
  border-left: 3px solid var(--rez);
  padding: 0.8rem 1rem;
  display: grid;
  gap: 0.3rem;
  max-width: 46ch;
}

.chapter__note-annot {
  color: var(--grafit);
}

.chapter__note-gloss {
  font-size: 0.9rem;
  color: var(--grafit-2);
}

/* The machine margin — real bytes closing the chapter. */
.chapter__strip {
  list-style: none;
  display: grid;
  gap: 0.25rem;
  border-top: 1px dashed var(--mreza-strong);
  padding-top: 0.75rem;
}

.chapter__strip .emisija {
  color: var(--grafit-2);
}

/* --- desktop: three different compositions -------------------------------- */
@media (min-width: 900px) {
  .chapter {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1.5rem 2.5rem;
  }

  .chapter__head {
    grid-column: 1 / 5;
  }

  /* 1 — craft: lead-sized summary right, points as a wide two-column ledger. */
  .chapter--design .chapter__summary {
    grid-column: 6 / 13;
    font-size: var(--fs-lead);
    line-height: 1.6;
  }
  .chapter--design .chapter__points {
    grid-column: 6 / 13;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 2.5rem;
  }

  /* 2 — envelope: full-width horizontal point ledger, machine strip right. */
  .chapter--security .chapter__summary {
    grid-column: 6 / 13;
  }
  .chapter--security .chapter__points {
    grid-column: 1 / 13;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem 2.5rem;
  }
  .chapter--security .chapter__strip {
    grid-column: 6 / 13;
  }

  /* 3 — riser: mirrored (head right), the machine margin densest. */
  .chapter--seo .chapter__head {
    grid-column: 9 / 13;
    grid-row: 1;
  }
  .chapter--seo .chapter__summary {
    grid-column: 1 / 8;
    grid-row: 1;
  }
  .chapter--seo .chapter__points {
    grid-column: 1 / 8;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem 2.5rem;
  }
  .chapter--seo .chapter__note {
    grid-column: 9 / 13;
    align-self: start;
  }
  .chapter--seo .chapter__strip {
    grid-column: 1 / 8;
  }
}
</style>
