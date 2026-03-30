import { defineStore } from 'pinia'
import { ref } from 'vue'


const localLogo = (file) => new URL(`../assets/images/logos/${file}`, import.meta.url).href
const cb = (domain) => `https://logo.clearbit.com/${domain}`

// ── Metadata estática para fondos (logos, colores, patrimonio display) ─────────
// Cuando CAFCI devuelve un fondo, buscamos su gerente en este mapa.
// Si no lo encontramos, se usa color/logo genérico.
const FONDOS_META = {
  'Cocos Capital': { logo: localLogo('buala.png'), color: '#4C6EF5' },
  'Pellegrini': { logo: localLogo('bpellegrini.jpg'), color: '#0052CC' },
  'Adcap': { logo: localLogo('badcap.png'), color: '#1A1A2E' },
  'Allaria': { logo: localLogo('ballaria.png'), color: '#7B2D8B' },
  'Balanz': { logo: localLogo('bbalanz.png'), color: '#1B3F8B' },
  'Supervielle': { logo: localLogo('bsupervielle.svg'), color: '#E61E27' },
  'ICBC': { logo: localLogo('bicbc.png'), color: '#CC0000' },
  'Premier': { logo: localLogo('bsupervielle.svg'), color: '#E61E27' },
  'Galicia': { logo: localLogo('bgalicia.png'), color: '#E31837' },
  'Macro': { logo: localLogo('bmacro.png'), color: '#005189' },
  'Santander': { logo: localLogo('bsantander.png'), color: '#EC0000' },
  'Nación': { logo: localLogo('bna.png'), color: '#004A8F' },
  'BBVA': { logo: localLogo('bbvaargentina.png'), color: '#004481' },
  'Patagonia': { logo: localLogo('bpatagonia.svg'), color: '#0061A0' },
  'Itaú': { logo: localLogo('bitau.png'), color: '#EC7000' },
  'Cohen': { logo: localLogo('bcohen.jpg'), color: '#005FAD' },
  'Rava': { logo: localLogo('brava.png'), color: '#2B5F9E' },
  'IOL': { logo: localLogo('biol.jpg'), color: '#F5821F' },
  'PPI': { logo: localLogo('bppi.jpg'), color: '#0056A0' },
  'Bind': { logo: localLogo('bbind.jpg'), color: '#7B2FBE' },
}

function metaForGerente(gerente) {
  const found = Object.entries(FONDOS_META).find(([k]) => gerente.toLowerCase().includes(k.toLowerCase()))
  return found ? found[1] : { logo: null, color: '#6B7280' }
}

