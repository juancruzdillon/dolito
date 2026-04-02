<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    
    <div>
      <h1 class="text-3xl font-bold mb-2" :style="{ color: 'var(--text)' }">Términos y Condiciones</h1>
      <p class="text-sm" :style="{ color: 'var(--text-3)' }">Última actualización: {{ new Date().toLocaleDateString('es-AR') }}</p>
    </div>

    <div class="space-y-6 text-sm" :style="{ color: 'var(--text-2)' }">
      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">1. Aceptación de los Términos</h2>
        <p class="mb-3">
          Al acceder o utilizar Dolito.ar ("el sitio"), aceptas estar sujeto a estos Términos y Condiciones de uso, así como a todas las leyes aplicables. Si no estás de acuerdo con alguno de estos términos, te pedimos que dejes de usar el sitio.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">2. Naturaleza Informativa y Educativa</h2>
        <p class="mb-3">
          Toda la información proporcionada en Dolito, incluyendo cotizaciones del dólar, calculadoras financieras, tasas de interés y noticias de mercado, tiene propósitos exclusiva y estrictamente <strong>informativos y educativos</strong>.
        </p>
        <p class="font-bold underline mb-3 text-red-500">
          Dolito NO constituye asesoramiento financiero, de inversión, fiscal ni legal.
        </p>
        <p class="mb-3">
          No somos asesores financieros ni agentes de bolsa registrados. Las decisiones basadas en la información proporcionada en el sitio web corren bajo propio riesgo del usuario, y bajo ninguna circunstancia la información será considerada como una recomendación para comprar, vender o retener activos financieros.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">3. Exactitud de la Información</h2>
        <p class="mb-3">
          Hacemos todo lo posible por extraer y calcular la información a partir de fuentes de terceros y APIs públicas reconocidas (como dolarapi.com y argentinadatos.com). Sin embargo, el mercado es volátil y los precios cambian segundo a segundo; por lo tanto, no garantizamos que la información sea 100% precisa, completa o actual.
        </p>
        <p>
          Las comisiones reales calculadas para los brokers MEP son estimaciones hechas considerando las políticas documentadas por cada Sociedad de Bolsa. Las políticas reales pueden cambiar sin previo aviso. Siempre verifica con la fuente original antes de realizar transacciones.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">4. Limitación de Responsabilidad</h2>
        <p class="mb-3">
          En ningún caso Dolito, ni sus proveedores, serán responsables por ningún daño emergente, incidental, especial, directo o indirecto, pérdida de datos, lucro cesante o pérdidas derivadas debido a la confianza depositada en la información presentada o al uso (o incapacidad de uso) de nuestro sitio.
        </p>
      </section>

      <div class="mt-10 pt-6 border-t" :style="{ borderColor: 'var(--border)' }">
        <p>Para mayor información, consulta nuestra Política de Privacidad, o ponte en contacto en la sección correspondiente.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
