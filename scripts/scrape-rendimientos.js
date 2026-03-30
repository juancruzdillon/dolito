/**
 * scrape-rendimientos.js
 * ----------------------
 * Playwright scraper que visita cada billetera/fondo individualmente
 * y extrae la TNA actual. Escribe a src/data/rendimientos-live.json.
 *
 * Uso:  npm run scrape:rend
 */

import { chromium } from 'playwright'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.join(__dirname, '../src/data/rendimientos-live.json')

const sleep = ms => new Promise(r => setTimeout(r, ms))

function loadExisting() {
  if (!existsSync(OUTPUT)) return { billeteras: [], fondos: [], lastUpdated: null }
  try { return JSON.parse(readFileSync(OUTPUT, 'utf8')) }
  catch { return { billeteras: [], fondos: [], lastUpdated: null } }
}

function findTNA(text) {
  // Match patterns like "28,00% TNA", "TNA 28%", "28.00% T.N.A", etc.
  const patterns = [
    /(\d{1,2}[.,]\d{1,2})\s*%\s*(?:T\.?N\.?A|tna)/i,
    /(?:T\.?N\.?A|tna)\s*[:=]?\s*(\d{1,2}[.,]\d{1,2})\s*%/i,
    /rendimiento[^\d]*(\d{1,2}[.,]\d{1,2})\s*%/i,
    /tasa[^\d]*(\d{1,2}[.,]\d{1,2})\s*%/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (val >= 10 && val <= 50) return val
    }
  }
  return null
}

// ── Targets ──────────────────────────────────────────────────────────────────

const BILLETERA_TARGETS = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    url: 'https://www.mercadopago.com.ar/cuenta-remunerada',
    alt_urls: ['https://www.mercadopago.com.ar/money-market'],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'uala',
    name: 'Ualá',
    url: 'https://www.uala.com.ar/rendimiento',
    alt_urls: ['https://www.uala.com.ar/cuenta-remunerada'],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'naranjax',
    name: 'Naranja X',
    url: 'https://www.naranjax.com/rendimiento',
    alt_urls: ['https://www.naranjax.com/inversion'],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'personal',
    name: 'Personal Pay',
    url: 'https://www.personalpay.com.ar/rendimiento',
    alt_urls: ['https://www.personalpay.com.ar/'],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'brubank',
    name: 'Brubank',
    url: 'https://www.brubank.com/plazo-fijo/',
    alt_urls: ['https://www.brubank.com/'],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'fiwind',
    name: 'Fiwind',
    url: 'https://www.fiwind.io/',
    alt_urls: [],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
  {
    id: 'carrefour',
    name: 'Carrefour Banco',
    url: 'https://www.bancocarrefour.com.ar/',
    alt_urls: [],
    extract: async (page) => {
      const text = await page.innerText('body')
      return findTNA(text)
    }
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dolito — Scraper de rendimientos ===')
  console.log(`Fecha: ${new Date().toISOString()}\n`)

  const existing = loadExisting()
  const existingMap = Object.fromEntries(
    (existing.billeteras || []).map(b => [b.id, b])
  )

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const billeteras = []

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'es-AR',
    })

    for (const target of BILLETERA_TARGETS) {
      console.log(`\n[${target.name}] ${target.url}`)
      let tna = null

      // Try main URL
      const page = await context.newPage()
      try {
        await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 12000 })
        await sleep(3000)
        tna = await target.extract(page)
      } catch (e) {
        console.log(`  → Main URL failed: ${e.message}`)
      }

      // Try alt URLs
      if (!tna && target.alt_urls?.length) {
        for (const alt of target.alt_urls) {
          try {
            await page.goto(alt, { waitUntil: 'domcontentloaded', timeout: 12000 })
            await sleep(3000)
            tna = await target.extract(page)
            if (tna) break
          } catch (e) { /* skip */ }
        }
      }

      await page.close()

      if (tna) {
        console.log(`  → ✓ TNA: ${tna}%`)
      } else {
        tna = existingMap[target.id]?.tna || null
        console.log(`  → ⚠ No se encontró. ${tna ? `Usando previo: ${tna}%` : 'Sin dato'}`)
      }

      billeteras.push({
        id: target.id,
        name: target.name,
        tna,
        scraped: tna !== null && tna !== existingMap[target.id]?.tna,
        lastChecked: new Date().toISOString(),
      })

      await sleep(1500)
    }
  } finally {
    await browser.close()
  }

  // ── Output ──
  const result = {
    billeteras,
    fondos: existing.fondos || [], // preserve fondos from previous run
    lastUpdated: new Date().toISOString(),
  }

  console.log('\n=== Resultado ===')
  for (const b of billeteras) {
    const icon = b.scraped ? '✓' : '⚠'
    console.log(`  ${icon} ${b.name.padEnd(20)} TNA: ${b.tna ?? '?'}%`)
  }

  writeFileSync(OUTPUT, JSON.stringify(result, null, 2))
  console.log(`\n✓ Guardado en ${OUTPUT}`)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
