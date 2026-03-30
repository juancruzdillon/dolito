<template>
  <div class="card p-5 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 sm:mb-6">
      <div>
        <h2 class="text-lg sm:text-xl font-bold" :style="{ color: 'var(--text)' }">MEP real por broker</h2>
        <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">
          Precio final con impuestos y comisiones (la que te llega a tu banco)
        </p>
      </div>
      <div
        class="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 border self-start flex-shrink-0"
        :class="brokersStore.configSource === 'fallback'
          ? 'border-amber-500/30'
          : 'border-brand-500/30'"
        :style="brokersStore.configSource === 'fallback'
          ? 'background: var(--amber-bg); color: var(--amber);'
          : 'background: var(--brand-bg); color: var(--brand-text, var(--brand));'"
      >
        <AlertTriangle v-if="brokersStore.configSource === 'fallback'" :size="12" class="flex-shrink-0" />
        <CheckCircle   v-else :size="12" class="flex-shrink-0" />
        <span class="font-medium">{{ brokersStore.sourceLabel }}</span>
      </div>
    </div>

    <!-- Inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">
          Pesos a convertir
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" :style="{ color: 'var(--text-3)' }">$</span>
          <input v-model.number="amountARS" type="number" class="input-field pl-7" min="1000" placeholder="100000" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--text-2)' }">
          MEP mercado (venta)
        </label>
        <div class="relative">
          <input
            :value="marketRate ? marketRate.toFixed(2) : ''"
            readonly
            class="input-field pr-14"
            placeholder="Cargando..."
            :style="{ background: 'var(--surface-2)', cursor: 'not-allowed' }"
          />
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wide" style="color: var(--brand);">AUTO</span>
        </div>
      </div>
    </div>

    <!-- Cards de brokers -->
    <div v-if="results.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <div
        v-for="(r, idx) in results"
        :key="r.broker.id"
        class="relative rounded-2xl border p-4 transition-all"
        :style="idx === 0
          ? 'background: var(--green-bg); border-color: rgba(52,211,153,.35);'
          : 'background: var(--surface-2); border-color: var(--border);'"
      >
        <!-- Badge mejor -->
        <div
          v-if="idx === 0"
          class="absolute -top-2.5 left-4 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wide"
          style="background: var(--green); color: #fff;"
        >
          MEJOR
        </div>

        <!-- Nombre broker -->
        <div class="flex items-center gap-2 mb-3 mt-1">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border"
            :style="{ backgroundColor: r.broker.logo ? '#fff' : r.broker.color, borderColor: 'var(--border)' }"
          >
            <img v-if="r.broker.logo" :src="getBrokerLogo(r.broker.logo)" class="w-full h-full object-contain p-1" />
            <span v-else class="text-white text-xs font-black">{{ r.broker.shortName.charAt(0) }}</span>
          </div>
          <span class="font-semibold text-sm" :style="{ color: 'var(--text)' }">{{ r.broker.shortName }}</span>
        </div>

        <!-- Datos -->
        <div class="space-y-2.5">
          <div>
            <p class="text-[10px] uppercase tracking-wide mb-0.5" :style="{ color: 'var(--text-3)' }">Tipo de cambio real</p>
            <p class="price-value text-xl font-black" :style="idx === 0 ? { color: 'var(--green)' } : { color: 'var(--text)' }">
              {{ fmt(r.effectiveRate) }}
            </p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide mb-0.5" :style="{ color: 'var(--text-3)' }">USD que recibís</p>
            <p class="price-value text-base font-bold" :style="{ color: 'var(--text-2)' }">{{ fmtUSD(r.receivedUSD) }}</p>
          </div>
          <div class="pt-2.5 border-t" :style="{ borderColor: 'var(--border)' }">
            <div class="flex justify-between text-xs mb-1">
              <span :style="{ color: 'var(--text-3)' }">Tarifa broker</span>
              <span class="font-medium" :style="{ color: 'var(--text-2)' }">{{ (r.broker.commissionBuy * 100).toFixed(2) }}%</span>
            </div>
            <div class="flex justify-between text-xs mb-1">
              <span :style="{ color: 'var(--text-3)' }">Comisión total (ARS)</span>
              <span class="font-semibold" style="color: var(--red);">−{{ fmt(r.commissionImpact) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span :style="{ color: 'var(--text-3)' }">Spread total</span>
              <span class="font-medium" :style="{ color: 'var(--text-2)' }">{{ r.spreadPct.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!marketRate" class="text-center py-10 text-sm" :style="{ color: 'var(--text-3)' }">
      Cargando cotización MEP...
    </div>

    <!-- Nota -->
    <div
      class="mt-4 p-3.5 rounded-xl border text-xs leading-relaxed"
      :style="{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-3)' }"
    >
      <strong :style="{ color: 'var(--text-2)' }">¿Por qué el precio real es mayor?</strong>
      El broker cobra comisión al comprar el bono en pesos <em>y</em> al venderlo en dólares.
      El precio que ves en pantalla no incluye estas comisiones hasta que ya operaste.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'
import { useBrokersStore } from '@/stores/brokers.js'

const dolarStore   = useDolarStore()
const brokersStore = useBrokersStore()

const amountARS  = ref(100000)
const marketRate = computed(() => dolarStore.mepRate?.venta || null)
const results    = computed(() => {
  if (!marketRate.value || !amountARS.value) return []
  return brokersStore.compareAll(marketRate.value, amountARS.value)
})

const fmt    = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n)
const fmtUSD = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const getBrokerLogo = (name) => {
  return new URL(`../../assets/images/brokers/${name}`, import.meta.url).href
}
</script>
