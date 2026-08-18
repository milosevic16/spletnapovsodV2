<script setup lang="ts">
/**
 * /zasebnost — the privacy policy and provider-identity subpage.
 *
 * Same contract as home and apartmaji: everything a crawler needs is in the
 * prerendered HTML, the head is emitted in setup, the canonical is absolute
 * from ONE constant, and the page is prerendered flat to dist/zasebnost.html so
 * the canonical carries no trailing slash.
 *
 * The chrome gets THIS page's stops. There is no inquiry form here (a privacy
 * page is not a funnel): the masthead CTA points at the on-page »Vaše pravice«
 * section, where the contact for exercising data rights lives, and the visible
 * breadcrumb is the route back to home. JSON-LD carries a WebPage referencing
 * the site Organization, plus a BreadcrumbList that mirrors the visible trail.
 */
import { useHead } from '@unhead/vue'
import { meta, breadcrumb, nav, ctaPrimary } from '@/content/zasebnost'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import ZasebnostHero from '@/components/ZasebnostHero.vue'
import ZasebnostPolicy from '@/components/ZasebnostPolicy.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const canonical = `${SITE_ORIGIN}/zasebnost`
const orgId = `${SITE_ORIGIN}/#org`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      name: meta.title,
      description: meta.description,
      url: canonical,
      inLanguage: 'sl',
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      about: { '@id': orgId },
      publisher: { '@id': orgId },
    },
    // Mirrors the VISIBLE trail in ZasebnostHero — never markup for a trail the
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
      id: 'ld-zasebnost',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="nav" :cta="ctaPrimary" />
  <main id="main">
    <ZasebnostHero />
    <ZasebnostPolicy />
  </main>
  <SiteFooter :items="nav" />
</template>
