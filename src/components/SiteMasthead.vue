<script setup lang="ts">
/**
 * The masthead: four section buttons plus the call to action.
 *
 * DESKTOP (≥900px) — all five centred on a narrow strip, as they are.
 *
 * PHONE — the strip carries a single »Meni« chip, and opening it TRANSFORMS
 * the strip into the menu rather than dropping a separate panel over it: the
 * strip's own ground goes one step darker, the chip dissolves into it, and the
 * same ground unfolds downward with the site's red cut plane riding its
 * leading edge. Each row's label rises and its rule draws itself left-to-right
 * as the plane passes — so the whole thing travels top-down, once, in one
 * gesture. `--reveal` (registered in tokens.css) is the single number driving
 * the unfold and the plane, so they cannot fall out of step.
 *
 * The collapse is gated on `live`: with JS off there is no chip and the nav is
 * simply visible in flow, which is also what a crawler reads. The panel's
 * links are in the static HTML either way — the phone state hides them with
 * `visibility`, which takes them out of the tab order with them.
 *
 * The CTA keeps its own element: it points at the same anchor as »Kontakt«, so
 * folding it into the nav would put a duplicate stop inside a navigation
 * landmark. It carries the links' styling, by the owner's call.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { nav, hero, ui } from '@/content/home'
import { createFx } from '@/lib/fx'

const fx = createFx()
const live = ref(false)
const open = ref(false)
/** Whether the chip is the nav's only face — drives `inert`, so it must be real. */
const phone = ref(false)
/** Phones only: the bar has gathered itself out of the hero and taken the top. */
const pinned = ref(false)
/** Phones only: pulled off the top while the reader is travelling down. */
const stowed = ref(false)
const toggleEl = ref<HTMLButtonElement | null>(null)

function close() {
  open.value = false
}

/**
 * The bar yields to a reader travelling down and returns the moment they turn
 * back. The threshold is what keeps it from flickering on the small
 * corrections a finger makes; an open menu never stows, because pulling the
 * panel's own header out from over it would be absurd.
 */
const STOW_THRESHOLD = 8
let lastY = 0

function onDirection() {
  const y = window.scrollY
  const dy = y - lastY
  if (Math.abs(dy) < STOW_THRESHOLD) return
  lastY = y
  stowed.value = open.value ? false : dy > 0
}

function toggle() {
  open.value = !open.value
}

