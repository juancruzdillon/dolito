<template>
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
import { onMounted, provide, ref } from 'vue'
import NavBar from './components/layout/NavBar.vue'
import RatesTickerBar from './components/layout/RatesTickerBar.vue'
import NewsTickerBar from './components/layout/NewsTickerBar.vue'
import FooterBar from './components/layout/FooterBar.vue'
import { useDolarStore } from './stores/dolar.js'
import { useBrokersStore } from './stores/brokers.js'

const store   = useDolarStore()
const brokers = useBrokersStore()

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
onMounted(() => {
  store.fetchRates()
  brokers.init()
})

// Auto-refresh cotizaciones cada 5 minutos
setInterval(() => store.fetchRates(true), 5 * 60 * 1000)
</script>
