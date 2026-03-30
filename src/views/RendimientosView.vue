<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-black tracking-tight" :style="{ color: 'var(--text)' }">Rendimientos</h1>
      <p class="text-sm mt-0.5" :style="{ color: 'var(--text-3)' }">Compará rendimientos actualizados de billeteras, fondos e instrumentos de inversión en Argentina.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 overflow-x-auto pb-0.5 mb-6 border-b" :style="{ borderColor: 'var(--border)' }">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-shrink-0 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px"
        :style="activeTab === tab.id
          ? { color: 'var(--brand)', borderColor: 'var(--brand)' }
          : { color: 'var(--text-3)', borderColor: 'transparent' }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Cuentas y Billeteras ─────────────────────────────────────────────── -->
    <template v-if="activeTab === 'billeteras'">
      <SectionTitle title="Billeteras y fondos de liquidez" subtitle="Billeteras con tasa garantizada y fondos comunes de inversión de bajo riesgo" />
      <div class="space-y-2">
        <InstrumentRow
          v-for="item in billerasOrdenadas"
          :key="item.id"
          :logo="item.logo"
          :color="item.color"
          :name="item.name"
          :sub="item.institution || item.clase"
          :rate="item.tna"
          rate-label="TNA"
        >
          <template #badges>
            <span class="badge badge-blue">{{ item.badge || item.tipo }}</span>
            <span v-if="item.limit" class="badge badge-gray">Límite: {{ item.limit }}</span>
            <span v-if="item.patrimonio" class="badge badge-gray">Patrimonio: {{ item.patrimonio }}</span>
          </template>
          <template #date>
            <template v-if="item.since">TNA vigente desde el {{ item.since }}</template>
            <template v-else-if="item.from">Entre {{ item.from }} y {{ item.to }}</template>
          </template>
        </InstrumentRow>
      </div>
      <!-- Rendimientos especiales -->
      <div class="mt-8">
        <SectionTitle title="Rendimientos especiales" subtitle="Productos con requisitos o condiciones particulares para acceder" />
        <div class="space-y-2">
          <div
            v-for="item in store.especiales"
            :key="item.id"
            class="flex items-start gap-4 p-4 rounded-2xl border"
            :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
          >
            <LogoCell :logo="item.logo" :color="item.color" :name="item.name" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm" :style="{ color: 'var(--text)' }">{{ item.name }}</p>
              <p class="text-xs mt-0.5 leading-relaxed" :style="{ color: 'var(--text-3)' }">{{ item.requisito }}</p>
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <span class="badge badge-blue">{{ item.badge }}</span>
                <span class="badge badge-gray">Límite: {{ item.limit }}</span>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-xl font-black tabular-nums text-emerald-500">{{ item.tna != null ? item.tna.toFixed(2) + '%' : '—' }}</p>
              <p class="text-[10px] font-semibold uppercase tracking-wider" :style="{ color: 'var(--text-3)' }">TNA</p>
              <p class="text-[10px] mt-0.5" :style="{ color: 'var(--text-3)' }">{{ item.since ? 'Vigente desde ' + item.since : (item.from ? item.from + ' – ' + item.to : '') }}</p>
            </div>
          </div>
        </div>
      </div>

      <DataNote :text="`Fuente: CAFCI · Actualizado al ${store.lastUpdated}`" />
    </template>

    <!-- ── Plazo Fijo ──────────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'plazo'">
      <SectionTitle title="Plazo fijo bancario" subtitle="Tasas referenciales a 30 días para persona humana, sin monto mínimo" />
      <div class="space-y-2">
        <div
          v-for="banco in store.plazofijo"
          :key="banco.id"
          class="flex items-center gap-4 p-4 rounded-2xl border transition-colors"
          :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
        >
          <!-- Logo -->
          <LogoCell :logo="banco.logo" :color="banco.color" :name="banco.name" />

          <!-- Nombre -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text)' }">{{ banco.name }}</p>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">Plazo fijo tradicional</p>
          </div>

          <!-- Tasas -->
          <div class="text-right">
            <p class="text-xl font-black tabular-nums text-emerald-500">{{ banco.tna != null ? banco.tna.toFixed(2) + '%' : '—' }}</p>
            <p class="text-[10px] font-semibold uppercase tracking-wider" :style="{ color: 'var(--text-3)' }">TNA · 30d</p>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">{{ banco.tna != null ? 'TEA ' + tnaToTea(banco.tna) + '%' : '' }}</p>
          </div>
        </div>
      </div>
      <DataNote :text="`Fuente: BCRA · Tasas referenciales · Actualizado al ${store.lastUpdated}`" />
    </template>

    <!-- ── LECAPs ──────────────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'lecaps'">
      <SectionTitle title="LECAPs" subtitle="Letras de Capitalización del Tesoro en pesos, emitidas por el MECON" />
      <div class="rounded-2xl border overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-wider border-b" :style="{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }">
              <th class="text-left px-4 py-3">Ticker</th>
              <th class="text-left px-4 py-3 hidden sm:table-cell">Vencimiento</th>
              <th class="text-right px-4 py-3">TEM</th>
              <th class="text-right px-4 py-3">TNA</th>
              <th class="text-right px-4 py-3 hidden sm:table-cell">Precio</th>
            </tr>
          </thead>
          <tbody class="divide-y" :style="{ borderColor: 'var(--border)' }">
            <tr v-for="l in store.lecaps" :key="l.ticker" class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <td class="px-4 py-3.5">
                <span class="font-black tracking-tight" :style="{ color: 'var(--text)' }">{{ l.ticker }}</span>
                <p class="text-[11px] sm:hidden mt-0.5" :style="{ color: 'var(--text-3)' }">{{ l.vto }}</p>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell" :style="{ color: 'var(--text-2)' }">{{ l.vto }}</td>
              <td class="px-4 py-3.5 text-right font-bold text-emerald-500">{{ l.tem != null ? l.tem.toFixed(2) + '%' : '—' }}</td>
              <td class="px-4 py-3.5 text-right font-semibold" :style="{ color: 'var(--text)' }">{{ l.tna != null ? l.tna.toFixed(2) + '%' : '—' }}</td>
              <td class="px-4 py-3.5 text-right hidden sm:table-cell" :style="{ color: 'var(--text-2)' }">{{ l.precio != null ? '$' + l.precio.toFixed(2) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <DataNote :text="`Datos orientativos · Cierre ${store.lastUpdated} · Verificar en BYMA o tu broker`" />
    </template>

    <!-- ── Bonos CER ───────────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'cer'">
      <SectionTitle title="Bonos CER" subtitle="Instrumentos indexados por inflación (CER), emitidos por el Tesoro Nacional" />
      <div class="rounded-2xl border overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-wider border-b" :style="{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }">
              <th class="text-left px-4 py-3">Ticker</th>
              <th class="text-left px-4 py-3 hidden sm:table-cell">Vencimiento</th>
              <th class="text-right px-4 py-3 hidden sm:table-cell">Cupón</th>
              <th class="text-right px-4 py-3">TIR real</th>
              <th class="text-right px-4 py-3">Paridad</th>
            </tr>
          </thead>
          <tbody class="divide-y" :style="{ borderColor: 'var(--border)' }">
            <tr v-for="b in store.bonosCer" :key="b.ticker" class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <td class="px-4 py-3.5">
                <span class="font-black tracking-tight" :style="{ color: 'var(--text)' }">{{ b.ticker }}</span>
                <p class="text-[11px] mt-0.5" :style="{ color: 'var(--text-3)' }">{{ b.nombre }}</p>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell" :style="{ color: 'var(--text-2)' }">{{ b.vto }}</td>
              <td class="px-4 py-3.5 text-right hidden sm:table-cell text-xs" :style="{ color: 'var(--text-3)' }">{{ b.cupon }}</td>
              <td class="px-4 py-3.5 text-right font-bold text-emerald-500">{{ b.tir ?? '—' }}</td>
              <td class="px-4 py-3.5 text-right font-semibold" :style="{ color: 'var(--text)' }">{{ b.paridad != null ? b.paridad.toFixed(1) + '%' : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <DataNote text="Datos de mercado vía Rava · Verificar en BYMA o tu broker" />
    </template>

    <!-- ── Bonos Soberanos ─────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'soberanos'">
      <SectionTitle title="Bonos Soberanos en USD" subtitle="Deuda externa argentina cotizando en dólares, mercado local y exterior" />
      <div class="rounded-2xl border overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-wider border-b" :style="{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }">
              <th class="text-left px-4 py-3">Ticker</th>
              <th class="text-left px-4 py-3 hidden sm:table-cell">Vencimiento</th>
              <th class="text-right px-4 py-3 hidden sm:table-cell">Cupón</th>
              <th class="text-right px-4 py-3">TIR</th>
              <th class="text-right px-4 py-3">Paridad</th>
              <th class="text-right px-4 py-3 hidden sm:table-cell">Ley</th>
            </tr>
          </thead>
          <tbody class="divide-y" :style="{ borderColor: 'var(--border)' }">
            <tr v-for="b in store.soberanos" :key="b.ticker" class="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <td class="px-4 py-3.5">
                <span class="font-black tracking-tight" :style="{ color: 'var(--text)' }">{{ b.ticker }}</span>
                <p class="text-[11px] sm:hidden mt-0.5" :style="{ color: 'var(--text-3)' }">{{ b.vto }}</p>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell" :style="{ color: 'var(--text-2)' }">{{ b.vto }}</td>
              <td class="px-4 py-3.5 text-right hidden sm:table-cell text-xs" :style="{ color: 'var(--text-3)' }">{{ b.cupon }}</td>
              <td class="px-4 py-3.5 text-right font-bold text-emerald-500">{{ b.tir ?? '—' }}</td>
              <td class="px-4 py-3.5 text-right font-semibold" :style="{ color: 'var(--text)' }">{{ b.paridad != null ? b.paridad.toFixed(1) + '%' : '—' }}</td>
              <td class="px-4 py-3.5 text-right hidden sm:table-cell">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" :style="{ background: 'var(--surface-2)', color: 'var(--text-3)' }">{{ b.ley }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <DataNote text="Datos de mercado vía Rava · Verificar en BYMA, MAE o tu broker" />
    </template>

    <!-- ── ONs ────────────────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'ons'">
      <SectionTitle title="Obligaciones Negociables" subtitle="Deuda corporativa de empresas argentinas, en pesos y dólares" />
      <div class="space-y-2">
        <div
          v-for="on in store.ons"
          :key="on.id"
          class="flex items-center gap-4 p-4 rounded-2xl border"
          :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
        >
          <!-- Logo -->
          <LogoCell :logo="on.logo" :color="on.color || onColor(on.company)" :name="on.company" />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-sm" :style="{ color: 'var(--text)' }">{{ on.company }}</p>
              <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded" :style="{ background: 'var(--surface-2)', color: 'var(--text-3)' }">{{ on.ticker }}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="badge" :class="on.moneda === 'USD' ? 'badge-green' : 'badge-blue'">{{ on.moneda }}</span>
              <span class="text-xs" :style="{ color: 'var(--text-3)' }">Vto {{ on.vto }}</span>
              <span class="text-xs" :style="{ color: 'var(--text-3)' }">Rating: {{ on.rating }}</span>
            </div>
          </div>

          <!-- Tasas -->
          <div class="text-right flex-shrink-0">
            <p class="text-lg font-black tabular-nums text-emerald-500">{{ on.tir ?? '—' }}</p>
            <p class="text-[10px] font-semibold uppercase tracking-wider" :style="{ color: 'var(--text-3)' }">TIR</p>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">Cupón {{ on.cupon }}</p>
          </div>
        </div>
      </div>
      <DataNote :text="`Datos orientativos · Cierre ${store.lastUpdated} · Verificar precio actual en tu broker`" />
    </template>

  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, onMounted } from 'vue'
import { useRendimientosStore } from '@/stores/rendimientos.js'

const store = useRendimientosStore()
const activeTab = ref('billeteras')

const TABS = [
  { id: 'billeteras', label: 'Cuentas y Billeteras' },
  { id: 'plazo',      label: 'Plazo Fijo' },
  { id: 'lecaps',     label: 'LECAPs' },
  { id: 'cer',        label: 'Bonos CER' },
  { id: 'soberanos',  label: 'Bonos Soberanos' },
  { id: 'ons',        label: 'ONs' },
]

const billerasOrdenadas = computed(() =>
  [...store.billeteras, ...store.fondos]
    .filter(x => x.tna !== null)
    .sort((a, b) => b.tna - a.tna)
)

onMounted(() => store.fetchAll())

// TNA a 30 días → TEA
function tnaToTea(tna) {
  return (((1 + tna / 100 / 365) ** 365 - 1) * 100).toFixed(2)
}

const ON_COLORS = ['#16A34A','#0052CC','#E42313','#7B2D8B','#005189','#004481','#009B77','#CC0000','#1B3F8B']
function onColor(company) {
  let h = 0
  for (const c of company) h = (h * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return ON_COLORS[h % ON_COLORS.length]
}

// ── Sub-components ────────────────────────────────────────────────────────────

const LogoCell = defineComponent({
  props: ['logo', 'color', 'name'],
  setup(props) {
    const failed = ref(false)
    return () => (props.logo && !failed.value)
      ? h('img', {
          src: props.logo,
          class: 'w-11 h-11 rounded-xl object-contain bg-white p-1 flex-shrink-0 border',
          style: 'border-color:var(--border)',
          onError: () => { failed.value = true }
        })
      : h('div', {
          class: 'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-xs',
          style: { background: props.color }
        }, props.name.slice(0, 2).toUpperCase())
  }
})

const InstrumentRow = defineComponent({
  props: ['logo', 'color', 'name', 'sub', 'rate', 'rateLabel'],
  setup(props, { slots }) {
    return () => h('div', {
      class: 'flex items-center gap-4 p-4 rounded-2xl border transition-colors',
      style: { borderColor: 'var(--border)', background: 'var(--surface)' }
    }, [
      // Logo
      h(LogoCell, { logo: props.logo, color: props.color, name: props.name }),
      // Left info
      h('div', { class: 'flex-1 min-w-0' }, [
        h('p', { class: 'font-semibold text-sm truncate', style: { color: 'var(--text)' } }, props.name),
        h('p', { class: 'text-xs truncate mt-0.5', style: { color: 'var(--text-3)' } }, props.sub),
        h('div', { class: 'flex items-center gap-1.5 mt-1.5 flex-wrap' }, slots.badges?.()),
      ]),
      // Right: rate
      h('div', { class: 'text-right flex-shrink-0' }, [
        h('p', { class: 'text-xl font-black tabular-nums text-emerald-500' }, `${Number(props.rate).toFixed(2)}%`),
        h('p', { class: 'text-[10px] font-semibold uppercase tracking-wider', style: { color: 'var(--text-3)' } }, props.rateLabel),
        h('p', { class: 'text-[10px] mt-0.5', style: { color: 'var(--text-3)' } }, slots.date?.()),
      ])
    ])
  }
})

const SectionTitle = defineComponent({
  props: ['title', 'subtitle'],
  setup(props) {
    return () => h('div', { class: 'mb-4' }, [
      h('h2', { class: 'font-bold text-base', style: { color: 'var(--text)' } }, props.title),
      h('p', { class: 'text-xs mt-0.5', style: { color: 'var(--text-3)' } }, props.subtitle),
    ])
  }
})

const DataNote = defineComponent({
  props: ['text'],
  setup(props) {
    return () => h('p', {
      class: 'text-[10px] mt-4 text-center font-medium uppercase tracking-wider',
      style: { color: 'var(--text-3)' }
    }, props.text)
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-blue  { background: #DBEAFE; color: #1D4ED8; }
.badge-gray  { background: var(--surface-2); color: var(--text-3); }
.badge-green { background: #D1FAE5; color: #065F46; }
.dark .badge-blue  { background: #1E3A5F; color: #93C5FD; }
.dark .badge-gray  { background: var(--surface-2); color: var(--text-3); }
.dark .badge-green { background: #064E3B; color: #6EE7B7; }
</style>