function fmtPatrimonio(n) {
  if (!n) return null
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)} B`
  if (n >= 1e9) return `$${Math.round(n / 1e9)} mil M`
  if (n >= 1e6) return `$${Math.round(n / 1e6)} M`
  return `$${n}`
}

// ──────────────────────────────────────────────────────────────────────────────

export const useRendimientosStore = defineStore('rendimientos', () => {

  const lastUpdated = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ── Billeteras ────────────────────────────────────────────────────────────────
  // Defaults — updated at runtime from /rendimientos-live.json (run npm run update:rend)
  const billeteras = ref([
    { id: 'mercadopago', name: 'Mercado Pago', institution: 'Mercado Libre', badge: 'Fondo', logo: localLogo('bmercadopago.png'), color: '#00B1EA', limit: null, tna: null },
    { id: 'carrefour', name: 'Carrefour Banco', institution: 'Carrefour', badge: 'Billetera', logo: localLogo('bcarrefour.png'), color: '#E42313', limit: '$4 M', tna: null },
    { id: 'fiwind', name: 'Fiwind', institution: 'Fiwind', badge: 'Billetera', logo: localLogo('bfiwind.png'), color: '#F5A623', limit: '$750 K', tna: null },
    { id: 'uala', name: 'Ualá', institution: 'Ualá', badge: 'Billetera', logo: localLogo('buala.png'), color: '#5C1BE3', limit: '$1 M', tna: null },
    { id: 'personal', name: 'Personal Pay', institution: 'Telecom', badge: 'Billetera', logo: localLogo('bppay.jpg'), color: '#FF6B00', limit: '$3 M', tna: null },
    { id: 'naranjax', name: 'Naranja X', institution: 'Naranja', badge: 'Billetera', logo: localLogo('bnaranjax.jpg'), color: '#FF6B35', limit: '$4 M', tna: null },
    { id: 'brubank', name: 'Brubank', institution: 'Brubank', badge: 'Billetera', logo: localLogo('bbrubank.svg'), color: '#0066FF', limit: null, tna: null },
  ])

  // ── Especiales ────────────────────────────────────────────────────────────────
  const especiales = ref([
    { id: 'uala-plus2', name: 'Ualá Plus 2', institution: 'Ualá', badge: 'Cuenta Remunerada', logo: localLogo('buala.png'), color: '#5C1BE3', limit: '$1 M', tna: 29.00, requisito: 'Acumulá $500.000 entre inversiones, consumos con tarjeta y cobros con Ualá Bis para acceder a la tasa Plus 2 el próximo mes.' },
    { id: 'uala-plus1', name: 'Ualá Plus 1', institution: 'Ualá', badge: 'Cuenta Remunerada', logo: localLogo('buala.png'), color: '#5C1BE3', limit: '$1 M', tna: 26.00, requisito: 'Acumulá $250.000 entre inversiones, consumos con tarjeta y cobros con Ualá Bis para acceder a la tasa Plus 1 el próximo mes.' },
    { id: 'supervielle', name: 'Supervielle', institution: 'Supervielle', badge: 'Cuenta Remunerada', logo: localLogo('bsupervielle.svg'), color: '#E61E27', limit: '$1 M', tna: 19.50, requisito: 'Solo Clientes Plan Sueldo.' },
  ])

  // ── Fondos CAFCI (vivos desde /api/rendimientos) ───────────────────────────
  const fondos = ref([
    { id: 'cocos', name: 'Cocos Rendimiento', clase: 'Clase A', institution: 'Cocos', tipo: 'Renta Mixta', logo: localLogo('bcocos.png'), color: '#4C6EF5', patrimonio: '$250 mil M', tna: 24.28 },
    { id: 'pellegrini', name: 'Pellegrini Renta Pesos', clase: 'Clase A', institution: 'Pellegrini', tipo: 'Money Market', logo: localLogo('bpellegrini.jpg'), color: '#0052CC', patrimonio: '$150 mil M', tna: 22.79 },
    { id: 'adcap', name: 'Adcap Ahorro Pesos', clase: 'Clase A', institution: 'Adcap', tipo: 'Money Market', logo: localLogo('badcap.png'), color: '#1A1A2E', patrimonio: '$178 mil M', tna: 21.72 },
    { id: 'allaria', name: 'Allaria Ahorro', clase: 'Clase E', institution: 'Prex', tipo: 'Money Market', logo: localLogo('ballaria.png'), color: '#7B2D8B', patrimonio: '$131 mil M', tna: 21.71 },
    { id: 'alpha', name: 'Alpha Pesos', clase: 'Clase A', institution: 'ICBC', tipo: 'Money Market', logo: localLogo('bicbc.png'), color: '#CC0000', patrimonio: '$1.5 B', tna: 21.34 },
    { id: 'balanz', name: 'Balanz Capital Money Market', clase: 'Clase A', institution: 'Balanz', tipo: 'Money Market', logo: localLogo('bbalanz.png'), color: '#1B3F8B', patrimonio: '$274 mil M', tna: 21.31 },
    { id: 'premier', name: 'Premier Renta CP en Pesos', clase: 'Clase A', institution: 'Supervielle', tipo: 'Money Market', logo: localLogo('bsupervielle.svg'), color: '#E61E27', patrimonio: '$354 mil M', tna: 21.24 },
  ])

  // ── Plazo Fijo (dinámico desde /api/rendimientos → BCRA) ──────────────────────
  // Logo/color lookup para bancos conocidos; los que no matchean usan fallback
  const PF_LOGO_MAP = {
    'NACION':            { logo: localLogo('bna.png'),              color: '#004A8F' },
    'SANTANDER':         { logo: localLogo('bsantander.png'),       color: '#EC0000' },
    'GALICIA':           { logo: localLogo('bgalicia.png'),         color: '#E31837' },
    'BBVA':              { logo: localLogo('bbvaargentina.png'),    color: '#004481' },
    'MACRO':             { logo: localLogo('bmacro.png'),           color: '#005189' },
    'ICBC':              { logo: localLogo('bicbc.png'),            color: '#CC0000' },
    'SUPERVIELLE':       { logo: localLogo('bsupervielle.svg'),     color: '#E61E27' },
    'PATAGONIA':         { logo: localLogo('bpatagonia.svg'),       color: '#0061A0' },
    'CIUDAD':            { logo: localLogo('bciudad.png'),          color: '#1A1A2E' },
    'HIPOTECARIO':       { logo: localLogo('bhipotecario.png'),     color: '#005B9F' },
    'COMAFI':            { logo: localLogo('bcomafi.png'),          color: '#009B77' },
    'CREDICOOP':         { logo: localLogo('bcredicop.png'),        color: '#003D99' },
    'BRUBANK':           { logo: localLogo('bbrubank.svg'),         color: '#0066FF' },
    'VOII':              { logo: localLogo('bvoii.png'),            color: '#0099D8' },
    'DEL SOL':           { logo: localLogo('bdelsol.svg'),          color: '#FFA500' },
    'PROVINCIA DE CORDOBA': { logo: localLogo('bbancor.svg'),       color: '#004F9F' },
    'CHUBUT':            { logo: localLogo('bdelchubut.png'),       color: '#105099' },
    'CORRIENTES':        { logo: localLogo('bdecorrientes.svg'),    color: '#00833b' },
    'NEUQUEN':           { logo: localLogo('bbancodelneuquen.jpg'), color: '#006c9b' },
    'DINO':              { logo: localLogo('bdino.svg'),            color: '#343A40' },
    'ENTRE RIOS':        { logo: localLogo('bentrerios.svg'),       color: '#E3001B' },
    'MUNICIPAL DE ROSARIO': { logo: localLogo('bmunicipalrosario.png'), color: '#FF6B00' },
    'SAN JUAN':          { logo: localLogo('bsanjuan.png'),         color: '#E3001B' },
    'SANTA CRUZ':        { logo: localLogo('bsantacruz.svg'),       color: '#E3001B' },
    'SANTA FE':          { logo: localLogo('bsantafe.jpg'),         color: '#E3001B' },
    'TIERRA DEL FUEGO':  { logo: localLogo('btierradelfuego.png'),  color: '#00548d' },
  }

  function pfMetaFor(entidad) {
    const upper = entidad.toUpperCase()
    for (const [key, meta] of Object.entries(PF_LOGO_MAP)) {
      if (upper.includes(key)) return meta
    }
    return { logo: null, color: '#6B7280' }
  }

  function shortName(entidad) {
    return entidad
      .replace(/^BANCO\s+/i, '')
      .replace(/\s+S\.?A\.?U?\.?\s*$/i, '')
      .replace(/\s+ARGENTINA\s*/i, ' ')
      .trim()
  }

  const plazofijo = ref([])

  // ── LECAPs (base estática; se actualiza con precios de BYMA via /api/rendimientos)
  const lecaps = ref([
    { ticker: 'S30J6', vto: '30/06/2026', tem: 2.80, tna: 33.60, precio: 94.82 },
    { ticker: 'S31L6', vto: '31/07/2026', tem: 2.75, tna: 33.00, precio: 91.93 },
    { ticker: 'S28A6', vto: '28/08/2026', tem: 2.72, tna: 32.64, precio: 89.12 },
    { ticker: 'S30S6', vto: '30/09/2026', tem: 2.68, tna: 32.16, precio: 86.05 },
    { ticker: 'S30O6', vto: '30/10/2026', tem: 2.65, tna: 31.80, precio: 83.21 },
    { ticker: 'S27N6', vto: '27/11/2026', tem: 2.62, tna: 31.44, precio: 80.48 },
    { ticker: 'S18D6', vto: '18/12/2026', tem: 2.60, tna: 31.20, precio: 77.90 },
    { ticker: 'S16E7', vto: '16/01/2027', tem: 2.58, tna: 30.96, precio: 75.47 },
  ])

  // ── Bonos CER ─────────────────────────────────────────────────────────────────
  const bonosCer = ref([
    { ticker: 'TX26', nombre: 'BONCER Nov 2026', vto: '09/11/2026', cupon: 'CER + 2%', paridad: 108.5, tir: 'CER - 5.2%' },
    { ticker: 'TZXM7', nombre: 'BONCER Ene 2027', vto: '14/01/2027', cupon: 'CER + 2%', paridad: 103.2, tir: 'CER - 1.8%' },
    { ticker: 'TX28', nombre: 'BONCER Sep 2028', vto: '13/09/2028', cupon: 'CER + 2%', paridad: 112.8, tir: 'CER + 4.1%' },
    { ticker: 'DICP', nombre: 'DISCOUNT CER 2033', vto: '31/12/2033', cupon: 'CER + 5.83%', paridad: 88.7, tir: 'CER + 8.2%' },
    { ticker: 'CUAP', nombre: 'PAR CER 2038', vto: '31/12/2038', cupon: 'CER + 3.5%', paridad: 72.4, tir: 'CER + 6.9%' },
  ])

  // ── Soberanos USD (base estática; precio/paridad se actualiza con BYMA) ───────
  const soberanos = ref([
    { ticker: 'GD29', nombre: 'Global 2029', vto: '09/01/2029', cupon: '1.00%', paridad: 71.2, tir: '10.1%', ley: 'NY' },
    { ticker: 'GD30', nombre: 'Global 2030', vto: '09/07/2030', cupon: '1.75%', paridad: 68.4, tir: '10.4%', ley: 'NY' },
    { ticker: 'GD35', nombre: 'Global 2035', vto: '09/07/2035', cupon: '3.625%', paridad: 72.1, tir: '10.8%', ley: 'NY' },
    { ticker: 'GD38', nombre: 'Global 2038', vto: '09/01/2038', cupon: '3.875%', paridad: 70.8, tir: '10.9%', ley: 'NY' },
    { ticker: 'GD41', nombre: 'Global 2041', vto: '09/07/2041', cupon: '4.125%', paridad: 69.2, tir: '11.1%', ley: 'NY' },
    { ticker: 'GD46', nombre: 'Global 2046', vto: '09/07/2046', cupon: '4.625%', paridad: 67.8, tir: '11.3%', ley: 'NY' },
    { ticker: 'AL29', nombre: 'Bonar 2029', vto: '09/07/2029', cupon: '1.00%', paridad: 65.3, tir: '10.6%', ley: 'AR' },
    { ticker: 'AL30', nombre: 'Bonar 2030', vto: '09/07/2030', cupon: '0.50%', paridad: 64.1, tir: '10.8%', ley: 'AR' },
    { ticker: 'AL35', nombre: 'Bonar 2035', vto: '09/07/2035', cupon: '3.625%', paridad: 68.5, tir: '11.1%', ley: 'AR' },
  ])

  // ── ONs ───────────────────────────────────────────────────────────────────────
  const ons = ref([
    { id: 'ypf-2027', company: 'YPF', logo: cb('ypf.com'), color: '#00AEEF', ticker: 'YMCHO', moneda: 'USD', cupon: '9.00%', vto: '12/02/2027', tir: '9.8%', rating: 'B' },
    { id: 'ypf-2029', company: 'YPF', logo: cb('ypf.com'), color: '#00AEEF', ticker: 'YMC3O', moneda: 'USD', cupon: '9.50%', vto: '28/07/2029', tir: '10.2%', rating: 'B' },
    { id: 'pampa', company: 'Pampa Energía', logo: cb('pampaenergia.com'), color: '#009944', ticker: 'MGC1O', moneda: 'USD', cupon: '9.50%', vto: '21/07/2027', tir: '9.9%', rating: 'B+' },
    { id: 'vista', company: 'Vista Oil & Gas', logo: cb('vistaoilandgas.com'), color: '#1B3F8B', ticker: 'VSC2O', moneda: 'USD', cupon: '9.75%', vto: '20/03/2028', tir: '10.3%', rating: 'BB-' },
    { id: 'tgs', company: 'TGS', logo: cb('tgs.com.ar'), color: '#005189', ticker: 'TSC2O', moneda: 'USD', cupon: '9.625%', vto: '14/05/2027', tir: '9.7%', rating: 'B+' },
    { id: 'aaa2000', company: 'Aeropuertos 2000', logo: cb('aa2000.com.ar'), color: '#003DA5', ticker: 'ARC2O', moneda: 'USD', cupon: '8.50%', vto: '01/02/2031', tir: '9.4%', rating: 'B+' },
    { id: 'genneia', company: 'Genneia', logo: cb('genneia.com'), color: '#7FBA00', ticker: 'GNCXO', moneda: 'USD', cupon: '8.75%', vto: '15/01/2027', tir: '9.5%', rating: 'B' },
    { id: 'mastellone', company: 'Mastellone', logo: cb('mastellone.com.ar'), color: '#C8102E', ticker: 'MRCFO', moneda: 'ARS', cupon: 'Badlar Priv+300', vto: '28/04/2026', tir: '31.0%', rating: 'B' },
    { id: 'telecom', company: 'Telecom Argentina', logo: cb('telecom.com.ar'), color: '#009FE3', ticker: 'TLCMO', moneda: 'USD', cupon: '8.00%', vto: '15/08/2026', tir: '9.1%', rating: 'B' },
  ])

  // ── fetchAll: llama /api/rendimientos y actualiza lo que llegue ───────────────

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      // 1. Fetch billeteras from static JSON (public/rendimientos-live.json)
      try {
        const lr = await fetch('/rendimientos-live.json?_t=' + Date.now())
        if (lr.ok) {
          const liveData = await lr.json()
          if (liveData.billeteras?.length) {
            for (const live of liveData.billeteras) {
              if (live.tna == null) continue
              const match = billeteras.value.find(b => b.id === live.id)
              if (match) match.tna = live.tna
            }
            // Sort by tna desc
            billeteras.value = [...billeteras.value].sort((a, b) => (b.tna ?? 0) - (a.tna ?? 0))
          }
          if (liveData.lastUpdated) {
            const d = new Date(liveData.lastUpdated)
            lastUpdated.value = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          }
        }
      } catch (e) {
        console.warn('[rendimientos] rendimientos-live.json not available:', e.message)
      }

      // 2. Fetch plazo fijo from API (BCRA via ArgentinaDatos)
      try {
        const r = await fetch('/api/rendimientos')
        if (r.ok) {
          const data = await r.json()
          if (data.plazoFijo?.length) {
            plazofijo.value = data.plazoFijo.map((bank, i) => {
              const meta = pfMetaFor(bank.entidad)
              return {
                id:   `pf-${i}`,
                name: shortName(bank.entidad),
                logo: meta.logo || bank.logo || null,
                color: meta.color,
                tna:  bank.tnaClientes,
              }
            })
          }
          if (data.lastUpdated) {
            const d = new Date(data.lastUpdated)
            lastUpdated.value = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          }
        }
      } catch (e) {
        console.warn('[rendimientos] API failed:', e.message)
      }

    } catch (e) {
      error.value = e.message
      console.warn('[rendimientos] fetchAll failed:', e.message)
      lastUpdated.value = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } finally {
      loading.value = false
    }
  }

  return {
    billeteras, especiales, fondos, plazofijo,
    lecaps, bonosCer, soberanos, ons,
    lastUpdated, loading, error,
    fetchAll,
  }
})
