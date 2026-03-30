// api/rendimientos.js — Vercel serverless function
// Fetches live data from ArgentinaDatos (plazo fijo, billeteras)
// CAFCI and BYMA are blocked/down, so fondos/lecaps/soberanos stay static for now.

const TTL = 4 * 60 * 60 * 1000 // 4h in-memory cache
let _cache = { data: null, ts: 0 }

// ── Plazo Fijo (BCRA via ArgentinaDatos) ───────────────────────────────────────

async function fetchPlazoFijo() {
  const r = await fetch('https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo', {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`ArgentinaDatos PF ${r.status}`)
  const data = await r.json()

  return data
    .filter(d => d.tnaClientes != null)
    .map(d => ({
      entidad:       d.entidad,
      logo:          d.logo || null,
      tnaClientes:   Math.round(d.tnaClientes * 10000) / 100, // 0.22 → 22.00
      tnaNoClientes: d.tnaNoClientes ? Math.round(d.tnaNoClientes * 10000) / 100 : null,
    }))
    .sort((a, b) => b.tnaClientes - a.tnaClientes)
}

// ── Billeteras / Rendimientos ARS (ArgentinaDatos) ─────────────────────────────

async function fetchBilleteras() {
  const r = await fetch('https://api.argentinadatos.com/v1/finanzas/rendimientos', {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`ArgentinaDatos Rend ${r.status}`)
  const data = await r.json()

  // Extract ARS rendimientos only
  const results = []
  for (const entry of data) {
    const ars = (entry.rendimientos || []).find(r => r.moneda === 'ARS')
    if (!ars) continue
    results.push({
      entidad: entry.entidad,
      tna:     ars.apy,
      fecha:   ars.fecha,
      bonus:   ars.bonusValue || null,
      bonusThreshold: ars.bonusThreshold || null,
    })
  }
  return results.sort((a, b) => b.tna - a.tna)
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

  const [pfRes, billRes] = await Promise.allSettled([
    fetchPlazoFijo(),
    fetchBilleteras(),
  ])

  const result = {
    plazoFijo:   pfRes.status   === 'fulfilled' ? pfRes.value   : null,
    billeteras:  billRes.status === 'fulfilled' ? billRes.value  : null,
    // CAFCI and BYMA are currently blocked — these stay null
    fondos:      null,
    lecaps:      null,
    soberanos:   null,
    lastUpdated: new Date().toISOString(),
    errors: {
      plazoFijo:  pfRes.status   === 'rejected' ? pfRes.reason?.message   : null,
      billeteras: billRes.status === 'rejected' ? billRes.reason?.message : null,
    },
  }

  _cache = { data: result, ts: Date.now() }
  res.setHeader('X-Cache', 'MISS')
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify(result))
}
