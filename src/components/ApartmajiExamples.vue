<script setup lang="ts">
/**
 * »Primeri« — three template renders, each openable as a fullscreen preview.
 *
 * THE CARDS ARE A LABELLED DEMO. Each is a real render of a template pack
 * (SpehKing/register_nastanitev: atelier, veduta, mariven-stay) driven with a
 * fictional apartment — invented name, copy and reviews; the photographs are
 * CC0 public-domain images (Openverse, provenance shipped at
 * /primeri/photos/PROVENANCE.json) — because the generator's own output is
 * built from scraped content of real operators, which must never appear
 * here. The visible demoNote says exactly that; the refresh ritual lives in
 * scripts/build-primeri-images.mjs.
 *
 * EVERY CARD IS A REAL LINK to its shipped demo page. With JS off, or for a
 * crawler, the link simply navigates: no dead control. With JS, the click is
 * upgraded to THE LIFT: the card's own plate zooms — uniformly, no distortion
 * — from its place on the sheet until it covers the screen (the system's 1:1
 * gesture: the drawing at full scale), a paper backdrop rises under it, and
 * the LIVE page crossfades in over the plate once its iframe has loaded. A
 * square close button holds the top-right corner throughout.
 *
 * PHONES KEEP THE LIFT BUT NEVER HOLD THE PLATE (owner's call, second
 * round): the plate is a DESKTOP capture, and what read as awkward was the
 * zoomed desktop page HELD on screen after landing while the mobile-laid-out
 * iframe was still loading. The motion itself was wanted. So on phones the
 * plate flies exactly as on desktop, and ON LANDING it dissolves into the
 * beige backdrop: page already loaded → zoom, an eyeblink of paper, page;
 * still loading → zoom, beige, page fading in whenever it arrives. Closing
 * restores the plate and runs the flight in reverse. Desktop keeps the plate
 * under the crossfade, where it matches the incoming page and holding it is
 * seamless.
 *
 * ONE OVERLAY, ONE OWNER — and this is the part that was got wrong once, so
 * it is written down. The Escape listener used to be registered per open and
 * never removed, so every handler closed over ITS OWN nodes while all of them
 * tested the SHARED module-level `overlay`. Opening three previews left three
 * live document listeners; the oldest ran first, tore down a root that was
 * already gone, nulled the shared reference, and orphaned the dialog actually
 * on screen — which then could never be closed (measured: three dialogs in the
 * DOM at once). Now: the listener is registered natively per open and REMOVED
 * in teardown, teardown is idempotent (it nulls the reference FIRST, so
 * re-entry is impossible), and every deferred callback guards on OBJECT
 * IDENTITY — a timer belonging to a closed overlay can never act on the one
 * that replaced it.
 *
 * The overlay is a dialog in the workflow-rules sense: role="dialog" +
 * aria-modal, focus moves to the close button on open (preventScroll — a
 * plain focus() scroll-reveals inside a locked document), Escape closes (also
 * from inside the same-origin iframe, best effort), Tab is trapped between
 * the close button and the iframe, and focus RETURNS to the card that opened
 * it. Scroll lock follows the house recipe: capture scrollY first, overflow
 * hidden on html+body, snap back the same frame — never position:fixed on
 * body.
 *
 * Overlay nodes are injected on demand and styled inline (scoped CSS cannot
 * reach body-appended nodes); they sit at z-index 9500, ABOVE the grain at
 * 9000 — an owner call that overrides the grain-over-everything doctrine for
 * this one surface: the preview shows ANOTHER site, not our sheet, so our
 * paper texture must not play over it. Every wait is capped: a renderer that
 * never fires animation finish or iframe load still ends in the settled state
 * (the same settle-with-timeout discipline the rest of the effects follow).
 * Everything routes through fx and dies on unmount; the SPA click interceptor
 * in App.vue ignores the upgraded clicks because it checks e.defaultPrevented
 * first.
 *
 * Reduced motion: no lift, no crossfade — the dialog appears settled and
 * fully functional immediately. The animation is the garnish, never the door.
 */
import { onUnmounted } from 'vue'
import { examples } from '@/content/apartmaji'
import { createFx, prefersReducedMotion } from '@/lib/fx'
import type { AptExample } from '@/content/apartmaji'

/** Emitted by scripts/build-primeri-images.mjs — 2:1 crops at these widths. */
const WIDTHS = [560, 840, 1104]

const srcset = (id: string, ext: string) =>
  WIDTHS.map((w) => `/img/primeri/${id}-${w}.${ext} ${w}w`).join(', ')

/** Phone: one column at the container's width; desktop: three columns. */
const SIZES = '(max-width: 809px) calc(100vw - 40px), 368px'

const fx = createFx()
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
/** One knob per phase; every JS wait is (duration + slack) so a frozen
 *  renderer can never wedge the overlay mid-flight. */
