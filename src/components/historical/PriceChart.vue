<template>
  <div class="card p-6">
    <!-- Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="font-semibold text-slate-900">Evolución de precios</h3>
        <p class="text-xs text-slate-400 mt-0.5">Histórico · Fuente: argentinadatos.com</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="selectedType" class="select-field text-xs py-2 w-auto">
          <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <div class="flex gap-1">
          <button
            v-for="p in periods"
            :key="p.value"
            @click="selectedPeriod = p.value"
            class="tab-btn"
            :class="selectedPeriod === p.value ? 'active' : ''"
          >{{ p.label }}</button>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="loading" class="flex items-center justify-center h-56">
      <div class="w-7 h-7 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    </div>
    <div v-else-if="error" class="text-center py-12 text-sm text-slate-400">
      <p>{{ error }}</p>
    </div>
    <div v-else class="relative h-64 sm:h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Stats row -->
    <div v-if="stats" class="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
      <div v-for="s in stats" :key="s.label" class="text-center">
        <p class="text-[10px] text-slate-400 uppercase tracking-wide">{{ s.label }}</p>
        <p class="text-sm font-semibold" :class="s.color || 'text-slate-900'">{{ s.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const HISTORICAL_TYPES = [
  { value: 'blue',             label: 'Blue' },
  { value: 'oficial',          label: 'Oficial' },
  { value: 'bolsa',            label: 'MEP / Bolsa' },
  { value: 'contadoconliqui',  label: 'CCL' },
  { value: 'cripto',           label: 'Cripto' },
]

const PERIODS = [
  { value: 7,   label: '7d' },
  { value: 30,  label: '1m' },
  { value: 90,  label: '3m' },
  { value: 180, label: '6m' },
  { value: 365, label: '1a' },
]

const props = defineProps({
  initialType: { type: String, default: 'blue' }
})

const types = HISTORICAL_TYPES
const periods = PERIODS
const selectedType   = ref(props.initialType)
const selectedPeriod = ref(30)
const loading = ref(false)
const error   = ref(null)
const rawData = ref([])

const CACHE = {}

async function fetchHistory(type) {
  const key = type
  if (CACHE[key]) { rawData.value = CACHE[key]; return }

  loading.value = true
  error.value   = null
  try {
    const res = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${type}`)
    if (!res.ok) throw new Error('Sin datos')
    const data = await res.json()
    CACHE[key] = data
    rawData.value = data
  } catch {
    error.value = 'No se pudo cargar el histórico. Verificá tu conexión.'
    rawData.value = []
  } finally {
    loading.value = false
  }
}

const slicedData = computed(() => {
  if (!rawData.value.length) return []
  const cutoff = dayjs().subtract(selectedPeriod.value, 'day')
  return rawData.value
    .filter(d => dayjs(d.fecha).isAfter(cutoff))
    .slice(-selectedPeriod.value)
})

const chartData = computed(() => ({
  labels: slicedData.value.map(d => dayjs(d.fecha).format('DD/MM')),
  datasets: [
    {
      label: 'Venta',
      data: slicedData.value.map(d => d.venta),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79,70,229,0.08)',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.3,
    },
    {
      label: 'Compra',
      data: slicedData.value.map(d => d.compra),
      borderColor: '#10b981',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [4, 3],
      pointRadius: 0,
      pointHoverRadius: 3,
      fill: false,
      tension: 0.3,
    },
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12, boxHeight: 2, font: { size: 11, family: 'Inter' }, color: '#64748b'
      }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleFont: { family: 'Inter', size: 11 },
      bodyFont: { family: 'JetBrains Mono', size: 12 },
      padding: 10,
      callbacks: {
        label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, family: 'Inter' }, color: '#94a3b8',
        maxTicksLimit: 8,
      }
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: {
        font: { size: 10, family: 'JetBrains Mono' }, color: '#94a3b8',
        callback: v => '$' + v.toLocaleString('es-AR')
      }
    }
  }
}))

const stats = computed(() => {
  if (!slicedData.value.length) return null
  const ventas = slicedData.value.map(d => d.venta).filter(Boolean)
  const last    = ventas[ventas.length - 1]
  const first   = ventas[0]
  const max     = Math.max(...ventas)
  const min     = Math.min(...ventas)
  const change  = first ? ((last - first) / first * 100) : 0

  const fmt = n => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2 })
  return [
    { label: 'Último',     value: fmt(last),   color: 'text-brand-700' },
    { label: 'Máximo',     value: fmt(max),     color: 'text-red-500' },
    { label: 'Mínimo',     value: fmt(min),     color: 'text-emerald-600' },
    { label: 'Variación',  value: (change >= 0 ? '+' : '') + change.toFixed(1) + '%', color: change >= 0 ? 'text-red-500' : 'text-emerald-600' },
    { label: 'Período',    value: slicedData.value.length + ' días', color: 'text-slate-500' },
  ]
})

watch(selectedType, t => fetchHistory(t))
onMounted(() => fetchHistory(selectedType.value))
</script>
