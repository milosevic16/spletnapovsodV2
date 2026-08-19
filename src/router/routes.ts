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
    path: '/nastanitve',
    name: 'nastanitve',
    component: () => import('@/views/NastanitveView.vue'),
  },
  {
    path: '/zasebnost',
    name: 'zasebnost',
    component: () => import('@/views/ZasebnostView.vue'),
  },
  {
    path: '/pogoji-splosno',
    name: 'pogoji-splosno',
    component: () => import('@/views/PogojiSplosnoView.vue'),
  },
  {
    path: '/pogoji-nastanitve',
    name: 'pogoji-nastanitve',
    component: () => import('@/views/PogojiNastanitveView.vue'),
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
