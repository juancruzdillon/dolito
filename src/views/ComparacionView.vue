<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <div>
      <h1 class="section-title text-3xl">Comparación de cotizaciones</h1>
      <p class="section-subtitle">Analizá side-by-side los distintos tipos de cambio</p>
    </div>

    <!-- Bar chart visual comparison -->
    <div class="card p-6">
      <h2 class="font-semibold text-slate-900 mb-5">Cotizaciones de venta hoy</h2>
      <div class="space-y-3">
        <div
          v-for="rate in ratesWithData"
          :key="rate.casa"
          class="flex items-center gap-3"
        >
          <div class="w-28 text-right text-sm font-medium text-slate-600 flex-shrink-0">
            {{ DOLLAR_TYPES[rate.casa]?.label || rate.nombre }}
          </div>
          <div class="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
            <div
              class="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
              :style="{
                width: barWidth(rate.venta) + '%',
                backgroundColor: barColor(rate.casa)
              }"
            >
              <span class="text-xs font-semibold text-white price-value">{{ fmt(rate.venta) }}</span>
            </div>
          </div>
          <div class="w-20 text-right flex-shrink-0">
            <span
              v-if="store.oficialRate?.venta && rate.casa !== 'oficial'"
              class="text-xs font-semibold"
              :class="brechaColor(rate)"
            >
              +{{ brechaVsOficial(rate) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MEP broker comparison in context -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-semibold text-slate-900">Dólar MEP por broker</h2>
          <p class="text-xs text-slate-400 mt-0.5">Precio real según comisiones aplicadas</p>
        </div>
        <div class="text-sm text-slate-500">
          Mercado: <span class="font-mono font-semibold text-brand-700">{{ fmt(store.mepRate?.venta) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="result in mepResults"
          :key="result.broker.id"
          class="rounded-xl border p-4"
          :class="result === mepResults[0] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'"
        >
          <p class="text-xs font-semibold mb-1" :style="{ color: result.broker.color }">{{ result.broker.name }}</p>
          <p class="price-value text-xl font-bold text-slate-900">{{ fmt(result.effectiveRate) }}</p>
          <p class="text-xs text-slate-400 mt-1">+{{ result.spreadPct.toFixed(2) }}% spread</p>
          <p class="text-xs text-slate-500">{{ result.broker.note }}</p>
        </div>
      </div>
    </div>

    <!-- Comparación: cuántos dólares sacás con $100.000 ARS -->
    <div class="card p-6">
      <h2 class="font-semibold text-slate-900 mb-1">¿Cuántos USD obtenés con $100.000 ARS?</h2>
      <p class="text-xs text-slate-400 mb-5">Comparación directa entre todos los métodos de compra</p>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <!-- Tasas normales -->
        <div
          v-for="rate in ratesWithData"
          :key="rate.casa"
          class="rounded-xl border border-slate-200 p-4"
        >
          <p class="text-xs font-medium text-slate-500 mb-1">{{ DOLLAR_TYPES[rate.casa]?.label || rate.nombre }}</p>
          <p class="price-value text-2xl font-bold text-slate-900">
            {{ fmtUSD(100000 / rate.venta) }}
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5">USD con $100.000</p>
        </div>

        <!-- MEP por broker -->
        <div
          v-for="result in mepResults"
          :key="'mep-' + result.broker.id"
          class="rounded-xl border p-4"
          :class="result === mepResults[0] ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-slate-50'"
        >
          <p class="text-xs font-medium mb-1" :style="{ color: result.broker.color }">
            MEP · {{ result.broker.shortName }}
          </p>
          <p class="price-value text-2xl font-bold text-slate-900">
            {{ fmtUSD(result.receivedUSD) }}
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5">USD netos con $100.000</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDolarStore, DOLLAR_TYPES } from '@/stores/dolar.js'
import { useBrokersStore } from '@/stores/brokers.js'

const store   = useDolarStore()
const brokers = useBrokersStore()

const ratesWithData = computed(() =>
  store.rates.filter(r => r.venta).sort((a, b) => a.venta - b.venta)
)

const maxVenta = computed(() =>
  Math.max(...ratesWithData.value.map(r => r.venta))
)

const mepResults = computed(() => {
  if (!store.mepRate?.venta) return []
  return brokers.compareAll(store.mepRate.venta, 100000)
})

const BAR_COLORS = {
  oficial: '#3b82f6', blue: '#64748b', bolsa: '#4f46e5',
  contadoconliqui: '#7c3aed', tarjeta: '#f59e0b', mayorista: '#0d9488', cripto: '#8b5cf6'
}

const barColor  = casa => BAR_COLORS[casa] || '#94a3b8'
const barWidth  = venta => Math.max(5, (venta / maxVenta.value) * 100)

const brechaVsOficial = rate => {
  const of = store.oficialRate?.venta
  if (!of) return 0
  return (((rate.venta - of) / of) * 100).toFixed(1)
}

const brechaColor = rate => {
  const b = Number(brechaVsOficial(rate))
  if (b > 100) return 'text-red-600'
  if (b > 50) return 'text-amber-600'
  return 'text-slate-500'
}

const fmt    = n => n ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n) : '—'
const fmtUSD = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
</script>
