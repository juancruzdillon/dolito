<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="section-title text-3xl">Calculadoras financieras</h1>
      <p class="section-subtitle">Todos los cálculos son reales y precisos. Ingresá los datos y obtené resultados instantáneos.</p>
    </div>

    <!-- Tab selector -->
    <div class="flex flex-wrap gap-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="activeTab === tab.id
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ─── MEP CON COMISIONES ─── -->
    <div v-if="activeTab === 'mep'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold text-slate-900 mb-1">Dólar MEP real por broker</h2>
        <p class="text-xs text-slate-400 mb-6">Calculá cuántos dólares realmente recibís según el broker que uses</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Pesos a invertir</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input v-model.number="mep.amount" type="number" class="input-field pl-7" min="1000" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Cotización MEP mercado (venta)</label>
            <input v-model.number="mep.marketRate" type="number" class="input-field" placeholder="ej. 1200" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="(r, i) in mepBrokerResults"
            :key="r.broker.id"
            class="rounded-xl border p-4"
            :class="i === 0 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'"
          >
            <span v-if="i === 0" class="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">★ Mejor opción</span>
            <p class="font-semibold text-sm mt-1" :style="{ color: r.broker.color }">{{ r.broker.name }}</p>
            <p class="price-value text-2xl font-bold text-slate-900 mt-1">{{ fmtUSD(r.receivedUSD) }}</p>
            <div class="mt-2 space-y-1 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Tipo de cambio real:</span>
                <span class="font-mono font-semibold">{{ fmt(r.effectiveRate) }}</span>
              </div>
              <div class="flex justify-between text-red-500">
                <span>Costo comisión:</span>
                <span class="font-mono">{{ fmt(r.commissionImpact) }}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Spread:</span>
                <span>{{ r.spreadPct.toFixed(3) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── PLAZO FIJO ─── -->
    <div v-if="activeTab === 'plazofijo'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold text-slate-900 mb-1">Plazo fijo</h2>
        <p class="text-xs text-slate-400 mb-6">Calculá el rendimiento de un plazo fijo en pesos</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Capital inicial</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input v-model.number="pf.capital" type="number" class="input-field pl-7" min="1000" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">TNA (%)</label>
            <div class="relative">
              <input v-model.number="pf.tna" type="number" class="input-field pr-7" step="0.1" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Días</label>
            <div class="flex gap-2">
              <input v-model.number="pf.dias" type="number" class="input-field" min="1" max="365" />
              <div class="flex gap-1 flex-shrink-0">
                <button v-for="d in [30,60,90,180]" :key="d" @click="pf.dias = d"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
                  :class="pf.dias === d ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-500 hover:border-brand-300'">
                  {{ d }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pfResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl bg-brand-50 border border-brand-200 p-4 text-center">
            <p class="text-xs text-brand-600 uppercase tracking-wide mb-1">Total al vencer</p>
            <p class="price-value text-2xl font-bold text-brand-700">{{ fmt(pfResult.total) }}</p>
          </div>
          <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p class="text-xs text-emerald-600 uppercase tracking-wide mb-1">Intereses ganados</p>
            <p class="price-value text-2xl font-bold text-emerald-700">{{ fmt(pfResult.intereses) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">TEA</p>
            <p class="price-value text-2xl font-bold text-slate-700">{{ pfResult.tea.toFixed(2) }}%</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Rendimiento período</p>
            <p class="price-value text-2xl font-bold text-slate-700">{{ pfResult.rendPeriodo.toFixed(3) }}%</p>
          </div>
        </div>

        <div class="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
          <strong class="text-slate-700">Fórmula:</strong>
          Intereses = Capital × TNA/100 × Días/365 · Total = Capital + Intereses
          <br/>TEA = (1 + TNA/100 × Días/365)^(365/Días) − 1
        </div>
      </div>
    </div>

    <!-- ─── LECAP ─── -->
    <div v-if="activeTab === 'lecap'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold text-slate-900 mb-1">LECAP — Letras de Capitalización</h2>
        <p class="text-xs text-slate-400 mb-2">
          Las LECAP son letras del Tesoro Nacional que se emiten con descuento y capitalizan a una tasa fija.
          Se operan en el mercado secundario a precio de mercado.
        </p>

        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-6">
          <strong>¿Cómo funcionan?</strong> Comprás la letra a un precio inferior a su valor nominal ($1.000).
          Al vencimiento recibís el VN completo. La diferencia es tu ganancia.
          También podés comprarlas en el mercado secundario a precio de mercado.
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Monto a invertir (ARS)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input v-model.number="lecap.monto" type="number" class="input-field pl-7" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Precio de compra (% del VN)</label>
            <div class="relative">
              <input v-model.number="lecap.precio" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 95.5" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">100% = par · menor precio = mayor rendimiento</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Días al vencimiento</label>
            <input v-model.number="lecap.dias" type="number" class="input-field" min="1" placeholder="ej. 90" />
          </div>
        </div>

        <div v-if="lecapResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl bg-brand-50 border border-brand-200 p-4 text-center">
            <p class="text-xs text-brand-600 uppercase tracking-wide mb-1">Valor nominal obtenido</p>
            <p class="price-value text-2xl font-bold text-brand-700">{{ fmt(lecapResult.vnTotal) }}</p>
          </div>
          <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p class="text-xs text-emerald-600 uppercase tracking-wide mb-1">Ganancia</p>
            <p class="price-value text-2xl font-bold text-emerald-700">{{ fmt(lecapResult.ganancia) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">TIR anual (TNA)</p>
            <p class="price-value text-2xl font-bold text-slate-700">{{ lecapResult.tirAnual.toFixed(2) }}%</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">TEA</p>
            <p class="price-value text-2xl font-bold text-slate-700">{{ lecapResult.tea.toFixed(2) }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── BONO ─── -->
    <div v-if="activeTab === 'bono'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold text-slate-900 mb-1">Bono simple (cupón 0 o con amortización)</h2>
        <p class="text-xs text-slate-400 mb-6">Calculá el rendimiento actual y la TIR estimada de un bono</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Precio de compra (% del VN)</label>
            <div class="relative">
              <input v-model.number="bono.precio" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 45" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Cupón anual (% del VN)</label>
            <div class="relative">
              <input v-model.number="bono.cupon" type="number" class="input-field pr-7" step="0.01" placeholder="ej. 8.75" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Años al vencimiento</label>
            <input v-model.number="bono.anios" type="number" class="input-field" min="0.1" step="0.1" placeholder="ej. 5" />
          </div>
        </div>

        <div v-if="bonoResult" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="rounded-xl bg-brand-50 border border-brand-200 p-4 text-center">
            <p class="text-xs text-brand-600 uppercase tracking-wide mb-1">Rendimiento corriente</p>
            <p class="price-value text-2xl font-bold text-brand-700">{{ bonoResult.currentYield.toFixed(2) }}%</p>
            <p class="text-[10px] text-slate-500 mt-1">Cupón anual / Precio pagado</p>
          </div>
          <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
            <p class="text-xs text-emerald-600 uppercase tracking-wide mb-1">TIR estimada (YTM)</p>
            <p class="price-value text-2xl font-bold text-emerald-700">{{ bonoResult.ytm.toFixed(2) }}%</p>
            <p class="text-[10px] text-slate-500 mt-1">Rendimiento al vencimiento</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Upside vs par</p>
            <p class="price-value text-2xl font-bold" :class="bonoResult.upside > 0 ? 'text-emerald-700' : 'text-red-500'">
              {{ bonoResult.upside > 0 ? '+' : '' }}{{ bonoResult.upside.toFixed(2) }}%
            </p>
            <p class="text-[10px] text-slate-500 mt-1">Si vence al 100% del VN</p>
          </div>
        </div>

        <div class="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
          <p><strong class="text-slate-700">Rendimiento corriente</strong> = Cupón anual / Precio actual × 100</p>
          <p><strong class="text-slate-700">TIR (YTM)</strong> = Calculada via Newton-Raphson considerando flujos de fondos al vencimiento</p>
        </div>
      </div>
    </div>

    <!-- ─── INFLACIÓN ─── -->
    <div v-if="activeTab === 'inflacion'" class="space-y-6">
      <div class="card p-6">
        <h2 class="font-semibold text-slate-900 mb-1">Actualización por inflación</h2>
        <p class="text-xs text-slate-400 mb-6">¿Cuánto vale hoy ese dinero de antes? ¿Cuánto necesitás ganar para mantener el poder adquisitivo?</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Capital original</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input v-model.number="inf.capital" type="number" class="input-field pl-7" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Inflación del período (%)</label>
            <div class="relative">
              <input v-model.number="inf.inflacion" type="number" class="input-field pr-7" step="0.1" placeholder="ej. 211" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Rendimiento obtenido (%)</label>
            <div class="relative">
              <input v-model.number="inf.rendimiento" type="number" class="input-field pr-7" step="0.1" placeholder="ej. 190" />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
          </div>
        </div>

        <div v-if="infResult" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Valor actualizado</p>
            <p class="price-value text-xl font-bold text-slate-700">{{ fmt(infResult.valorActualizado) }}</p>
            <p class="text-[10px] text-slate-400 mt-1">Para mantener poder adquisitivo</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Capital final</p>
            <p class="price-value text-xl font-bold text-slate-700">{{ fmt(infResult.capitalFinal) }}</p>
            <p class="text-[10px] text-slate-400 mt-1">Con tu rendimiento aplicado</p>
          </div>
          <div
            class="rounded-xl border p-4 text-center"
            :class="infResult.rendimientoReal >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'"
          >
            <p class="text-xs uppercase tracking-wide mb-1"
              :class="infResult.rendimientoReal >= 0 ? 'text-emerald-600' : 'text-red-600'">
              Rendimiento real
            </p>
            <p class="price-value text-xl font-bold"
              :class="infResult.rendimientoReal >= 0 ? 'text-emerald-700' : 'text-red-600'">
              {{ infResult.rendimientoReal >= 0 ? '+' : '' }}{{ infResult.rendimientoReal.toFixed(2) }}%
            </p>
            <p class="text-[10px] mt-1"
              :class="infResult.rendimientoReal >= 0 ? 'text-emerald-600' : 'text-red-500'">
              {{ infResult.rendimientoReal >= 0 ? '✓ Ganaste contra la inflación' : '✗ Perdiste poder adquisitivo' }}
            </p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Ganancia/pérdida real</p>
            <p class="price-value text-xl font-bold"
              :class="infResult.diferenciaReal >= 0 ? 'text-emerald-700' : 'text-red-600'">
              {{ fmt(infResult.diferenciaReal) }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDolarStore } from '@/stores/dolar.js'
import { useBrokersStore } from '@/stores/brokers.js'

const dolarStore   = useDolarStore()
const brokersStore = useBrokersStore()

const tabs = [
  { id: 'mep',        label: 'Dólar MEP' },
  { id: 'plazofijo',  label: 'Plazo Fijo' },
  { id: 'lecap',      label: 'LECAP' },
  { id: 'bono',       label: 'Bono' },
  { id: 'inflacion',  label: 'Inflación' },
]
const activeTab = ref('mep')

// ── MEP ──────────────────────────────────────────
const mep = ref({ amount: 100000, marketRate: null })
const marketRateAuto = computed(() => dolarStore.mepRate?.venta || null)
const effectiveMarketRate = computed(() => mep.value.marketRate || marketRateAuto.value)

const mepBrokerResults = computed(() => {
  if (!effectiveMarketRate.value || !mep.value.amount) return []
  return brokersStore.compareAll(effectiveMarketRate.value, mep.value.amount)
})

// ── PLAZO FIJO ────────────────────────────────────
const pf = ref({ capital: 100000, tna: 37, dias: 30 })
const pfResult = computed(() => {
  const { capital, tna, dias } = pf.value
  if (!capital || !tna || !dias) return null
  const r       = (tna / 100) * (dias / 365)
  const intereses = capital * r
  const total     = capital + intereses
  const tea       = (Math.pow(1 + r, 365 / dias) - 1) * 100
  return {
    total, intereses, tea,
    rendPeriodo: r * 100,
  }
})

// ── LECAP ─────────────────────────────────────────
const lecap = ref({ monto: 100000, precio: 95, dias: 90 })
const lecapResult = computed(() => {
  const { monto, precio, dias } = lecap.value
  if (!monto || !precio || !dias) return null
  // Cuántas láminas de VN 1000 compro con el monto
  const precioUnitario = (precio / 100) * 1000  // precio de 1 lámina de VN 1000
  const laminas        = monto / precioUnitario
  const vnTotal        = laminas * 1000          // VN que recibo al vencimiento
  const ganancia       = vnTotal - monto

  // TNA: rend = (VN/Precio - 1) × 365/dias
  const tirAnual = ((1000 / precioUnitario - 1) * (365 / dias)) * 100
  // TEA: (1 + rend_periodo)^(365/dias) - 1
  const rendPeriodo = (1000 / precioUnitario - 1)
  const tea         = (Math.pow(1 + rendPeriodo, 365 / dias) - 1) * 100

  return { vnTotal, ganancia, tirAnual, tea }
})

// ── BONO ──────────────────────────────────────────
const bono = ref({ precio: 45, cupon: 8.75, anios: 5 })
const bonoResult = computed(() => {
  const { precio, cupon, anios } = bono.value
  if (!precio || anios <= 0) return null

  const p = precio / 100  // precio como fracción del VN
  const c = cupon  / 100  // cupón anual como fracción del VN

  // Rendimiento corriente
  const currentYield = (c / p) * 100

  // Upside vs par
  const upside = ((1 - p) / p) * 100

  // YTM aproximado via Newton-Raphson
  // Para cupón periódico: precio = sum(c/(1+y)^t) + 1/(1+y)^n
  let y  = c / p  // semilla inicial
  for (let iter = 0; iter < 100; iter++) {
    let pv  = 0
    let dpv = 0
    for (let t = 1; t <= anios; t++) {
      pv  +=  c / Math.pow(1 + y, t)
      dpv += -t * c / Math.pow(1 + y, t + 1)
    }
    pv  += 1 / Math.pow(1 + y, anios)
    dpv += -anios / Math.pow(1 + y, anios + 1)
    const f   = pv - p
    if (Math.abs(f) < 1e-8) break
    y = y - f / dpv
  }
  const ytm = y * 100

  return { currentYield, ytm, upside }
})

// ── INFLACIÓN ─────────────────────────────────────
const inf = ref({ capital: 100000, inflacion: 211, rendimiento: 190 })
const infResult = computed(() => {
  const { capital, inflacion, rendimiento } = inf.value
  if (!capital || inflacion === null) return null

  const valorActualizado = capital * (1 + inflacion / 100)
  const capitalFinal     = capital * (1 + rendimiento / 100)

  // Rendimiento real: (1 + rend) / (1 + inf) - 1
  const rendimientoReal = ((1 + rendimiento / 100) / (1 + inflacion / 100) - 1) * 100
  const diferenciaReal  = capitalFinal - valorActualizado

  return { valorActualizado, capitalFinal, rendimientoReal, diferenciaReal }
})

const fmt    = n => n !== undefined ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n) : '—'
const fmtUSD = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
</script>
