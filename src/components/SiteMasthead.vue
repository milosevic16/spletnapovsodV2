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
import type { NavItem } from '@/content/home'
import { createFx } from '@/lib/fx'

/**
 * SHARED CHROME, PER-PAGE STOPS. The masthead is the same instrument on every
 * page, but the anchors belong to whichever page mounts it. Both props default
 * to the home page's own values, so every existing call site is unchanged; a
 * subpage passes its own nav and CTA. The href shape (an in-page #anchor) is
 * untouched, which is what keeps this a prop and not a rewrite.
 */
const props = withDefaults(
  defineProps<{ items?: NavItem[]; cta?: { label: string; target: string } }>(),
  { items: () => nav, cta: () => hero.ctaPrimary },
)

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
    class="masthead press press--light"
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
        <!-- The pd mark — geometry pairs with StatementSection's, which pairs
             with the intro veil's. One mark, three renderings. -->
        <svg class="masthead__brandmark" viewBox="116.2 287.19 1019.76 654.28">
          <circle cx="443.34" cy="614.33" r="327.14" fill="var(--rez)" />
          <circle cx="808.92" cy="614.11" r="327.04" fill="var(--rez)" />
          <path fill="var(--list)" fill-rule="evenodd" d="M268.03 829.73C261.27 828.75 255.08 826.61 250.25 823.57C247.88 822.09 243.97 819.1 242.07 817.33C237.72 813.27 233.82 806.97 232.8 802.36C232.02 798.8 231.83 785.73 231.4 704.24C231.24 675.28 231.62 619.94 232.05 608.24C232.31 601.1 232.93 590.97 233.31 587.58C233.44 586.41 233.72 583.89 233.93 581.97C234.45 577.29 235.13 573.07 236.15 568.28C236.62 566.08 237.46 562.05 238.02 559.31C239.5 552.05 240.13 549.64 241.88 544.37C243.39 539.83 243.89 538.48 247.3 529.8C248.67 526.3 254.47 514.5 257.88 508.26C259.92 504.54 263.71 498.54 266.77 494.19C268.26 492.07 270.53 488.82 271.8 486.98C279.19 476.28 291.58 462.21 302.16 452.51C309.77 445.52 317.85 439.02 324.64 434.4C333.25 428.55 342.91 422.59 347.72 420.16C352 417.99 363.24 412.51 363.41 412.51C363.49 412.51 364.07 412.28 364.7 411.99C365.33 411.7 367.88 410.69 370.36 409.73C383.88 404.52 385.81 403.9 396.35 401.3C409.55 398.04 415.33 397.05 428.43 395.83C464.09 392.48 501.33 397.91 531.16 410.79C540.33 414.75 546.92 417.86 551.42 420.36C560.9 425.62 563.24 427.03 569.36 431.19C574.46 434.65 583.72 441.5 584.94 442.7C585.13 442.89 586.19 443.75 587.28 444.62C588.38 445.49 590.06 446.89 591.02 447.75C591.97 448.6 593.77 450.17 595 451.23C599.84 455.39 609.79 465.57 615.46 472.16C618.6 475.81 623.72 482.08 625.43 484.35C626.45 485.72 627.36 486.87 627.46 486.9C627.55 486.93 627.89 486.52 628.22 485.98C628.55 485.45 629.28 484.53 629.85 483.94C631.34 482.37 634.52 478.59 637.48 474.88C643.98 466.74 649.53 460.95 658.88 452.58C669.3 443.25 677.26 437.35 689.75 429.69C692.01 428.31 694.03 427.07 694.24 426.94C694.44 426.81 694.78 426.63 694.98 426.54C695.19 426.45 695.64 426.19 695.98 425.96C696.32 425.73 697.22 425.2 697.97 424.79C699.27 424.08 700.01 423.66 702.14 422.43C704.07 421.32 707.4 419.67 710.17 418.45C711.75 417.75 713.82 416.81 714.78 416.37C715.74 415.92 717.49 415.1 718.67 414.55C723.82 412.16 740.68 406.32 747.56 404.56C765.3 400.01 784.56 397.59 803.18 397.58C828.74 397.56 852.93 401.44 873.04 408.78C888.89 414.57 897.04 418.29 913.5 427.28C916.43 428.88 922.6 432.55 925.45 434.39C927.11 435.46 929.85 437.14 938.49 442.39C941.02 443.93 942.37 444.62 942.49 444.43C942.58 444.27 942.8 442.15 942.97 439.72C944.08 423.97 947.54 414.97 955.39 407.45C958.51 404.45 959.89 403.45 964.34 400.94C972.56 396.31 977.95 395.32 986.8 396.84C994.43 398.14 1001.81 402.09 1008.11 408.23C1012.73 412.73 1015.58 418.01 1016.57 423.9C1018.17 433.36 1018.84 470.97 1018.83 549.72C1018.82 608.48 1018.62 619.38 1017.21 636.1C1015.62 655.1 1012.44 670.92 1006.86 687.63C1005.98 690.28 1004.83 693.53 1004.3 694.86C1002.28 699.93 997.25 710.47 995.31 713.71C994.07 715.76 993.94 716 991.58 720.18C988.58 725.48 985.61 729.98 980.21 737.41C975.93 743.29 971.84 748.34 965.81 755.16C962.41 759.01 951.83 769.67 948.11 772.99C945.73 775.12 945.02 775.74 940.77 779.37C938.23 781.53 935.54 783.69 933.3 785.36C932.27 786.12 930.18 787.7 928.66 788.86C926.27 790.68 922.94 793.06 921.63 793.89C921.42 794.03 920.06 794.92 918.61 795.87C915.43 797.98 910.14 801.19 907.77 802.47C905.32 803.8 903.68 804.72 902.67 805.34C901.68 805.96 893.12 810.2 892.87 810.2C892.71 810.2 890.97 810.98 887.48 812.63C883.76 814.38 882.72 814.78 874.78 817.56C870.55 819.04 861.76 821.74 858.72 822.5C856.47 823.06 843.48 825.63 841.04 826C830.98 827.51 826.49 827.98 818.75 828.37C808.92 828.86 802.51 828.93 794.47 828.65C781.63 828.19 773.65 827.39 763.34 825.51C751.53 823.35 748.63 822.64 738.17 819.29C726.11 815.44 721.36 813.59 711.05 808.69C707.58 807.05 695.94 800.67 693.05 798.83C692.33 798.38 691.68 798 691.61 798C691.54 798 691.17 797.79 690.8 797.52C690.43 797.26 688.39 795.9 686.27 794.5C684.14 793.1 681.51 791.29 680.42 790.49C679.32 789.68 677.09 788.06 675.46 786.88C665.13 779.43 650.22 766.08 641.56 756.53C641.14 756.07 640.44 755.3 640 754.82C639.57 754.34 638.51 753.13 637.66 752.13C636.81 751.13 635.42 749.58 634.58 748.69C631.81 745.76 629.11 742.62 627.9 740.91C627.24 739.99 626.56 739.23 626.37 739.23C626.19 739.23 625.5 739.87 624.84 740.66C624.18 741.45 623.58 742.15 623.51 742.22C623.44 742.29 621.93 744.18 620.15 746.43C615.73 752.01 611.65 756.61 605.86 762.52C601.61 766.86 593.04 774.89 589.65 777.71C588.16 778.94 586.08 780.71 584.68 781.94C583.43 783.03 575.84 788.81 572.63 791.11C570.7 792.5 562.91 797.73 562.38 798C562.24 798.07 561.46 798.56 560.65 799.08C559.84 799.61 557.6 800.93 555.67 802.01C553.74 803.1 552 804.09 551.79 804.22C549.51 805.66 543.52 808.73 539.72 810.4C538.48 810.95 536.36 811.92 534.99 812.56C530.53 814.66 526.58 816.16 516.93 819.41C513.99 820.41 511.4 821.31 511.18 821.43C509.64 822.23 495.57 825.28 485.55 826.99C473.72 829 469.17 829.37 453.56 829.54C437.86 829.72 428.6 829.2 417.57 827.52C412.73 826.78 396.35 823.36 391.67 822.12C387.83 821.09 378.14 817.88 372.62 815.8C358.36 810.43 343.03 802.83 329.42 794.39C327.84 793.41 324.14 791.12 321.2 789.29C318.25 787.47 314.87 785.36 313.68 784.62C312.43 783.83 311.39 783.34 311.22 783.44C311.01 783.57 310.97 784.16 311.07 785.42C311.5 790.44 310.16 797.62 307.39 805.17C306.22 808.36 303.61 812.93 301.72 815.08C300.33 816.68 293.98 822.22 292.17 823.43C288.45 825.92 283.41 828.05 278.62 829.16C276.56 829.64 269.88 829.99 268.03 829.73ZM810.9 750.44C821.01 750 828.84 748.81 839.67 746.08C847.8 744.02 850.86 742.94 860.24 738.78C866.27 736.11 867.33 735.56 871.54 732.96C879.16 728.25 878.55 728.68 886.48 722.65C888.06 721.45 890.02 719.91 890.84 719.23C893.15 717.33 899.2 711.75 900.44 710.39C901.05 709.72 902.78 707.9 904.29 706.34C907.17 703.35 912.39 697.08 915.16 693.28C920.02 686.6 923.39 681.1 926.8 674.25C930.85 666.14 931.51 664.48 934.63 654.77C938.39 643.09 939.31 638.74 940.66 626.17C941.2 621.18 941.4 608.65 941.04 603.1C940.25 591.15 937.64 579.35 932.75 565.66C930.7 559.92 925.38 548.77 922.05 543.25C919.01 538.2 916.27 533.96 914.88 532.17C914.14 531.21 912.8 529.47 911.91 528.31C903.16 516.93 891.59 506.13 880.08 498.59C871.87 493.21 861.97 487.95 854.73 485.1C838.58 478.75 817.36 475.07 799.95 475.6C784.25 476.07 765.56 479.95 751.76 485.6C741.28 489.89 738.47 491.26 732.37 495.07C732.15 495.2 731.4 495.65 730.72 496.05C728.08 497.6 723.15 500.93 721.13 502.53C712.45 509.37 708.55 512.9 702.52 519.37C685.96 537.14 676.37 554.86 670.25 578.98C669.15 583.3 667.76 589.98 667.48 592.31C667.4 592.92 667.12 595 666.86 596.91C666.03 602.91 665.76 607.15 665.77 614.1C665.78 621.57 666.05 625.58 666.99 632.4C669.06 647.38 674.61 664.97 680.97 676.73C684.86 683.9 694.07 697.6 698.28 702.45C704.69 709.84 708.63 713.81 715.15 719.47C726.13 728.99 738.01 736.12 751.24 741.14C762.7 745.49 768.88 747.08 781.01 748.8C788.18 749.82 791.98 750.19 797.95 750.43C804.53 750.69 805.18 750.69 810.9 750.44ZM463.14 748.09C471.68 747.13 482.71 744.95 488.67 743.06C491.15 742.27 504.15 737.33 506.86 736.14C508.8 735.3 511.05 734.08 516.81 730.78C520.77 728.51 522.22 727.56 527.64 723.69C532.23 720.41 534.67 718.56 535.23 717.95C535.37 717.8 537.28 716.1 539.47 714.16C544 710.16 545.61 708.54 550.41 703.14C554.77 698.24 556.08 696.62 559.39 692.04C568.32 679.71 573.31 669.7 578.69 653.32C579.88 649.72 580.96 645.22 581.91 639.99C585.61 619.5 585.83 604.63 582.7 586.08C581.57 579.39 579.95 573.39 577.27 566.03C574.25 557.74 572.13 552.9 569.39 548.04C568.79 546.98 567.77 545.1 567.11 543.87C565.99 541.76 564.2 538.97 561.05 534.41C558.21 530.29 556.06 527.62 550.52 521.32C543.26 513.06 532.12 503.44 523.53 498.01C512.37 490.96 500.29 485.5 488.08 482.01C481.03 479.99 472.12 478.28 463.14 477.22C456.22 476.4 443.84 476.4 436.01 477.21C424.51 478.41 415.91 480.22 406.01 483.5C395.02 487.15 383.81 492.63 373.25 499.53C365.27 504.75 355.79 512.73 349.7 519.35C344.06 525.48 340.25 530.27 335.95 536.65C331.5 543.25 331.03 544.03 328.41 549.23C321.01 563.91 316.62 578.63 314.37 596.29C312.27 612.76 313.47 630.72 317.85 648.09C318.77 651.74 321.49 659.82 323.78 665.68C328.69 678.24 337.31 692.27 346.8 703.17C349.54 706.32 356.87 713.47 360.8 716.83C369.03 723.87 374.99 727.95 384.35 732.97C390.48 736.26 396.83 738.89 406.12 741.99C416.66 745.51 424.3 747.03 439.11 748.54C441.77 748.81 459.71 748.47 463.14 748.09Z" />
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
        class="masthead__panel press press--light"
        :inert="live && phone && !open ? true : undefined"
      >
        <nav class="masthead__nav" aria-label="Glavna navigacija">
          <a
            v-for="(item, i) in props.items"
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
          :href="`#${props.cta.target}`"
          class="masthead__link masthead__cta"
          :style="{ '--i': props.items.length }"
          @click="close"
          >{{ props.cta.label }}</a
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
  /* A GROUND OF ITS OWN. The strip used to be transparent and simply showed
     the page canvas; a screen needs a surface to sit on, and the header now
     reads as the same treated paper as the references band. background-COLOR,
     never the shorthand — the shorthand resets background-image and would
     silently drop the screen. */
  background-color: var(--list);
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