onMounted(() => {
  live.value = true

  fx.on(window, 'keydown', ((e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !open.value) return
    close()
    // Escape returns the focus to the control that opened the menu.
    toggleEl.value?.focus()
  }) as EventListener)

  // Crossing to the desktop layout retires the chip, so a stale open state
  // would leave aria-expanded describing a control nobody can see — and the
  // shut panel must never be inert there, where it IS the visible nav.
  const desktop = window.matchMedia('(min-width: 900px)')
  const sync = () => {
    phone.value = !desktop.matches
    if (desktop.matches) close()
  }
  sync()
  fx.on(desktop, 'change', sync as EventListener)

  // The bar appears exactly when the hero's own wordmark leaves the screen, so
  // the brand is never absent from the page. The sentinel is a named contract
  // with StatementSection rather than a class-name guess.
  const sentinel = document.querySelector('[data-brand-sentinel]')
  if (sentinel && 'IntersectionObserver' in window) {
    fx.io(
      (entries) => {
        for (const e of entries) pinned.value = !e.isIntersecting
      },
      { threshold: 0 },
    ).observe(sentinel)
  } else {
    // No sentinel (or no observer): fall back to a plain threshold rather than
    // leaving the bar stuck in its hero face forever.
    const onScroll = () => {
      pinned.value = window.scrollY > 120
    }
    onScroll()
    fx.on(window, 'scroll', onScroll, { passive: true })
  }

  lastY = window.scrollY
  fx.on(window, 'scroll', onDirection, { passive: true })
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <header
    class="masthead"
    :class="{
      'masthead--live': live,
      'masthead--open': open,
      'masthead--pinned': pinned,
      'masthead--stowed': stowed,
    }"
  >
    <div class="container masthead__row">
      <!-- The bar's own small wordmark, phones only, revealed once pinned.
           aria-hidden and hydration-gated: the hero already carries the brand
           for crawlers and assistive tech, and this is its second face, not a
           second announcement. -->
      <p v-if="live" class="masthead__brand" aria-hidden="true">
        <svg class="masthead__brandmark" viewBox="0 0 24 24" fill="none">
          <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor"
            stroke-width="1.5" />
          <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
          <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
        </svg>
        <span class="masthead__brandtext">SpletnaPovsod</span>
      </p>

      <button
        v-if="live"
        ref="toggleEl"
        type="button"
        class="masthead__toggle"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-label="ui.feedback.menuLabel"
        aria-controls="glavni-meni"
        @click="toggle"
      >
        <span class="masthead__toggle-label">{{ ui.feedback.menuLabel }}</span>
        <!-- Bracketed rules, the drawing's own vocabulary. Open, the outer two
             collapse into the middle: the plane closing, not a rotated X. -->
        <svg
          class="masthead__glyph"
          viewBox="0 0 24 16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        >
          <path d="M4.5 1.5 H1.5 V14.5 H4.5" />
          <path d="M19.5 1.5 H22.5 V14.5 H19.5" />
          <line class="masthead__gr masthead__gr--1" x1="7.5" y1="5" x2="16.5" y2="5" />
          <line class="masthead__gr" x1="7.5" y1="8" x2="16.5" y2="8" />
          <line class="masthead__gr masthead__gr--3" x1="7.5" y1="11" x2="16.5" y2="11" />
        </svg>
      </button>

      <!-- Shut, the panel is clipped to nothing AND inert, which is what takes
           its links out of the tab order and off assistive tech. Deliberately
           not `visibility`: that has to transition to survive the closing
           animation, and a delayed transition applies to the FIRST paint too —
           measured, the whole expanded nav showed for 460ms on every load. -->
      <div
        id="glavni-meni"
        class="masthead__panel"
        :inert="live && phone && !open ? true : undefined"
      >
        <nav class="masthead__nav" aria-label="Glavna navigacija">
          <a
            v-for="(item, i) in nav"
            :key="item.target"
            :href="`#${item.target}`"
            class="masthead__link"
            :style="{ '--i': i }"
            @click="close"
          >
            {{ item.label }}
          </a>
        </nav>

        <a
          :href="`#${hero.ctaPrimary.target}`"
          class="masthead__link masthead__cta"
          :style="{ '--i': nav.length }"
          @click="close"
          >{{ hero.ctaPrimary.label }}</a
        >
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Transparent: the page's own paper runs unbroken through the chrome. The
   position is the panel's containing block, so the panel goes full-bleed on a
   phone while the row it lives in stays inside the centred measure. */
.masthead {
  position: relative;
  color: var(--grafit);
  border-bottom: 1px solid var(--mreza);
  transition:
    background-color 220ms var(--ease-out),
    border-bottom-color 220ms var(--ease-out);
}

.masthead__row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  /* Same as the nav's internal gap, so all five items are evenly spaced. */
  gap: 0 clamp(1rem, 4vw, 3rem);
}

.masthead__panel,
.masthead__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: clamp(1rem, 4vw, 3rem);
}

/* Both exist only once hydrated, and only on a phone. */
.masthead__toggle,
.masthead__brand {
  display: none;
}

/* The strip is visually narrow; the 44px tap floor lives on the links. */
.masthead__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 0.25rem;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 500;
  font-size: var(--fs-kicker);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: var(--grafit-2); /* 6.74:1 on --list, 6.16:1 on --list-2 — measured */
  text-decoration: none;
}

.masthead__link:hover {
  color: var(--rez);
}

/* The CTA differs from the nav links in one respect only: it never breaks. */
.masthead__cta {
  white-space: nowrap;
}

/* --- phone: two faces ------------------------------------------------------
   AT THE TOP the masthead is not a header at all: it is fixed, transparent,
   and contributes nothing but the menu button standing in the hero's own
   top-right corner, on the same --hero-inset as the wordmark opposite it.
   PINNED (the hero wordmark has scrolled away) it gathers into a thin bar —
   paper ground, hairline, the small wordmark arriving from the left, the
   button drawing up into the row with it. */
