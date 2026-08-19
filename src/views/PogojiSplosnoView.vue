<script setup lang="ts">
/**
 * /pogoji-splosno — the general terms of business.
 *
 * Same SSG contract as the other subpages: head emitted in setup, absolute
 * canonical from one constant, prerendered flat to dist/pogoji-splosno.html.
 *
 * JSON-LD is a WebPage referencing the site Organization. No BreadcrumbList:
 * this page carries no visible trail (the masthead's home link is the route
 * back), and markup for a trail the reader cannot see is markup for a lie.
 */
import { useHead } from '@unhead/vue'
import { meta, articles, provider, updated, nav, ctaPrimary, related } from '@/content/pogoji'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import PogojiHero from '@/components/PogojiHero.vue'
import PogojiDocument from '@/components/PogojiDocument.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { hero } from '@/content/pogoji'

const canonical = `${SITE_ORIGIN}/pogoji-splosno`
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
      // Mirrors the VISIBLE pointer in the hero: a reader who came in on an
      // accommodation promotion is governed by the accommodation document instead.
      relatedLink: `${SITE_ORIGIN}/pogoji-nastanitve`,
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
    { rel: 'alternate', hreflang: 'sl', href: canonical },
    { rel: 'alternate', hreflang: 'x-default', href: canonical },
  ],
  script: [
    {
      id: 'ld-pogoji-splosno',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="nav" :cta="ctaPrimary" :home="{ href: '/', label: 'Domov' }" />
  <main id="main">
    <PogojiHero :hero="hero" :related="related" />
    <PogojiDocument
      :articles="articles"
      :updated="updated"
      :provider="provider"
      provider-in="uvod"
    />
  </main>
  <SiteFooter :items="nav" />
</template>
