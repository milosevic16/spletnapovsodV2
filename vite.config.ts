import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FontaineTransform } from 'fontaine'
import 'vite-ssg' // type augmentation for ssgOptions

// The veil's IZRIS build-date stamp lives in scripts/postbuild.mjs — a
// transformIndexHtml hook here does NOT survive into vite-ssg's rendered
// route files (verified: dist shipped the raw token). Postbuild also blocks
// the build if any token remains.

export default defineConfig({
  // The preview port comes from the harness's PORT env when assigned (parallel
  // sessions each get their own), falling back to the historical fixed port.
  preview: {
    port: Number(process.env.PORT) || 4272,
    strictPort: true,
  },
  plugins: [
    vue(),
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
