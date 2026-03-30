<template>
  <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200" style="background-color: var(--bg); color: var(--text);">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-12 text-center sm:text-left">
        <h1 class="text-4xl font-black mb-3 tracking-tight">Créditos Hipotecarios</h1>
        <p style="color: var(--text-2);">Encontrá el banco que menos te cobra para comprar tu casa.</p>
      </header>

      <!-- Toggle & Filters -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 p-6 rounded-3xl border gap-4" style="background-color: var(--surface); border-color: var(--border);">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl" style="background-color: var(--brand-bg); color: var(--brand);">💼</div>
          <div>
            <p class="text-sm font-bold">¿Cobrás el sueldo en el banco?</p>
            <p class="text-xs" style="color: var(--text-3);">Muchos bancos te descuentan tasa si sos cliente.</p>
          </div>
        </div>
        <button 
          @click="store.showSalaryRates = !store.showSalaryRates"
          class="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
          :style="{ backgroundColor: store.showSalaryRates ? 'var(--brand)' : 'var(--border-2)' }"
        >
          <span 
            class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="store.showSalaryRates ? 'translate-x-6' : 'translate-x-0'"
          ></span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 class="animate-spin mb-4" :size="40" style="color: var(--brand);" />
        <p class="text-sm font-bold animate-pulse">Buscando las mejores tasas...</p>
      </div>

      <!-- Mortgage Cards List (Deduplicated & Paginated) -->
      <div v-else class="space-y-4 mb-10">
        <div 
          v-for="bank in store.paginatedRates" 
          :key="bank.id"
          class="card-hover overflow-hidden"
          :class="{ 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-transparent': bank.highlight }"
        >
          <div class="flex flex-col sm:flex-row items-center p-6 gap-6">
            <!-- Left: Bank Logo -->
            <div class="flex-shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 shadow-inner border" style="border-color: var(--border);">
              <img 
                v-if="bank.logo" 
                :src="getLogoUrl(bank.logo)" 
                :alt="bank.bankName" 
                class="max-w-full max-h-full object-contain"
                @error="handleImageError"
              />
              <Building v-else style="color: var(--text-3);" :size="28" />
            </div>

            <!-- Center: Simple Info -->
            <div class="flex-1 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h3 class="text-xl font-bold">{{ bank.bankName }}</h3>
                <span v-if="bank.isSalaryAccount" class="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest text-white shadow-sm" style="background-color: var(--brand);">Sueldo</span>
              </div>
              <div class="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-medium">
                <div class="flex items-center gap-1.5" style="color: var(--text-2);">
                  <div class="w-1.5 h-1.5 rounded-full" style="background-color: var(--brand);"></div>
                  Hasta {{ bank.term }}
                </div>
                <div class="flex items-center gap-1.5" style="color: var(--text-2);">
                  <div class="w-1.5 h-1.5 rounded-full" style="background-color: var(--brand);"></div>
                  Te prestan el {{ bank.financing }}
                </div>
              </div>
            </div>

            <!-- Right: The "Cost" (ELI5) -->
            <div class="flex flex-col items-center sm:items-end flex-shrink-0">
              <div class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-3);">Lo que pagás extra</div>
              <div class="text-4xl font-black leading-none flex items-baseline gap-1" style="color: var(--green);">
                {{ (bank.tna || 0).toFixed(1) }}%
                <span class="text-xs font-bold uppercase" style="color: var(--text-3);">anual</span>
              </div>
              <p class="text-[10px] mt-2 font-medium" style="color: var(--text-3);">Tasa fija + ajuste UVA</p>
            </div>
          </div>
        </div>

        <!-- Pagination: Load More -->
        <div v-if="store.hasMore" class="flex justify-center pt-6">
          <button @click="store.loadMore" class="btn-secondary group">
            Ver más bancos
            <ChevronDown class="group-hover:translate-y-0.5 transition-transform" :size="16" />
          </button>
        </div>
      </div>

      <!-- Comparison Chart (Simple Ranking) -->
      <div v-if="!store.loading && store.filteredRates.length > 0" class="card p-8 mb-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold">Ranking de conveniencia</h2>
            <p class="text-sm mt-1" style="color: var(--text-3);">Las tasas más bajas del mercado.</p>
          </div>
          <BarChart3 style="color: var(--text-3);" :size="24" />
        </div>

        <div class="space-y-6">
          <div v-for="bank in store.filteredRates.slice(0, 10)" :key="'chart-'+bank.id" class="group/bar">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border" style="border-color: var(--border);">
                  <img v-if="bank.logo" :src="getLogoUrl(bank.logo)" class="max-w-full max-h-full object-contain" />
                  <Building v-else style="color: var(--text-3);" :size="14" />
                </div>
                <span class="text-sm font-bold" style="color: var(--text-2);">{{ bank.bankName }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-black" style="color: var(--green);">{{ (bank.tna || 0).toFixed(1) }}%</span>
                <span class="text-[8px] block uppercase font-bold" style="color: var(--text-3);">TNA</span>
              </div>
            </div>
            <div class="w-full h-3 rounded-full overflow-hidden p-[1px] relative" style="background-color: var(--surface-2); border: 1px solid var(--border);">
              <div 
                class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,201,144,0.2)]"
                style="background-color: var(--brand);"
                :style="{ width: `${(bank.tna / maxTna) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ELI5 Guide -->
      <section class="max-w-3xl mx-auto space-y-12">
        <div class="text-center">
          <h2 class="text-3xl font-black">¿Cómo funciona esto?</h2>
          <p class="mt-2" style="color: var(--text-3);">Explicado para que lo entienda cualquiera.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="text-4xl">🧱</div>
            <h3 class="text-xl font-bold">El "UVA" son ladrillos</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-2);">
              Imaginate que el banco no te presta pesos, sino <strong>ladrillos virtuales</strong>. Si debés 10.000 ladrillos, siempre debés esa cantidad. Lo que cambia es cuánto vale cada ladrillo por la inflación.
            </p>
          </div>
          <div class="space-y-4">
            <div class="text-4xl">📉</div>
            <h3 class="text-xl font-bold">La tasa es el "alquiler"</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-2);">
              Ese porcentaje que ves (ej: 5.0%) es lo que el banco te cobra por prestarte sus ladrillos. Es como un alquiler extra que pagás sobre tu deuda. <strong>Cuanto más bajo ese número, menos pagás.</strong>
            </p>
          </div>
        </div>
      </section>

      <!-- Footer Info -->
      <footer class="mt-20 pt-8 border-t text-center" style="border-color: var(--border);">
        <p class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--text-3);">
          Última actualización: {{ store.lastUpdated || 'Hoy' }} &bull; BCRA Transparencia
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useMortgageStore } from '@/stores/mortgages.js'
import { BarChart3, Building, Loader2, ChevronDown } from 'lucide-vue-next'

const store = useMortgageStore()

const maxTna = computed(() => {
  const values = store.filteredRates.map(r => r.tna)
  return Math.max(...values, 1)
})

function getLogoUrl(filename) {
  try {
    return new URL(`../assets/images/logos/${filename}`, import.meta.url).href
  } catch (e) {
    return null
  }
}

function handleImageError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling?.classList.remove('hidden')
}

onMounted(() => {
  store.fetchMortgageRates()
})
</script>

<style scoped>
.tracking-tight { letter-spacing: -0.05em; }
</style>
