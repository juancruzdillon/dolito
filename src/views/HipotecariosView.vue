<template>
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style="background-color: var(--bg); color: var(--text);">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight mb-1">Créditos Hipotecarios UVA</h1>
        <p class="text-sm" style="color: var(--text-2);">Compará tasas y condiciones de préstamos hipotecarios UVA de bancos argentinos.</p>
      </header>

      <!-- Salary Toggle -->
      <div class="card mb-4 p-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium">¿Querés ver las tasas cómo si acreditaras sueldo en el banco?</p>
          <p class="text-xs mt-0.5" style="color: var(--text-3);">Activa para ver tasas preferenciales para clientes.</p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="text-xs font-medium" :style="{ color: !store.showSalaryRates ? 'var(--brand)' : 'var(--text-3)' }">Base</span>
          <button
            @click="store.showSalaryRates = !store.showSalaryRates"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :style="{ backgroundColor: store.showSalaryRates ? 'var(--brand)' : 'var(--border-2)' }"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="store.showSalaryRates ? 'translate-x-5' : 'translate-x-0'"
            ></span>
          </button>
          <span class="text-xs font-medium" :style="{ color: store.showSalaryRates ? 'var(--brand)' : 'var(--text-3)' }">Sueldo</span>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="!store.loading && store.rates.length > 0" class="card mb-4 p-4">
        <div class="flex flex-wrap items-end gap-3">
          <!-- Buscador -->
          <div class="flex-1 min-w-[180px]">
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Buscar banco</label>
            <div class="relative">
              <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--text-3);" />
              <input v-model="bankSearch" type="text" placeholder="Nombre del banco..." class="input-field py-2 text-sm pl-8" />
            </div>
          </div>
          <div class="flex-1 min-w-[140px]">
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Ordenar por</label>
            <div class="flex rounded-lg overflow-hidden border" style="border-color: var(--border);">
              <button
                v-for="opt in [{id:'tna', label:'Tasa'}, {id:'financing', label:'Fin.'}, {id:'term', label:'Plazo'}]"
                :key="opt.id"
                @click="store.sortBy = opt.id"
                class="flex-1 py-1.5 text-xs font-semibold transition-colors"
                :style="store.sortBy === opt.id
                  ? 'background: var(--brand); color: #fff;'
                  : 'background: var(--surface-2); color: var(--text-2);'"
              >{{ opt.label }}</button>
            </div>
          </div>
          <div class="w-32">
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Tasa máx (%)</label>
            <input v-model.number="store.filters.maxTna" type="number" step="0.5" max="99" min="0" @input="store.filters.maxTna = Math.min(store.filters.maxTna || 0, 99)" placeholder="Ej: 8" class="input-field py-2 text-sm" />
          </div>
          <div class="w-32">
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Mín financia (%)</label>
            <input v-model.number="store.filters.minFinancing" type="number" max="100" min="0" @input="store.filters.minFinancing = Math.min(store.filters.minFinancing || 0, 100)" placeholder="Ej: 75" class="input-field py-2 text-sm" />
          </div>
          <button @click="resetFilters(); bankSearch = ''" class="btn-ghost py-2" title="Limpiar filtros">
            <RefreshCcw :size="14" />
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="flex items-center justify-center gap-3 py-20" style="color: var(--text-3);">
        <div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color: var(--border-2); border-top-color: var(--brand);"></div>
        <span class="text-sm">Cargando...</span>
      </div>

      <!-- No Results -->
      <div v-else-if="store.filteredRates.length === 0" class="card text-center py-12 px-6">
        <p class="text-sm font-medium mb-1">No hay resultados con esos filtros</p>
        <p class="text-xs mb-4" style="color: var(--text-3);">Ajustá la tasa máxima o la financiación mínima.</p>
        <button @click="resetFilters" class="btn-secondary text-xs py-1.5 px-4">Limpiar filtros</button>
      </div>

      <!-- Bank List -->
      <div v-else class="space-y-2 mb-12">
        <div
          v-for="bank in displayedRates"
          :key="bank.id"
          class="card p-4 flex items-center gap-4"
        >
          <div class="logo-chip flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden border" style="border-color: var(--border);">
            <img v-if="bank.logo" :src="getLogoUrl(bank.logo)" :alt="bank.bankName" class="w-full h-full object-contain" @error="handleImageError" />
            <Building v-else :size="20" style="color: var(--text-3);" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5">
              <p class="font-semibold text-sm truncate">{{ bank.bankName }}</p>
              <span v-if="bank.isSalaryAccount" class="text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0" style="border-color: var(--brand); color: var(--brand);">SUELDO</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md" style="background: var(--surface-2); color: var(--text-2);">{{ bank.term }}</span>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md" style="background: var(--brand-bg); color: var(--brand-text);">Financia {{ bank.financing }}</span>
            </div>
          </div>

          <div class="flex-shrink-0 text-right overflow-hidden min-w-0">
            <p class="price-value font-bold truncate" :class="priceTextClass((bank.tna || 0).toFixed(1) + '%', 'text-xl')" style="color: var(--brand);">{{ (bank.tna || 0).toFixed(1) }}%</p>
            <p class="text-[10px] font-medium" style="color: var(--text-3);">TNA</p>
            <p v-if="bank.updatedAt" class="text-[10px] mt-0.5 truncate" :style="{ color: isStale(bank.updatedAt) ? 'var(--amber)' : 'var(--text-3)' }" :title="isStale(bank.updatedAt) ? 'El banco no actualizó esta tasa en más de 30 días' : ''">{{ bank.updatedAt }}</p>
          </div>
        </div>

        <div v-if="store.hasMore && !bankSearch" class="flex justify-center pt-2">
          <button @click="store.loadMore" class="btn-secondary flex items-center gap-2 text-sm">
            Ver más <ChevronDown :size="14" />
          </button>
        </div>
      </div>

      <!-- Chart -->
      <section v-if="!store.loading && store.filteredRates.length > 0" class="mb-12">
        <h2 class="text-base font-semibold mb-3">Comparativa de tasas</h2>
        <div class="card p-5 space-y-3">
          <div v-for="bank in store.filteredRates.slice(0, 8)" :key="'chart-'+bank.id" class="flex items-center gap-3">
            <div class="logo-chip w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border" style="border-color: var(--border);">
              <img v-if="bank.logo" :src="getLogoUrl(bank.logo)" class="w-full h-full object-contain" />
              <Building v-else :size="14" style="color: var(--text-3);" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm truncate" style="color: var(--text-2);">{{ bank.bankName }}</span>
                <span class="price-value text-sm font-semibold flex-shrink-0 pl-3" style="color: var(--brand);">{{ (bank.tna || 0).toFixed(1) }}%</span>
              </div>
              <div class="h-1.5 rounded-full overflow-hidden" style="background-color: var(--surface-2);">
                <div class="h-full rounded-full transition-all duration-700" style="background-color: var(--brand);" :style="{ width: `${(bank.tna / maxTna) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Calculator -->
      <section id="calculadora" class="mb-12 scroll-mt-20">
        <h2 class="text-base font-semibold mb-3">Simulador hipotecario</h2>
        <div class="card p-5 space-y-5">

          <!-- Bank Selector -->
          <div>
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Entidad financiera</label>
            <div class="relative">
              <button
                @click="calc.showBankSelector = !calc.showBankSelector"
                class="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors"
                :style="calc.showBankSelector
                  ? 'border-color: var(--brand); background: var(--surface-2);'
                  : 'border-color: var(--border); background: var(--surface-2);'"
              >
                <div class="flex items-center gap-3">
                  <div class="logo-chip w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border" style="border-color: var(--border);">
                    <img v-if="selectedBank?.logo" :src="getLogoUrl(selectedBank.logo)" class="w-full h-full object-contain" />
                    <Building v-else :size="14" style="color: var(--text-3);" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold">{{ selectedBank?.bankName }}</p>
                    <p class="text-xs" style="color: var(--text-3);">{{ selectedBank?.tna }}% TNA + UVA · {{ selectedBank?.financing }} de financiación</p>
                  </div>
                </div>
                <ChevronDown :size="16" :class="{ 'rotate-180': calc.showBankSelector }" class="transition-transform flex-shrink-0" style="color: var(--text-3);" />
              </button>

              <div v-if="calc.showBankSelector" class="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border shadow-lg overflow-hidden" style="background: var(--surface); border-color: var(--border);">
                <div class="p-2 border-b" style="border-color: var(--border);">
                  <div class="relative">
                    <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--text-3);" />
                    <input
                      v-model="calc.bankSearchQuery"
                      type="text"
                      placeholder="Buscar banco..."
                      class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border outline-none"
                      style="background: var(--surface-2); border-color: var(--border); color: var(--text);"
                    />
                  </div>
                </div>
                <div class="max-h-60 overflow-y-auto">
                  <button
                    v-for="b in filteredBanks" :key="'drop-'+b.id"
                    @click="calc.bankId = b.id; calc.showBankSelector = false"
                    class="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                    :style="calc.bankId === b.id ? 'background: var(--brand-bg);' : ''"
                    @mouseover="$event.currentTarget.style.background = calc.bankId === b.id ? 'var(--brand-bg)' : 'var(--surface-2)'"
                    @mouseleave="$event.currentTarget.style.background = calc.bankId === b.id ? 'var(--brand-bg)' : ''"
                  >
                    <div class="flex items-center gap-3">
                      <div class="logo-chip w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border" style="border-color: var(--border);">
                        <img :src="getLogoUrl(b.logo)" class="w-full h-full object-contain" />
                      </div>
                      <span class="text-sm">{{ b.bankName }}</span>
                    </div>
                    <span class="price-value text-sm font-semibold" style="color: var(--brand);">{{ b.tna }}%</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="text-[11px] font-semibold uppercase tracking-wide block mb-1.5" style="color: var(--text-3);">Monto del préstamo (ARS)</label>
            <input v-model.number="calc.amount" type="number" max="999999999999" min="0" @input="calc.amount = Math.min(calc.amount || 0, 999999999999)" placeholder="Ej: 50000000" class="input-field text-sm" />
            <button
              @click="calc.showUsdHelper = !calc.showUsdHelper"
              class="mt-2 text-xs flex items-center gap-1.5 transition-colors"
              style="color: var(--text-3);"
            >
              <Coins :size="11" />
              {{ calc.showUsdHelper ? 'Cerrar conversor' : 'Calcular desde valor en USD' }}
            </button>

            <div v-if="calc.showUsdHelper" class="mt-3 p-4 rounded-xl border space-y-3" style="background: var(--surface-2); border-color: var(--border);">
              <label class="text-[11px] font-semibold uppercase tracking-wide block" style="color: var(--text-3);">Valor de la propiedad (USD)</label>
              <input v-model.number="calc.houseUsd" type="number" max="999999999999" min="0" @input="calc.houseUsd = Math.min(calc.houseUsd || 0, 999999999999)" placeholder="0" class="input-field text-sm" />
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="applyArsValue(arsFromUsd.oficial)"
                  class="text-left p-3 rounded-lg border transition-colors"
                  style="border-color: var(--border); background: var(--surface);"
                >
                  <p class="text-[10px] font-semibold uppercase tracking-wide mb-0.5 truncate" style="color: var(--text-3);">Tipo oficial</p>
                  <p class="font-bold price-value truncate" :class="priceTextClass(fmtCurrencyNoDecAuto(arsFromUsd.oficial), 'text-sm')" style="color: var(--brand);">{{ fmtCurrencyNoDecAuto(arsFromUsd.oficial) }}</p>
                </button>
                <button
                  @click="applyArsValue(arsFromUsd.mep)"
                  class="text-left p-3 rounded-lg border transition-colors overflow-hidden min-w-0"
                  style="border-color: var(--border); background: var(--surface);"
                >
                  <p class="text-[10px] font-semibold uppercase tracking-wide mb-0.5 truncate" style="color: var(--text-3);">Tipo MEP</p>
                  <p class="font-bold price-value truncate" :class="priceTextClass(fmtCurrencyNoDecAuto(arsFromUsd.mep), 'text-sm')" style="color: var(--brand);">{{ fmtCurrencyNoDecAuto(arsFromUsd.mep) }}</p>
                </button>
              </div>
            </div>
          </div>

          <!-- Years -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="text-[11px] font-semibold uppercase tracking-wide" style="color: var(--text-3);">Plazo</label>
              <span class="text-sm font-semibold">{{ calc.years }} años</span>
            </div>
            <!-- Track visual separado del input para evitar desfase por padding interno del browser -->
            <div class="relative h-4 flex items-center">
              <div class="absolute inset-x-0 h-1 rounded-full pointer-events-none" style="background: var(--surface-2);">
                <div class="h-full rounded-full" style="background: var(--brand);" :style="{ width: sliderPct + '%' }"></div>
              </div>
              <input v-model.number="calc.years" type="range" min="5" max="30" step="1" class="range-slider w-full relative z-10" />
            </div>
            <div class="relative text-[10px] mt-1.5 h-4" style="color: var(--text-3);">
              <span class="absolute left-0">5 años</span>
              <span class="absolute -translate-x-1/2" style="left: 60%">20 años</span>
              <span class="absolute right-0">30 años</span>
            </div>
          </div>

          <!-- Results -->
          <div class="border-t pt-4" style="border-color: var(--border);">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="p-3 rounded-xl overflow-hidden min-w-0" style="background: var(--surface-2);">
                <p class="text-[10px] font-semibold uppercase tracking-wide mb-1 truncate" style="color: var(--text-3);">Cuota mensual</p>
                <p class="price-value font-bold truncate" :class="priceTextClass('$' + fmtCurrencyNoDecAuto(monthlyPaymentARS), 'text-sm')" style="color: var(--brand);">${{ fmtCurrencyNoDecAuto(monthlyPaymentARS) }}</p>
              </div>
              <div class="p-3 rounded-xl overflow-hidden min-w-0" style="background: var(--surface-2);">
                <p class="text-[10px] font-semibold uppercase tracking-wide mb-1 truncate" style="color: var(--text-3);">UVAs/mes</p>
                <p class="price-value font-bold truncate" :class="priceTextClass(String(Math.round(monthlyPaymentUVA)), 'text-sm')">{{ Math.round(monthlyPaymentUVA) }}</p>
              </div>
              <div class="p-3 rounded-xl overflow-hidden min-w-0" style="background: var(--surface-2);">
                <p class="text-[10px] font-semibold uppercase tracking-wide mb-1 truncate" style="color: var(--text-3);">Finaliza en</p>
                <p class="price-value text-sm font-bold truncate">{{ endYear }}</p>
              </div>
              <div class="p-3 rounded-xl overflow-hidden min-w-0" style="background: var(--surface-2);">
                <p class="text-[10px] font-semibold uppercase tracking-wide mb-1 truncate" style="color: var(--text-3);">Valor UVA</p>
                <p class="price-value font-bold truncate" :class="priceTextClass('$' + Math.round(store.uvaValue), 'text-sm')">${{ Math.round(store.uvaValue) }}</p>
              </div>
            </div>
            <p class="text-[10px] mt-3" style="color: var(--text-3);">Simulación informativa. Consultá con tu banco para condiciones definitivas.</p>
          </div>

        </div>
      </section>

      <!-- Educational -->
      <section class="mb-12">
        <h2 class="text-base font-semibold mb-3">Entendé los números</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-2">¿Qué es el UVA?</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-2);">El BCRA mide el valor del ladrillo en UVAs. Tu deuda se expresa en esta unidad — si el UVA sube 10%, tu cuota también sube 10%.</p>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-2">La tasa (TNA)</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-2);">Es el interés que el banco cobra por encima de la inflación. Una TNA del 6% significa 6% anual sobre tu deuda en UVAs.</p>
          </div>
        </div>
      </section>

      <!-- Histórico UVA -->
      <section class="mb-12">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-semibold">Evolución del valor UVA</h2>
          <div class="flex gap-2">
            <button
              v-for="r in [{label:'1A', months:12},{label:'2A', months:24},{label:'5A', months:60},{label:'Todo', months:0}]"
              :key="r.label"
              @click="uvaRange = r.months"
              class="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
              :style="uvaRange === r.months ? 'background: var(--brand); color: #fff;' : 'background: var(--surface-2); color: var(--text-2);'"
            >{{ r.label }}</button>
          </div>
        </div>
        <div class="card p-4">
          <div v-if="uvaHistory.length === 0" class="flex items-center justify-center h-40 gap-2" style="color: var(--text-3);">
            <div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color: var(--border-2); border-top-color: var(--brand);"></div>
            <span class="text-sm">Cargando...</span>
          </div>
          <Line v-else :data="uvaChartData" :options="uvaChartOptions" style="height: 220px;" />
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, reactive, ref, watch } from 'vue'
import { useMortgageStore } from '@/stores/mortgages.js'
import { Building, ChevronDown, Coins, RefreshCcw, Search } from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const store = useMortgageStore()
const dolarStore = useDolarStore()

