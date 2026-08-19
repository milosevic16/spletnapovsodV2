import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router/routes'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) {
        // Anchor scrolls get their offset from scroll-margin-top in CSS.
        return { el: to.hash }
      }
      // Route-change resets snap — never glide (global smooth-behavior trap).
      return { top: 0, behavior: 'instant' as ScrollBehavior }
    },
  },
  () => {
    // App-level plugins/context go here (runs at build AND in browser — no DOM access).
  },
  {
    /* HYDRATE THE PRERENDERED HTML instead of re-rendering over it. vite-ssg's
       default browser mount is a plain createApp — it wipes the server DOM and
       rebuilds the whole tree at mount (measured: nodes tagged in the SSR HTML
       were gone after boot). Every CSS animation on the rebuilt nodes then
       RESTARTS on mount's clock instead of the page's — and the veil-keyed
       settles (base.css) assume they share the veil's t0, so on any
       slow-enough load the header sat hidden in its 2.63s delay while the
       parting sheet had already revealed the page (owner's report: header ~2s
       after the rest). Hydration adopts the existing nodes, so the settles
       keep their first-paint start and the choreography holds by construction.
       PROD only: the dev server has no prerendered HTML to adopt — a plain
       mount is correct there (and hydrating an empty container would just log
       a dev warning and full-mount anyway). Dev's late-born nodes are instead
       re-anchored to the veil's timeline at mount (App.vue). */
    hydration: import.meta.env.PROD,
  },
)