const LIFT_MS = 460
const CLOSE_MS = 380
const FADE_MS = 240
const SETTLE_SLACK_MS = 240
/** Phone only: how fast the landed plate dissolves into the beige. */
const PLATE_EXIT_MS = 200
/** Iframe grace: past this we reveal whatever the frame has — a demo that
 *  loads slowly still appears; one that failed leaves the plate standing. */
const IFRAME_CAP_MS = 4000

interface Saved {
  y: number
  html: string
  body: string
}

interface Overlay {
  root: HTMLElement
  morph: HTMLElement
  backdrop: HTMLElement
  frame: HTMLIFrameElement
  closeBtn: HTMLButtonElement
  invoker: HTMLElement
  plateSource: HTMLImageElement
  saved: Saved
  reduced: boolean
  phone: boolean
  closing: boolean
  onKeydown: (e: Event) => void
}

let overlay: Overlay | null = null

function lockScroll(): Saved {
  // Order is load-bearing (house recipe): capture FIRST — the lock completes
  // an in-flight scroll — then overflow hidden, then re-pin the offset.
  const y = window.scrollY
  const html = document.documentElement.style.overflow
  const body = document.body.style.overflow
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
  return { y, html, body }
}

function unlockScroll(saved: Saved) {
  document.documentElement.style.overflow = saved.html
  document.body.style.overflow = saved.body
  window.scrollTo({ top: saved.y, behavior: 'instant' as ScrollBehavior })
}

/** Animate with the resting state written as inline style FIRST, fill:'none' —
 *  cancel-safe at any instant, nothing to settle (house WAAPI doctrine). */
function animTo(el: HTMLElement, prop: string, from: string, to: string, ms: number) {
  el.style.setProperty(prop, to)
  return fx.anim(el, [{ [prop]: from }, { [prop]: to }], { duration: ms, easing: EASE, fill: 'none' })
}

/**
 * Idempotent, and the ONLY place overlay state is released. Nulls the module
 * reference before touching the DOM, so a second call (stray timer, second
 * Escape, unmount) finds nothing to do.
 */
function teardown(restoreFocus = true) {
  const o = overlay
  if (!o) return
  overlay = null
  document.removeEventListener('keydown', o.onKeydown)
  try {
    o.frame.contentWindow?.removeEventListener('keydown', o.onKeydown)
  } catch {
    /* frame gone or cross-origin — nothing to remove */
  }
  o.root.remove()
  unlockScroll(o.saved)
  if (restoreFocus) o.invoker.focus({ preventScroll: true })
}

function closePreview() {
  const o = overlay
  if (!o || o.closing) return
  o.closing = true

  if (o.reduced) {
    teardown()
    return
  }

  o.closeBtn.style.opacity = '0'
  animTo(o.frame, 'opacity', o.frame.style.opacity || '1', '0', 160)

  // Phone: the plate dissolved on landing — bring it back under the fading
  // frame so the return flight has something to fly.
  if (o.phone) o.morph.style.opacity = '1'

  // The plate returns to WHERE THE CARD IS NOW — re-measured, because a resize
  // while open moves it. Scroll cannot have (it is locked).
  const back = o.plateSource.getBoundingClientRect()
  const s = Math.max(window.innerWidth / back.width, window.innerHeight / back.height)
  const bx = window.innerWidth / 2 - (back.left + back.width / 2)
  const by = window.innerHeight / 2 - (back.top + back.height / 2)
  o.morph.style.top = `${back.top}px`
  o.morph.style.left = `${back.left}px`
  o.morph.style.width = `${back.width}px`
  o.morph.style.height = `${back.height}px`
  animTo(
    o.morph,
    'transform',
    `translate(${bx}px, ${by}px) scale(${s})`,
    'translate(0px, 0px) scale(1)',
    CLOSE_MS,
  )
  animTo(o.backdrop, 'opacity', '1', '0', FADE_MS)

  // Timed teardown for the same reason the landing is timed — and identity
  // guarded, so this timer can never tear down a LATER overlay.
  fx.setTimeout(() => {
    if (overlay === o) teardown()
  }, CLOSE_MS + SETTLE_SLACK_MS)
}

function closeGlyph(): string {
  // Drawn ✕ — two rules at the masthead glyph's stroke weight. Inline SVG,
  // never a dingbat codepoint (iOS emoji-presentation trap).
  return (
    '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/>' +
    '<line x1="19" y1="5" x2="5" y2="19"/></svg>'
  )
}