const calc = reactive({
  bankId: '',
  amount: 50000000,
  years: 15,
  houseUsd: 100000,
  showUsdHelper: false,
  showBankSelector: false,
  bankSearchQuery: ''
})

const bankSearch = ref('')
const uvaHistory = ref([])
const uvaRange = ref(24)

const filteredBanks = computed(() => {
  const q = calc.bankSearchQuery.toLowerCase()
  return store.filteredRates.filter(b => b.bankName.toLowerCase().includes(q))
})

const displayedRates = computed(() => {
  const q = bankSearch.value.toLowerCase().trim()
  if (q) return store.filteredRates.filter(b => b.bankName.toLowerCase().includes(q))
  return store.paginatedRates
})

const sliderPct = computed(() => ((calc.years - 5) / (30 - 5)) * 100)

const uvaChartData = computed(() => {
  let data = uvaHistory.value
  if (uvaRange.value > 0) {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - uvaRange.value)
    data = data.filter(d => new Date(d.fecha) >= cutoff)
  }
  // Un punto cada 15 días + siempre incluir el último
  const sampled = data.filter((_, i, arr) => i % 15 === 0 || i === arr.length - 1)
  return {
    labels: sampled.map(d => {
      const [y, m] = d.fecha.split('-')
      return `${m}/${y.slice(2)}`
    }),
    datasets: [{
      data: sampled.map(d => d.valor),
      borderColor: 'var(--brand)',
      backgroundColor: 'rgba(14, 164, 122, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2
    }]
  }
})

const uvaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: ctx => ` $${ctx.parsed.y.toFixed(2)}` }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: 'var(--text-3)', font: { size: 10 }, maxTicksLimit: 8 } },
    y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--text-3)', font: { size: 10 }, callback: v => `$${v}` } }
  },
  elements: { point: { radius: 0, hoverRadius: 4, hoverBackgroundColor: 'var(--brand)' } }
}

const selectedBank = computed(() => {
  return store.rates.find(b => b.id === calc.bankId) || store.rates[0]
})

const monthlyPaymentUVA = computed(() => {
  const bank = store.rates.find(b => b.id === calc.bankId)
  if (!bank || !calc.amount || !calc.years || !store.uvaValue) return 0
  const loanInUvas = calc.amount / store.uvaValue
  const monthlyRate = (bank.tna / 100) / 12
  const n = calc.years * 12
  if (monthlyRate === 0) return loanInUvas / n
  return loanInUvas * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
})

const monthlyPaymentARS = computed(() => monthlyPaymentUVA.value * store.uvaValue)
const endYear = computed(() => new Date().getFullYear() + (calc.years || 0))

const maxTna = computed(() => {
  const vals = store.filteredRates.map(r => r.tna)
  return vals.length ? Math.max(...vals) : 10
})

const arsFromUsd = computed(() => {
  const bank = store.rates.find(b => b.id === calc.bankId)
  if (!bank || !calc.houseUsd) return { oficial: 0, mep: 0 }
  const financingPercent = parseInt(bank.financing) / 100
  const oficial = dolarStore.oficialRate?.venta || 0
  const mep = dolarStore.mepRate?.venta || 0
  return {
    oficial: calc.houseUsd * oficial * financingPercent,
    mep: calc.houseUsd * mep * financingPercent
  }
})

