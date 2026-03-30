<template>
  <div class="card p-6">
    <!-- Controls -->
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-semibold text-slate-900">Evolución de precios</h3>
          <p class="text-xs text-slate-400 mt-0.5">Histórico · Compará múltiples cotizaciones</p>
        </div>
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
      
      <!-- Multi-select chips -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in types"
          :key="t.value"
          @click="toggleType(t.value)"
          class="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors border outline-none select-none"
          :class="selectedTypes.includes(t.value) 
            ? 'bg-slate-800 text-white border-slate-800' 
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
        >
          <span class="flex items-center gap-1.5">
            <span 
              v-if="selectedTypes.includes(t.value)"
              class="w-2 h-2 rounded-full" 
              :style="{ backgroundColor: CHART_COLORS[t.value] }"
            ></span>
            {{ t.label }}
          </span>
        </button>
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

    <!-- Stats row (solo visible si 1 dolar seleccionado) -->
    <div v-if="stats && selectedTypes.length === 1" class="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
      <div v-for="s in stats" :key="s.label" class="text-center">
        <p class="text-[10px] text-slate-400 uppercase tracking-wide">{{ s.label }}</p>
        <p class="text-sm font-semibold" :class="s.color || 'text-slate-900'">{{ s.value }}</p>
      </div>
    </div>
    <div v-else-if="selectedTypes.length > 1" class="mt-4 text-center pt-4 border-t border-slate-100">
      <p class="text-xs text-slate-500">
        Mostrando precios de <span class="font-semibold text-slate-700">Venta</span> 
        de los {{ selectedTypes.length }} dólares seleccionados de los últimos {{ selectedPeriod }} días.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
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
  { value: 'tarjeta',          label: 'Tarjeta' },
]

const CHART_COLORS = {
  oficial: '#3b82f6',
  blue: '#64748b',
  bolsa: '#4f46e5',
  contadoconliqui: '#7c3aed',
  tarjeta: '#f59e0b',
  mayorista: '#0d9488',
  cripto: '#8b5cf6' 
}

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
const selectedTypes = ref([props.initialType])
const selectedPeriod = ref(30)
const loading = ref(false)
const error   = ref(null)

const CACHE = reactive({})

function toggleType(typeValue) {
  const idx = selectedTypes.value.indexOf(typeValue)
  if (idx === -1) {
    selectedTypes.value.push(typeValue)
  } else {
    // Al menos 1 debe quedar seleccionado
    if (selectedTypes.value.length > 1) {
      selectedTypes.value.splice(idx, 1)
    }
  }
}

