<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
    :style="{ background: 'color-mix(in srgb, var(--surface) 85%, transparent)', borderColor: 'var(--border)' }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 gap-4">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 flex-shrink-0 group">
          <div class="relative w-8 h-8 transition-transform group-hover:scale-105 duration-300">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <rect width="48" height="48" rx="14" fill="#0EA47A"/>
              <path d="M24 8 V40" stroke="white" stroke-width="4.5" stroke-linecap="round" />
              <path d="M31 16 C31 11.5, 17 11.5, 17 19 C17 26.5, 31 24.5, 31 31 C31 38.5, 17 38.5, 17 34" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none" />
            </svg>
          </div>
          <div class="flex items-baseline gap-0.5">
            <span
              class="font-black text-xl tracking-tight leading-none transition-colors"
              :style="{ color: 'var(--text)' }"
            >dol</span>
            <span class="font-black text-xl tracking-tight leading-none" style="color: var(--brand)">ito</span>
          </div>
        </RouterLink>

        <!-- Nav desktop -->
        <nav class="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            :style="{ color: 'var(--text-2)' }"
            active-class="!font-semibold"
            :class="'nav-link'"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <!-- Derecha: estado + dark toggle + refresh -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Indicador en vivo (solo desktop) -->
          <div
            v-if="store.lastUpdated"
            class="hidden lg:flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border"
            :style="{ color: 'var(--text-3)', borderColor: 'var(--border)', background: 'var(--surface-2)' }"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow flex-shrink-0"></span>
            {{ store.lastUpdated }}
          </div>

          <!-- Botón refresh -->
          <button
            @click="store.fetchRates(true)"
            class="btn-ghost p-2 rounded-xl"
            :class="{ 'opacity-40 pointer-events-none': store.loading }"
            title="Actualizar cotizaciones"
          >
            <RefreshCw :size="15" :class="{ 'animate-spin': store.loading }" />
          </button>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDark()"
            class="btn-ghost p-2 rounded-xl"
            :title="isDark ? 'Modo claro' : 'Modo oscuro'"
          >
            <Sun  v-if="isDark" :size="16" />
            <Moon v-else        :size="16" />
          </button>

          <!-- Hamburger mobile -->
          <button
            class="md:hidden btn-ghost p-2 rounded-xl"
            @click="mobileOpen = !mobileOpen"
          >
            <Menu v-if="!mobileOpen" :size="18" />
            <X    v-else            :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide">
      <div
        v-if="mobileOpen"
        class="md:hidden border-t"
        :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }"
      >
        <nav class="flex flex-col px-4 py-3 gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            :style="{ color: 'var(--text-2)' }"
            active-class="!font-semibold"
            @click="mobileOpen = false"
          >
            <component :is="link.icon" :size="15" />
            {{ link.label }}
          </RouterLink>

          <!-- Divisor -->
          <div class="my-1 border-t" :style="{ borderColor: 'var(--border)' }"></div>

          <!-- Estado en mobile -->
          <div
            v-if="store.lastUpdated"
            class="flex items-center gap-2 px-3 py-2 text-xs"
            :style="{ color: 'var(--text-3)' }"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Actualizado {{ store.lastUpdated }}
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, inject } from 'vue'
import { RefreshCw, Menu, X, Moon, Sun, Home, BarChart2, GitCompare, Calculator, BookOpen, Building } from 'lucide-vue-next'
import { useDolarStore } from '@/stores/dolar.js'

const store      = useDolarStore()
const mobileOpen = ref(false)
const isDark     = inject('isDark')
const toggleDark = inject('toggleDark')

const navLinks = [
  { to: '/',             label: 'Inicio',       icon: Home },
  { to: '/historico',    label: 'Histórico',    icon: BarChart2 },
  { to: '/comparar',     label: 'Comparar',     icon: GitCompare },
  { to: '/calculadoras', label: 'Calculadoras', icon: Calculator },
  { to: '/hipotecarios', label: 'Hipotecarios', icon: Building },
  { to: '/aprender',     label: 'Aprender',     icon: BookOpen },
]
</script>

<style scoped>
.nav-link:hover {
  background: var(--surface-2);
  color: var(--text) !important;
}
.router-link-active.nav-link,
.router-link-exact-active.nav-link {
  background: var(--brand-bg);
  color: var(--brand) !important;
}

.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
