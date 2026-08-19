<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { notFound } from '@/content/home'
import { SITE_ORIGIN, SITE_NAME } from '@/lib/constants'

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
