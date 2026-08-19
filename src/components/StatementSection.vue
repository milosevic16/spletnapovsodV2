<script setup lang="ts">
/**
 * The opening band — A TITLE SHEET, and by now a sheet with nothing ruled on
 * it. It carried a hairline frame, crop marks at every corner, a construction
 * line down the right of the courses and a rule under the claim; all four are
 * gone on the owner's call, in that order. Over a film that furniture was
 * competing with the one line that carries meaning. What draws the band now is
 * the mark, the two courses, the red cut plane between them, and the claim —
 * the sheet is a measure and a padding rather than a box.
 *
 * THE BAND IS A FILM. The clip fills the whole hero, edge to edge, untreated —
 * its own brightness, its own colour — and the sheet is drawn on top of it.
 * That is the owner's call and it has a cost, measured and recorded on
 * .stmt__wordmark: this footage carries near-white wall and a near-black block
 * in the same frame, so no flat ink clears AA against every part of it.
 *
 * THE MARK IS THE SHEET'S CORNER STAMP, and which corner depends on the screen.
 * DESKTOP: the top-RIGHT, because the two courses are left-aligned and stop
 * well short of the frame, so the right of the sheet is the composition's void
 * and the mark is what fills it; the crop mark that stood there steps aside.
 * PHONES: the top-LEFT, unchanged — there is no header over the hero on a
 * phone, only the menu control floating in the opposite corner, so the sheet's
 * own stamp is the brand and the control mirrors it.
 * Both positions are CORNERS on purpose, because that is what keeps the intro
 * veil's landing expressible as a formula rather than a measurement: every
 * coordinate is an inset from a viewport edge. index.html copies them as
 * literals — change either, change both.
 *
 * THE DRAWING. Two courses of monumental type in one flat ink, and nothing
 * else. They carried the page's press screen clipped into the letterforms, and
 * »Povsod« was a window onto this same clip seen through its glyphs; a red cut
 * plane with square end ticks divided them. All three devices are cancelled on
 * the owner's call — uniform colour, no texture, no knockout, no rule. The
 * band is the film, the mark, the two words and the claim.
 *
 * THE COURSES ARE FLUSH BY ARITHMETIC, not by eye. Measured at 100px in the
 * real face (Geist 400, uppercase, ls −0.02em): »SPLETNA« sets 4.218em wide,
 * »POVSOD« 3.951em. Those ratios are properties of the strings, not of the
 * size, so dividing one target width by each constant makes both words span
 * EXACTLY the same measure at every viewport. Re-measure both if the lettering
 * or the tracking ever changes. (They changed once already: the second word
 * was 3.118em while it carried a script splice on its tail. That device is
 * cancelled — one face per title, everywhere.)
 *
 * The only JavaScript is the one that starts the film, and it is not load-
 * bearing: the <video> ships in the markup with its poster and no autoplay, so
 * a JS-off or reduced-motion visitor gets the same composition with the film
 * held on one frame. Nothing is hidden and nothing is revealed. On phones the
 * sheet deliberately stops short of the fold so the work below shows through —
 * a hero that ends where the next thing begins; on desktop --hero-reveal does
 * the same job deliberately, standing the band clear of the fold.
 */
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { hero } from '@/content/home'
import { createFx, prefersReducedMotion } from '@/lib/fx'

// The accent span is derived from the title, so a copy edit can never make the
// highlight diverge from the real h1 text.
const accentValid = hero.title.startsWith(hero.titleAccent)
const titleAccent = accentValid ? hero.titleAccent : ''
const titleRest = accentValid ? hero.title.slice(hero.titleAccent.length) : hero.title

const WORD_1 = 'Spletna'
const WORD_2 = 'Povsod'

/** PAIRED with BANDS['hero-fill'] in scripts/build-pillar-videos.mjs.
 *  /video/* is immutable-cached, so a re-encode must bump both. */
const CLIP_VERSION = 'v1'
const clip = (ext: string) => `/video/hero-fill-${CLIP_VERSION}.${ext}`

const fx = createFx()
const rootEl = ref<HTMLElement | null>(null)

onMounted(() => {
  // The film is NOT gated on hydration: it ships in the markup with its poster,
  // so with JS off the hero is that still frame under the same treatment — a
  // complete hero rather than an empty dark band. All JS does is start it.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
  nextTick(() => {
    const v = rootEl.value?.querySelector<HTMLVideoElement>('.stmt__film')
    if (!v) return
    const io = fx.io(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        }
      },
      { threshold: 0 },
    )
    io.observe(v)
  })
})