/* The panel carries .press for the PHONE menu, where it paints its own ground
   and has to bring its own screen. On desktop it is just the inline nav row
   with no ground of its own, so the screen is switched off here — left on it
   would print a second set of dots over the masthead's own and read as a
   denser patch behind the nav. The phone rule turns it back on. */
.masthead__panel {
  background-image: none;
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
   AT THE TOP the masthead is not a header at all: it is transparent and
   contributes nothing but the menu button standing in the hero's own top-right
   corner, on the same --hero-inset as the wordmark opposite it. And it belongs
   to the PAGE there, not the viewport — see the hero-face override below.
   PINNED (the hero has scrolled away) it gathers into a thin bar — paper
   ground, hairline, the small wordmark arriving from the left, the button
   drawing up into the row with it. */
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
    /* No bar at the top of a phone: the chrome is only the corner control, so
       there is no surface here and the screen must go with it. Both stated
       explicitly — a later change to background-color alone would otherwise
       leave the dots floating over the hero. */
    background-color: transparent;
    background-image: none;
    border-bottom-color: transparent;
    /* The hero face's box is as tall as the (invisible) brand inside it, so it
       must not sit over the page swallowing taps. Only its controls take any. */
    pointer-events: none;
    transition:
      background-color 260ms var(--ease-out),
      border-bottom-color 260ms var(--ease-out),
      transform 320ms var(--ease-out);
  }

  /* THE HERO FACE BELONGS TO THE PAGE, not the viewport. Fixed, the button sat
     glued to the top-right corner through the whole hero scroll and only ever
     hid once the sentinel had fully left — the reported "stuck button that
     hides after you scroll past the hero". Absolute, with no positioned
     ancestor (the masthead is a direct child of a static #app), it resolves
     against the initial containing block at the PAGE origin, so top:0 is the
     top of the DOCUMENT and the button scrolls up and away with the hero it
     stands in, exactly like any other element on the sheet.

     Only the hero face. The moment the menu OPENS it must overlay the viewport,
     and once PINNED the bar must hold the top — both of those fall back to the
     base `fixed` above because this rule excludes them. The two positions
     coincide at scroll 0 (absolute top:0 == fixed top:0), which is the only
     place the hero-face button is tappable anyway, so opening never jumps.

     This is also why the close now settles at the very top rather than a
     centimetre below it: the header is no longer a fixed layer that can desync
     from the page's own top (the mobile URL bar slides the two apart), so
     closing simply reveals the document where the document actually is. */
  .masthead--live:not(.masthead--pinned):not(.masthead--open) {
    position: absolute;
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
    background-color: var(--list);
    /* Back on for this face: the hero-face rule above kills the screen for
       the no-bar state, and it matches whenever the masthead is live. Taken
       from .press's own custom properties so it cannot drift from the
       utility. */
    background-image: var(--press-dot-hi), var(--press-dot-lo), var(--press-dot-hi),
      var(--press-dot-lo);
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
    /* SIZED TO FIT, like the open face below — same reasoning, this face's own
       geometry. Here the mark is em-sized (0.78em tall, so 0.78 × 1.5586 =
       1.216em wide), so the whole row scales with the font and the fit is one
       division: mark 1.216em + gap 0.5em + lettering 6.45em = 8.166em, plus the
       fixed reserve. 8.29 is that with a little slack.

       AND THE FIT IS NOW LOAD-BEARING, not belt-and-braces. The hero face is
       absolute rather than fixed (see the position override above), and an
       absolute box DOES contribute to its container's scrollable overflow where
       a fixed one does not — so an invisible brand wider than the line would
       become a sideways-panning page, the exact failure this divisor prevents.
       At hero size the box ran 339.9px inside a 280px line at 320 before this
       fit was added; measured after the position change, the whole masthead's
       right edge sits inside the viewport at 320/360/375, so the fit holds. */
    font-size: min(
      var(--hero-wordmark),
      calc((100vw - 2 * var(--hero-inset) - var(--brand-reserve)) / 8.29)
    );
    line-height: 1;
    letter-spacing: -0.025em;
    margin-top: -0.11em;
    padding-block: calc((var(--hero-wordmark-scaley) - 1) * 0.5em);
    /* The strip the button stands in, plus air. 3rem left the wordmark
       touching the glyph at 375 (measured: brand + reserve ran 342px into a
       335px row, so the nowrap text ran under the control). */
    /* Widened again when the control moved into the corner: nesting it took
       ~11px out of this strip and the lettering's clearance fell from 25.7px
       to 16.1px (measured at 375). */
    --brand-reserve: 5.2rem;
    padding-right: var(--brand-reserve);
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

  /* Open, the wordmark is SIZED TO FIT rather than copied from the hero. The
     control holds a fixed strip on the right, so the lettering has a fixed
     width to live in, and at hero size it did not fit: "SpletnaPovsod"
     measures 6.45em wide at this weight and tracking (measured at 100px) and
     its gap adds 0.5em, so the text side needs 6.95em. The mark is NOT part of
     that term — it is pinned to the hero's absolute size below, so it costs a
     fixed 0.55 × --hero-display and must be subtracted, not scaled. (It was in
     the term while the mark was em-sized; leaving it there after the mark went
     fixed cost the lettering its clearance — measured 11.9px to the glyph.)
     Whichever of the two is smaller wins, so the wordmark shrinks a little on
     the narrowest screens and is the hero's own size everywhere else.

     THE MARK COSTS ITS WIDTH, NOT ITS HEIGHT. It is an SVG sized by height
     alone, and its aspect ratio is 1.5586 (the artwork, see StatementSection) — so a mark
     0.55 × --hero-display tall stands 0.55 × 1.5586 = 0.857 × --hero-display
     WIDE. Subtracting the
     height reserved 30.36px for a mark that occupies 51.44px at 320 (measured),
     and the lettering took the missing 21.08px straight off the right edge:
     the open menu's wordmark ran 301px into a 280px line — visibly, past the
     control it is supposed to clear — and did so across the whole phone/tablet
     band, 40px over at 800. 7.02 is 6.95 (gap + lettering) with a little
     slack. */
  .masthead--live.masthead--open .masthead__brand {
    opacity: 1;
    font-size: min(
      var(--hero-wordmark),
      calc(
        (100vw - 2 * var(--hero-inset) - var(--brand-reserve) - 0.857 * var(--hero-display)) / 7.02
      )
    );
  }

  .masthead__brandmark {
    height: 0.78em;
    width: auto;
    flex: 0 0 auto;
  }

  /* OPEN, the brand's mark IS the hero's mark: same absolute size, same top,
     so opening the menu does not move the logo — and the control opposite it
     keeps mirroring the same box in both faces. The optical pull is dropped
     here because the mark, not the lettering, is now the row's datum. */
  .masthead--live.masthead--open .masthead__brand {
    margin-top: 0;
  }

  .masthead--live.masthead--open .masthead__brandmark {
    height: calc(0.55 * var(--hero-display));
  }

  .masthead--live .masthead__toggle {
    display: inline-flex;
    align-items: center;
    /* THE CONTROL MIRRORS THE MARK. The pd mark stands at the sheet's
       top-left with its ink starting on --hero-inset and standing
       0.55em of --hero-display tall (StatementSection; the intro veil lands
       on exactly that box). This is its reflection: ink flush to the RIGHT
       inset, centred on the SAME line — half the mark's height below the
       frame's top edge. Sitting on the corner itself put it a mark's-radius
       too high, which is what read as not meeting the drawing.
       The anchor is the MASTHEAD (fixed at the viewport's top), not the row,
       so the position is identical in the hero face and the open face — the
       control never moves when the menu opens, and neither does the mark it
       mirrors (the open brand's own mark is pinned to the same box below).
       Pinned, the bar is thin and it centres in the bar instead. */
    position: absolute;
    /* THE CORNER GAP — one number, used on both axes, so the glyph sits
       equidistant from the two drawn lines. Vertically its centre is half the
       mark's height below the top line, which leaves (that − half the ink) of
       air above it; the same figure then comes off the right, so the ink nests
       INSIDE the corner instead of standing on the right line.

       6.5px, not 8: the bracket's INK is 13px of the glyph's 16px box (the
       paths run y 1.5–14.5 of a 16-unit viewBox). Measuring the box instead of
       the ink left the two gaps 2px apart — 11.1 above against 9.1 right. */
    --corner-gap: calc(0.275 * var(--hero-display) - 6.5px);
    top: calc(var(--hero-inset) + 0.275 * var(--hero-display));
    /* −1.5px is the bracket's own inset inside its viewBox: it puts the INK,
       not the box, at the intended distance. */
    right: calc(var(--hero-inset) - 1.5px + var(--corner-gap));
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

  /* NO PAPER PUNCH. The glyph used to stand on the frame's right line and cut
     both lines with a patch of paper behind it; nested inside the corner it
     crosses nothing, so the patch would only be an eraser taking bites out of
     a drawing that should run unbroken to its corner. */

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
    background-color: var(--list-2);
    /* Back on for this face: the hero-face rule above kills the screen for
       the no-bar state, and it matches whenever the masthead is live. Taken
       from .press's own custom properties so it cannot drift from the
       utility. */
    background-image: var(--press-dot-hi), var(--press-dot-lo), var(--press-dot-hi),
      var(--press-dot-lo);
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
    background-color: var(--list-2);
    /* The screen comes back here, where the panel is an opaque surface that
       would otherwise cover the masthead's. Re-declared from .press's own
       custom properties rather than restated by value, so it cannot drift. */
    background-image: var(--press-dot-hi), var(--press-dot-lo), var(--press-dot-hi),
      var(--press-dot-lo);
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
