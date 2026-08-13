<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { ui } from '@/content/home'
import { wireGround, type GroundHandle } from '@/lib/ground'

// unhead owns htmlAttrs at prerender — declare the real lang or it emits "en".
// It ALSO injects a default viewport meta that REPLACES the shell's authored
// one, silently dropping viewport-fit=cover (verified in dist) — so the full
// viewport meta is declared here, where unhead is the authority.
useHead({
  htmlAttrs: { lang: 'sl' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
  ],
})

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

/** The veil (index.html) is a pure-CSS timed sequence that finishes on its
 *  own; this only removes the spent node and clears the `data-intro` flag that
 *  scopes the page's arrival settle. Timing = the CSS timeline's end (veil
 *  hidden at 3.45s) + the longest settle delay (2.8s + 0.55s) + slack — never
 *  load-bearing, and clearing the flag is what keeps the settle from
 *  replaying on SPA navigation back to the home route. */
const VEIL_CLEANUP_MS = 4100
let veilTimer = 0

/** The page-wide light→dark ground switch (src/lib/ground.ts). Lives here for
 *  the app's lifetime; refreshed on route commit because a navigation does
 *  not always produce the scroll event the listener keys on. */
let ground: GroundHandle | null = null
let removeGroundHook: (() => void) | null = null

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  ground = wireGround()
  removeGroundHook = router.afterEach(() => ground?.refresh())
  veilTimer = window.setTimeout(() => {
    document.getElementById('veil')?.remove()
    delete document.documentElement.dataset.intro
  }, VEIL_CLEANUP_MS)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  removeGroundHook?.()
  ground?.dispose()
  clearTimeout(veilTimer)
})
</script>

<template>
  <a href="#main" class="skip-link">{{ ui.skipToContent }}</a>
  <RouterView />
  <!-- The grain: one noise layer above ALL content, both grounds (base.css
       .grain). Static template node — no JS creates it, so the surface reads
       the same with JS off; pure-CSS jitter, frozen under reduced motion. -->
  <div class="grain" aria-hidden="true"></div>
</template>
