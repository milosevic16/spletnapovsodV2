<script setup lang="ts">
import { nav } from '@/content/home'
</script>

<template>
  <header class="masthead">
    <div class="container masthead__row">
      <a href="/" class="masthead__brand" aria-label="SpletnaPovsod — domov">
        <!-- Brand mark: the two-layer seam, the site's own motif -->
        <svg
          class="masthead__mark"
          viewBox="0 0 18 18"
          width="18"
          height="18"
          aria-hidden="true"
          fill="none"
        >
          <rect x="5" y="5" width="12" height="12" fill="var(--accent-on-dark)" />
          <rect x="1" y="1" width="12" height="12" fill="var(--surface)" />
        </svg>
        <span class="masthead__wordmark">SpletnaPovsod</span>
      </a>
      <nav class="masthead__nav" aria-label="Glavna navigacija">
        <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="masthead__link">
          {{ item.label }}
        </a>
      </nav>
      <span class="masthead__domain annot" aria-hidden="true">spletnapovsod.si</span>
    </div>
  </header>
</template>

<style scoped>
.masthead {
  background: var(--panel);
  color: var(--surface);
}

.masthead__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-height: 3.5rem;
}

.masthead__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px; /* tap target */
  text-decoration: none;
}

.masthead__wordmark {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.005em;
}

.masthead__nav {
  display: none;
}

.masthead__domain {
  color: var(--accent-on-dark);
}

@media (min-width: 900px) {
  .masthead {
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .masthead__nav {
    display: flex;
    gap: 2rem;
  }

  .masthead__link {
    font-family: var(--font-mono);
    font-size: var(--fs-kicker);
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: var(--paper-dim);
    text-decoration: none;
    padding: 1.1rem 0; /* fills the 56px strip — 44px+ target */
  }

  .masthead__link:hover {
    color: var(--accent-on-dark);
  }
}
</style>
