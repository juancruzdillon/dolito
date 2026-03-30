import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Inicio' }
  },
  {
    path: '/historico',
    name: 'historical',
    component: () => import('../views/HistoricalView.vue'),
    meta: { title: 'Histórico' }
  },
  {
    path: '/comparar',
    name: 'comparar',
    component: () => import('../views/ComparacionView.vue'),
    meta: { title: 'Comparar' }
  },
  {
    path: '/calculadoras',
    name: 'calculadoras',
    component: () => import('../views/CalculadorasView.vue'),
    meta: { title: 'Calculadoras' }
  },
  {
    path: '/aprender',
    name: 'aprender',
    component: () => import('../views/AprendizajeView.vue'),
    meta: { title: 'Aprender' }
  },
  {
    path: '/hipotecarios',
    name: 'hipotecarios',
    component: () => import('../views/HipotecariosView.vue'),
    meta: { title: 'Hipotecarios' }
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Dolito` : 'Dolito'
})
