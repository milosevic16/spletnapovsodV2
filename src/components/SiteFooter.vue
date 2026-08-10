<script setup lang="ts">
import { nav, footer } from '@/content/home'
import { CONTACT_EMAIL } from '@/lib/constants'
import PrerezLine from './PrerezLine.vue'

// Baked at prerender; patched client-side only across a New Year boundary.
const year = new Date().getFullYear()
</script>

<template>
  <!-- press--light with the sand (see the press utility's own note on dark
       dots over light grounds). -->
  <footer class="footer press press--light">
    <div class="container">
      <!-- Colophon contract: every annotation here must stay mechanically
           verifiable against the shipped artifact (SSG output, no analytics,
           no tracking cookies). If that ever changes, change the content FIRST.
           The LIGHT Prerez variant now — the on-dark one spoke on-dark inks
           that read 1.9:1 on the sand; its line is re-aimed below. -->
      <PrerezLine :annotation="footer.colophon.annotation" :gloss="footer.colophon.gloss" />

      <div class="footer__cols">
        <div class="footer__brand">
          <span class="footer__wordmark">SpletnaPovsod</span>
          <p class="footer__tagline">{{ footer.tagline }}</p>
        </div>

        <nav class="footer__nav" aria-label="Navigacija v nogi">
          <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="footer__link">
            {{ item.label }}
          </a>
        </nav>

        <p class="footer__mail">
          <span class="footer__mail-label">{{ footer.emailLabel }}</span>
          <a :href="`mailto:${CONTACT_EMAIL}`" class="footer__mail-link emisija">{{
            CONTACT_EMAIL
          }}</a>
        </p>
      </div>

      <p class="footer__legal">© {{ year }} SpletnaPovsod</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  /* --zemlja IS the sand now (tokens.css) — the closing band brightened with
     the rest of the owner's call, and its inks flipped to the dark family,
     which is BROWN on the sand bands (owner: "switch black font to dark
     brown"): the same re-pointing the contact block above carries, so the
     two halves of the closing band cannot disagree. */
  --grafit: var(--color-bronze-deep);
  --grafit-2: var(--color-bronze-2);
  background-color: var(--zemlja);
  color: var(--grafit-2);
  padding-block: 3rem 2.5rem;
  border-top: 1px solid var(--crta-na-temnem);
}

/* The colophon's hairline, re-aimed for the sand: the light variant's
   --mreza-strong reads 1.29:1 there where the bronze-line reads 2.02 — line
   duty, same warm family as every other rule on the band. */
.footer :deep(.prerez) {
  --prerez-line: var(--crta-na-temnem);
}

.footer__cols {
  margin-top: 2.5rem;
  display: grid;
  gap: 2rem;
}

.footer__wordmark {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--grafit);
}

.footer__tagline {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  max-width: 34ch;
}

.footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.75rem;
}

.footer__link {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 500;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--grafit-2);
  text-decoration: none;
  padding: 0.85rem 0; /* 44px+ tap target — the only nav phones get */
}

.footer__link:hover {
  color: var(--rez-na-pesku);
}

.footer__mail {
  display: grid;
  gap: 0.3rem;
}

.footer__mail-label {
  font-size: 0.9rem;
}

.footer__mail-link {
  display: inline-block;
  padding-block: 0.75rem; /* 44px+ tap target */
  color: var(--rez-na-pesku);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.footer__legal {
  margin-top: 2.5rem;
  font-size: 0.8rem;
}

@media (min-width: 900px) {
  .footer__cols {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
}
</style>
