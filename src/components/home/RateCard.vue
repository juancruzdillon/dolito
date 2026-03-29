<template>
  <div
    class="card-hover p-4 sm:p-5 flex flex-col gap-3 cursor-default"
    :class="isBest ? 'ring-2 ring-brand-500/40' : ''"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="font-semibold text-sm leading-tight" :style="{ color: 'var(--text)' }">
          {{ meta.label }}
        </h3>
        <p class="text-[11px] mt-0.5 leading-snug line-clamp-2" :style="{ color: 'var(--text-3)' }">
          {{ meta.description }}
        </p>
      </div>
      <span
        v-if="isBest"
        class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style="background: var(--brand-bg); color: var(--brand);"
      >
        <Star :size="9" />Mejor
      </span>
    </div>

    <!-- Precios -->
    <div class="flex items-end justify-between gap-2">
      <div class="flex gap-3 sm:gap-4 min-w-0">
        <div>
          <p class="text-[10px] uppercase tracking-wide mb-0.5" :style="{ color: 'var(--text-3)' }">Compra</p>
          <p class="price-value text-base sm:text-lg font-bold" :style="{ color: 'var(--text)' }">
            {{ rate.compra ? fmtShort(rate.compra) : '—' }}
          </p>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wide mb-0.5" :style="{ color: 'var(--text-3)' }">Venta</p>
          <p class="price-value text-base sm:text-lg font-bold" :style="{ color: 'var(--text)' }">
            {{ rate.venta ? fmtShort(rate.venta) : '—' }}
          </p>
        </div>
      </div>
      <div v-if="spread" class="text-right flex-shrink-0">
        <p class="text-[10px]" :style="{ color: 'var(--text-3)' }">Spread</p>
        <p class="text-xs font-semibold" :style="{ color: 'var(--text-2)' }">{{ spread }}%</p>
      </div>
    </div>

    <!-- Brecha vs oficial -->
    <div
      v-if="brechaVsOficial !== null"
      class="pt-2.5 border-t flex items-center justify-between"
      :style="{ borderColor: 'var(--border)' }"
    >
      <span class="text-[10px] uppercase tracking-wide" :style="{ color: 'var(--text-3)' }">
        Brecha vs oficial
      </span>
      <span
        class="text-xs font-bold px-1.5 py-0.5 rounded-md"
        :style="brechaStyle"
      >
        +{{ brechaVsOficial }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { DOLLAR_TYPES } from '@/stores/dolar.js'

const props = defineProps({
  rate:          { type: Object,  required: true },
  oficialVenta:  { type: Number,  default: null },
  isBest:        { type: Boolean, default: false },
})

const meta   = computed(() => DOLLAR_TYPES[props.rate.casa] || { label: props.rate.nombre, description: '' })

const fmtShort = n => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
}).format(n)

const spread = computed(() => {
  if (!props.rate.compra || !props.rate.venta) return null
  return (((props.rate.venta - props.rate.compra) / props.rate.compra) * 100).toFixed(1)
})

const brechaVsOficial = computed(() => {
  if (!props.oficialVenta || !props.rate.venta || props.rate.casa === 'oficial') return null
  return (((props.rate.venta - props.oficialVenta) / props.oficialVenta) * 100).toFixed(1)
})

const brechaStyle = computed(() => {
  const b = Number(brechaVsOficial.value)
  if (b > 20) return 'background: var(--amber-bg); color: var(--amber);'
  if (b < 0)  return 'background: var(--green-bg); color: var(--green);'
  return 'background: var(--surface-2); color: var(--text-2);'
})
</script>