onUnmounted(() => {
  fx.dispose()
})
</script>

<template>
  <section ref="rootEl" class="stmt">
    <!-- THE HERO IS THE FILM. The same clip that used to be seen through the
         word »POVSOD« now fills the whole band, edge to edge, and everything
         else is drawn on top of it. It ships in the markup rather than behind a
         hydration flag: a <video> with a poster and no autoplay IS a still
         image, so the JS-off hero is the same composition with the film held on
         one frame — which is also exactly what a reduced-motion visitor gets. -->
    <video
      class="stmt__film"
      :poster="clip('jpg')"
      muted
      loop
      playsinline
      preload="metadata"
      disablepictureinpicture
      aria-hidden="true"
      tabindex="-1"
    >
      <source :src="clip('webm')" type="video/webm" />
      <source :src="clip('mp4')" type="video/mp4" />
    </video>
    <!-- The static, laid OVER the film — the NastanitveHero screen pattern: a
         texture that must sit on imagery cannot be a background layer under
         it. One frame, no clocks; the sheet (z-index 1) stays above it. -->
    <div class="stmt__snow grain" aria-hidden="true"></div>
    <!-- The sheet. data-brand-sentinel is a contract with SiteMasthead: the
         phone bar appears exactly when this element leaves the screen, so the
         brand is never absent from the page. -->
    <div class="stmt__sheet" data-brand-sentinel>
      <!-- The corner stamp: the pd mark, punched into the frame. Two
           overlapping discs carrying Povsod's first and last letters; the d is
           the p rotated 180° (the mark's point symmetry). THE VEIL LANDS HERE
           — see the header comment before touching its size or position. -->
      <span class="stmt__stamp">
        <!-- THE CONSTRUCTION, redrawn against the owner's reference artwork:
             THE OWNER'S VECTOR ARTWORK, VERBATIM — two circles and one
             compound path (fill-rule evenodd, counters as subpaths), copied
             from logo_centered.svg with nothing redrawn. Three earlier
             reconstructions from primitives all failed on sight, and the
             lesson is recorded here so nobody tries a fourth: the lettering is
             a DRAWN outline — junctions, terminals, the fused crossing — and
             cannot be rebuilt from circles and rects. The viewBox is the disc
             union's own bounding box (the lettering sits inside it), so the
             svg's box IS the ink: ratio 1019.76 / 654.28 = 1.5586, a literal
             that SiteMasthead's fit formulas and the veil's landing copy —
             change one, change all. The white ink takes the site's paper
             token, the discs the site's red; the artwork's own hexes differ by
             a hair and the palette wins. The d is the
             p turned 180° about the mark's centre, so the two share a height
             by construction. Copied verbatim in SiteMasthead, ContactSection's
             seal, the intro veil and both icons — change one, change all. -->
        <svg class="stmt__mark" viewBox="116.2 287.19 1019.76 654.28" aria-hidden="true">
          <circle cx="443.34" cy="614.33" r="327.14" fill="var(--rez)" />
          <circle cx="808.92" cy="614.11" r="327.04" fill="var(--rez)" />
          <path fill="var(--list)" fill-rule="evenodd" d="M268.03 829.73C261.27 828.75 255.08 826.61 250.25 823.57C247.88 822.09 243.97 819.1 242.07 817.33C237.72 813.27 233.82 806.97 232.8 802.36C232.02 798.8 231.83 785.73 231.4 704.24C231.24 675.28 231.62 619.94 232.05 608.24C232.31 601.1 232.93 590.97 233.31 587.58C233.44 586.41 233.72 583.89 233.93 581.97C234.45 577.29 235.13 573.07 236.15 568.28C236.62 566.08 237.46 562.05 238.02 559.31C239.5 552.05 240.13 549.64 241.88 544.37C243.39 539.83 243.89 538.48 247.3 529.8C248.67 526.3 254.47 514.5 257.88 508.26C259.92 504.54 263.71 498.54 266.77 494.19C268.26 492.07 270.53 488.82 271.8 486.98C279.19 476.28 291.58 462.21 302.16 452.51C309.77 445.52 317.85 439.02 324.64 434.4C333.25 428.55 342.91 422.59 347.72 420.16C352 417.99 363.24 412.51 363.41 412.51C363.49 412.51 364.07 412.28 364.7 411.99C365.33 411.7 367.88 410.69 370.36 409.73C383.88 404.52 385.81 403.9 396.35 401.3C409.55 398.04 415.33 397.05 428.43 395.83C464.09 392.48 501.33 397.91 531.16 410.79C540.33 414.75 546.92 417.86 551.42 420.36C560.9 425.62 563.24 427.03 569.36 431.19C574.46 434.65 583.72 441.5 584.94 442.7C585.13 442.89 586.19 443.75 587.28 444.62C588.38 445.49 590.06 446.89 591.02 447.75C591.97 448.6 593.77 450.17 595 451.23C599.84 455.39 609.79 465.57 615.46 472.16C618.6 475.81 623.72 482.08 625.43 484.35C626.45 485.72 627.36 486.87 627.46 486.9C627.55 486.93 627.89 486.52 628.22 485.98C628.55 485.45 629.28 484.53 629.85 483.94C631.34 482.37 634.52 478.59 637.48 474.88C643.98 466.74 649.53 460.95 658.88 452.58C669.3 443.25 677.26 437.35 689.75 429.69C692.01 428.31 694.03 427.07 694.24 426.94C694.44 426.81 694.78 426.63 694.98 426.54C695.19 426.45 695.64 426.19 695.98 425.96C696.32 425.73 697.22 425.2 697.97 424.79C699.27 424.08 700.01 423.66 702.14 422.43C704.07 421.32 707.4 419.67 710.17 418.45C711.75 417.75 713.82 416.81 714.78 416.37C715.74 415.92 717.49 415.1 718.67 414.55C723.82 412.16 740.68 406.32 747.56 404.56C765.3 400.01 784.56 397.59 803.18 397.58C828.74 397.56 852.93 401.44 873.04 408.78C888.89 414.57 897.04 418.29 913.5 427.28C916.43 428.88 922.6 432.55 925.45 434.39C927.11 435.46 929.85 437.14 938.49 442.39C941.02 443.93 942.37 444.62 942.49 444.43C942.58 444.27 942.8 442.15 942.97 439.72C944.08 423.97 947.54 414.97 955.39 407.45C958.51 404.45 959.89 403.45 964.34 400.94C972.56 396.31 977.95 395.32 986.8 396.84C994.43 398.14 1001.81 402.09 1008.11 408.23C1012.73 412.73 1015.58 418.01 1016.57 423.9C1018.17 433.36 1018.84 470.97 1018.83 549.72C1018.82 608.48 1018.62 619.38 1017.21 636.1C1015.62 655.1 1012.44 670.92 1006.86 687.63C1005.98 690.28 1004.83 693.53 1004.3 694.86C1002.28 699.93 997.25 710.47 995.31 713.71C994.07 715.76 993.94 716 991.58 720.18C988.58 725.48 985.61 729.98 980.21 737.41C975.93 743.29 971.84 748.34 965.81 755.16C962.41 759.01 951.83 769.67 948.11 772.99C945.73 775.12 945.02 775.74 940.77 779.37C938.23 781.53 935.54 783.69 933.3 785.36C932.27 786.12 930.18 787.7 928.66 788.86C926.27 790.68 922.94 793.06 921.63 793.89C921.42 794.03 920.06 794.92 918.61 795.87C915.43 797.98 910.14 801.19 907.77 802.47C905.32 803.8 903.68 804.72 902.67 805.34C901.68 805.96 893.12 810.2 892.87 810.2C892.71 810.2 890.97 810.98 887.48 812.63C883.76 814.38 882.72 814.78 874.78 817.56C870.55 819.04 861.76 821.74 858.72 822.5C856.47 823.06 843.48 825.63 841.04 826C830.98 827.51 826.49 827.98 818.75 828.37C808.92 828.86 802.51 828.93 794.47 828.65C781.63 828.19 773.65 827.39 763.34 825.51C751.53 823.35 748.63 822.64 738.17 819.29C726.11 815.44 721.36 813.59 711.05 808.69C707.58 807.05 695.94 800.67 693.05 798.83C692.33 798.38 691.68 798 691.61 798C691.54 798 691.17 797.79 690.8 797.52C690.43 797.26 688.39 795.9 686.27 794.5C684.14 793.1 681.51 791.29 680.42 790.49C679.32 789.68 677.09 788.06 675.46 786.88C665.13 779.43 650.22 766.08 641.56 756.53C641.14 756.07 640.44 755.3 640 754.82C639.57 754.34 638.51 753.13 637.66 752.13C636.81 751.13 635.42 749.58 634.58 748.69C631.81 745.76 629.11 742.62 627.9 740.91C627.24 739.99 626.56 739.23 626.37 739.23C626.19 739.23 625.5 739.87 624.84 740.66C624.18 741.45 623.58 742.15 623.51 742.22C623.44 742.29 621.93 744.18 620.15 746.43C615.73 752.01 611.65 756.61 605.86 762.52C601.61 766.86 593.04 774.89 589.65 777.71C588.16 778.94 586.08 780.71 584.68 781.94C583.43 783.03 575.84 788.81 572.63 791.11C570.7 792.5 562.91 797.73 562.38 798C562.24 798.07 561.46 798.56 560.65 799.08C559.84 799.61 557.6 800.93 555.67 802.01C553.74 803.1 552 804.09 551.79 804.22C549.51 805.66 543.52 808.73 539.72 810.4C538.48 810.95 536.36 811.92 534.99 812.56C530.53 814.66 526.58 816.16 516.93 819.41C513.99 820.41 511.4 821.31 511.18 821.43C509.64 822.23 495.57 825.28 485.55 826.99C473.72 829 469.17 829.37 453.56 829.54C437.86 829.72 428.6 829.2 417.57 827.52C412.73 826.78 396.35 823.36 391.67 822.12C387.83 821.09 378.14 817.88 372.62 815.8C358.36 810.43 343.03 802.83 329.42 794.39C327.84 793.41 324.14 791.12 321.2 789.29C318.25 787.47 314.87 785.36 313.68 784.62C312.43 783.83 311.39 783.34 311.22 783.44C311.01 783.57 310.97 784.16 311.07 785.42C311.5 790.44 310.16 797.62 307.39 805.17C306.22 808.36 303.61 812.93 301.72 815.08C300.33 816.68 293.98 822.22 292.17 823.43C288.45 825.92 283.41 828.05 278.62 829.16C276.56 829.64 269.88 829.99 268.03 829.73ZM810.9 750.44C821.01 750 828.84 748.81 839.67 746.08C847.8 744.02 850.86 742.94 860.24 738.78C866.27 736.11 867.33 735.56 871.54 732.96C879.16 728.25 878.55 728.68 886.48 722.65C888.06 721.45 890.02 719.91 890.84 719.23C893.15 717.33 899.2 711.75 900.44 710.39C901.05 709.72 902.78 707.9 904.29 706.34C907.17 703.35 912.39 697.08 915.16 693.28C920.02 686.6 923.39 681.1 926.8 674.25C930.85 666.14 931.51 664.48 934.63 654.77C938.39 643.09 939.31 638.74 940.66 626.17C941.2 621.18 941.4 608.65 941.04 603.1C940.25 591.15 937.64 579.35 932.75 565.66C930.7 559.92 925.38 548.77 922.05 543.25C919.01 538.2 916.27 533.96 914.88 532.17C914.14 531.21 912.8 529.47 911.91 528.31C903.16 516.93 891.59 506.13 880.08 498.59C871.87 493.21 861.97 487.95 854.73 485.1C838.58 478.75 817.36 475.07 799.95 475.6C784.25 476.07 765.56 479.95 751.76 485.6C741.28 489.89 738.47 491.26 732.37 495.07C732.15 495.2 731.4 495.65 730.72 496.05C728.08 497.6 723.15 500.93 721.13 502.53C712.45 509.37 708.55 512.9 702.52 519.37C685.96 537.14 676.37 554.86 670.25 578.98C669.15 583.3 667.76 589.98 667.48 592.31C667.4 592.92 667.12 595 666.86 596.91C666.03 602.91 665.76 607.15 665.77 614.1C665.78 621.57 666.05 625.58 666.99 632.4C669.06 647.38 674.61 664.97 680.97 676.73C684.86 683.9 694.07 697.6 698.28 702.45C704.69 709.84 708.63 713.81 715.15 719.47C726.13 728.99 738.01 736.12 751.24 741.14C762.7 745.49 768.88 747.08 781.01 748.8C788.18 749.82 791.98 750.19 797.95 750.43C804.53 750.69 805.18 750.69 810.9 750.44ZM463.14 748.09C471.68 747.13 482.71 744.95 488.67 743.06C491.15 742.27 504.15 737.33 506.86 736.14C508.8 735.3 511.05 734.08 516.81 730.78C520.77 728.51 522.22 727.56 527.64 723.69C532.23 720.41 534.67 718.56 535.23 717.95C535.37 717.8 537.28 716.1 539.47 714.16C544 710.16 545.61 708.54 550.41 703.14C554.77 698.24 556.08 696.62 559.39 692.04C568.32 679.71 573.31 669.7 578.69 653.32C579.88 649.72 580.96 645.22 581.91 639.99C585.61 619.5 585.83 604.63 582.7 586.08C581.57 579.39 579.95 573.39 577.27 566.03C574.25 557.74 572.13 552.9 569.39 548.04C568.79 546.98 567.77 545.1 567.11 543.87C565.99 541.76 564.2 538.97 561.05 534.41C558.21 530.29 556.06 527.62 550.52 521.32C543.26 513.06 532.12 503.44 523.53 498.01C512.37 490.96 500.29 485.5 488.08 482.01C481.03 479.99 472.12 478.28 463.14 477.22C456.22 476.4 443.84 476.4 436.01 477.21C424.51 478.41 415.91 480.22 406.01 483.5C395.02 487.15 383.81 492.63 373.25 499.53C365.27 504.75 355.79 512.73 349.7 519.35C344.06 525.48 340.25 530.27 335.95 536.65C331.5 543.25 331.03 544.03 328.41 549.23C321.01 563.91 316.62 578.63 314.37 596.29C312.27 612.76 313.47 630.72 317.85 648.09C318.77 651.74 321.49 659.82 323.78 665.68C328.69 678.24 337.31 692.27 346.8 703.17C349.54 706.32 356.87 713.47 360.8 716.83C369.03 723.87 374.99 727.95 384.35 732.97C390.48 736.26 396.83 738.89 406.12 741.99C416.66 745.51 424.3 747.03 439.11 748.54C441.77 748.81 459.71 748.47 463.14 748.09Z" />
        </svg>
      </span>

      <!-- THE DRAWING. A container query context: both courses size themselves
           from THIS box's inline width, so they are flush to each other and to
           the measure without measuring anything at runtime. -->
      <div class="stmt__elevation">
        <p class="stmt__course stmt__course--drawn">
          <span class="stmt__wordmark">{{ WORD_1 }}</span>
        </p>

        <p class="stmt__course stmt__course--solid">
          <!-- The film used to be seen only through these letterforms; it is
               the whole band now, so the word is simply set in it. -->
          <span class="stmt__wordmark">{{ WORD_2 }}</span>
        </p>
      </div>

      <!-- The title block: the sheet's own register strip, along the bottom. -->
      <div class="stmt__block">
        <h1 class="stmt__title">
          <span v-if="titleAccent" class="stmt__hl">{{ titleAccent }}</span>{{ titleRest }}
        </h1>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* PINNED light: the page root flips with the ground switch and this section's
   inks are the paper world's. `overflow: clip` is load-bearing, not tidiness:
   the courses are sized so the REAL face spans the measure exactly, and for
   the instant before the webfont swaps, the metric-matched fallback's wider
   advances would push the ink past the frame. */
.stmt {
  position: relative;
  overflow: clip;
  /* THE GROUND UNDER THE FILM, and it has to be a real one: it is what a
     visitor sees for the moment before the poster decodes, and what fills any
     part of the band `cover` cannot reach. The film runs untreated and this
     footage is paper-toned, so the ground is the page's own second paper —
     a light band that goes on being a light band if the film never arrives. */
  background: var(--list-2);
  padding: var(--hero-inset);
}

/* --- the film ---------------------------------------------------------------
   Edge to edge under everything. `cover` has two very different jobs here: a
   phone hero is roughly 0.55:1 against the clip's 0.60:1, so it shows very
   nearly the whole frame, while a desktop hero is about 2.4:1 and takes a
   horizontal band out of the middle. The encode is the full frame precisely so
   both have material to take (scripts/build-pillar-videos.mjs, BANDS.hero-fill).

   NO TREATMENT AT ALL, on the owner's call: the film runs at its own
   brightness and its own colour. What that costs is recorded on .stmt__wordmark
   — this footage carries both near-white wall and a near-black block in the
   same frame, so no single ink can clear AA against every part of it, and the
   type is set for the wall because that is what most of the band is. */
.stmt__film {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  pointer-events: none;
}

/* --- the sheet --------------------------------------------------------------
   The frame is inset by exactly --hero-inset, which is what puts its top-left
   corner where the veil lands the mark. */
.stmt__snow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.stmt__sheet {
  position: relative;
  /* Above the film and its tint. */
  z-index: 1;
  display: flex;
  flex-direction: column;
  /* NO FRAME. The sheet was drawn as a ruled rectangle with crop marks at its
     corners and a rule under the claim — drafting furniture that made sense
     when the band was paper. Over the film it was three kinds of line competing
     with the one line that means something, and it is all gone on the owner's
     call. What is left draws itself: the mark, the two courses, the red cut,
     the claim. The sheet is now a measure and a padding, not a box.

     The padding stays: it is what holds the ink off the band's edges, and the
     stamp's clearance term is what the veil's landing formula reads. */
  padding: calc(0.55 * var(--hero-display) + var(--space-4)) var(--space-4) var(--space-4);
  /* Short of the fold ON PURPOSE (phones): the work below has to show through,
     so the hero ends where the next thing begins. Desktop takes the full
     screen below. */
  min-height: 72svh;
}

/* The stamp sits ON the corner: its own patch of paper punches the frame's
   two lines, so the mark reads as part of the sheet's furniture rather than as
   an object fenced above it. The padding extends the paper past the ink on the
   inside edges only — the ink's top-left stays exactly on the corner, which is
   the veil's landing formula. */
.stmt__stamp {
  /* The sheet's top-LEFT corner, which is where a phone keeps it. Desktop moves
     it across to the right — see the block at the end. */
  position: absolute;
  /* Flush with the corner, full stop. It used to be pulled out by the frame's
     own border width, because an absolute box resolves against the PADDING box
     and the veil lands on --hero-inset — the frame's OUTER corner. With the
     frame gone the padding box IS that corner, so the compensation goes with
     it or the mark sits 1px outside the formula the veil copies. */
  left: 0;
  top: 0;
  padding: 0 var(--space-3) var(--space-3) 0;
  /* NO PATCH ON THE FILM. Punching the frame with a rectangle of the band's
     own fill was right while the band was flat paper; over a moving image any
     solid rectangle reads as exactly the patch that comment warned about. The
     frame's two lines run under the mark instead — which is what a stamp on a
     real sheet does anyway. */
  background: transparent;
}

.stmt__mark {
  display: block;
  height: 0.55em;
  width: auto;
  font-size: var(--hero-display);
}

/* --- the drawing ------------------------------------------------------------
   `--mon-span` is the width both courses span; each divides it by its own
   measured em-width (see the header), so both land on exactly that width. cqw,
   not vw: the container's inline size already excludes the scrollbar, the
   section's inset and the sheet's own padding, so the ink lands inside the
   frame by construction rather than by subtraction.

   THE CAP HAS TWO JOBS AND SO IT HAS TWO TERMS. 16rem stops the type growing
   without bound on very wide screens. The svh term is the one that keeps the
   CLAIM ABOVE THE FOLD: the sheet is the viewport's height minus its fixed
   costs, and the drawing is the only part of it that scales, so on a short
   screen the courses are what push the title block past the bottom edge —
   measured at 1440×760, the claim's last line sat 6px below the fold. Tying
   the cap to viewport height makes the drawing give way instead of the claim.
   22svh was chosen against measurement, not taste: 25 still left the claim
   6px under the fold at 1280×650, which is the short-laptop case the report
   came from. At 22 the term is inert above ~970px of viewport height (the
   width term wins there, so a tall screen is unchanged) and the claim clears
   the fold with room at 650, 700 and 760. Both caps carry the same
   4.4502 : 4.125 relation, so capping — by either term — never breaks the
   flush. */
.stmt__elevation {
  position: relative;
  container-type: inline-size;
  --mon-span: 100cqw;
  --mon-cap: min(16rem, 22svh);
  /* The ONE flexible margin on the sheet: all free space collects above, so
     the drawing and its claim stand together at the foot (the title block's
     margin is a fixed step — see .stmt__block). */
  margin-top: auto;
  padding-block: clamp(1rem, 2vw, 2rem);
}

.stmt__course {
  margin: 0;
  font-family: var(--font-sans);
  /* 700, not 400: both courses are now FILLED — one with a drafting hatch, the
     other with a moving image — and a 400 letterform is too thin a window for
     either to read inside it. The weight is what makes the fills legible, so
     it is not a style preference but a requirement of the treatment. */
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--grafit);
  /* The 0.8 line-height crops the caps' own box; a hair of leading keeps the
     cut off the letterforms. */
  padding-block: 0.04em;
}

