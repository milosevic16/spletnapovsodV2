<script setup lang="ts">
import { nav, footer } from '@/content/home'
import type { NavItem } from '@/content/home'
import { CONTACT_EMAIL } from '@/lib/constants'
import PrerezLine from './PrerezLine.vue'

/**
 * Same contract as the masthead, and it matters more here: on a phone the
 * footer nav IS the complete in-flow navigation, so a subpage must pass its
 * own stops or it is four dead anchors. Defaults to home's.
 */
const props = withDefaults(defineProps<{ items?: NavItem[] }>(), { items: () => nav })

// Baked at prerender; patched client-side only across a New Year boundary.
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer press">
    <div class="container">
      <!-- Colophon contract: every annotation here must stay mechanically
           verifiable against the shipped artifact (SSG output, no analytics,
           no tracking cookies). If that ever changes, change the content FIRST. -->
      <PrerezLine on-dark :annotation="footer.colophon.annotation" :gloss="footer.colophon.gloss" />

      <div class="footer__cols">
        <div class="footer__brand">
          <span class="footer__wordmark">SpletnaPovsod</span>
          <p class="footer__tagline">{{ footer.tagline }}</p>

          <!-- Provider identity, on every page (ZEPT). Numbers in the mono
               register: checkable public identifiers, like the e-mail below. -->
          <div class="footer__business">
            <p class="footer__business-name">{{ footer.business.name }}</p>
            <p v-for="row in footer.business.rows" :key="row.label" class="footer__business-row">
              <span class="footer__business-label">{{ row.label }}</span>
              <span class="footer__business-value emisija">{{ row.value }}</span>
            </p>
          </div>
        </div>

        <nav class="footer__nav" aria-label="Navigacija v nogi">
          <a v-for="item in props.items" :key="item.target" :href="`#${item.target}`" class="footer__link">
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

      <div class="footer__legal">
        <span class="footer__copy">© {{ year }} SpletnaPovsod</span>
        <a :href="footer.privacyHref" class="footer__legal-link">{{ footer.privacyLabel }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--zemlja);
  color: var(--papir-dim);
  padding-block: 3rem 2.5rem;
  border-top: 1px solid var(--crta-na-temnem);
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
  color: var(--list);
}

.footer__tagline {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  max-width: 34ch;
}

.footer__business {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.3rem;
}

.footer__business-name {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--list);
}

.footer__business-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.6rem;
  margin: 0;
  font-size: 0.8rem;
}

.footer__business-label {
  min-width: 6.5rem;
  color: var(--papir-dim);
}

.footer__business-value {
  color: var(--list);
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
  color: var(--papir-dim);
  text-decoration: none;
  padding: 0.85rem 0; /* 44px+ tap target — the only nav phones get */
}

.footer__link:hover {
  color: var(--rez-na-temnem);
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
  color: var(--rez-na-temnem);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.footer__legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--crta-na-temnem);
  font-size: 0.8rem;
}

.footer__legal-link {
  color: var(--papir-dim);
  text-decoration: underline;
  text-underline-offset: 0.25em;
  padding-block: 0.4rem; /* keeps the tap target comfortable */
}

.footer__legal-link:hover,
.footer__legal-link:focus-visible {
  color: var(--rez-na-temnem);
}

@media (min-width: 900px) {
  .footer__cols {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
}
</style>
