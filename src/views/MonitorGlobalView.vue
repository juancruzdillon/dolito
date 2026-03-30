<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight" :style="{ color: 'var(--text)' }">Monitor Global</h1>
        <p class="text-sm mt-0.5" :style="{ color: 'var(--text-3)' }">Principales indicadores del mercado mundial en tiempo real.</p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="lastUpdatedStr" class="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border" :style="{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
          {{ lastUpdatedStr }}
        </span>
        <button
          @click="reload"
          class="p-2 rounded-xl transition-colors"
          :style="{ color: 'var(--text-2)', background: 'var(--surface-2)' }"
          :class="{ 'opacity-40 pointer-events-none': store.loading }"
          title="Actualizar"
        >
          <RefreshCw :size="15" :class="{ 'animate-spin': store.loading }" />
        </button>
      </div>
    </div>

    <!-- Skeleton loading -->
    <div v-if="store.loading && !hasData" class="space-y-4">
      <div v-for="n in 7" :key="n" class="rounded-2xl border p-4 space-y-3 animate-pulse" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
        <div class="h-3 w-20 rounded-full" :style="{ background: 'var(--surface-2)' }"></div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="m in 3" :key="m" class="h-16 rounded-xl" :style="{ background: 'var(--surface-2)' }"></div>
        </div>
      </div>
    </div>

    <!-- Error / sin datos -->
    <div v-else-if="!hasData" class="rounded-2xl border p-8 text-center" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
      <AlertCircle :size="32" class="mx-auto mb-3 text-red-400" />
      <p class="font-semibold" :style="{ color: 'var(--text)' }">No se pudo cargar el mercado global</p>
      <p class="text-sm mt-1 mb-4" :style="{ color: 'var(--text-3)' }">{{ store.error || 'No se recibieron datos. Intentá de nuevo.' }}</p>
      <button @click="reload" class="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
        Reintentar
      </button>
    </div>

    <!-- Market data -->
    <template v-else-if="hasData">
      <!-- Categories -->
      <section
        v-for="cat in CATEGORIES"
        :key="cat.id"
        class="rounded-2xl border overflow-hidden"
        :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
      >
        <div class="px-4 pt-3 pb-2">
          <span class="text-[10px] font-bold tracking-widest uppercase" :style="{ color: 'var(--text-3)' }">
            {{ cat.label }}
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" :style="{ borderColor: 'var(--border)' }" style="border-top: 1px solid var(--border)">
          <div
            v-for="item in cat.items"
            :key="item.symbol"
            class="p-4 flex items-center gap-3"
          >
            <!-- Prefix badge -->
            <div v-if="item.prefix" class="text-[9px] font-black leading-none px-1.5 py-1 rounded-md flex-shrink-0" :style="{ background: 'var(--surface-2)', color: 'var(--text-3)' }">
              {{ item.prefix }}
            </div>

            <!-- Data -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium truncate" :style="{ color: 'var(--text-3)' }">{{ item.nombre }}</p>
              <p class="text-lg font-bold tabular-nums leading-tight" :style="{ color: 'var(--text)' }">
                {{ formatPrice(store.quotes[item.symbol], item) }}
              </p>
            </div>

            <!-- Change -->
            <div class="text-right flex-shrink-0">
              <div
                class="text-sm font-semibold tabular-nums"
                :class="changeColor(store.quotes[item.symbol]?.regularMarketChangePercent)"
              >
                {{ formatChange(store.quotes[item.symbol]?.regularMarketChangePercent) }}
              </div>
              <div class="flex justify-end mt-1">
                <span
                  class="w-2 h-2 rounded-full"
                  :class="dotColor(store.quotes[item.symbol]?.regularMarketChangePercent)"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOT: stocks con mayor movimiento -->
      <section v-if="store.hotStocks.length">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">HOT</span>
          <span class="text-sm font-medium" :style="{ color: 'var(--text-3)' }">US stocks con mayor movimiento</span>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          <div
            v-for="(stock, i) in store.hotStocks"
            :key="stock.symbol"
            class="flex-shrink-0 snap-start rounded-2xl border p-4 w-44 sm:w-48"
            :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
          >
            <div class="flex items-start justify-between mb-3">
              <span class="text-xs font-black" :style="{ color: 'var(--text-3)' }">{{ i + 1 }}</span>
              <div
                class="text-xs font-bold tabular-nums"
                :class="changeColor(stock.regularMarketChangePercent)"
              >
                {{ formatChange(stock.regularMarketChangePercent) }}
              </div>
            </div>
            <p class="font-black text-base leading-none mb-1" :style="{ color: 'var(--text)' }">{{ stock.symbol }}</p>
            <p class="text-[10px] truncate mb-2" :style="{ color: 'var(--text-3)' }">{{ stock.longName || stock.shortName }}</p>
            <p class="font-bold tabular-nums" :style="{ color: 'var(--text)' }">
              ${{ stock.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
          </div>
        </div>
      </section>
    </template>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useGlobalStore, CATEGORIES } from '@/stores/global.js'

const store = useGlobalStore()

const hasData = computed(() => Object.keys(store.quotes).length > 0)

const lastUpdatedStr = computed(() => {
  if (!store.lastUpdated) return null
  return store.lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
})

function reload() {
  localStorage.removeItem('dolito_global_v1')
  store.fetchData()
}

// ── Formatting helpers ──────────────────────────────────────────────────────

function formatPrice(quote, item) {
  const price = quote?.regularMarketPrice
  if (price == null) return '—'

  if (item.isTasa) return price.toFixed(3) + '%'
  if (item.smallPrice) return price.toFixed(3)

  const sym = item.symbol
  if (sym === 'EURUSD=X') return price.toFixed(4)
  if (sym.endsWith('=X'))  return price.toFixed(4)

  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
  }
  return price.toFixed(2)
}

function formatChange(pct) {
  if (pct == null) return '—'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function changeColor(pct) {
  if (pct == null) return 'text-slate-400'
  return pct >= 0 ? 'text-emerald-500' : 'text-red-500'
}

function dotColor(pct) {
  if (pct == null) return 'bg-slate-400'
  return pct >= 0 ? 'bg-emerald-500' : 'bg-red-500'
}

onMounted(() => store.fetchData())
</script>
