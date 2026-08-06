<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { ui } from '@/content/home'

// unhead owns htmlAttrs at prerender — declare the real lang or it emits "en".
useHead({ htmlAttrs: { lang: 'sl' } })

const router = useRouter()

/**
 * Global click interceptor: content links stay plain <a href> in the markup
 * (crawlers walk real links); same-origin clicks upgrade to SPA navigation.
 */
function onDocumentClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const anchor = (e.target as Element | null)?.closest?.('a')
  if (!anchor) return
  if (anchor.target && anchor.target !== '_self') return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#')) return
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith(location.origin)) return
  const url = new URL(href, location.href)
  if (url.origin !== location.origin) return
  e.preventDefault()
  router.push(url.pathname + url.search + url.hash)
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <a href="#main" class="skip-link">{{ ui.skipToContent }}</a>
  <RouterView />
</template>
