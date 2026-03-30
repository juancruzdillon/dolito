import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const CACHE_KEY = 'dolito_rates_cache_v2'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

// Mapeo de casas a nombres amigables
export const DOLLAR_TYPES = {
  oficial:        { label: 'Oficial',       color: 'blue',    description: 'Tipo de cambio regulado por el BCRA' },
  blue:           { label: 'Blue',          color: 'slate',   description: 'Mercado informal (paralelo)' },
  bolsa:          { label: 'MEP / Bolsa',   color: 'indigo',  description: 'Compra vía bonos en el mercado bursátil (AL30 24hs)' },
  contadoconliqui:{ label: 'CCL',           color: 'violet',  description: 'Contado con liquidación (AL30 24hs)' },
  tarjeta:        { label: 'Tarjeta',       color: 'orange',  description: 'Compras en moneda extranjera con tarjeta' },
  mayorista:      { label: 'Mayorista',     color: 'teal',    description: 'Comercio exterior — solo para empresas' },
  cripto:         { label: 'Cripto',        color: 'purple',  description: 'Vía USDT/criptomonedas' },
}

/**
 * Normaliza la respuesta de CriptoYa al formato interno:
 * [{ casa, nombre, compra, venta }]
 */
function normalizeCriptoYa(data) {
  const rates = []

  // Oficial
  if (data.oficial) {
    rates.push({
      casa: 'oficial',
      nombre: 'Oficial',
      compra: data.oficial.bid,
      venta: data.oficial.ask,
    })
  }

  // Blue
  if (data.blue) {
    rates.push({
      casa: 'blue',
      nombre: 'Blue',
      compra: data.blue.bid,
      venta: data.blue.ask,
    })
  }

  // MEP (Bolsa) — usamos AL30 24hs como referencia principal
  if (data.mep?.al30?.['24hs']) {
    const mep = data.mep.al30['24hs']
    // CriptoYa solo devuelve price para MEP, estimamos spread ~0.3%
    const price = mep.price
    rates.push({
      casa: 'bolsa',
      nombre: 'Bolsa',
      compra: +(price * 0.997).toFixed(2),
      venta: +(price * 1.003).toFixed(2),
    })
  }

  // CCL — usamos AL30 24hs
  if (data.ccl?.al30?.['24hs']) {
    const ccl = data.ccl.al30['24hs']
    const price = ccl.price
    rates.push({
      casa: 'contadoconliqui',
      nombre: 'Contado con liquidación',
      compra: +(price * 0.997).toFixed(2),
      venta: +(price * 1.003).toFixed(2),
    })
  }

  // Mayorista
  if (data.mayorista) {
    const price = data.mayorista.price
    rates.push({
      casa: 'mayorista',
      nombre: 'Mayorista',
      compra: +(price * 0.997).toFixed(2),
      venta: +(price * 1.003).toFixed(2),
    })
  }

  // Tarjeta
  if (data.tarjeta) {
    const price = data.tarjeta.price
    rates.push({
      casa: 'tarjeta',
      nombre: 'Tarjeta',
      compra: null,
      venta: price,
    })
  }

  // Cripto — usamos USDT
  if (data.cripto?.usdt) {
    rates.push({
      casa: 'cripto',
      nombre: 'Cripto',
      compra: data.cripto.usdt.bid,
      venta: data.cripto.usdt.ask,
    })
  }

  return rates
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
      // Fuente principal: CriptoYa (datos más precisos con compra/venta reales)
      const res = await fetch('https://criptoya.com/api/dolar')
      if (!res.ok) throw new Error('CriptoYa no disponible')
      const raw = await res.json()
      const data = normalizeCriptoYa(raw)
      rates.value = data
      lastUpdated.value = dayjs().format('HH:mm')
      saveToCache(data)
    } catch {
      // Fallback: dolarapi.com
      try {
        const res2 = await fetch('https://dolarapi.com/v1/dolares')
        if (!res2.ok) throw new Error('Fallback no disponible')
        const data2 = await res2.json()
        rates.value = data2
        lastUpdated.value = dayjs().format('HH:mm')
        saveToCache(data2)
      } catch {
        error.value = 'No se pudieron cargar las cotizaciones. Usando datos en caché si están disponibles.'
        loadFromCache()
      }
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
