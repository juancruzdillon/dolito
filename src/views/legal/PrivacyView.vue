<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    
    <div>
      <h1 class="text-3xl font-bold mb-2" :style="{ color: 'var(--text)' }">Política de Privacidad</h1>
      <p class="text-sm" :style="{ color: 'var(--text-3)' }">Última actualización: {{ new Date().toLocaleDateString('es-AR') }}</p>
    </div>

    <div class="space-y-6 text-sm" :style="{ color: 'var(--text-2)' }">
      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">1. Información que recopilamos</h2>
        <p class="mb-3">
          En Dolito ("nosotros", "nuestro"), estamos comprometidos a proteger tu privacidad. No requerimos que te registres ni proporciones datos personales identificables para consultar las cotizaciones y calculadoras.
        </p>
        <p>
          Sin embargo, recopilamos información no personal que los navegadores web y servidores ponen a disposición habitualmente, como el tipo de navegador, la preferencia de idioma, el sitio de referencia y la fecha y hora de cada solicitud de visitante, con la finalidad de entender mejor cómo nuestros visitantes usan el sitio.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">2. Uso de Cookies y Publicidad de Google AdSense</h2>
        <p class="mb-3">
          Este sitio utiliza cookies para personalizar el contenido y los anuncios, proporcionar funciones de redes sociales y analizar nuestro tráfico. También compartimos información sobre cómo usas nuestro sitio con nuestros partners de analítica y publicidad, incluido Google AdSense.
        </p>
        <ul class="list-disc pl-5 space-y-2 mb-3">
          <li>Los proveedores de terceros, incluido Google, utilizan cookies para mostrar anuncios relevantes basándose en las visitas anteriores de un usuario a su sitio web o a otros sitios en Internet.</li>
          <li>El uso de cookies de publicidad permite a Google y a sus socios mostrar anuncios a nuestros usuarios basados en su visita a nuestros sitios y/o a otros sitios en Internet.</li>
          <li>Los usuarios pueden inhabilitar la publicidad personalizada. Para ello, deberán acceder a <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline" :style="{ color: 'var(--brand)' }">Configuración de anuncios</a>.</li>
        </ul>
        <p>
          Las cookies DART son utilizadas por Google para servir publicidad. Si deseas optar por no utilizar cookies DART o inhabilitar de manera más general la publicidad conductual de terceros, puedes visitar <a href="https://aboutads.info/" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline" :style="{ color: 'var(--brand)' }">aboutads.info</a>.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">3. Enlaces de Terceros</h2>
        <p>
          Ocasionalmente, a nuestra discreción, podemos incluir o referenciar servicios de terceros (como brokers o cotizaciones) en nuestro sitio web. Estos sitios tienen políticas de privacidad separadas e independientes. Por lo tanto, no tenemos responsabilidad alguna sobre el contenido y las actividades de esos sitios enlazados.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3" :style="{ color: 'var(--text)' }">4. Cambios en la Política</h2>
        <p>
          Nos reservamos el derecho de actualizar o cambiar nuestra Política de Privacidad en cualquier momento. Si realizamos cambios sustanciales en la forma en que tratamos la información personal, lo notificaremos mediante un aviso destacado en nuestro sitio web. Al continuar usando nuestro sitio, aceptas automáticamente las nuevas políticas.
        </p>
      </section>

      <div class="mt-10 pt-6 border-t" :style="{ borderColor: 'var(--border)' }">
        <p>Si tienes alguna pregunta sobre nuestras Políticas de Privacidad, puedes contactarnos visitando nuestra página de <RouterLink to="/contacto" class="underline hover:text-brand-500" :style="{ color: 'var(--brand)' }">Contacto</RouterLink>.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
