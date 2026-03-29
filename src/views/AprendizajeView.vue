<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="section-title text-3xl">Aprender a invertir</h1>
      <p class="section-subtitle">Guía completa para el argentino que quiere empezar — sin tecnicismos innecesarios</p>
    </div>

    <!-- Track selector -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      <button
        v-for="track in tracks"
        :key="track.id"
        @click="activeSection = track.sections[0]"
        class="card p-4 text-left transition-all hover:shadow-card-hover hover:-translate-y-0.5"
        :class="activeSection && track.sections.includes(activeSection) ? 'ring-2 ring-brand-500' : ''"
      >
        <span class="text-2xl mb-2 block">{{ track.emoji }}</span>
        <p class="font-semibold text-sm text-slate-900">{{ track.label }}</p>
        <p class="text-xs text-slate-400 mt-0.5">{{ track.desc }}</p>
      </button>
    </div>

    <!-- Sidebar + content layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar -->
      <aside class="lg:w-56 flex-shrink-0">
        <div class="card p-3 space-y-0.5 sticky top-20">
          <template v-for="section in allSections" :key="section.id">
            <div v-if="section.divider" class="pt-2 pb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {{ section.divider }}
            </div>
            <button
              v-else
              @click="activeSection = section.id"
              class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
              :class="activeSection === section.id
                ? 'bg-brand-50 text-brand-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            >
              {{ section.label }}
            </button>
          </template>
        </div>
      </aside>

      <!-- Content -->
      <div class="flex-1 min-w-0">

        <!-- ── TIPOS DE DÓLAR ── -->
        <div v-if="activeSection === 'tipos-dolar'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Los tipos de dólar en Argentina</h2>
          <p class="text-slate-500 text-sm leading-relaxed">
            En Argentina existen múltiples cotizaciones del dólar según cómo y para qué lo comprás.
            Entenderlos es clave para no perder plata sin saberlo.
          </p>

          <div v-for="tipo in tiposDolar" :key="tipo.nombre" class="card p-5">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" :class="tipo.bgColor">
                {{ tipo.icon }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-slate-900">{{ tipo.nombre }}</h3>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="tipo.legalClass">{{ tipo.legal }}</span>
                </div>
                <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ tipo.descripcion }}</p>
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div v-if="tipo.comoPuedoComprarlo" class="p-3 bg-slate-50 rounded-lg">
                    <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">¿Cómo se compra?</p>
                    <p class="text-xs text-slate-600">{{ tipo.comoPuedoComprarlo }}</p>
                  </div>
                  <div v-if="tipo.limite" class="p-3 bg-amber-50 rounded-lg">
                    <p class="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">Límites / Restricciones</p>
                    <p class="text-xs text-amber-800">{{ tipo.limite }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── ABRIR CUENTA ── -->
        <div v-if="activeSection === 'abrir-cuenta'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Paso 1: Abrir una cuenta en un broker</h2>
          <p class="text-slate-500 text-sm leading-relaxed">
            Para invertir en Argentina necesitás una cuenta comitente en un Agente de Liquidación y Compensación (ALyC), comúnmente llamado "broker".
            Es gratis, lleva minutos y se hace 100% online.
          </p>

          <div class="p-4 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-800">
            <strong>¿Cuál elegir?</strong> Para empezar, te recomendamos <strong>Invertir Online (IOL)</strong> o <strong>Cocos Capital</strong>.
            IOL tiene bajas comisiones; Cocos tiene una app muy amigable para principiantes.
          </div>

          <div v-for="(paso, i) in pasosAbrirCuenta" :key="i" class="card p-5">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {{ i + 1 }}
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ paso.titulo }}</h3>
                <p class="text-sm text-slate-500 mt-1 leading-relaxed">{{ paso.descripcion }}</p>
                <div v-if="paso.tip" class="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  💡 {{ paso.tip }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── PRIMER OPERACIÓN / MEP ── -->
        <div v-if="activeSection === 'primer-operacion'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Paso 2: Tu primera operación — Comprar dólar MEP</h2>
          <p class="text-slate-500 text-sm leading-relaxed">
            El dólar MEP es la forma más conveniente, legal y sin límite de ahorro en dólares para el argentino común.
            Acá te explicamos el proceso completo.
          </p>

          <div class="card p-5 border-l-4 border-brand-500">
            <h3 class="font-semibold text-slate-900 mb-2">¿Qué es el dólar MEP?</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              MEP significa "Mercado Electrónico de Pagos". En la práctica, es un mecanismo legal donde:
            </p>
            <ol class="mt-3 space-y-2 text-sm text-slate-600">
              <li class="flex gap-2"><span class="font-bold text-brand-600 flex-shrink-0">1.</span> Comprás un bono soberano argentino en pesos (por ejemplo, AL30 en pesos)</li>
              <li class="flex gap-2"><span class="font-bold text-brand-600 flex-shrink-0">2.</span> Esperás el "parking" obligatorio (1 día hábil, actualmente)</li>
              <li class="flex gap-2"><span class="font-bold text-brand-600 flex-shrink-0">3.</span> Vendés ese mismo bono pero en su versión dolarizada (AL30D en dólares)</li>
              <li class="flex gap-2"><span class="font-bold text-brand-600 flex-shrink-0">4.</span> Recibís los dólares en tu cuenta en el broker o podés transferirlos a tu cuenta bancaria en dólares</li>
            </ol>
          </div>

          <div class="card p-5 bg-amber-50 border border-amber-200">
            <h3 class="font-semibold text-amber-900 mb-2">⚠️ El "parking" — importante</h3>
            <p class="text-sm text-amber-800 leading-relaxed">
              Existe un período mínimo de tenencia antes de poder vender el bono en dólares.
              Actualmente es de <strong>1 día hábil</strong> (puede cambiar por normativa del BCRA/CNV).
              Significa que no podés comprar y vender el mismo día.
            </p>
          </div>

          <div class="card p-5">
            <h3 class="font-semibold text-slate-900 mb-3">¿Por qué usar Dolito para calcular el MEP?</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Cuando tu broker te muestra "Dólar MEP: $1.200", ese número es la cotización del mercado.
              Pero vos terminás pagando más porque el broker cobra comisiones en la compra del bono (en pesos)
              y en la venta (en dólares). Dolito te muestra el precio <strong>real</strong> que pagás según tu broker.
            </p>
            <RouterLink to="/" class="btn-primary mt-3 w-fit">
              Ver calculadora MEP →
            </RouterLink>
          </div>
        </div>

        <!-- ── INSTRUMENTOS ── -->
        <div v-if="activeSection === 'instrumentos'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Instrumentos de inversión</h2>
          <p class="text-slate-500 text-sm leading-relaxed">
            Del más conservador al más arriesgado. Todos son legales y accesibles desde Argentina.
          </p>

          <div v-for="inst in instrumentos" :key="inst.nombre" class="card p-5">
            <div class="flex items-start gap-3">
              <div class="text-2xl flex-shrink-0">{{ inst.icon }}</div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <h3 class="font-bold text-slate-900">{{ inst.nombre }}</h3>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Riesgo: {{ inst.riesgo }}</span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{{ inst.rendimiento }}</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">{{ inst.descripcion }}</p>
                <div class="mt-3 grid sm:grid-cols-2 gap-2">
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Para quién</p>
                    <p class="text-xs text-slate-600">{{ inst.paraQuien }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg">
                    <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Consideraciones</p>
                    <p class="text-xs text-slate-600">{{ inst.consideraciones }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── GLOSARIO ── -->
        <div v-if="activeSection === 'glosario'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Glosario financiero</h2>
          <p class="text-slate-500 text-sm">Los términos más importantes que vas a escuchar</p>

          <div class="card overflow-hidden">
            <div
              v-for="(term, i) in glosario"
              :key="term.termino"
              class="px-5 py-4 flex gap-4"
              :class="i % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
            >
              <div class="w-40 flex-shrink-0">
                <p class="font-semibold text-sm text-slate-900">{{ term.termino }}</p>
                <p v-if="term.acronimo" class="text-xs text-brand-600 font-mono">{{ term.acronimo }}</p>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ term.definicion }}</p>
            </div>
          </div>
        </div>

        <!-- ── ESTRATEGIAS ── -->
        <div v-if="activeSection === 'estrategias'" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Estrategias de inversión en Argentina</h2>
          <p class="text-slate-500 text-sm leading-relaxed">
            El contexto argentino requiere estrategias específicas. Estas son las más usadas.
          </p>

          <div v-for="est in estrategias" :key="est.nombre" class="card p-5">
            <div class="flex items-start gap-3">
              <div class="text-2xl">{{ est.icon }}</div>
              <div>
                <h3 class="font-bold text-slate-900">{{ est.nombre }}</h3>
                <p class="text-sm text-slate-600 mt-1 leading-relaxed">{{ est.descripcion }}</p>
                <ul class="mt-3 space-y-1">
                  <li v-for="punto in est.puntos" :key="punto" class="flex gap-2 text-xs text-slate-600">
                    <span class="text-brand-500 mt-0.5">→</span>
                    <span>{{ punto }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeSection = ref('tipos-dolar')

const tracks = [
  { id: 'beginner', emoji: '🌱', label: 'Principiante', desc: 'Nunca invertí, quiero empezar', sections: ['tipos-dolar', 'abrir-cuenta', 'primer-operacion'] },
  { id: 'intermediate', emoji: '📈', label: 'Intermedio', desc: 'Ya tengo cuenta, quiero optimizar', sections: ['instrumentos', 'estrategias'] },
  { id: 'reference', emoji: '📖', label: 'Referencia', desc: 'Consultar conceptos y términos', sections: ['glosario'] },
]

const allSections = [
  { divider: 'Fundamentos' },
  { id: 'tipos-dolar',       label: 'Tipos de dólar' },
  { divider: 'Paso a paso' },
  { id: 'abrir-cuenta',      label: 'Abrir una cuenta' },
  { id: 'primer-operacion',  label: 'Comprar dólar MEP' },
  { divider: 'Instrumentos' },
  { id: 'instrumentos',      label: 'Qué puedo comprar' },
  { id: 'estrategias',       label: 'Estrategias' },
  { divider: 'Referencia' },
  { id: 'glosario',          label: 'Glosario' },
]

const tiposDolar = [
  {
    nombre: 'Dólar Oficial', icon: '🏦', bgColor: 'bg-blue-100',
    legal: 'Legal · Regulado', legalClass: 'bg-blue-100 text-blue-700',
    descripcion: 'El tipo de cambio fijado (o administrado) por el Banco Central de la República Argentina (BCRA). Es el dólar "real" según el Estado. Se usa para importaciones, exportaciones y operaciones del sistema financiero formal.',
    comoPuedoComprarlo: 'Para ahorro, solo $200/mes vía home banking (cupo oficial). Para viajes y tarjeta, se aplica automaticamente.',
    limite: '$200/mes para ahorro. Muy restrictivo para el ciudadano común desde el cepo de 2019.',
  },
  {
    nombre: 'Dólar Blue', icon: '💵', bgColor: 'bg-slate-100',
    legal: 'Informal', legalClass: 'bg-orange-100 text-orange-700',
    descripcion: 'El mercado paralelo e informal del dólar. Se compra y vende en "cuevas" o entre privados en efectivo. No está regulado ni tiene respaldo legal, pero es ampliamente usado.',
    comoPuedoComprarlo: 'A través de cuevas de cambio o conocidos. No tiene respaldo legal: si te estafan, no hay recurso.',
    limite: 'Sin límite de monto, pero ilegal. Se corre riesgo de ser estafado con billetes falsos o la operación en sí.',
  },
  {
    nombre: 'Dólar MEP / Bolsa', icon: '📊', bgColor: 'bg-indigo-100',
    legal: 'Legal · Sin límite', legalClass: 'bg-emerald-100 text-emerald-700',
    descripcion: 'Se obtiene comprando un bono en pesos y vendiéndolo en su versión dolarizada. Es 100% legal, sin límite de monto y te da dólares reales en tu cuenta del broker. Generalmente tiene una cotización similar al blue.',
    comoPuedoComprarlo: 'Necesitás cuenta en un broker (ALyC) como IOL, Balanz, Cocos, Bull Market. El proceso toma 1-2 días hábiles.',
    limite: 'Sin límite de monto. Existe "parking" de 1 día hábil entre compra y venta del bono.',
  },
  {
    nombre: 'CCL — Contado con Liquidación', icon: '🌐', bgColor: 'bg-violet-100',
    legal: 'Legal', legalClass: 'bg-emerald-100 text-emerald-700',
    descripcion: 'Similar al MEP pero el bono se compra en Argentina y se vende en el exterior (bonos que cotizan en EEUU). El dinero "líquida" en el exterior, por eso el nombre. Útil para girar fondos al exterior.',
    comoPuedoComprarlo: 'Cuenta en broker + cuenta bancaria en el exterior. Proceso más complejo que el MEP.',
    limite: 'Sin límite oficial, pero la CNV puede aplicar restricciones. Suele costar más que el MEP (cotiza más alto).',
  },
  {
    nombre: 'Dólar Tarjeta', icon: '💳', bgColor: 'bg-orange-100',
    legal: 'Legal', legalClass: 'bg-emerald-100 text-emerald-700',
    descripcion: 'Se aplica automáticamente en compras en moneda extranjera con tarjeta de débito o crédito argentina. Incluye el oficial más impuestos (PAIS -eliminado en sept 2024- y percepción a cuenta de Ganancias/Bienes Personales).',
    comoPuedoComprarlo: 'Automático al pagar con tarjeta argentina en el exterior o en sitios web en dólares.',
    limite: 'La percepción del 35% es acreditable como pago a cuenta de Ganancias o Bienes Personales.',
  },
  {
    nombre: 'Dólar Cripto', icon: '₿', bgColor: 'bg-purple-100',
    legal: 'Legal (gris)', legalClass: 'bg-yellow-100 text-yellow-700',
    descripcion: 'Se obtiene comprando USDT (stablecoin) con pesos en exchanges como Binance, Lemon, Ripio, etc. El precio fluctúa con oferta y demanda. Técnicamente legal pero en una zona gris regulatoria.',
    comoPuedoComprarlo: 'Cuenta en un exchange de criptomonedas. Rápido y disponible 24/7.',
    limite: 'Sin límite. Riesgo de volatilidad de la plataforma y riesgo regulatorio.',
  },
]

const pasosAbrirCuenta = [
  {
    titulo: 'Elegí tu broker',
    descripcion: 'Registrate en el sitio web o descargá la app del broker elegido. Para principiantes recomendamos IOL (invertironline.com) o Cocos Capital (cocoscapital.com.ar). Ambos son ALyC regulados por la CNV.',
    tip: 'El registro es gratuito y no hay costo de mantenimiento de cuenta en ninguno de estos brokers.',
  },
  {
    titulo: 'Verificá tu identidad (onboarding)',
    descripcion: 'Vas a necesitar: DNI (frente y dorso), foto selfie, CUIL/CUIT y número de cuenta bancaria propia. El proceso es 100% digital y tarda entre 1 y 48 horas hábiles en ser aprobado.',
    tip: 'Asegurate que las fotos del DNI sean nítidas y que el selfie tenga buena iluminación. Esto acelera la aprobación.',
  },
  {
    titulo: 'Transferí fondos (acreditación)',
    descripcion: 'Una vez aprobada la cuenta, transferís desde tu cuenta bancaria usando el CBU/CVU del broker. La acreditación es casi inmediata (24/7 vía transferencia bancaria). No hay monto mínimo en la mayoría.',
    tip: 'Guardá el comprobante de transferencia. En caso de demora, lo vas a necesitar para hacer el reclamo.',
  },
  {
    titulo: '¡Listo para operar!',
    descripcion: 'Con el dinero acreditado ya podés comprar dólar MEP, LECAP, plazos fijos, bonos, CEDEARs y más. Todo desde la app o web del broker.',
  },
]

const instrumentos = [
  {
    icon: '🏦', nombre: 'Plazo Fijo Tradicional', riesgo: 'Muy bajo', rendimiento: 'TNA ~37% (varía)',
    descripcion: 'Depositás pesos en un banco por un plazo mínimo de 30 días a cambio de una tasa de interés fija. Es el instrumento más simple y conocido. El BCRA fija una tasa mínima de referencia.',
    paraQuien: 'Cualquier persona con cuenta bancaria. Sin conocimientos previos necesarios.',
    consideraciones: 'La tasa suele estar por debajo de la inflación, por lo que perdés poder adquisitivo en términos reales. Ideal solo para el corto plazo.',
  },
  {
    icon: '💹', nombre: 'FCI Money Market (Fondo de dinero)',
    riesgo: 'Muy bajo', rendimiento: 'Similar o mejor que PF',
    descripcion: 'Un fondo de inversión que invierte en instrumentos de cortísimo plazo (cheques, cauciones). La plata está disponible en el día. Rendimiento similar al plazo fijo pero con liquidez inmediata.',
    paraQuien: 'Ideal para tener el dinero disponible pero que "trabaje" mientras tanto.',
    consideraciones: 'No tiene plazo mínimo. No tiene garantía del SEDESA como el plazo fijo. Aun así, es muy seguro históricamente.',
  },
  {
    icon: '📄', nombre: 'LECAP — Letras de Capitalización',
    riesgo: 'Bajo', rendimiento: 'TNA fija >40%',
    descripcion: 'Letras del Tesoro Nacional a tasa fija. Se compran con descuento y al vencimiento recibís el valor nominal completo. Suelen ofrecer tasas superiores a los plazos fijos.',
    paraQuien: 'Inversores que quieren tasas fijas conocidas desde el principio, con horizonte de 1-12 meses.',
    consideraciones: 'Se operan en el mercado secundario vía broker. Tienen riesgo soberano (si el Estado no paga). Podés venderlas antes del vencimiento.',
  },
  {
    icon: '🏛️', nombre: 'Bonos Soberanos (AL30, GD30, etc.)',
    riesgo: 'Medio-alto', rendimiento: 'Variable, suele ser alto en %',
    descripcion: 'Deuda emitida por el Estado argentino. Algunos cotizan en pesos (AL30) y otros en dólares (GD30). Permiten dolarizarse vía MEP o simplemente cobrar cupones.',
    paraQuien: 'Inversores con algo de experiencia que entienden el riesgo soberano argentino.',
    consideraciones: 'Argentina tiene historial de defaults. Alto potencial de ganancia pero también de pérdida. Muy volátiles.',
  },
  {
    icon: '🌍', nombre: 'CEDEARs (acciones globales en ARS)',
    riesgo: 'Medio-alto', rendimiento: 'Variable (acompaña al exterior)',
    descripcion: 'Certificados de Depósito Argentinos que representan acciones extranjeras (Apple, Google, Tesla, etc.). Cotizan en pesos pero su precio sigue al dólar CCL, funcionando como cobertura cambiaria.',
    paraQuien: 'Quien quiere exposición a empresas globales sin salir del sistema argentino.',
    consideraciones: 'Tienen riesgo de mercado (la acción puede bajar) más riesgo cambiario. No hay límite de tenencia.',
  },
  {
    icon: '📈', nombre: 'Acciones Argentinas (Panel Merval)',
    riesgo: 'Alto', rendimiento: 'Variable, muy volátil',
    descripcion: 'Acciones de empresas que cotizan en la Bolsa de Comercio de Buenos Aires (BCBA). YPF, Banco Galicia, Telecom, Pampa Energía, etc.',
    paraQuien: 'Inversores con experiencia, horizonte largo y tolerancia a volatilidad alta.',
    consideraciones: 'Puede subir 200% o bajar 50% en el mismo año. Requiere análisis y seguimiento constante.',
  },
]

const estrategias = [
  {
    icon: '🛡️', nombre: 'Dolarización defensiva',
    descripcion: 'La estrategia más común para argentinos: transformar los ahorros en pesos a dólares para protegerse de la devaluación e inflación.',
    puntos: [
      'Usá el MEP para obtener dólares sin límite y de forma legal',
      'Comparé comisiones de brokers con Dolito antes de operar',
      'Los dólares los podés tener en el broker o transferirlos a tu caja de ahorro en dólares',
    ],
  },
  {
    icon: '⚖️', nombre: 'Cartera equilibrada en ARS',
    descripcion: 'Para quién tiene pesos y quiere rendimiento real positivo en moneda local.',
    puntos: [
      '60-70% en LECAP o FCI renta fija (tasa fija y segura)',
      '20-30% en bonos CER (ajustan por inflación)',
      '10% en liquidez (FCI money market para gastos)',
    ],
  },
  {
    icon: '🌐', nombre: 'Cobertura con CEDEARs',
    descripcion: 'Mantener una parte del portafolio en activos que ajustan por dólar CCL.',
    puntos: [
      'Los CEDEARs acompañan al dólar CCL, funcionando como cobertura',
      'Además tenés exposición a empresas globales de primer nivel',
      'Recomendado para el largo plazo (3+ años)',
    ],
  },
]

const glosario = [
  { termino: 'TNA', acronimo: 'Tasa Nominal Anual', definicion: 'La tasa de interés anual sin capitalizar. Si el banco te ofrece 40% TNA a 30 días, el interés del período es 40%/365×30 = 3.29%.' },
  { termino: 'TEA', acronimo: 'Tasa Efectiva Anual', definicion: 'La tasa real anualizada considerando la capitalización de intereses. Permite comparar instrumentos con distintas frecuencias de pago.' },
  { termino: 'TIR', acronimo: 'Tasa Interna de Retorno', definicion: 'El rendimiento efectivo de una inversión considerando todos los flujos de fondos (cupones + amortización + precio de compra). La métrica más útil para comparar bonos.' },
  { termino: 'VN', acronimo: 'Valor Nominal', definicion: 'El valor "de carátula" de un bono o letra. En Argentina, los bonos soberanos suelen tener VN de $1 o $100. Las LECAP tienen VN de $1.000.' },
  { termino: 'CER', acronimo: 'Coef. de Estabilización de Referencia', definicion: 'Índice de ajuste atado a la inflación (IPC) publicado por el BCRA. Los instrumentos CER ajustan su capital por inflación.' },
  { termino: 'MEP', acronimo: 'Mercado Electrónico de Pagos', definicion: 'Mecanismo legal para comprar dólares sin límite a través de la compra y venta de bonos en dos monedas distintas dentro del mercado bursátil.' },
  { termino: 'CCL', acronimo: 'Contado con Liquidación', definicion: 'Similar al MEP pero la venta del bono se liquida en el exterior. Sirve para girar dinero a cuentas fuera de Argentina.' },
  { termino: 'ALyC', acronimo: 'Agente de Liquidación y Compensación', definicion: 'El nombre oficial de los brokers habilitados por la CNV para operar en el mercado de capitales argentino.' },
  { termino: 'BCRA', acronimo: 'Banco Central de la República Argentina', definicion: 'El banco central que regula la política monetaria, el tipo de cambio oficial y las tasas de referencia.' },
  { termino: 'CNV', acronimo: 'Comisión Nacional de Valores', definicion: 'El organismo regulador del mercado de capitales argentino. Supervisa brokers, fondos de inversión y la bolsa.' },
  { termino: 'FCI', acronimo: 'Fondo Común de Inversión', definicion: 'Vehículo de inversión colectiva que agrupa a muchos inversores para acceder a una cartera diversificada gestionada por una sociedad gerente.' },
  { termino: 'CEDEAR', acronimo: 'Certificado de Depósito Argentino', definicion: 'Certificados que representan acciones extranjeras pero cotizan en pesos en la bolsa argentina. Su precio sigue al dólar CCL.' },
  { termino: 'Parking', acronimo: null, definicion: 'Período mínimo de tenencia obligatoria de un bono entre la compra en pesos y la venta en dólares en una operación de MEP o CCL. Actualmente 1 día hábil.' },
  { termino: 'Brecha cambiaria', acronimo: null, definicion: 'La diferencia porcentual entre el dólar oficial y cualquier otro tipo de cambio (blue, MEP, CCL). Indica el grado de distorsión del mercado cambiario.' },
  { termino: 'Spread', acronimo: null, definicion: 'La diferencia entre el precio de compra y el de venta de un instrumento. En el MEP, el spread del bono + las comisiones del broker determinan el costo real de la operación.' },
]
</script>
