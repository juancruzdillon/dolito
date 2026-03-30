// api/market.js — Vercel serverless function
// Yahoo Finance requires crumb+cookie auth. Uses query2.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

let _cookie = null
let _crumb  = null
let _expiry = 0

async function getSession() {
  if (_crumb && Date.now() < _expiry) return { cookie: _cookie, crumb: _crumb }

  const r1 = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': UA },
    redirect: 'follow'
  })
  _cookie = (r1.headers.get('set-cookie') || '')
    .split(',')
    .map(c => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ')

  const r2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { Cookie: _cookie, 'User-Agent': UA }
  })
  _crumb  = await r2.text()
  if (!_crumb || _crumb.includes('<')) throw new Error('Failed to get Yahoo crumb')
  _expiry = Date.now() + 25 * 60 * 1000

  return { cookie: _cookie, crumb: _crumb }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const url     = new URL(req.url, 'http://localhost')
  const hot     = url.searchParams.get('hot')
  const symbols = url.searchParams.get('symbols')

  try {
    const { cookie, crumb } = await getSession()
    const headers = { Cookie: cookie, 'User-Agent': UA }
    const crumbQ  = `crumb=${encodeURIComponent(crumb)}`

    if (hot) {
      const r = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives&count=6&start=0&${crumbQ}`,
        { headers }
      )
      const data = await r.json()
      return res.status(200).json(data)
    }

    if (!symbols) return res.status(400).json({ error: 'symbols param required' })

    const r = await fetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&${crumbQ}`,
      { headers }
    )
    if (!r.ok) {
      _crumb = null
      throw new Error(`Yahoo returned ${r.status}`)
    }
    const data = await r.json()
    return res.status(200).json(data)
  } catch (e) {
    _crumb = null
    console.error('❌ Yahoo Finance error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
