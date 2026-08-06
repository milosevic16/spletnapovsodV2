<script setup lang="ts">
/**
 * The datum — navigation as a drawing instrument, two faces:
 *   ≥900px: a fixed left level rail. Section labels run vertically along the
 *           datum line (drafting convention: dimension text runs along its
 *           line); a red tick marks the current level via scroll-spy.
 *   <900px: a fixed top strip (brand + MENU) opening a native <dialog> overlay
 *           (free focus trap + Escape). The footer remains the in-flow nav.
 * Anchors come from the typed `nav` array; targets are machine identifiers.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { nav, datum } from '@/content/home'
import { createFx } from '@/lib/fx'

const fx = createFx()
const current = ref('')
const menu = ref<HTMLDialogElement | null>(null)
let scrollYBefore = 0

onMounted(() => {
  // Scroll-spy: the level whose section occupies the reading band is current.
  if (!('IntersectionObserver' in window)) return
  const io = fx.io(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) current.value = e.target.id
      }
    },
    { rootMargin: '-35% 0px -55% 0px' },
  )
  for (const item of nav) {
    const el = document.getElementById(item.target)
    if (el) io.observe(el)
  }
})

function openMenu() {
  const d = menu.value
  if (!d) return
  // Scroll lock, house order: capture first, then overflow hidden, then re-pin.
  scrollYBefore = window.scrollY
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  d.showModal()
  window.scrollTo({ top: scrollYBefore, behavior: 'instant' })
}

function unlockScroll() {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  window.scrollTo({ top: scrollYBefore, behavior: 'instant' })
}

function closeMenu() {
  // Unlock directly — the dialog's queued 'close' event can be deferred in
  // throttled/background documents; the button/link path must not wait on it.
  unlockScroll()
  menu.value?.close()
}

/** Escape closes the dialog natively — this is that path's unlock. */
function onDialogClose() {
  unlockScroll()
}

onUnmounted(() => {
  fx.dispose()
  unlockScroll()
})
</script>

<template>
  <!-- Phone strip / desktop rail — one landmark, two CSS faces. -->
  <header class="datum-bar">
    <a href="/" class="datum-bar__brand" :aria-label="datum.brandAriaLabel">
      <!-- The mark: a sheet cut by the red plane, lower half pochéd. -->
      <svg class="datum-bar__mark" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" />
        <rect x="2.5" y="13" width="19" height="8.5" fill="currentColor" />
        <rect x="0" y="11.25" width="24" height="1.9" fill="var(--rez)" />
      </svg>
      <span class="datum-bar__word">SpletnaPovsod</span>
    </a>

    <nav class="datum-bar__nav" :aria-label="datum.navAriaLabel">
      <ul class="datum-bar__levels">
        <li v-for="item in nav" :key="item.target">
          <a
            :href="`#${item.target}`"
            class="datum-bar__level datum"
            :class="{ 'datum-bar__level--current': current === item.target }"
            :aria-current="current === item.target ? 'true' : undefined"
          >
            <span class="datum-bar__tick" aria-hidden="true"></span>
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>

    <button class="datum-bar__menu datum" type="button" @click="openMenu">
      {{ datum.menuLabel }}
    </button>
  </header>

  <dialog ref="menu" class="menu" @close="onDialogClose">
    <div class="menu__sheet">
      <button class="menu__close datum" type="button" @click="closeMenu">
        {{ datum.menuCloseLabel }}
      </button>
      <nav :aria-label="datum.navAriaLabel">
        <ul class="menu__list">
          <li v-for="item in nav" :key="item.target">
            <a :href="`#${item.target}`" class="menu__link" @click="closeMenu">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <p class="menu__tb" aria-hidden="true">SPLETNAPOVSOD · MERILO 1 : 1</p>
    </div>
  </dialog>
</template>

<style scoped>
/* --- phone: top strip ----------------------------------------------------- */
.datum-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.5rem;
  padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
  background: var(--list);
  border-bottom: 1px solid var(--mreza);
}

.datum-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  color: var(--grafit);
  text-decoration: none;
}

.datum-bar__word {
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.datum-bar__nav {
  display: none;
}

.datum-bar__menu {
  min-height: 44px;
  min-width: 44px;
  padding: 0 0.25rem;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--grafit);
}

/* --- phone: menu overlay --------------------------------------------------- */
.menu {
  border: 0;
  padding: 0;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  background: var(--list);
  color: var(--grafit);
}
.menu::backdrop {
  background: none;
}

.menu__sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: max(1rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right))
    max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  border: 1px solid var(--mreza);
  margin: 0.5rem;
  width: calc(100% - 1rem);
  height: calc(100% - 1rem);
}

.menu__close {
  align-self: flex-end;
  min-height: 44px;
  min-width: 44px;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--grafit);
}

.menu__list {
  list-style: none;
  margin-top: 8vh;
  display: grid;
  gap: 0.5rem;
}

.menu__link {
  display: block;
  padding: 0.6rem 0;
  font-family: var(--font-display);
  font-stretch: var(--wdth-monument);
  font-weight: 275;
  font-size: clamp(1.9rem, 8vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-decoration: none;
  border-bottom: 1px solid var(--mreza);
}

.menu__link:active {
  color: var(--rez);
}

.menu__tb {
  margin-top: auto;
  align-self: flex-end;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--mreza);
  border-right-width: 3px;
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-size: 0.62rem;
  letter-spacing: 0.13em;
  color: var(--grafit-2);
}

/* --- desktop: left level rail ---------------------------------------------- */
@media (min-width: 900px) {
  .datum-bar {
    top: 0;
    right: auto;
    bottom: 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 4rem;
    height: 100dvh;
    padding: 1.25rem 0;
    border-bottom: 0;
    border-right: 1px solid var(--mreza);
  }

  .datum-bar__word {
    display: none;
  }

  .datum-bar__menu {
    display: none;
  }

  .datum-bar__nav {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .datum-bar__levels {
    list-style: none;
    display: grid;
    gap: 2.25rem;
  }

  /* Dimension text runs along the datum line (bottom-up, drafting standard). */
  .datum-bar__level {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    min-width: 44px;
    padding: 0.25rem 0;
    text-decoration: none;
    color: var(--grafit-2);
    transition: color var(--t-micro) var(--ease-out);
  }

  .datum-bar__level:hover {
    color: var(--grafit);
  }

  .datum-bar__tick {
    width: 2px;
    height: 7px;
    background: var(--mreza-strong);
    transition: background var(--t-micro) var(--ease-out), height var(--t-micro) var(--ease-out);
  }

  .datum-bar__level--current {
    color: var(--grafit);
  }

  .datum-bar__level--current .datum-bar__tick {
    background: var(--rez);
    height: 14px;
  }

  .menu {
    display: none;
  }
}
</style>
