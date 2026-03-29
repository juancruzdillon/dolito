<template>
  <div
    v-if="best"
    class="rounded-2xl p-5 sm:p-6 overflow-hidden relative"
    style="background: var(--brand); color: #fff;"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <!-- Izquierda -->
      <div class="flex items-start sm:items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background: rgba(0,0,0,.15);">
          <TrendingDown :size="20" style="color: #fff;" />
        </div>
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style="color: rgba(255,255,255,.65);">
            Mejor cotización hoy
          </p>
          <h2 class="font-bold text-lg sm:text-xl leading-tight text-white">
            {{ bestLabel }}
            <span class="font-normal text-sm sm:text-base ml-1" style="color: rgba(255,255,255,.65);">— {{ bestDesc }}</span>
          </h2>
        </div>
      </div>

      <!-- Derecha: precios -->
      <div class="flex items-center gap-5 pl-[52px] sm:pl-0 flex-shrink-0">
        <div>
          <p class="text-[10px] uppercase tracking-wide mb-0.5" style="color: rgba(255,255,255,.55);">Venta</p>
          <p class="price-value text-2xl sm:text-3xl font-black text-white">{{ fmt(best.venta) }}</p>
        </div>
        <div v-if="best.compra" class="pl-5 sm:pl-6 border-l" style="border-color: rgba(255,255,255,.2);">
          <p class="text-[10px] uppercase tracking-wide mb-0.5" style="color: rgba(255,255,255,.55);">Compra</p>
          <p class="price-value text-lg sm:text-xl font-bold" style="color: rgba(255,255,255,.85);">{{ fmt(best.compra) }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-4 pt-3 border-t flex flex-wrap items-center gap-x-5 gap-y-1" style="border-color: rgba(255,255,255,.18);">
      <div v-if="brechaBlue !== null" class="flex items-center gap-1.5 text-xs">
        <span style="color: rgba(255,255,255,.55);">Brecha blue:</span>
        <span class="font-semibold text-white">+{{ brechaBlue }}%</span>
      </div>
      <div v-if="brechaMep !== null" class="flex items-center gap-1.5 text-xs">
        <span style="color: rgba(255,255,255,.55);">Brecha MEP:</span>
        <span class="font-semibold text-white">+{{ brechaMep }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingDown } from 'lucide-vue-next'
import { useDolarStore, DOLLAR_TYPES } from '@/stores/dolar.js'

const store      = useDolarStore()
const best       = computed(() => store.bestBuyRate)
const brechaBlue = computed(() => store.brechaBlue)
const brechaMep  = computed(() => store.brechaMep)
const bestLabel  = computed(() => best.value ? (DOLLAR_TYPES[best.value.casa]?.label || best.value.nombre) : '')
const bestDesc   = computed(() => best.value ? (DOLLAR_TYPES[best.value.casa]?.description || '') : '')

const fmt = n => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 2
}).format(n)
</script>