/* »SPLETNA« — 4.4502em wide in the real face (measured at weight 700; it was
   4.218 at 400, and the constants MUST be re-measured whenever the weight or
   the tracking moves, or the two courses stop being flush). */
.stmt__course--drawn {
  font-size: min(calc(var(--mon-span) / 4.4502), var(--mon-cap));
}

/* »POVSOD« — 4.13em at the same weight. The cap carries the same ratio
   (16rem × 4.4502 / 4.13 = 17.24rem) so capping never breaks the flush. */
.stmt__course--solid {
  position: relative;
  font-size: min(calc(var(--mon-span) / 4.125), calc(var(--mon-cap) * 1.0788));
  color: var(--grafit);
}

/* THE COURSES ARE FLAT INK, on the owner's call. They carried the press
   screen clipped into the letterforms — the page's own pressed stock showing
   through the glyphs — and that device is cancelled here: one uniform colour,
   no texture, which also retires the background-clip:text guard that existed
   only to carry it.

   WHICH ink is decided by the footage, not by the palette. The film is
   untreated and it is a paper-toned wall for most of its frame, so the type is
   the page's own graphite and reads as ink on that wall. Where the clip's
   graphite block passes behind a letter the two are near enough the same value
   that the letter stops reading — measured on the built page below. That is the
   cost of running the film untreated and it is stated rather than hidden. */

