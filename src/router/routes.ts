import type { RouteRecordRaw } from 'vue-router'

/**
 * Routes array only — never a router instance at module scope.
 * vite-ssg owns history creation (memory history at build, web history in browser).
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'catch-all',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