async function fetchHistory(typesToFetch) {
  const missing = typesToFetch.filter(t => !CACHE[t])
  if (!missing.length) return // ya están todos cacheados

  loading.value = true
  error.value   = null
  
  try {
    await Promise.all(missing.map(async (type) => {
      const res = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${type}`)
      if (!res.ok) throw new Error('Sin datos')
      const data = await res.json()
      CACHE[type] = data
    }))
  } catch {
    error.value = 'No se pudo cargar el histórico completo. Verificá tu conexión.'
  } finally {
    loading.value = false
  }
}

// Escuchamos cuando cambian los selectedTypes para procesar fetches paralelos
watch(selectedTypes, (newTypes) => {
  fetchHistory(newTypes)
}, { deep: true })

onMounted(() => fetchHistory(selectedTypes.value))

// Función para obtener los días alineados de todos los seleccionados
const slicedData = computed(() => {
  if (selectedTypes.value.some(t => !CACHE[t])) return { labels: [], datasetsByCasa: {} }
  
  const cutoff = dayjs().subtract(selectedPeriod.value, 'day')
  
  // Encontrar todas las fechas únicas (eje X) entre todos los tipos de dólar seleccionados en el periodo
  const datesSet = new Set()
  selectedTypes.value.forEach(type => {
    CACHE[type].forEach(d => {
      if (dayjs(d.fecha).isAfter(cutoff)) {
        datesSet.add(d.fecha)
      }
    })
  })
  
  const labels = Array.from(datesSet).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
  
  // Mapear los valores de cada tipo en base al array de labels alineado
  const datasetsByCasa = {}
  selectedTypes.value.forEach(type => {
    // crear un mapa rápido { 'YYYY-MM-DD' : {venta, compra} }
    const lookup = {}
    CACHE[type].forEach(d => {
      if (dayjs(d.fecha).isAfter(cutoff)) lookup[d.fecha] = d
    })
    
    // Si no hay cotización exacta un día (ej, fin de semana), arrastramos el valor previo
    let lastKnown = null
    const mapped = labels.map(dateStr => {
      if (lookup[dateStr]) {
        lastKnown = lookup[dateStr]
      }
      return lastKnown
    })
    
    datasetsByCasa[type] = mapped
  })
  
  return { labels, datasetsByCasa }
})

const chartData = computed(() => {
  const { labels, datasetsByCasa } = slicedData.value
  const displayLabels = labels.map(d => dayjs(d).format('DD/MM'))
  const datasets = []
  
  if (selectedTypes.value.length === 1) {
    const type = selectedTypes.value[0]
    const cData = datasetsByCasa[type] || []
    const color = CHART_COLORS[type] || '#4f46e5'
    
    datasets.push({
      label: 'Venta',
      data: cData.map(d => Object.values(d || {}).length ? d.venta : null),
      borderColor: color,
      backgroundColor: color + '14', // 8% alpha opacidad prox
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.3,
    })
    datasets.push({
      label: 'Compra',
      data: cData.map(d => Object.values(d || {}).length ? d.compra : null),
      borderColor: '#10b981', // Verde estándar para compra general
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [4, 3],
      pointRadius: 0,
      pointHoverRadius: 3,
      fill: false,
      tension: 0.3,
    })
  } else {
    // Modo comparación (2 o más): solo mostramos "Venta" de cada uno con su color rep.
    selectedTypes.value.forEach(type => {
      const cData = datasetsByCasa[type] || []
      const ts = HISTORICAL_TYPES.find(h => h.value === type)
      const color = CHART_COLORS[type] || '#4f46e5'
      
      datasets.push({
        label: ts ? ts.label : type,
        data: cData.map(d => Object.values(d || {}).length ? d.venta : null),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false, // Sin relleno para que no se superpongan
        tension: 0.3,
      })
    })
  }

  return { labels: displayLabels, datasets }
})

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
        label: ctx => {
          if (ctx.parsed.y === null) return ''
          return ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
        }
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

// Solo se computan métricas dinámicas si hay exactamente 1 seleccionado
const stats = computed(() => {
  if (selectedTypes.value.length !== 1) return null
  const type = selectedTypes.value[0]
  if (!slicedData.value.datasetsByCasa[type]) return null
  
  const cData = slicedData.value.datasetsByCasa[type]
  const validVentas = cData.map(d => d?.venta).filter(Boolean)
  if (!validVentas.length) return null

  const last    = validVentas[validVentas.length - 1]
  const first   = validVentas[0]
  const max     = Math.max(...validVentas)
  const min     = Math.min(...validVentas)
  const change  = first ? ((last - first) / first * 100) : 0

  const fmt = n => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2 })
  return [
    { label: 'Último',     value: fmt(last),   color: 'text-brand-700' },
    { label: 'Máximo',     value: fmt(max),     color: 'text-red-500' },
    { label: 'Mínimo',     value: fmt(min),     color: 'text-emerald-600' },
    { label: 'Variación',  value: (change >= 0 ? '+' : '') + change.toFixed(1) + '%', color: change >= 0 ? 'text-red-500' : 'text-emerald-600' },
    { label: 'Período',    value: validVentas.length + ' días', color: 'text-slate-500' },
  ]
})
</script>
