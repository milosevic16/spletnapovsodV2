<script setup lang="ts">
/**
 * /pogoji-apartmaji — the service module of terms for apartment work.
 *
 * It renders the SAME components as the general terms, with its own content:
 * one instrument, two documents. The hero carries the standing pointer back to
 * the base document, because the precedence rule is what makes this a module
 * rather than a rival contract.
 *
 * No provider block here: the party is named once, in the general terms, and
 * restating it in a second document is exactly the duplication that lets two
 * documents drift apart.
 */
import { useHead } from '@unhead/vue'
import { meta, hero, articles, updated, nav, ctaPrimary } from '@/content/pogoji-apartmaji'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import PogojiHero from '@/components/PogojiHero.vue'
import PogojiDocument from '@/components/PogojiDocument.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const canonical = `${SITE_ORIGIN}/pogoji-apartmaji`
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
      id: 'ld-pogoji-apartmaji',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    },
  ],
})
</script>

<template>
  <SiteMasthead :items="nav" :cta="ctaPrimary" :home="{ href: '/', label: 'Domov' }" />
  <main id="main">
    <PogojiHero :hero="hero" />
    <PogojiDocument :articles="articles" :updated="updated" />
  </main>
  <SiteFooter :items="nav" />
</template>
