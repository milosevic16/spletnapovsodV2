<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { meta, headerNav } from '@/content/home'
import { SITE_ORIGIN, SITE_NAME, CONTACT_EMAIL } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import StatementSection from '@/components/StatementSection.vue'
import TraditionSection from '@/components/TraditionSection.vue'
import WorkCarousel from '@/components/WorkCarousel.vue'
import PillarsSection from '@/components/PillarsSection.vue'
import DifferentiatorsSection from '@/components/DifferentiatorsSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const canonical = `${SITE_ORIGIN}/`

// JSON-LD derives from the same constants/content as the visible page —
// markup can never drift from copy. Emitted in setup so it prerenders.
const orgId = `${SITE_ORIGIN}/#org`
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: SITE_NAME,
      url: canonical,
      email: CONTACT_EMAIL,
      description: meta.description,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: canonical,
      name: SITE_NAME,
      inLanguage: 'sl',
      publisher: { '@id': orgId },
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
      id: 'ld-home',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="headerNav" spread />
  <main id="main">
    <StatementSection />
    <!-- Owner's order: the proof (work), then what a package contains, then
         the invisible-work band that argues for it. Each section keeps its OWN
         ground through the Paketi/Kaj-dobite swap — Paketi stays paper-2, Kaj
         dobite stays graphite — so the bands read
         pigment → paper-2 → graphite → paper → earth. -->
    <WorkCarousel />
    <PillarsSection />
    <TraditionSection />
    <DifferentiatorsSection />
    <ContactSection />
  </main>
  <SiteFooter />
</template>
