<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div>
      <h1 class="section-title text-3xl">Histórico de precios</h1>
      <p class="section-subtitle">Evolución histórica de cada tipo de cambio en Argentina</p>
    </div>

    <PriceChart />

    <!-- Tabla de últimas cotizaciones -->
    <div class="card overflow-hidden">
      <div class="p-5 border-b border-slate-100">
        <h3 class="font-semibold text-slate-900">Cotizaciones actuales</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Compra</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Venta</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Spread</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Brecha vs oficial</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="rate in store.rates" :key="rate.casa" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-3.5 font-medium text-slate-900">
                {{ DOLLAR_TYPES[rate.casa]?.label || rate.nombre }}
              </td>
              <td class="px-5 py-3.5 text-right price-value text-slate-700">
                {{ rate.compra ? fmt(rate.compra) : '—' }}
              </td>
              <td class="px-5 py-3.5 text-right price-value font-semibold text-slate-900">
                {{ rate.venta ? fmt(rate.venta) : '—' }}
              </td>
              <td class="px-5 py-3.5 text-right text-slate-500 hidden sm:table-cell">
                {{ spread(rate) }}
              </td>
              <td class="px-5 py-3.5 text-right hidden md:table-cell">
                <span
                  v-if="brecha(rate) !== null"
                  class="text-xs font-semibold"
                  :class="Number(brecha(rate)) > 0 ? 'text-amber-600' : 'text-emerald-600'"
                >
                  {{ brecha(rate) !== null ? '+' + brecha(rate) + '%' : '—' }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDolarStore, DOLLAR_TYPES } from '@/stores/dolar.js'
import PriceChart from '@/components/historical/PriceChart.vue'

const store = useDolarStore()

const fmt = n => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 2
}).format(n)

const spread = rate => {
  if (!rate.compra || !rate.venta) return '—'
  return (((rate.venta - rate.compra) / rate.compra) * 100).toFixed(1) + '%'
}

const brecha = rate => {
  const of = store.oficialRate?.venta
  if (!of || !rate.venta || rate.casa === 'oficial') return null
  return (((rate.venta - of) / of) * 100).toFixed(1)
}
</script>