.stmt__wordmark {
  display: inline-block;
  /* The window is positioned against this box, so the clip path's user space
     and the glyphs it cuts share one origin. */
  position: relative;
}

/* --- the title block --------------------------------------------------------
   The sheet's register strip: a ruled band along the bottom edge, spanning the
   frame's full inner width, carrying the claim. */
.stmt__block {
  /* A deliberate step, not a flexible one (owner's call): the drawing stands
     close over its claim at every width, and the sheet's free space pools
     above the pair. This used to be `auto`, splitting the void with the
     elevation's auto and floating the drawing mid-band — phones dropped that
     first, and the owner then asked the title down to the claim everywhere. */
  margin-top: var(--space-6);
  margin-inline: calc(var(--space-4) * -1);
  padding: var(--space-4) var(--space-4) 0;
}

.stmt__title {
  /* One notch under the original clamp(1.5rem, 1.05rem + 1.1vw, 2rem) —
     "scale down the subtitle just a bit" (owner), ~10% across the range. */
  font-size: clamp(1.35rem, 0.95rem + 1vw, 1.8rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--grafit);
  max-width: 26ch;
}

.stmt__hl {
  /* Display-adjacent size (24px+), so the 3:1 floor applies. */
  color: var(--rez);
}

/* --- desktop ---------------------------------------------------------------
   The sheet takes the whole first screen (less the masthead's in-flow strip),
   the courses stop short of the frame's right edge, and the leftover column is
   the composition's void — marked by the construction line where the type
   ends.

   78%, and the number is arithmetic rather than taste: at 1440×900 the sheet
   has 713px to work in, and everything that is NOT the two courses (the mark's
   clearance, the cut's gaps, the drawing's padding, the title block, the
   sheet's own frame padding) costs ~290px of it. That leaves ~420px for the
   pair, which is a 228px first course — and 78cqw lands there. Re-derive if
   any of those fixed costs change. */
