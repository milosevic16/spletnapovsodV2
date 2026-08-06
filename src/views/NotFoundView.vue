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
  <main id="main" class="nf">
    <div class="nf__sheet">
      <h1>{{ notFound.heading }}</h1>
      <p>{{ notFound.body }}</p>
      <p><a href="/" class="nf__home">{{ notFound.homeLabel }}</a></p>
      <p class="nf__tb" aria-hidden="true">{{ notFound.stamp }}</p>
    </div>
  </main>
</template>

<style scoped>
.nf {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 4rem var(--gutter);
}

/* An empty sheet — the drawing that does not exist. */
.nf__sheet {
  position: relative;
  display: grid;
  gap: 1rem;
  border: 1px solid var(--mreza);
  padding: clamp(2rem, 1.5rem + 3vw, 4rem) clamp(1.5rem, 1rem + 3vw, 3.5rem)
    clamp(3.5rem, 3rem + 3vw, 5rem);
  max-width: 34rem;
}

.nf__home {
  display: inline-block;
  padding: 0.65rem 0;
  font-weight: 600;
  color: var(--rez);
  text-underline-offset: 0.25em;
}

.nf__tb {
  position: absolute;
  right: 0.9rem;
  bottom: 0.75rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--mreza);
  border-right-width: 3px;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-size: 0.62rem;
  letter-spacing: 0.13em;
  color: var(--grafit-2);
}
</style>
