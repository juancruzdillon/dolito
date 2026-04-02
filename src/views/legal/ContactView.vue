<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    
    <div>
      <h1 class="text-3xl font-bold mb-2" :style="{ color: 'var(--text)' }">Contacto</h1>
      <p class="text-sm" :style="{ color: 'var(--text-3)' }">Estamos para escucharte</p>
    </div>

    <div class="space-y-6 text-sm" :style="{ color: 'var(--text-2)' }">
      <section>
        <p class="mb-3 text-base">
          Si tenés dudas, consultas, sugerencias comerciales, o querés reportar un problema en la información que mostramos en la web, podés contactarnos enviando un correo a la siguiente dirección:
        </p>

        <div class="p-6 rounded-xl border flex items-center gap-4 my-6" :style="{ borderColor: 'var(--border)', background: 'var(--surface)' }">
          <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--brand-bg)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--brand)">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </div>
          <div>
            <p class="font-bold text-lg" :style="{ color: 'var(--text)' }">juancruzdillon123@gmail.com</p>
            <p :style="{ color: 'var(--text-3)' }">Intentaremos responderte dentro de las 48 horas hábiles.</p>
          </div>
        </div>

        <p>
          Por favor, no mandes consultas de asesoramiento financiero directo, ya que por regulaciones legales nuestro sitio ofrece información meramente educativa, no recomendaciones explícitas de inversión.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
</script>
