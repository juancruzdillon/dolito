import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const CACHE_KEY = 'dolito_rates_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

// Mapeo de casas a nombres amigables
export const DOLLAR_TYPES = {
  oficial:        { label: 'Oficial',       color: 'blue',    description: 'Tipo de cambio regulado por el BCRA' },
  blue:           { label: 'Blue',          color: 'slate',   description: 'Mercado informal (paralelo)' },
  bolsa:          { label: 'MEP / Bolsa',   color: 'indigo',  description: 'Compra vía bonos en el mercado bursátil' },
  contadoconliqui:{ label: 'CCL',           color: 'violet',  description: 'Contado con liquidación (para girar al exterior)' },
  tarjeta:        { label: 'Tarjeta',       color: 'orange',  description: 'Compras en moneda extranjera con tarjeta' },
  mayorista:      { label: 'Mayorista',     color: 'teal',    description: 'Comercio exterior — solo para empresas' },
  cripto:         { label: 'Cripto',        color: 'purple',  description: 'Vía USDT/criptomonedas' },
}

export const useDolarStore = defineStore('dolar', () => {
  const rates = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  const rateMap = computed(() => {
    const map = {}
    rates.value.forEach(r => { map[r.casa] = r })
    return map
  })

  const mepRate = computed(() => rateMap.value['bolsa'] || null)
  const blueRate = computed(() => rateMap.value['blue'] || null)
  const oficialRate = computed(() => rateMap.value['oficial'] || null)

  // Mejor cotización para comprar USD: la que menos pesos requiere por dólar
  // (excluimos tarjeta y mayorista porque tienen restricciones)
  const bestBuyRate = computed(() => {
    const candidates = rates.value.filter(r =>
      ['blue', 'bolsa', 'contadoconliqui', 'cripto'].includes(r.casa) && r.venta
    )
    if (!candidates.length) return null
    return candidates.reduce((best, r) =>
      r.venta < best.venta ? r : best
    )
  })

  const brechaBlue = computed(() => {
    const of = oficialRate.value?.venta
    const bl = blueRate.value?.venta
    if (!of || !bl) return null
    return (((bl - of) / of) * 100).toFixed(1)
  })

  const brechaMep = computed(() => {
    const of = oficialRate.value?.venta
    const mep = mepRate.value?.venta
    if (!of || !mep) return null
    return (((mep - of) / of) * 100).toFixed(1)
  })

  function loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return false
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp > CACHE_TTL_MS) return false
      rates.value = data
      lastUpdated.value = dayjs(timestamp).format('HH:mm')
      return true
    } catch { return false }
  }

  function saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {}
  }

  async function fetchRates(force = false) {
    if (!force && loadFromCache()) return

    loading.value = true
    error.value = null
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares')
      if (!res.ok) throw new Error('Error al obtener cotizaciones')
      const data = await res.json()
      rates.value = data
      lastUpdated.value = dayjs().format('HH:mm')
      saveToCache(data)
    } catch (e) {
      error.value = 'No se pudieron cargar las cotizaciones. Usando datos en caché si están disponibles.'
      loadFromCache()
    } finally {
      loading.value = false
    }
  }

  return {
    rates, loading, error, lastUpdated,
    rateMap, mepRate, blueRate, oficialRate,
    bestBuyRate, brechaBlue, brechaMep,
    fetchRates
  }
})