function resetFilters() {
  store.filters.maxTna = null
  store.filters.minFinancing = null
  store.sortBy = 'tna'
}

function fmtCurrencyNoDecAuto(val) {
  if (!val) return '0'
  const dec = Math.abs(val) < 10000 ? 2 : 0
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: dec }).format(val)
}

const priceTextClass = (val, base = 'text-2xl') => {
  const s = String(val)
  if (s.length > 14) return 'text-lg'
  if (s.length > 11) return 'text-xl'
  return base
}

function getLogoUrl(filename) {
  if (!filename) return null
  return new URL(`../assets/images/logos/${filename}`, import.meta.url).href
}

function handleImageError(e) {
  e.target.style.display = 'none'
}

function isStale(dateStr) {
  if (!dateStr) return false
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff > 30 * 24 * 60 * 60 * 1000 // más de 30 días
}

function applyArsValue(val) {
  calc.amount = Math.round(val)
  calc.showUsdHelper = false
}

watch(() => store.filteredRates, (newRates) => {
  if (newRates.length > 0) calc.bankId = newRates[0].id
}, { immediate: true })

async function fetchUvaHistory() {
  try {
    const res = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/uva')
    uvaHistory.value = await res.json()
  } catch (e) {
    console.error('Error fetching UVA history', e)
  }
}

onMounted(() => {
  store.fetchMortgageRates()
  dolarStore.fetchRates()
  fetchUvaHistory()
})
</script>

<style scoped>
/* Fondo siempre blanco: logos tipo app-icon lo tapan con su propio rect coloreado,
   logos flat (texto/ícono transparente) quedan legibles sobre blanco en cualquier tema. */
.logo-chip {
  background: white;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.range-slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 16px;
  outline: none;
}

/* Track transparente — el fill visual lo maneja el div separado */
.range-slider::-webkit-slider-runnable-track { background: transparent; height: 16px; }
.range-slider::-moz-range-track { background: transparent; height: 16px; }

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--brand);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--brand);
  margin-top: 0;
}

.range-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--brand);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--brand);
}
</style>
