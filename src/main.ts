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
)
