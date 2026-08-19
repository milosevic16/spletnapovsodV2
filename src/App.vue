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

/** THE VEIL AND THE SETTLES RUN ON THE DOCUMENT'S ANIMATION TIMELINE; this
 *  cleanup must too, and running it on the wall clock instead was a live
 *  production bug. The animation timeline pauses whenever the page is not
 *  rendering (a load in a background tab, a paused renderer) and restarts for
 *  any node hydration re-creates — while a setTimeout keeps counting real
 *  time. Any skew between the two clocks let the old timer clear things
 *  mid-choreography, and on the real domain the observed shape was: veil
 *  finished and gone, the settle-gated text still held transparent by its
 *  own `both` fill for up to ~3s of visible, text-less page.
 *
 *  So the flag now dies WITH the veil, on the veil's own clock: the
 *  `veil-done` animationend is the one moment that, by construction, means
 *  "the veil has just finished covering the page" — clearing `data-intro`
 *  there cancels any settle animation still waiting, whose resting state is
 *  visible. The gate fails OPEN. The wall-clock timer remains only as a
 *  safety net for paths where the event can never fire (reduced motion sets
 *  `display: none` on the veil, so nothing animates — and nothing settles
 *  either, the settle block being gated on no-preference), sized far past
 *  any honest timeline. */
const VEIL_NET_MS = 12000
let veilTimer = 0
let veilCleaned = false

function cleanupVeil() {
  if (veilCleaned) return
  veilCleaned = true
  document.getElementById('veil')?.remove()
  delete document.documentElement.dataset.intro
}

/** The page-wide light→dark ground switch (src/lib/ground.ts). Lives here for
 *  the app's lifetime; refreshed on route commit because a navigation does
 *  not always produce the scroll event the listener keys on. */
let ground: GroundHandle | null = null
let removeGroundHook: (() => void) | null = null

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  ground = wireGround()
  removeGroundHook = router.afterEach(() => ground?.refresh())
  const veil = document.getElementById('veil')
  // The end of `veil-done` IS the veil's end — same element, same timeline.
  veil?.addEventListener('animationend', (e) => {
    if (e.animationName === 'veil-done') cleanupVeil()
  })
  /* TWO GUARDS for mounts that arrive off the veil's clock. Hydration keeps
     prod on it (main.ts), but the dev server client-renders every node at
     mount, and a slow-enough prod load can mount after the veil has already
     finished — in both, the settles' assumption that they share the veil's t0
     breaks, and the header waits out its 2.63s delay against a page the sheet
     has already revealed.

     1. The veil is already spent (its veil-done animation finished before this
        listener existed, so the event is gone — or it will never fire: reduced
        motion sets display:none and no animation is ever created): clean up
        NOW instead of leaving the page to the 12s net.
     2. The veil is still running but THIS mount created settle animations
        younger than it (dev's client render; any future hydration bail):
        re-anchor their startTime to the veil's, so they play exactly as
        choreographed — already-elapsed portions resolve instantly, and on a
        healthy hydrated load every startTime is equal and this writes
        nothing. */
  const veilDone = veil
    ?.getAnimations?.()
    .find((a) => (a as CSSAnimation).animationName === 'veil-done')
  if (!veilDone || veilDone.playState === 'finished' || veilDone.playState === 'idle') {
    cleanupVeil()
  } else if (veilDone.startTime != null && document.getAnimations) {
    for (const a of document.getAnimations()) {
      const name = (a as CSSAnimation).animationName
      if (name?.startsWith('settle-') && a.startTime !== veilDone.startTime)
        a.startTime = veilDone.startTime
    }
  }
  veilTimer = window.setTimeout(cleanupVeil, VEIL_NET_MS)
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
