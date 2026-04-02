<template>
  <Transition name="slide-up">
    <div
      v-if="!hasConsented"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 shadow-2xl border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    >
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>Aviso de Cookies:</strong> Utilizamos cookies propias y de terceros (incluido Google AdSense) para personalizar el contenido, mostrar anuncios relevantes y analizar nuestro tráfico. 
            Al continuar navegando, aceptas el uso de cookies. 
            <RouterLink to="/privacidad" class="underline font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
              Leer Política de Privacidad
            </RouterLink>.
          </p>
        </div>

        <div class="flex flex-shrink-0 gap-3 w-full sm:w-auto">
          <button
            @click="acceptCookies"
            class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-sm w-full sm:w-auto hover:brightness-110"
            style="background: var(--brand);"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const hasConsented = ref(true) // prevent hydration flash

onMounted(() => {
  hasConsented.value = localStorage.getItem('dolito-cookie-consent') === 'true'
})

function acceptCookies() {
  localStorage.setItem('dolito-cookie-consent', 'true')
  hasConsented.value = true
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
