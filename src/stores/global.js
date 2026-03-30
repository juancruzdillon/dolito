import { defineStore } from 'pinia'
import { ref } from 'vue'

const CACHE_KEY = 'dolito_global_v1'
const CACHE_TTL = 5 * 60 * 1000 // 5 min

export const CATEGORIES = [
  {
    id: 'indices',
    label: 'Índices',
    items: [
      { symbol: '^GSPC',  nombre: 'S&P 500',    prefix: null },
      { symbol: '^NDX',   nombre: 'Nasdaq 100',  prefix: null },
      { symbol: '^DJI',   nombre: 'Dow Jones',   prefix: null },
    ]
  },
  {
    id: 'tasas',
    label: 'Tasas',
    items: [
      { symbol: '^TNX', nombre: 'UST 10Y', prefix: 'US', isTasa: true },
      { symbol: '^TYX', nombre: 'UST 30Y', prefix: 'US', isTasa: true },
      { symbol: '^FVX', nombre: 'UST 5Y',  prefix: 'US', isTasa: true },
    ]
  },
  {
    id: 'energia',
    label: 'Energía',
    items: [
      { symbol: 'CL=F', nombre: 'WTI',      prefix: null },
      { symbol: 'BZ=F', nombre: 'Brent',    prefix: null },
      { symbol: 'RB=F', nombre: 'Gasolina', prefix: null, smallPrice: true },
    ]
  },
  {
    id: 'metales',
    label: 'Metales',
    items: [
      { symbol: 'GC=F', nombre: 'Oro',   prefix: null },
      { symbol: 'SI=F', nombre: 'Plata', prefix: null },
      { symbol: 'HG=F', nombre: 'Cobre', prefix: null, smallPrice: true },
    ]
  },
  {
    id: 'agro',
    label: 'Agro',
    items: [
      { symbol: 'ZS=F', nombre: 'Soja',  prefix: null },
      { symbol: 'ZW=F', nombre: 'Trigo', prefix: null },
      { symbol: 'ZC=F', nombre: 'Maíz',  prefix: null },
    ]
  },
  {
    id: 'crypto',
    label: 'Crypto',
    items: [
      { symbol: 'BTC-USD',  nombre: 'Bitcoin',   prefix: null },
      { symbol: 'ETH-USD',  nombre: 'Ethereum',  prefix: null },
      { symbol: 'AVAX-USD', nombre: 'Avalanche', prefix: null },
    ]
  },
  {
    id: 'monedas',
    label: 'Monedas',
    items: [
      { symbol: 'EURUSD=X', nombre: 'EUR/USD', prefix: 'EU' },
      { symbol: 'MXN=X',    nombre: 'USD/MXN', prefix: 'MX' },
      { symbol: 'BRL=X',    nombre: 'USD/BRL', prefix: 'BR' },
    ]
  }
]

const ALL_SYMBOLS = CATEGORIES.flatMap(c => c.items.map(i => i.symbol))

export const useGlobalStore = defineStore('global', () => {
  const quotes    = ref({})
  const hotStocks = ref([])
  const loading   = ref(false)
  const lastUpdated = ref(null)
  const error     = ref(null)

  async function fetchData() {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          quotes.value    = data.quotes
          hotStocks.value = data.hotStocks
          lastUpdated.value = new Date(timestamp)
          return
        }
      }
    } catch {}

    loading.value = true
    error.value   = null

    try {
      const symbolsParam = encodeURIComponent(ALL_SYMBOLS.join(','))

      // Fetch quotes with retry
      let quotesData = null
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(`/api/market?symbols=${symbolsParam}`)
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const json = await r.json()
          const results = json.quoteResponse?.result || []
          if (results.length > 0) {
            quotesData = results
            break
          }
          // Empty result — wait and retry
          if (attempt === 0) await new Promise(r => setTimeout(r, 1500))
        } catch (e) {
          if (attempt === 1) throw e
          await new Promise(r => setTimeout(r, 1500))
        }
      }

      if (!quotesData || quotesData.length === 0) {
        throw new Error('Yahoo Finance no devolvió datos después de reintentar')
      }

      quotes.value = Object.fromEntries(quotesData.map(q => [q.symbol, q]))

      // Hot stocks (best effort, don't fail if this breaks)
      try {
        const hotRes = await fetch('/api/market?hot=1')
        if (hotRes.ok) {
          const data = await hotRes.json()
          hotStocks.value = (data.finance?.result?.[0]?.quotes || []).slice(0, 6)
        }
      } catch {}

      lastUpdated.value = new Date()
      if (Object.keys(quotes.value).length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { quotes: quotes.value, hotStocks: hotStocks.value },
          timestamp: Date.now()
        }))
      }
    } catch (e) {
      console.warn('[global] fetchData failed:', e.message)
      error.value = e.message
      // Clear stale cache so next load retries
      localStorage.removeItem(CACHE_KEY)
    } finally {
      loading.value = false
    }
  }

  return { quotes, hotStocks, loading, lastUpdated, error, fetchData }
})
