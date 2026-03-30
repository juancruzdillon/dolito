<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold" :style="{ color: 'var(--text)' }">Herramientas financieras</h2>
        <p class="text-xs mt-0.5" :style="{ color: 'var(--text-3)' }">Simuladores y calculadoras para tus finanzas</p>
      </div>
      <RouterLink to="/calculadoras" class="text-xs font-bold hover:underline" :style="{ color: 'var(--brand)' }">Ver todas</RouterLink>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <RouterLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="group relative p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
        :style="{ background: 'var(--surface)', borderColor: 'var(--border)' }"
      >
        <!-- Background Decoration -->
        <div 
          class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
          :style="{ color: tool.color }"
        >
          <component :is="tool.icon" :size="80" />
        </div>

        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          :style="{ background: tool.bg }"
        >
          <component :is="tool.icon" :size="20" :style="{ color: tool.color }" />
        </div>

        <h3 class="font-bold text-sm sm:text-base mb-1" :style="{ color: 'var(--text)' }">
          {{ tool.title }}
        </h3>
        <p class="text-[10px] sm:text-xs leading-relaxed" :style="{ color: 'var(--text-3)' }">
          {{ tool.desc }}
        </p>
        
        <div class="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" :style="{ color: tool.color }">
          Calcular <ArrowRight :size="12" />
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { 
  Key, 
  PiggyBank, 
  Building2, 
  TrendingUp,
  ArrowRight
} from 'lucide-vue-next'

const tools = [
  {
    title: 'Alquileres',
    desc: 'Calculá el aumento por ICL o IPC',
    icon: Key,
    to: '/calculadoras?tab=alquiler',
    bg: 'var(--green-bg)',
    color: 'var(--green)'
  },
  {
    title: 'Plazo Fijo',
    desc: 'Simulá intereses y rendimiento TEA',
    icon: PiggyBank,
    to: '/calculadoras?tab=plazofijo',
    bg: 'var(--brand-bg)',
    color: 'var(--brand)'
  },
  {
    title: 'Hipotecarios',
    desc: 'Simulador UVA y cuotas proyectadas',
    icon: Building2,
    to: '/hipotecarios',
    bg: 'rgba(79,70,229,.1)',
    color: '#4F46E5'
  },
  {
    title: 'LECAP/Bonos',
    desc: 'Rendimiento de deudas en pesos',
    icon: TrendingUp,
    to: '/calculadoras?tab=lecap',
    bg: 'rgba(245,158,11,.1)',
    color: '#F59E0B'
  }
]
</script>