function openPreview(e: MouseEvent, ex: AptExample) {
  // Modified clicks keep native behaviour (new tab etc.) — same etiquette as
  // the global interceptor, which skips them too.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  if (overlay) {
    e.preventDefault()
    // Mid-close: finish that teardown now and open the new one, rather than
    // swallowing the click and leaving the visitor tapping a dead card.
    if (!overlay.closing) return
    teardown(false)
  }
  const invoker = e.currentTarget as HTMLElement
  const img = invoker.querySelector('img')
  if (!img) return // no plate to lift — let the link navigate
  e.preventDefault() // also parks the SPA interceptor (checks defaultPrevented)

  const reduced = prefersReducedMotion()
  // The site's own phone breakpoint — the same 809.98 the stylesheets use.
  const phone = window.matchMedia('(max-width: 809.98px)').matches
  const rect = img.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const saved = lockScroll()

  const root = document.createElement('div')
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'true')
  root.setAttribute('aria-label', `${examples.feedback.previewTitle}: ${ex.name}`)
  root.style.cssText = 'position:fixed;inset:0;z-index:9500;'

  const backdrop = document.createElement('div')
  backdrop.style.cssText = 'position:absolute;inset:0;background:var(--list);'

  // The plate, exactly over the card's image on frame one.
  const morph = document.createElement('div')
  morph.setAttribute('aria-hidden', 'true')
  morph.style.cssText =
    `position:absolute;top:${rect.top}px;left:${rect.left}px;` +
    `width:${rect.width}px;height:${rect.height}px;overflow:hidden;will-change:transform;`
  const plate = document.createElement('img')
  plate.src = img.currentSrc || img.src
  plate.alt = ''
  plate.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:top;display:block;'
  morph.appendChild(plate)

  // The live page, loading during the flight.
  const frame = document.createElement('iframe')
  frame.src = ex.demo
  frame.title = `${examples.feedback.previewTitle}: ${ex.name}`
  frame.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;border:0;background:var(--list);opacity:0;'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', examples.feedback.close)
  closeBtn.innerHTML = closeGlyph()
  // PROMINENT (owner's call): the button sits over an UNKNOWN page — any of
  // the three demos, any scroll state — so it inverts to solid graphite with
  // a paper outline: dark chip reads on light regions, the outline carries it
  // over dark ones. 52px, up from the 44px floor; square, flat, no shadow.
  closeBtn.style.cssText =
    'position:absolute;top:max(14px, env(safe-area-inset-top));' +
    'right:max(14px, env(safe-area-inset-right));width:52px;height:52px;' +
    'display:inline-flex;align-items:center;justify-content:center;' +
    'background:var(--grafit);color:var(--list);border:2px solid var(--list);' +
    'border-radius:0;cursor:pointer;opacity:0;'

  root.append(backdrop, morph, frame, closeBtn)
  document.body.appendChild(root)

  const onKeydown = (ev: Event) => {
    const k = ev as KeyboardEvent
    if (k.key === 'Escape') {
      closePreview()
      return
    }
    // Two stops: the close button and the page itself. Keep Tab between them.
    if (k.key === 'Tab') {
      if (k.shiftKey && document.activeElement === closeBtn) {
        k.preventDefault()
        frame.focus()
      } else if (!k.shiftKey && document.activeElement === frame) {
        k.preventDefault()
        closeBtn.focus()
      }
    }
  }

  const o: Overlay = {
    root,
    morph,
    backdrop,
    frame,
    closeBtn,
    invoker,
    plateSource: img,
    saved,
    reduced,
    phone,
    closing: false,
    onKeydown,
  }
  overlay = o

  // Native listener, removed in teardown — NOT fx.on, which has no off handle
  // and would leave one live handler per open (see the header note).
  document.addEventListener('keydown', onKeydown)
  closeBtn.addEventListener('click', () => closePreview())

  // Uniform cover scale about the plate's centre: no distortion in flight.
  const s = Math.max(vw / rect.width, vh / rect.height)
  const dx = vw / 2 - (rect.left + rect.width / 2)
  const dy = vh / 2 - (rect.top + rect.height / 2)
  const lifted = `translate(${dx}px, ${dy}px) scale(${s})`

  let revealed = false
  let landed = reduced
  let loaded = false
  const maybeReveal = () => {
    if (!landed || !loaded || revealed) return
    if (overlay !== o || o.closing) return
    revealed = true
    if (reduced) frame.style.opacity = '1'
    else animTo(frame, 'opacity', '0', '1', FADE_MS)
  }

  frame.addEventListener('load', () => {
    loaded = true
    maybeReveal()
    // Same-origin: let Escape reach us from inside the page, best effort.
    try {
      frame.contentWindow?.addEventListener('keydown', onKeydown)
    } catch {
      /* cross-origin or gone — the outer listener still covers the button */
    }
  })
  // A frame that never fires load (blocked, dead) must not trap the plate
  // forever — past the cap we reveal regardless; worst case the plate stays.
  fx.setTimeout(() => {
    loaded = true
    maybeReveal()
  }, IFRAME_CAP_MS)

  const showChrome = () => {
    if (overlay !== o || o.closing) return
    if (reduced) closeBtn.style.opacity = '1'
    else animTo(closeBtn, 'opacity', '0', '1', 180)
    closeBtn.focus({ preventScroll: true })
  }

  if (reduced) {
    // The settled state, immediately: no lift. On a phone the plate is a
    // desktop capture with nothing to add — settle on paper instead.
    morph.style.transform = lifted
    if (phone) morph.style.opacity = '0'
    backdrop.style.opacity = '1'
    showChrome()
    maybeReveal()
  } else {
    animTo(backdrop, 'opacity', '0', '1', FADE_MS)
    animTo(morph, 'transform', 'translate(0px, 0px) scale(1)', lifted, LIFT_MS)
    // Landing is timed, not awaited from the animation — a non-compositing
    // renderer may never fire finish, and the inline end state is already set.
    fx.setTimeout(() => {
      landed = true
      // Phone: the plate has done its flying — dissolve it into the beige so
      // a zoomed DESKTOP page is never held while the mobile page loads.
      if (phone && overlay === o && !o.closing) {
        animTo(morph, 'opacity', '1', '0', PLATE_EXIT_MS)
      }
      showChrome()
      maybeReveal()
    }, LIFT_MS + SETTLE_SLACK_MS)
  }
}