/* A PHONE HAS NO HEADER OVER THE HERO — owner's call, and the film is the
   reason: a bar across the top cut the band off from the screen's edge, and the
   whole point of the film is that it runs to it. So the chrome up here is the
   menu control alone, floating on the sheet (SiteMasthead), and the brand stays
   where it was, stamped on the sheet's own top-left corner.

   That gives BOTH top corners to marks — the stamp on the left, the control
   mirroring it on the right — so both crop marks stand down there. The one
   under the control would overlap it (the mark spans 24px down from the corner
   and the glyph's ink sits 29.6–45.6px down), and the one under the stamp has
   the stamp on it. Desktop keeps its top-left mark and gives only the right
   corner away, because there the stamp has crossed the sheet. */
@media (max-width: 899.98px) {
  /* HALF THE AIR, restored (owner's call, second reversal — seen on a phone,
     the 72% band read too tall and the previous proportions came back). The
     sheet's fixed costs plus half the free space land it at 56svh; the 72svh
     reference-ratio experiment lived here for one round and is in the history
     if it is ever wanted again. */
  .stmt__sheet {
    min-height: 56svh;
  }

  /* THE DRAWING DROPS TO THE CLAIM (owner's call — phones first, the base
     followed with a wider step, and the owner then asked the phone TIGHTER
     still). The gap between the glyphs and the claim is three stacked
     spacings, and all three shrink here: the flexible step goes to zero, and
     the two paddings either side of the boundary drop to space-2 — measured
     40px of visual gap at 375 before this pass, ~16px after. The film keeps
     the void above, which is the right thing for a band that IS the film. */
  .stmt__block {
    margin-top: 0;
    padding-top: var(--space-2);
  }

  /* SPLETNA STEPS BACK A SIZE, restored with the rest of the previous
     proportions (the flush full-measure pair lived one round and was reversed
     with the 72% hero). The upper course takes 0.85 of the span and stops
     short from the shared left edge, the void opening on its right — the
     composition the desktop band also uses. 1 restores the flush exactly. */
  .stmt__elevation {
    --drawn-share: 0.85;
    /* The second of the three spacings between the glyphs and the claim (the
       other two live on .stmt__block above) — the base clamp resolves to 16px
       here, and the owner asked the pair tighter. */
    padding-block-end: var(--space-2);
  }

  .stmt__course--drawn {
    font-size: min(
      calc(var(--mon-span) * var(--drawn-share) / 4.4502),
      calc(var(--mon-cap) * var(--drawn-share))
    );
  }

  /* No phone size of its own any more: the 18px "between" step was reversed
     with the rest — the base clamp's floor (21.6px at phone widths) is the
     previous proportion the owner asked back. */
}

