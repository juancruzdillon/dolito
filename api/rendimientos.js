// api/rendimientos.js — Vercel serverless function
// Fetches live data from CAFCI (fondos) and BYMA open data (LECAPs/bonos)
// server-side to bypass CORS restrictions.

const TTL = 4 * 60 * 60 * 1000 // 4h in-memory cache
let _cache = { data: null, ts: 0 }

// ── CAFCI ──────────────────────────────────────────────────────────────────────

async function fetchCafci() {
  // Fetch all active funds with their classes and managers
  const url = 'https://api.cafci.org.ar/fondo?populate=gerente,tipoFondo,clasesFondo&page=0&limit=300&estado=1'
  const r = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`CAFCI ${r.status}`)
  const json = await r.json()

  const TIPOS_INTERES = ['Money Market', 'Renta Fija', 'Renta Mixta']
  const results = []

  for (const fondo of (json.data || [])) {
    const tipo = fondo.tipoFondo?.nombre || ''
    if (!TIPOS_INTERES.some(t => tipo.includes(t))) continue

    for (const clase of (fondo.clasesFondo || [])) {
      // CAFCI may use rendimiento or rendimientoClaseFondo
      const rend = clase.rendimiento ?? clase.rendimientoClaseFondo
      const tna = rend?.anual ?? rend?.['1a']
      if (!tna) continue

      results.push({
        id:         fondo.id,
        claseId:    clase.id,
        nombre:     fondo.nombre?.trim() ?? '',
        clase:      `Clase ${clase.nombre}`,
        gerente:    fondo.gerente?.nombre?.trim() ?? '',
        tipo:       tipo,
        tna:        parseFloat(tna),
        mensual:    parseFloat(rend?.mensual ?? rend?.['1m'] ?? 0),
        patrimonio: clase.patrimonio ?? null,
      })
    }
  }

  // Sort by TNA desc, return top 25
  return results.sort((a, b) => b.tna - a.tna).slice(0, 25)
}

// ── BYMA Open Data — LECAPs ────────────────────────────────────────────────────

async function fetchLecaps() {
  // BYMA open data: free public endpoint for short-term government securities
  const url = 'https://open.bymadata.com.ar/vanoms-be-core/rest/api/bymadata/free/bnown/seriesHistoricas/letes'
  const r = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`BYMA letes ${r.status}`)
  const json = await r.json()

  // Normalize BYMA format
  const data = json.data ?? json ?? []
  return data
    .filter(d => d.symbol && d.closePrice)
    .map(d => ({
      ticker:  d.symbol,
      precio:  parseFloat(d.closePrice ?? d.settlementPrice ?? 0),
      vto:     d.maturityDate ?? '',
      volumen: d.volume ?? 0,
    }))
}

// ── BYMA Open Data — Bonos soberanos ──────────────────────────────────────────

async function fetchSoberanos() {
  const url = 'https://open.bymadata.com.ar/vanoms-be-core/rest/api/bymadata/free/bnown/seriesHistoricas/bonosNacionales'
  const r = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`BYMA bonos ${r.status}`)
  const json = await r.json()

  const data = json.data ?? json ?? []
  const TICKERS_INTERES = ['GD29', 'GD30', 'GD35', 'GD38', 'GD41', 'GD46', 'AL29', 'AL30', 'AL35']
  return data
    .filter(d => TICKERS_INTERES.includes(d.symbol))
    .map(d => ({
      ticker: d.symbol,
      precio: parseFloat(d.closePrice ?? d.settlementPrice ?? 0),
      vto:    d.maturityDate ?? '',
    }))
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  // Serve cached response if fresh
  if (Date.now() - _cache.ts < TTL && _cache.data) {
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(_cache.data))
    return
  }

  const [cafciRes, lecapsRes, soberanosRes] = await Promise.allSettled([
    fetchCafci(),
    fetchLecaps(),
    fetchSoberanos(),
  ])

  const result = {
    fondos:     cafciRes.status      === 'fulfilled' ? cafciRes.value      : null,
    lecaps:     lecapsRes.status     === 'fulfilled' ? lecapsRes.value     : null,
    soberanos:  soberanosRes.status  === 'fulfilled' ? soberanosRes.value  : null,
    lastUpdated: new Date().toISOString(),
    errors: {
      cafci:    cafciRes.status     === 'rejected' ? cafciRes.reason?.message     : null,
      lecaps:   lecapsRes.status    === 'rejected' ? lecapsRes.reason?.message    : null,
      soberanos:soberanosRes.status === 'rejected' ? soberanosRes.reason?.message : null,
    },
  }

  _cache = { data: result, ts: Date.now() }
  res.setHeader('X-Cache', 'MISS')
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(result))
}
