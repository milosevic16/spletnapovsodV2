/**
 * Effects tracker: every rAF loop, timer, observer, listener and Web Animation
 * routes through one of these handles so dispose() on unmount tears everything
 * down — effects must never stack across SPA navigations.
 */
export interface Fx {
  raf(cb: FrameRequestCallback): number
  setTimeout(cb: () => void, ms: number): number
  io(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit): IntersectionObserver
  ro(cb: ResizeObserverCallback): ResizeObserver
  on<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    cb: (e: WindowEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ): void
  on(target: EventTarget, type: string, cb: EventListener, opts?: AddEventListenerOptions): void
  anim(el: Element, keyframes: Keyframe[], opts: KeyframeAnimationOptions): Animation
  dispose(): void
}

export function createFx(): Fx {
  const rafs = new Set<number>()
  const timers = new Set<number>()
  const observers = new Set<{ disconnect(): void }>()
  const listeners: Array<[EventTarget, string, EventListener, AddEventListenerOptions | undefined]> = []
  const anims = new Set<Animation>()

  return {
    raf(cb) {
      const id = requestAnimationFrame((t) => {
        rafs.delete(id)
        cb(t)
      })
      rafs.add(id)
      return id
    },
    setTimeout(cb, ms) {
      const id = window.setTimeout(() => {
        timers.delete(id)
        cb()
      }, ms)
      timers.add(id)
      return id
    },
    io(cb, opts) {
      const o = new IntersectionObserver(cb, opts)
      observers.add(o)
      return o
    },
    ro(cb) {
      const o = new ResizeObserver(cb)
      observers.add(o)
      return o
    },
    on(target: EventTarget, type: string, cb: EventListener, opts?: AddEventListenerOptions) {
      target.addEventListener(type, cb, opts)
      listeners.push([target, type, cb, opts])
    },
    anim(el, keyframes, opts) {
      const a = el.animate(keyframes, opts)
      anims.add(a)
      // Drop finished animations so a long session doesn't grow the set unbounded.
      const drop = () => anims.delete(a)
      a.addEventListener('finish', drop)
      a.addEventListener('cancel', drop)
      return a
    },
    dispose() {
      for (const id of rafs) cancelAnimationFrame(id)
      for (const id of timers) clearTimeout(id)
      for (const o of observers) o.disconnect()
      for (const [t, ty, cb, opts] of listeners) t.removeEventListener(ty, cb, opts)
      for (const a of anims) a.cancel()
      rafs.clear()
      timers.clear()
      observers.clear()
      listeners.length = 0
      anims.clear()
    },
  }
}

/** True when the visitor prefers reduced motion — check BEFORE creating effects. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True on devices whose primary pointer can hover (gate hover WIRING on this). */
export function canHover(): boolean {
  return window.matchMedia('(hover: hover)').matches
}
