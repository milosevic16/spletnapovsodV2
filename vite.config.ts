import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FontaineTransform } from 'fontaine'
import 'vite-ssg' // type augmentation for ssgOptions

export default defineConfig({
  plugins: [
    vue(),
    // Metric-matched fallback faces (size-adjust/ascent/descent) generated from
    // the real font files — the swap changes glyphs, not geometry (CLS ~0).
    FontaineTransform.vite({
      fallbacks: ['Georgia', 'Arial', 'Courier New'],
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
