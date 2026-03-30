<template>
  <!-- Loader global -->
  <AppLoader :show="showLoader" />

  <div class="min-h-screen flex flex-col">
    <NavBar />
    <RatesTickerBar />
    <NewsTickerBar />
    <main class="flex-1">
      <RouterView />
    </main>
    <FooterBar />
  </div>
</template>

<script setup>
import { onMounted, provide, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/layout/NavBar.vue'
import RatesTickerBar from './components/layout/RatesTickerBar.vue'
import NewsTickerBar from './components/layout/NewsTickerBar.vue'
import FooterBar from './components/layout/FooterBar.vue'
import AppLoader from './components/ui/AppLoader.vue'
import { useDolarStore } from './stores/dolar.js'
import { useBrokersStore } from './stores/brokers.js'

const store   = useDolarStore()
const brokers = useBrokersStore()
const router  = useRouter()

// ── Loader state ──────────────────────────────────────────────────────────
const initialLoading = ref(true)
const navigating     = ref(false)
const showLoader     = computed(() => initialLoading.value || navigating.value)

// Show loader during route navigation (lazy-loaded pages)
router.beforeEach(() => { navigating.value = true })
router.afterEach(() => { navigating.value = false })

// ── Dark mode ─────────────────────────────────────────────────────────────
const stored = localStorage.getItem('dolito-theme')
const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(stored === 'dark' || (!stored && sysDark))

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('dolito-theme', isDark.value ? 'dark' : 'light')
}

provide('isDark', isDark)
provide('toggleDark', toggleDark)

// ── Init ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await Promise.all([store.fetchRates(), brokers.init()])
  } finally {
    initialLoading.value = false
  }
})

// Auto-refresh cotizaciones cada 5 minutos
setInterval(() => store.fetchRates(true), 5 * 60 * 1000)
</script>