/* THE MARK STANDS AT THE SHEET'S TOP-RIGHT on desktop, not its top-left. The
   two courses are left-aligned and stop well short of the frame, so the right
   of the sheet is the composition's void; the mark fills it, and the corner it
   takes is the one corner the drawing never reaches. The crop mark that stood
   there steps aside for it, exactly as the top-left one used to.

   IT IS STILL A CORNER, and that is what keeps the intro veil expressible: both
   of its coordinates are insets from a viewport edge, so index.html can copy
   them as a formula (left = 100% − inset − the mark's own width, which is
   1019.76/654.28 = 1.5586 of its height). A position hung off the drawing's own centre would
   not be — change this and the veil's desktop landing changes with it. */
@media (min-width: 900px) {
  .stmt__stamp {
    left: auto;
    right: calc(var(--divider-width) * -1);
    padding: 0 0 var(--space-3) var(--space-3);
  }

}

@media (min-width: 1200px) {
  /* THE BAND STOPS SHORT OF THE FOLD. It used to end exactly on it — sheet +
     the section's two insets + the masthead's 45px strip summed to 100svh — so
     the band's own bottom edge was the last thing on the screen and the rule
     that opens the next section sat just under it, invisible until you
     scrolled. --hero-reveal is what it gives back: the height comes off the
     sheet, so the section ends that much higher and the next section's top
     shows as a band of what follows. It is the ONE number to turn if the hero
     should breathe more or less; nothing else is derived from it. */
  .stmt__sheet {
    --hero-reveal: 5rem;
    /* THE PAIR SITS 1.5cm HIGHER (owner's call: "preveč dol"). The drawing and
       its claim are bottom-anchored — .stmt__elevation holds the only
       margin-top:auto — and at this width the sheet is content-bound, so that
       auto resolves to zero and the pair's position is simply the top padding.
       --hero-lift is therefore taken OFF the top and given BACK to the bottom:
       the sheet's own height is unchanged, so the band still ends where
       --hero-reveal put it, and only the contents ride up.

       The top padding could afford it because it was clearance for a top-LEFT
       stamp. The mark stands top-right now, clear of the left-aligned courses,
       so the figure it was sized from stopped being the constraint. 3.5rem is
       56px, i.e. 1.5cm at 96dpi, and it is measured rather than assumed: the
       courses' own top moves by exactly that. */
    --hero-lift: 3.5rem;
    min-height: calc(100svh - 45px - 2 * var(--hero-inset) - var(--hero-reveal));
    padding: calc(0.55 * var(--hero-display) + var(--space-6) - var(--hero-lift))
      var(--space-8) calc(var(--space-8) + var(--hero-lift));
  }

  .stmt__elevation {
    --mon-span: 78cqw;
    padding-block: var(--space-4);
  }

  .stmt__block {
    margin-inline: calc(var(--space-8) * -1);
    padding: var(--space-6) var(--space-8) 0;
  }

  /* 30ch keeps the claim in two lines, which is what lets the sheet finish
     above the fold (measured). */
  .stmt__title {
    max-width: 30ch;
  }
}
</style>
