<script setup lang="ts">
/**
 * /nastanitve — the offer subpage for accommodation owners and sobodajalci.
 *
 * Same contract as the home page: everything a crawler needs is in the
 * prerendered HTML, the head is emitted in setup (not on mount), the canonical
 * is absolute from ONE constant, and the page is prerendered flat to
 * dist/nastanitve.html so the canonical carries no trailing slash.
 *
 * NOT LINKED FROM THE MAIN NAV, by decision: it reads as a page for one
 * audience rather than a section of the one-pager, and adding it to the home
 * nav would change home copy that has not been signed off. It is fully
 * indexable and enters the sitemap by construction.
 *
 * The chrome gets THIS page's stops, not the home page's. ContactSection is
 * reused (one inquiry form for the page); its #kontakt anchor is what every
 * CTA here points at. NO price is stated anywhere, so the JSON-LD carries a
 * Service with no Offer, never a fabricated number.
 */
import { useHead } from '@unhead/vue'
import { meta, nav, headerNav, ctaPrimary, contactExtras, packages } from '@/content/nastanitve'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import NastanitveHero from '@/components/NastanitveHero.vue'
import NastanitveExamples from '@/components/NastanitveExamples.vue'
import NastanitvePackages from '@/components/NastanitvePackages.vue'
import NastanitveRevisions from '@/components/NastanitveRevisions.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

/** The form's package chips, derived from the tiers themselves — one source,
 *  so a renamed tier can never leave a stale chip. */
const packageChoices = packages.items.map((p) => ({ value: p.id, label: p.name }))

const canonical = `${SITE_ORIGIN}/nastanitve`
const orgId = `${SITE_ORIGIN}/#org`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: meta.title,
      description: meta.description,
      serviceType: 'Izdelava spletnih strani za nastanitve',
      url: canonical,
      inLanguage: 'sl',
      areaServed: 'SI',
      provider: { '@id': orgId },
    },
  ],
}

useHead({
  title: meta.title,
  meta: [
    { name: 'description', content: meta.description },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonical },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'sl_SI' },
    { property: 'og:image', content: `${SITE_ORIGIN}/og.jpg` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: canonical },
    // Single-locale site: self-referential sl + x-default, no phantom alternates.
    { rel: 'alternate', hreflang: 'sl', href: canonical },
    { rel: 'alternate', hreflang: 'x-default', href: canonical },
  ],
  script: [
    {
      // Unique id: unhead dedupes by id, and a shared one would let this page's
      // node replace the home page's.
      id: 'ld-nastanitve',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="headerNav" :cta="ctaPrimary" :home="{ href: '/', label: 'Domov' }" />
  <main id="main">
    <NastanitveHero />
    <NastanitveExamples />
    <NastanitvePackages />
    <NastanitveRevisions />
    <ContactSection
      :package-choices="packageChoices"
      :package-label="contactExtras.packageLabel"
      :message-label="contactExtras.messageLabel"
    />
  </main>
  <SiteFooter :items="nav" />
</template>
