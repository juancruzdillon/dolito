<template>
  <footer class="border-t mt-16 transition-colors" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <!-- Brand -->
        <div>
          <div class="flex items-baseline gap-0.5 mb-1.5">
            <span class="font-black text-lg tracking-tight" :style="{ color: 'var(--text)' }">dol</span>
            <span class="font-black text-lg tracking-tight" style="color: var(--brand);">ito</span>
          </div>
          <p class="text-xs max-w-xs leading-relaxed" :style="{ color: 'var(--text-3)' }">
            Información financiera referencial para argentinos. No constituye asesoramiento financiero.
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-wrap gap-8 text-xs" :style="{ color: 'var(--text-3)' }">
          <div>
            <p class="font-semibold mb-2" :style="{ color: 'var(--text-2)' }">Fuentes</p>
            <ul class="space-y-1.5">
              <li><a href="https://dolarapi.com" target="_blank" rel="noopener" class="hover:text-brand-500 transition-colors">dolarapi.com</a></li>
              <li><a href="https://api.argentinadatos.com" target="_blank" rel="noopener" class="hover:text-brand-500 transition-colors">argentinadatos.com</a></li>
            </ul>
          </div>
          <div>
            <p class="font-semibold mb-2" :style="{ color: 'var(--text-2)' }">Navegación</p>
            <ul class="space-y-1.5">
              <li><RouterLink to="/"             class="hover:text-brand-500 transition-colors">Inicio</RouterLink></li>
              <li><RouterLink to="/calculadoras" class="hover:text-brand-500 transition-colors">Calculadoras</RouterLink></li>
              <li><RouterLink to="/aprender"     class="hover:text-brand-500 transition-colors">Aprender</RouterLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t mt-6 pt-4 text-xs text-center" :style="{ borderColor: 'var(--border)', color: 'var(--text-3)' }">
        © {{ year }} Dolito
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
