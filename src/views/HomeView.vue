<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

    <!-- Error -->
    <div
      v-if="store.error"
      class="rounded-xl p-4 text-sm flex items-center gap-2 border"
      style="background: var(--amber-bg); color: var(--amber); border-color: rgba(180,83,9,.25);"
    >
      <AlertCircle :size="15" class="flex-shrink-0" />
      {{ store.error }}
    </div>

    <!-- Skeleton loading -->
    <div v-if="store.loading && !store.rates.length" class="space-y-6 animate-pulse">
      <div class="h-28 rounded-2xl" style="background: var(--border);"></div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="i in 7" :key="i" class="h-32 rounded-2xl" style="background: var(--border);"></div>
      </div>
    </div>

    <template v-else>
      <!-- Banner mejor cotización -->
      <BestRateBanner />

      <!-- Cotizaciones -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold" :style="{ color: 'var(--text)' }">Cotizaciones</h2>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">Actualización cada 5 minutos</p>
          </div>
          <span v-if="store.lastUpdated" class="text-xs" :style="{ color: 'var(--text-3)' }">
            {{ store.lastUpdated }}
          </span>
        </div>

        <!-- Grid: 1 col mobile, 2 sm, 3 md, 4 lg -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <RateCard
            v-for="rate in orderedRates"
            :key="rate.casa"
            :rate="rate"
            :oficial-venta="store.oficialRate?.venta"
            :is-best="store.bestBuyRate?.casa === rate.casa"
          />
        </div>
      </section>

      <!-- Separador MEP -->
      <div class="flex items-center gap-4">
        <div class="flex-1 h-px" style="background: var(--border);"></div>
        <span class="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" :style="{ color: 'var(--text-3)' }">
          Dólar MEP con comisiones reales
        </span>
        <div class="flex-1 h-px" style="background: var(--border);"></div>
      </div>

      <!-- MEP -->
      <MEPSection />

      <!-- Herramientas (Featured calculators) -->
      <ToolsSection />

      <!-- Quick links -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="card-hover p-4 sm:p-5 flex items-center gap-4 group"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            :style="{ background: link.bg }"
          >
            <component :is="link.icon" :size="18" :style="{ color: link.iconColor }" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text)' }">{{ link.label }}</p>
            <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">{{ link.desc }}</p>
          </div>
          <ArrowRight :size="15" class="flex-shrink-0 opacity-30 group-hover:opacity-80 transition-opacity" :style="{ color: 'var(--text)' }" />
        </RouterLink>
      </section>

      <!-- Educational SEO Content -->
      <section class="mt-12 pt-8 border-t" :style="{ borderColor: 'var(--border)' }">
        <h2 class="text-xl font-bold mb-4" :style="{ color: 'var(--text)' }">Guía Rápida: Entendiendo el Dólar en Argentina</h2>
        <div class="space-y-6 text-sm leading-relaxed" :style="{ color: 'var(--text-2)' }">
          
          <div>
            <h3 class="font-semibold text-base mb-1" :style="{ color: 'var(--text)' }">¿Qué es el Dólar Blue?</h3>
            <p>El término <strong>Dólar Blue</strong> —también conocido como paralelo o informal— se refiere al dólar estadounidense que se compra y vende en el mercado no oficial (cuevas cambiarias o 'arbolitos'). Debido a las restricciones cambiarias vigentes, su valor suele ser superior al oficial y actúa como un termómetro de las expectativas económicas en el país.</p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-1" :style="{ color: 'var(--text)' }">¿Qué es el Dólar MEP (Bolsa)?</h3>
            <p>El <strong>Dólar MEP</strong> (Mercado Electrónico de Pagos) es una forma 100% legal de adquirir dólares sin los límites de compra del mercado oficial. Consiste en la compra de un bono en pesos (generalmente AL30 o GD30) y su posterior venta en dólares. En Dolito, calculamos las cotizaciones MEP incorporando las comisiones reales de los principales brokers de Argentina, para que sepas exactamente cuántos dólares recibirás.</p>
          </div>

          <div>
            <h3 class="font-semibold text-base mb-1" :style="{ color: 'var(--text)' }">¿Por qué hay tantas cotizaciones?</h3>
            <p>Argentina posee un régimen de control de cambios (el "cepo"). Esto genera un mercado desdoblado donde conviven el mercado mayorista (para exportadores/importadores), el mercado minorista, y distintas alternativas para dolarizarse indirectamente (MEP o CCL) que varían según el volumen, la legalidad y la accesibilidad para el ciudadano común.</p>
          </div>

          <p class="text-xs italic" :style="{ color: 'var(--text-3)' }">
            Nota: Toda la información provista en esta plataforma es referencial y obtenida a través de promedios de mercado o APIs públicas como DolarAPI y ArgentinaDatos. Ver <RouterLink to="/terminos" class="underline hover:text-brand-500" :style="{ color: 'var(--brand)' }">Términos y Condiciones</RouterLink> para más detalles.
          </p>

        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AlertCircle, LineChart, Calculator, BookOpen, ArrowRight } from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'
import BestRateBanner from '@/components/home/BestRateBanner.vue'
import RateCard from '@/components/home/RateCard.vue'
import MEPSection from '@/components/home/MEPSection.vue'
import ToolsSection from '@/components/home/ToolsSection.vue'

const store = useDolarStore()

const ORDER = ['oficial','blue','bolsa','contadoconliqui','mayorista','tarjeta','cripto']
const orderedRates = computed(() =>
  [...store.rates].sort((a, b) => {
    const ai = ORDER.indexOf(a.casa), bi = ORDER.indexOf(b.casa)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
)

const quickLinks = [
  {
    to: '/historico',    label: 'Histórico de precios', desc: 'Evolución de cada cotización',
    icon: LineChart,     bg: 'var(--brand-bg)',          iconColor: 'var(--brand)',
  },
  {
    to: '/calculadoras', label: 'Calculadoras',          desc: 'Plazos fijos, LECAP, bonos',
    icon: Calculator,    bg: 'var(--green-bg)',           iconColor: 'var(--green)',
  },
  {
    to: '/aprender',     label: 'Aprender a invertir',   desc: 'Guía para el argentino que quiere entrar en finanzas y no sabe cómo',
    icon: BookOpen,      bg: 'rgba(139,92,246,.12)',      iconColor: '#8b5cf6',
  },
]
</script>
