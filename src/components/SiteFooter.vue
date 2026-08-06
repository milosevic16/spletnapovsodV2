<script setup lang="ts">
/**
 * The footer shares the earth with the contact finale — the drawing's final
 * stamp. On phones this nav is the page's complete in-flow navigation.
 */
import { nav, footer } from '@/content/home'
import { CONTACT_EMAIL } from '@/lib/constants'

// Baked at prerender; patched client-side only across a New Year boundary.
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__cols">
        <div class="footer__brand">
          <span class="footer__wordmark">SpletnaPovsod</span>
          <p class="footer__tagline">{{ footer.tagline }}</p>
        </div>

        <nav class="footer__nav" :aria-label="footer.navAriaLabel">
          <a v-for="item in nav" :key="item.target" :href="`#${item.target}`" class="footer__link">
            {{ item.label }}
          </a>
        </nav>

        <div class="footer__contact">
          <span class="datum datum--on-dark">{{ footer.emailLabel }}</span>
          <a :href="`mailto:${CONTACT_EMAIL}`" class="emisija footer__mail">{{ CONTACT_EMAIL }}</a>
        </div>
      </div>

      <!-- Colophon contract: every annotation here must stay mechanically
           verifiable against the shipped artifact (SSG output, no analytics,
           no tracking cookies). If that ever changes, change the content FIRST.
           Claims, not emissions — so Narrow caps, never mono. -->
      <p class="footer__colophon">
        <span class="datum footer__colophon-annot">{{ footer.colophon.annotation }}</span>
        <span class="footer__colophon-gloss">{{ footer.colophon.gloss }}</span>
      </p>

      <p class="footer__legal">© {{ year }} SpletnaPovsod</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--zemlja);
  color: var(--list);
  border-top: 1px solid var(--crta-na-temnem);
  /* viewport-fit=cover: the legal line clears the iOS home indicator. */
  padding-block: clamp(2.5rem, 2rem + 2vw, 4rem)
    calc(clamp(1.5rem, 1rem + 1.5vw, 2.5rem) + env(safe-area-inset-bottom, 0px));
}

.footer__cols {
  display: grid;
  gap: 2rem;
}

.footer__wordmark {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.footer__tagline {
  margin-top: 0.6rem;
  color: var(--papir-dim);
  font-size: 0.95rem;
  max-width: 32ch;
}

.footer__nav {
  display: grid;
  align-content: start;
  gap: 0.1rem;
}

.footer__link {
  display: inline-block;
  padding: 0.7rem 0; /* 44px+ targets — the phone's primary nav */
  text-decoration: none;
  color: var(--list);
}

.footer__link:hover {
  color: var(--rez-na-temnem);
}

.footer__contact {
  display: grid;
  align-content: start;
  gap: 0.4rem;
}

.footer__mail {
  display: inline-block;
  padding-block: 0.6rem;
  color: var(--rez-na-temnem);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.footer__colophon {
  margin-top: 2.5rem;
  border-top: 1px solid var(--crta-na-temnem);
  padding-top: 1rem;
  display: grid;
  gap: 0.3rem;
  max-width: none;
}

.footer__colophon-annot {
  color: var(--papir-dim);
}

.footer__colophon-gloss {
  font-size: 0.9rem;
  color: var(--papir-dim);
}

.footer__legal {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: var(--papir-dim);
}

@media (min-width: 900px) {
  .footer__cols {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
  }
}
</style>