onUnmounted(() => {
  // The overlay must not outlive the view: drop it without stealing focus
  // (the invoker is being unmounted with it), then kill every tracked effect.
  teardown(false)
  fx.dispose()
})
</script>

<template>
  <section id="primeri" class="apte press press--light">
    <div class="container">
      <p class="kicker apte__kicker">{{ examples.kicker }}</p>
      <h2 class="apte__title">{{ examples.title }}</h2>
      <p class="apte__body">{{ examples.body }}</p>

      <ul class="apte__grid">
        <li v-for="ex in examples.items" :key="ex.id" class="apte__card">
          <a class="apte__link" :href="ex.demo" @click="openPreview($event, ex)">
            <figure class="apte__figure">
              <picture>
                <source type="image/avif" :srcset="srcset(ex.id, 'avif')" :sizes="SIZES" />
                <source type="image/webp" :srcset="srcset(ex.id, 'webp')" :sizes="SIZES" />
                <img
                  class="apte__img"
                  :src="`/img/primeri/${ex.id}-840.jpg`"
                  :srcset="srcset(ex.id, 'jpg')"
                  :sizes="SIZES"
                  :alt="ex.alt"
                  width="1104"
                  height="552"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption class="apte__caption">
                <span class="apte__name">{{ ex.name }}</span>
                <span class="apte__gloss">{{ ex.gloss }}</span>
              </figcaption>
            </figure>
          </a>
        </li>
      </ul>

      <!-- The honesty line: a ruled note on the sheet, same register as the
           old pending note it replaces. -->
      <p class="apte__demo-note">{{ examples.demoNote }}</p>
    </div>
  </section>
</template>

<style scoped>
.apte {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.apte__kicker {
  color: var(--grafit-2);
}

.apte__title {
  margin-top: var(--space-4);
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-size: var(--type-statement-size);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.apte__body {
  max-width: 56ch;
  line-height: 1.6;
  color: var(--grafit-2);
}

.apte__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-8);
  margin: var(--space-10) 0 0;
  padding: 0;
  list-style: none;
}

/* The whole card is one link; the plate is the control. */
.apte__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.apte__link:focus-visible {
  outline: 2px solid var(--grafit);
  outline-offset: 4px;
}

.apte__figure {
  margin: 0;
}

/* A sheet on the sheet: hairline frame, square corners, no shadow — the same
   drawn-plate treatment the rest of the system uses for imagery. */
.apte__img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--mreza-strong);
  transition: border-color 200ms var(--ease-out);
}

/* Hover is wired for pointers only (mouseleave never fires on touch); the
   ink names the interaction, the frame darkens under it. */
@media (hover: hover) {
  .apte__link:hover .apte__img {
    border-color: var(--grafit);
  }

  .apte__link:hover .apte__name {
    color: var(--rez);
  }
}

.apte__link:focus-visible .apte__name {
  color: var(--rez);
}

.apte__caption {
  display: grid;
  gap: var(--space-1);
  padding-top: var(--space-3);
}

.apte__name {
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--grafit);
  transition: color 200ms var(--ease-out);
}

.apte__gloss {
  font-size: var(--fs-annot);
  line-height: 1.5;
  color: var(--grafit-2);
}

.apte__demo-note {
  max-width: 56ch;
  margin-top: var(--space-8);
  margin-bottom: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--mreza-strong);
  font-size: var(--fs-annot);
  line-height: 1.55;
  color: var(--grafit-2);
}

@media (max-width: 809px) {
  .apte__body,
  .apte__demo-note {
    max-width: none;
  }

  .apte__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
