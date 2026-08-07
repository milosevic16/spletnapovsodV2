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
const toggleEl = ref<HTMLButtonElement | null>(null)

function close() {
  open.value = false
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
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <header class="masthead" :class="{ 'masthead--live': live, 'masthead--open': open }">
    <div class="container masthead__row">
      <button
        v-if="live"
        ref="toggleEl"
        type="button"
        class="masthead__toggle"
        :aria-expanded="open ? 'true' : 'false'"
        aria-controls="glavni-meni"
        @click="toggle"
      >
        {{ ui.feedback.menuLabel }}
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

/* The chip exists only once hydrated, and only on a phone. */
.masthead__toggle {
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

/* --- phone: the strip becomes the menu ------------------------------------- */
@media (max-width: 899.98px) {
  .masthead--live .masthead__toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 44px;
    padding-inline: 1rem;
    /* One step darker than the page, with a real line: at 1.09:1 against the
       paper the fill alone would not read as a control. */
    background: var(--list-2);
    border: 1px solid var(--mreza-strong);
    color: var(--grafit); /* 13.97:1 on --list-2 — measured */
    font-family: var(--font-display);
    font-stretch: var(--wdth-datum);
    font-weight: 500;
    font-size: var(--fs-kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    cursor: pointer;
    transition: background-color 220ms var(--ease-out);
  }

  /* Open, the chip's fill dissolves into the strip it just became. */
  .masthead--live.masthead--open .masthead__toggle {
    background: transparent;
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
