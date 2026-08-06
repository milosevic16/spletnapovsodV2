<script setup lang="ts">
/**
 * Prerez — the dimension-line motif. A hairline rule with square end-ticks
 * that carries one mono annotation stating a REAL fact about what it spans,
 * optionally glossed with a plain-Slovenian consequence sentence.
 *
 * Rest state (stylesheet) is the fully drawn line — the static page is
 * complete without JS. On arrival the line draws itself once (scaleX 0→1,
 * fill:'none', last keyframe equals the resting value) and the annotation
 * fades in after the line lands.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { createFx, prefersReducedMotion } from '@/lib/fx'

const props = defineProps<{
  /** Mono annotation — a real, verifiable fact. */
  annotation: string
  /** Plain-Slovenian consequence sentence (gloss rule: no measurement without it). */
  gloss?: string
  /** Render on a dark (underlay) surface. */
  onDark?: boolean
  /** Optional tick labels along the line (only for genuinely sequential content). */
  ticks?: string[]
}>()

const host = ref<HTMLElement | null>(null)
const lineEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const fx = createFx()

const DRAW_MS = 800
const FADE_MS = 250

onMounted(() => {
  if (prefersReducedMotion()) return
  if (!('IntersectionObserver' in window)) return // never hide what we can't un-hide
  const line = lineEl.value
  const text = textEl.value
  const el = host.value
  if (!line || !text || !el) return

  // Born hidden via JS inline style only (never CSS) — crawlers see the rest state.
  line.style.transform = 'scaleX(0)'
  text.style.opacity = '0'

  const settle = () => {
    line.style.transform = ''
    text.style.opacity = ''
  }

  let draw: Animation | null = null
  let fade: Animation | null = null

  const io = fx.io(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      draw = fx.anim(
        line,
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: DRAW_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' },
      )
      draw.addEventListener('finish', () => {
        line.style.transform = ''
        fade = fx.anim(text, [{ opacity: 0 }, { opacity: 1 }], {
          duration: FADE_MS,
          easing: 'ease-out',
          fill: 'none',
        })
        fade.addEventListener('finish', () => {
          text.style.opacity = ''
        })
      })
    },
    { threshold: 0.4 },
  )
  io.observe(el)

  // Safety net: a throttled/non-compositing renderer must never leave the line
  // hidden — disconnect FIRST, cancel anything in flight, then force-show.
  fx.setTimeout(() => {
    io.disconnect()
    draw?.cancel()
    fade?.cancel()
    settle()
  }, 8000)
})

onUnmounted(() => fx.dispose())
</script>

<template>
  <div ref="host" class="prerez" :class="{ 'prerez--dark': props.onDark }">
    <div class="prerez__rule">
      <span ref="lineEl" class="prerez__line" aria-hidden="true"></span>
      <span class="prerez__tick prerez__tick--start" aria-hidden="true"></span>
      <span class="prerez__tick prerez__tick--end" aria-hidden="true"></span>
      <span v-if="props.ticks" class="prerez__daymarks" aria-hidden="true">
        <span v-for="t in props.ticks" :key="t" class="prerez__daymark">{{ t }}</span>
      </span>
    </div>
    <div ref="textEl" class="prerez__text">
      <span class="annot prerez__annot">{{ props.annotation }}</span>
      <span v-if="props.gloss" class="prerez__gloss">{{ props.gloss }}</span>
    </div>
  </div>
</template>

<style scoped>
.prerez {
  --prerez-line: var(--hairline-strong);
  --prerez-mark: var(--accent);
  --prerez-annot: var(--ink-2);
  --prerez-gloss: var(--ink-2);
}
.prerez--dark {
  --prerez-line: var(--underlay-line);
  --prerez-mark: var(--accent-on-dark);
  --prerez-annot: var(--accent-on-dark);
  --prerez-gloss: var(--paper-dim);
}

.prerez__rule {
  position: relative;
  height: 6px;
}

.prerez__line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--prerez-line);
  transform-origin: left center;
}

.prerez__tick {
  position: absolute;
  top: 0;
  width: 2px;
  height: 6px;
  background: var(--prerez-mark);
}
.prerez__tick--start {
  left: 0;
}
.prerez__tick--end {
  right: 0;
}

/* Day ticks (sequential content only — e.g. PON · TOR · SRE) */
.prerez__daymarks {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  padding-inline: 18%;
}
.prerez__daymark {
  position: relative;
  top: -1.15rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--prerez-annot);
}

.prerez__text {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  align-items: baseline;
  margin-top: 0.5rem;
}

.prerez__annot {
  color: var(--prerez-annot);
  overflow-wrap: anywhere;
}

.prerez__gloss {
  font-size: 0.85rem;
  color: var(--prerez-gloss);
}
</style>
