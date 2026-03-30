import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─────────────────────────────────────────────────────────────────────────────
// COMISIONES MEP — se cargan desde un JSON remoto (GitHub Gist).
// Si el fetch falla, se usan estos valores de fallback hardcodeados.
//
// Para actualizar sin re-deploy: editá el Gist en:
//   https://gist.github.com/TU_USUARIO/TU_GIST_ID
//
// Estructura del JSON remoto: ver BROKERS_FALLBACK abajo como referencia.
//
// Fórmula del tipo de cambio efectivo:
//   efectivo = cotización_mercado × (1 + commissionBuy) / (1 - commissionSell)
//   NOTA: Los bonos/títulos públicos utilizados para MEP están EXENTOS DE IVA en Arg.
// ─────────────────────────────────────────────────────────────────────────────

// El JSON lo genera el scraper diario (GitHub Action) y queda en public/brokers.json.
// En producción (Vercel/Netlify) ese archivo se sirve como asset estático.
// VITE_BROKERS_CONFIG_URL puede sobreescribir con una URL externa (ej: Gist) si se prefiere.
const REMOTE_CONFIG_URL = import.meta.env.VITE_BROKERS_CONFIG_URL || '/brokers.json'

const CACHE_KEY = 'dolito_brokers_cache'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 horas

// ── Valores de fallback (usados si el remoto no está disponible) ──────────────

export const BROKERS_FALLBACK = [
  {
    id: 'iol',
    name: 'Invertir Online',
    shortName: 'IOL',
    commissionBuy:  0.005,   // 0.50%
    commissionSell: 0.005,
    color: '#1a56db',
    website: 'https://invertironline.com',
    note: '0.50% (Mep/Bonos - Exento de IVA)',
    pros: ['Bajo costo', 'Plataforma completa', 'App móvil'],
    cons: ['Interfaz algo compleja para principiantes'],
    lastUpdated: '2026-03',
  },
  {
    id: 'bullmarket',
    name: 'Bull Market',
    shortName: 'BMB',
    commissionBuy:  0.005,   // 0.50%
    commissionSell: 0.005,
    color: '#057a55',
    website: 'https://bullmarketbrokers.com',
    note: '0.50% (Mep/Bonos - Exento de IVA)',
    pros: ['Bajo costo', 'Buena plataforma'],
    cons: ['Menos conocido'],
    lastUpdated: '2026-03',
  },
  {
    id: 'cocos',
    name: 'Cocos Capital',
    shortName: 'Cocos',
    commissionBuy:  0.0045,    // 0.45%
    commissionSell: 0.0045,
    color: '#7e3af2',
    website: 'https://cocoscapital.com.ar',
    note: '0.45% (Mep/Bonos - Exento de IVA)',
    pros: ['App excelente', 'UX moderna', 'Ideal para principiantes'],
    cons: ['Comisiones más altas'],
    lastUpdated: '2026-03',
  },
  {
    id: 'balanz',
    name: 'Balanz',
    shortName: 'Balanz',
    commissionBuy:  0.005,    // 0.50%
    commissionSell: 0.005,
    color: '#e3a008',
    website: 'https://balanz.com',
    note: '0.50% (Mep/Bonos - Exento de IVA)',
    pros: ['Reconocida', 'Amplia oferta de productos'],
    cons: ['Comisiones más altas'],
    lastUpdated: '2026-03',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export const useBrokersStore = defineStore('brokers', () => {
  const brokers        = ref([...BROKERS_FALLBACK])
  const configSource   = ref('fallback') // 'remote' | 'cache' | 'fallback'
  const configLoadedAt = ref(null)

  // ── Caché local ──────────────────────────────────────────────────────────
  function loadFromCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return false
      const { data, timestamp } = JSON.parse(raw)
      if (Date.now() - timestamp > CACHE_TTL_MS) return false
      brokers.value   = data
      configSource.value   = 'cache'
      configLoadedAt.value = new Date(timestamp).toLocaleDateString('es-AR')
      return true
    } catch { return false }
  }

  function saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
    } catch {}
  }

  // ── Fetch remoto ─────────────────────────────────────────────────────────
  async function fetchRemoteConfig() {
    if (!REMOTE_CONFIG_URL) return false
    try {
      // Cache-bust con timestamp truncado a horas (no recarga cada request)
      const bust = Math.floor(Date.now() / CACHE_TTL_MS)
      const res  = await fetch(`${REMOTE_CONFIG_URL}?t=${bust}`)
      if (!res.ok) return false
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) return false

      // Validación mínima de estructura
      for (const b of data) {
        if (!b.id || b.commissionBuy == null || b.commissionSell == null) return false
      }

      brokers.value        = data
      configSource.value   = 'remote'
      configLoadedAt.value = new Date().toLocaleDateString('es-AR')
      saveToCache(data)
      return true
    } catch {
      return false
    }
  }

  // ── Init: remoto → caché → fallback ─────────────────────────────────────
  async function init() {
    const fromRemote = await fetchRemoteConfig()
    if (fromRemote) return
    const fromCache = loadFromCache()
    if (fromCache) return
    // fallback ya está en brokers.value por defecto
    configSource.value = 'fallback'
  }

  // ── Cálculos MEP ─────────────────────────────────────────────────────────
  function calculateMEP(marketRate, brokerId, amountARS = 100000) {
    const broker = brokers.value.find(b => b.id === brokerId)
    if (!broker || !marketRate) return null

    const effectiveRate    = marketRate * (1 + broker.commissionBuy) / (1 - broker.commissionSell)
    const receivedUSD      = amountARS / effectiveRate
    const commissionImpact = amountARS - (receivedUSD * marketRate)
    const spreadPct        = ((effectiveRate - marketRate) / marketRate) * 100

    return {
      broker,
      marketRate,
      effectiveRate:    +effectiveRate.toFixed(2),
      receivedUSD:      +receivedUSD.toFixed(2),
      commissionImpact: +commissionImpact.toFixed(2),
      spreadPct:        +spreadPct.toFixed(3),
    }
  }

  function compareAll(marketRate, amountARS = 100000) {
    return brokers.value
      .map(b => calculateMEP(marketRate, b.id, amountARS))
      .filter(Boolean)
      .sort((a, b) => a.effectiveRate - b.effectiveRate)
  }

  const sourceLabel = computed(() => ({
    remote:   '✓ Comisiones actualizadas (remoto)',
    cache:    '✓ Comisiones en caché local',
    fallback: '⚠ Comisiones por defecto — verificar manualmente',
  }[configSource.value]))

  return {
    brokers, configSource, configLoadedAt, sourceLabel,
    init, calculateMEP, compareAll,
  }
})
