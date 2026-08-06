import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FontaineTransform } from 'fontaine'
import 'vite-ssg' // type augmentation for ssgOptions

/** Stamp the veil's title block with the REAL build date (IZRIS — a drawing
 *  convention filled honestly; never a fabricated value). */
const buildDate = (): Plugin => ({
  name: 'sp-build-date',
  transformIndexHtml: (html) => html.replace('%IZRIS%', new Date().toISOString().slice(0, 10)),
})

export default defineConfig({
  plugins: [
    vue(),
    buildDate(),
    // Metric-matched fallback faces (size-adjust/ascent/descent) generated from
    // the real font files — the swap changes glyphs, not geometry (CLS ~0).
    // Order pairs with tokens.css stacks: Archivo↔Arial, Source Serif↔Georgia,
    // Chivo Mono↔Courier New.
    FontaineTransform.vite({
      fallbacks: ['Arial', 'Georgia', 'Courier New'],
      resolvePath: (id) => new URL(`./public${id}`, import.meta.url),
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssgOptions: {
    // Serial prerender: shared module state (head, refs) must never race across pages.
    concurrency: 1,
    formatting: 'minify',
    // Flat output (dist/404.html, not dist/404/index.html) so canonicals never
    // point at a host's trailing-slash redirect.
    dirStyle: 'flat',
    includedRoutes: () => ['/', '/404'],
  },
})
