import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Precio del Dólar Blue, MEP y Oficial Hoy' }
  },
  {
    path: '/historico',
    name: 'historical',
    component: () => import('../views/HistoricalView.vue'),
    meta: { title: 'Cotizaciones Históricas y Gráficos' }
  },
  {
    path: '/comparar',
    name: 'comparar',
    component: () => import('../views/ComparacionView.vue'),
    meta: { title: 'Comparar Brokers de Dólar MEP' }
  },
  {
    path: '/calculadoras',
    name: 'calculadoras',
    component: () => import('../views/CalculadorasView.vue'),
    meta: { title: 'Calculadoras Financieras' }
  },
  {
    path: '/aprender',
    name: 'aprender',
    component: () => import('../views/AprendizajeView.vue'),
    meta: { title: 'Guía para Invertir en Argentina' }
  },
  {
    path: '/hipotecarios',
    name: 'hipotecarios',
    component: () => import('../views/HipotecariosView.vue'),
    meta: { title: 'Créditos Hipotecarios UVA — Comparativa ' + new Date().getFullYear() }
  },
  {
    path: '/rendimientos',
    name: 'rendimientos',
    component: () => import('../views/RendimientosView.vue'),
    meta: { title: 'Rendimientos — Billeteras, Fondos, Bonos y Plazo Fijo' }
  },
  {
    path: '/monitor',
    name: 'monitor',
    component: () => import('../views/MonitorGlobalView.vue'),
    meta: { title: 'Monitor Global — Mercados Mundiales en Tiempo Real' }
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
