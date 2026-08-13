<script setup lang="ts">
/**
 * /apartmaji — the subpage for apartment owners and sobodajalci.
 *
 * Built to the same contract as the home page: everything a crawler needs is
 * in the prerendered HTML, the head is emitted in setup (never on mount), and
 * the canonical is absolute from ONE constant. The page is prerendered flat to
 * dist/apartmaji.html, so the canonical carries no trailing slash and the host
 * never 301s it.
 *
 * NOT LINKED FROM THE MAIN NAV, by decision: this reads as a page for one
 * audience rather than a section of the one-pager, and adding it to the home
 * nav would change home copy that has not been signed off. It is fully
 * indexable and enters the sitemap by construction (postbuild reads the
 * emitted HTML), and the visible breadcrumb gives it a route back so it is
 * never a dead end. If the owner wants it in the nav, that is a home content
 * change and its own commit.
 *
 * The chrome gets THIS page's stops, not the home page's — see SiteMasthead's
 * props. ContactSection is reused rather than duplicated: one inquiry form for
 * the cluster, and its #kontakt anchor is what every CTA here points at.
 */
import { useHead } from '@unhead/vue'
import { meta, breadcrumb, packages, nav, ctaPrimary } from '@/content/apartmaji'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'
import ApartmajiHero from '@/components/ApartmajiHero.vue'
import ApartmajiReasons from '@/components/ApartmajiReasons.vue'
import ApartmajiPackages from '@/components/ApartmajiPackages.vue'
import ApartmajiExamples from '@/components/ApartmajiExamples.vue'
import ContactSection from '@/components/ContactSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const canonical = `${SITE_ORIGIN}/apartmaji`
const orgId = `${SITE_ORIGIN}/#org`

/**
 * The offer is DERIVED from the price the visitor reads, not restated beside
 * it: the numeral is taken out of the rendered string, so structured data
 * cannot drift from the page. A tier whose price is a sentence rather than a
 * figure (»Cena v pripravi«, »Cena po meri«) yields no digits and is therefore
 * not published as an Offer at all, which is the correct outcome — an offer
 * without a confirmed price would be a fabricated number.
 */
const basic = packages.items.find((p) => p.id === 'basic')
const basicAmount = basic?.price.replace(/\D/g, '') ?? ''

const offers = basicAmount
  ? [
      {
        '@type': 'Offer',
        name: basic?.name,
        url: canonical,
        priceCurrency: 'EUR',
        price: basicAmount,
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: basicAmount,
          // Not VAT-registered (owner-confirmed): nothing is added on top, and
          // the description says so rather than leaving the flag to carry it.
          valueAddedTaxIncluded: true,
          description: `${packages.taxAnnotation}: ${packages.taxNote}`,
        },
      },
    ]
  : []

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: meta.title,
      description: meta.description,
      serviceType: 'Izdelava spletnih strani',
      url: canonical,
      inLanguage: 'sl',
      areaServed: 'SI',
      provider: { '@id': orgId },
      ...(offers.length ? { offers } : {}),
    },
    // Mirrors the VISIBLE trail in ApartmajiHero — never markup for a trail
    // the reader cannot see.
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumb.homeLabel,
          item: `${SITE_ORIGIN}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumb.currentLabel,
          item: canonical,
        },
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
      // Unique id per script node: unhead dedupes by id, and a shared one
      // would let this page's node replace the home page's.
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
    <ApartmajiReasons />
    <ApartmajiPackages />
    <ApartmajiExamples />
    <ContactSection />
  </main>
  <SiteFooter :items="nav" />
</template>