@media (max-width: 899.98px) {
  /* Three states, not two: HERO (transparent, brand blank, bare glyph),
     PINNED (thin bar, small brand) and OPEN (either of the above turned into a
     header carrying the brand at HERO size). Open is deliberately its own
     face rather than a modifier of pinned — the brand must never disappear
     behind the menu it opened. */
  .masthead--live {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: transparent;
    border-bottom-color: transparent;
    /* The hero face's box is as tall as the (invisible) brand inside it, so it
       must not sit over the page swallowing taps. Only its controls take any. */
    pointer-events: none;
    transition:
      background-color 260ms var(--ease-out),
      border-bottom-color 260ms var(--ease-out),
      transform 320ms var(--ease-out);
  }

  .masthead--live .masthead__toggle,
  .masthead--live .masthead__panel {
    pointer-events: auto;
  }

  /* Stowed: yields to a reader travelling down, returns when they turn back.
     Never while open, and never in the hero face, where it holds the only
     control the visitor has. */
  .masthead--live.masthead--pinned.masthead--stowed:not(.masthead--open) {
    transform: translateY(-100%);
  }

  /* The button is taken OUT of the row's flow. In flow it competes with a
     brand that is now hero-sized, and at 320px the two plus their gap exceed
     the line — measured, the button wrapped to a second row and the bar grew
     to 92px. Out of flow it can never wrap, and the brand gets the same
     reserved right-hand strip the hero's own wordmark has. */
  .masthead--live .masthead__row {
    position: relative;
    min-height: 44px;
    /* The desktop row centres its items; with the button out of flow the brand
       became the only one and centred with it, landing 5px off the hero's own
       wordmark. Phones start from the left edge. */
    justify-content: flex-start;
    /* The brand TOP-aligns, so the bar's copy lands exactly where the hero's
       own wordmark already is (centring it put the two 3px apart, which shows
       as a jump the moment the menu opens over it). */
    align-items: flex-start;
    /* The hero face: the button sits on the wordmark's own inset — which is
       NOT the container's gutter (they diverge above ~408px, where the gutter
       is 4vw and the inset 4.9vw). */
    padding-inline: var(--hero-inset);
    padding-block: var(--hero-inset) 0;
    transition: padding 320ms var(--ease-out);
  }

  /* Only a SHUT pinned bar draws in; open restores the hero's own padding.
     There the brand is a small mark, so the row centres as a bar should. */
  .masthead--live.masthead--pinned:not(.masthead--open) .masthead__row {
    align-items: center;
    padding-block: 0.25rem;
  }

  .masthead--live.masthead--pinned:not(.masthead--open) {
    background: var(--list);
    border-bottom-color: var(--mreza);
  }

  /* The bar's wordmark is the hero's, re-rendered: same tokens, same optical
     pull, same vertical stretch. Blank in the hero face — the real hero
     wordmark is showing through — and full size again the moment the menu
     opens over it, so the brand is never absent from the screen. */
  .masthead--live .masthead__brand {
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--font-display);
    font-stretch: var(--hero-wordmark-wdth);
    font-weight: 300;
    font-size: var(--hero-wordmark);
    line-height: 1;
    letter-spacing: -0.025em;
    margin-top: -0.11em;
    padding-block: calc((var(--hero-wordmark-scaley) - 1) * 0.5em);
    /* The same strip the hero's own brand reserves for the button. */
    padding-right: 3rem;
    color: var(--grafit);
    opacity: 0;
    transition:
      opacity 300ms var(--ease-out),
      font-size 380ms var(--ease-out),
      font-stretch 380ms var(--ease-out);
  }

  .masthead__brandtext {
    white-space: nowrap;
    transform: scaleY(var(--hero-wordmark-scaley));
    transform-origin: left center;
  }

  /* Shut and pinned, it is the small bar mark. */
  .masthead--live.masthead--pinned:not(.masthead--open) .masthead__brand {
    --hero-wordmark-scaley: 1;
    font-size: 1.05rem;
    font-stretch: var(--wdth-monument);
    letter-spacing: -0.02em;
    opacity: 1;
  }

  /* Open, from either face, it stands at hero size. */
  .masthead--live.masthead--open .masthead__brand {
    opacity: 1;
  }

  .masthead__brandmark {
    width: 0.78em;
    height: 0.78em;
    flex: 0 0 auto;
  }

  .masthead--live .masthead__toggle {
    display: inline-flex;
    align-items: center;
    /* Out of flow, pinned to the corner. The vertical anchor is the WORDMARK's
       own centre — inset, less the brand's 0.11em optical pull, plus half its
       stretched line — so the glyph lines up with the lettering rather than
       with whatever box happens to be tallest. */
    position: absolute;
    top: calc(var(--hero-inset) + 0.45 * var(--hero-wordmark));
    right: calc(var(--hero-inset) - 1.5px);
    transform: translateY(-50%);
    /* Ink, not box: the glyph is flush right and pulled out by the 1.5px its
       own viewBox holds inside, so its rule ends on exactly the inset the
       wordmark starts on. */
    justify-content: flex-end;
    margin-right: -1.5px;
    gap: 0.55rem;
    min-height: 44px;
    /* The hero face is the bare glyph — a standalone control, not a bar. The
       44px box stays for the tap floor; it is simply transparent, so the
       wordmark may come as close as its own padding-right allows. */
    min-width: 44px;
    padding-inline: 0;
    background: transparent;
    border: 1px solid transparent;
    color: var(--grafit);
    font-family: var(--font-display);
    font-stretch: var(--wdth-datum);
    font-weight: 500;
    font-size: var(--fs-kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    cursor: pointer;
    transition:
      background-color 260ms var(--ease-out),
      border-color 260ms var(--ease-out),
      padding 300ms var(--ease-out);
  }

  /* Pinned, it becomes the labelled chip: one step darker than the page, with
     a real line — at 1.09:1 against the paper the fill alone would not read
     as a control. */
  /* Pinned it gains its label and nothing else: no fill, no border — by the
     owner's call it is just a button in the header, not a chip on it. The row
     centres there, so the optical pull above is not wanted. */
  .masthead--live.masthead--pinned:not(.masthead--open) .masthead__toggle {
    top: 50%;
  }

  /* The label rides with the bar; in the hero and open faces only the glyph. */
  .masthead__toggle-label {
    display: inline-block;
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    white-space: nowrap;
    transition:
      max-width 300ms var(--ease-out),
      opacity 220ms var(--ease-out);
  }

  .masthead--live.masthead--pinned:not(.masthead--open) .masthead__toggle-label {
    max-width: 5rem;
    opacity: 1;
  }

  .masthead__glyph {
    width: 24px;
    height: 16px;
    overflow: visible;
  }

  .masthead__gr {
    transition:
      transform 300ms var(--ease-out),
      opacity 300ms var(--ease-out);
  }

  .masthead--open .masthead__gr--1 {
    transform: translateY(3px);
    opacity: 0;
  }

  .masthead--open .masthead__gr--3 {
    transform: translateY(-3px);
    opacity: 0;
  }

  /* The strip takes the menu's ground, and its own seam disappears so the
     ground runs unbroken into the panel below. */
  .masthead--live.masthead--open {
    background: var(--list-2);
    border-bottom-color: transparent;
  }

  .masthead--live .masthead__panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 40;
    flex-direction: column;
    align-items: stretch;
    column-gap: 0;
    background: var(--list-2);
    border-bottom: 1px solid var(--mreza-strong);
    /* ONE number unfolds the ground and carries the plane (see tokens.css).
       Shut it clips to zero height, which also stops it hit-testing; `inert`
       (bound in the template) is what removes it from the tab order. */
    clip-path: inset(0 0 calc((1 - var(--reveal)) * 100%) 0);
    transition: --reveal 460ms var(--ease-out);
  }

  .masthead--live .masthead__nav {
    flex-direction: column;
    align-items: stretch;
    column-gap: 0;
  }

  .masthead--live.masthead--open .masthead__panel {
    --reveal: 1;
  }

  /* The cut plane, riding the unfold's leading edge. Pulled up by its own
     height so it sits inside the revealed band rather than clipped by it. */
  .masthead--live .masthead__panel::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: calc(var(--reveal) * 100%);
    margin-top: -2px;
    height: 2px;
    background: var(--rez);
  }

  /* Rows: full width, label rising as the plane passes. */
  .masthead--live .masthead__panel .masthead__link {
    justify-content: flex-start;
    min-height: 52px;
    padding-inline: var(--gutter);
    opacity: 0;
    transform: translateY(-6px);
    transition:
      opacity 260ms var(--ease-out),
      transform 260ms var(--ease-out);
  }

  .masthead--live.masthead--open .masthead__panel .masthead__link {
    opacity: 1;
    transform: none;
    transition-delay: calc(90ms + var(--i, 0) * 55ms);
  }

  /* Each row's rule draws itself left to right, behind its label. */
  .masthead--live .masthead__panel .masthead__link::after {
    content: '';
    position: absolute;
    left: var(--gutter);
    right: var(--gutter);
    bottom: 0;
    height: 1px;
    background: var(--mreza-strong);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 340ms var(--ease-out);
  }

  .masthead--live.masthead--open .masthead__panel .masthead__link::after {
    transform: scaleX(1);
    transition-delay: calc(90ms + var(--i, 0) * 55ms);
  }

  /* The last row keeps no rule: the panel's own border closes the sheet. */
  .masthead--live .masthead__panel .masthead__cta::after {
    content: none;
  }
}
</style>
