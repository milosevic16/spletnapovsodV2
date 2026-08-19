<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { notFound } from '@/content/home'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'
import SiteMasthead from '@/components/SiteMasthead.vue'

useHead({
  title: `${notFound.metaTitle} — ${SITE_NAME}`,
  meta: [
    { name: 'description', content: notFound.metaDescription },
    { name: 'robots', content: 'noindex' },
  ],
  link: [{ rel: 'canonical', href: `${SITE_ORIGIN}/404` }],
})
</script>

<template>
  <!-- The subpage masthead, for two reasons that are really one: the page had
       no brand mark at all, so the intro veil's mark flew to the home-page
       corner and then vanished over nothing (every other page lands it on a
       real logo) — and a dead end with no chrome had no way home except a
       body link. items=[] (there is nothing on this page to jump to) and
       cta=null (every in-page anchor would be dead); the home link is the
       whole nav, and the veil's body:has(.masthead__home) rule now covers
       this page by construction. -->
  <SiteMasthead :items="[]" :cta="null" :home="{ href: '/', label: 'Domov' }" />
  <main id="main" class="nf grain">
    <h1>{{ notFound.heading }}</h1>
    <p>{{ notFound.body }}</p>
    <p><a href="/" class="nf__home">{{ notFound.homeLabel }}</a></p>
  </main>
</template>

<style scoped>
.nf {
  min-height: 60vh;
  display: grid;
  align-content: center;
  gap: 1rem;
  padding: 4rem clamp(1.25rem, 5vw, 4rem);
}

.nf__home {
  display: inline-block;
  padding: 0.65rem 0;
  font-weight: 600;
  color: var(--rez);
  text-underline-offset: 0.25em;
}
</style>
