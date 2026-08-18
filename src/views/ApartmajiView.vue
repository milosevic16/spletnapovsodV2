<script setup lang="ts">
/**
 * /apartmaji — the offer subpage for apartment owners and sobodajalci.
 *
 * Same contract as the home page: everything a crawler needs is in the
 * prerendered HTML, the head is emitted in setup (not on mount), the canonical
 * is absolute from ONE constant, and the page is prerendered flat to
 * dist/apartmaji.html so the canonical carries no trailing slash.
 *
 * NOT LINKED FROM THE MAIN NAV, by decision: it reads as a page for one
 * audience rather than a section of the one-pager, and adding it to the home
 * nav would change home copy that has not been signed off. It is fully
 * indexable and enters the sitemap by construction; the visible breadcrumb is
 * its route back.
 *
 * The chrome gets THIS page's stops, not the home page's. ContactSection is
 * reused (one inquiry form for the page); its #kontakt anchor is what every
 * CTA here points at. NO price is stated anywhere, so the JSON-LD carries a
 * Service with no Offer, never a fabricated number.
 */
import { useHead } from '@unhead/vue'
import { meta, breadcrumb, nav, ctaPrimary } from '@/content/apartmaji'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import ApartmajiHero from '@/components/ApartmajiHero.vue'
import ApartmajiExamples from '@/components/ApartmajiExamples.vue'
import ApartmajiPackages from '@/components/ApartmajiPackages.vue'
import ApartmajiRevisions from '@/components/ApartmajiRevisions.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const canonical = `${SITE_ORIGIN}/apartmaji`
const orgId = `${SITE_ORIGIN}/#org`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: meta.title,
      description: meta.description,
      serviceType: 'Izdelava spletnih strani za apartmaje',
      url: canonical,
      inLanguage: 'sl',
      areaServed: 'SI',
      provider: { '@id': orgId },
    },
    // Mirrors the VISIBLE trail in ApartmajiHero — never markup for a trail the
    // reader cannot see.
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: breadcrumb.homeLabel, item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: breadcrumb.currentLabel, item: canonical },
      ],
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
      id: 'ld-apartmaji',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="nav" :cta="ctaPrimary" />
  <main id="main">
    <ApartmajiHero />
    <ApartmajiExamples />
    <ApartmajiPackages />
    <ApartmajiRevisions />
    <ContactSection />
  </main>
  <SiteFooter :items="nav" />
</template>
