<template>
  <div
    v-if="items.length"
    class="border-b overflow-x-auto scrollbar-none"
    :style="{ background: 'var(--surface)', borderColor: 'var(--border)' }"
  >
    <div class="flex items-center justify-center h-8 px-6 gap-0">

      <template v-for="(item, i) in items" :key="item.key">
        <!-- Separador entre items -->
        <span v-if="i > 0" class="mx-4 text-xs select-none" :style="{ color: 'var(--border-2)' }">|</span>

        <div class="flex items-center gap-1.5 flex-shrink-0 text-xs">
          <span class="font-medium uppercase tracking-wider text-[10px]" :style="{ color: 'var(--text-3)' }">{{ item.label }}</span>
          <span class="font-mono font-bold" :style="{ color: 'var(--text)' }">{{ fmt(item.venta) }}</span>
        </div>
      </template>

      <!-- Brecha blue -->
      <template v-if="brechaBlue">
        <span class="mx-4 text-xs select-none" :style="{ color: 'var(--border-2)' }">|</span>
        <div class="flex items-center gap-1.5 flex-shrink-0 text-xs">
          <span class="font-medium uppercase tracking-wider text-[10px]" :style="{ color: 'var(--text-3)' }">Brecha</span>
          <span class="font-mono font-bold" :style="{ color: Number(brechaBlue) > 30 ? 'var(--amber)' : 'var(--green)' }">{{ brechaBlue }}%</span>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDolarStore } from '@/stores/dolar.js'

const store = useDolarStore()

const SHOWN = [
  { key: 'oficial',         label: 'Oficial' },
  { key: 'blue',            label: 'Blue' },
  { key: 'bolsa',           label: 'MEP' },
  { key: 'contadoconliqui', label: 'CCL' },
  { key: 'tarjeta',         label: 'Tarjeta' },
  { key: 'cripto',          label: 'Cripto' },
]

const items = computed(() =>
  SHOWN
    .map(({ key, label }) => {
      const r = store.rateMap[key]
      if (!r?.venta) return null
      return { key, label, venta: r.venta, variacion: null }
    })
    .filter(Boolean)
)

const brechaBlue = computed(() => store.brechaBlue)

function fmt(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
