<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    
    <div>
      <h1 class="text-3xl font-bold mb-2" :style="{ color: 'var(--text)' }">Sobre Nosotros</h1>
      <p class="text-sm" :style="{ color: 'var(--text-3)' }">Conocé la misión de Dolito</p>
    </div>

    <div class="space-y-6 text-sm" :style="{ color: 'var(--text-2)' }">
      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">¿Qué es Dolito?</h2>
        <p class="mb-3">
          Dolito es una plataforma web desarrollada para acercar la educación e información financiera al argentino promedio, de manera clara, concisa y sin jerga técnica innecesaria. Nuestro objetivo es simplificar el complejo mundo cambiario de Argentina.
        </p>
        <p class="mb-3">
          Nacimos con la intención de brindar transparencia frente a la multiplicidad de tipos de cambio vigentes en el país (oficial, blue, MEP, contado con liquidación y solidario). 
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">Nuestro Propósito</h2>
        <p class="mb-3">
          En Dolito creemos que el acceso a información financiera transparente es un derecho. Proveemos:
        </p>
        <ul class="list-disc pl-5 space-y-2 mb-3">
          <li><strong>Cotizaciones en tiempo real:</strong> Extraídas de fuentes públicas y confiables para que tengas la foto más actual del mercado.</li>
          <li><strong>Transparencia en comisiones:</strong> Somos el único sitio que desmenuza las comisiones reales de dólar MEP por cada broker (Sociedad de Bolsa) para que no te lleves sorpresas al invertir.</li>
          <li><strong>Calculadoras prácticas:</strong> Herramientas para comparar rendimientos de Plazos Fijos, cuentas remuneradas y opciones alternativas sin necesidad de sacar tu propia calculadora.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">Nuestro Equipo</h2>
        <p class="mb-3">
          Dolito fue concebido y desarrollado en Argentina por entusiastas de la tecnología y la educación financiera. Nos enorgullecemos de ofrecer herramientas de acceso libre y gratuito. Apoyándonos en APIs desarrolladas por la comunidad (como DolarAPI y ArgentinaDatos), buscamos democratizar el acceso al mercado de capitales local.
        </p>
      </section>

      <div class="mt-10 pt-6 border-t" :style="{ borderColor: 'var(--border)' }">
        <p>¿Tenés alguna sugerencia o encontraste un error en la información? Por favor, dirígete a nuestra página de <RouterLink to="/contacto" class="underline hover:text-brand-500" :style="{ color: 'var(--brand)' }">Contacto</RouterLink> y te responderemos a la brevedad.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
