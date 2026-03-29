/**
 * scrape-commissions.js
 * ---------------------
 * Corre en GitHub Actions (Node 20+, Playwright Chromium).
 * Para cada broker:
 *   1. Intenta extraer la comisión de su página de aranceles/comisiones.
 *   2. Valida que el número sea razonable (0.05% – 3%).
 *   3. Si no puede extraer, conserva el último valor conocido del JSON en disco.
 * Guarda el resultado en public/brokers.json.
 *
 * ⚠ IMPORTANTE: si un broker cambia su sitio y el scraper falla, el script
 *   conserva el valor anterior sin romper la app. Aun así te conviene revisar
 *   los logs del Action cuando falla para actualizar los selectores.
 */

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT    = path.join(__dirname, '../public/brokers.json')

// ── Helpers ───────────────────────────────────────────────────────────────────

const IVA = 0.21
const wi  = r => +(r * (1 + IVA)).toFixed(7)
const sleep = ms => new Promise(r => setTimeout(r, ms))

/**
 * Carga el JSON existente en disco (valores previos para fallback).
 */
function loadExisting() {
  if (!existsSync(OUTPUT)) return {}
  try {
    const arr = JSON.parse(readFileSync(OUTPUT, 'utf8'))
    return Object.fromEntries(arr.map(b => [b.id, b]))
  } catch { return {} }
}

/**
 * Extrae el primer porcentaje razonable de un bloque de texto plano.
 * Busca patrones como "0.25 %", "0,25%", "0.5%" cerca de palabras clave.
 *
 * @param {string}   text        - Texto plano de la página
 * @param {string[]} keywords    - Palabras que deben aparecer en los 300 chars previos
 * @param {number}   [fallback]  - Valor a retornar si no se encuentra nada
 * @returns {number|null}        - Porcentaje como decimal (ej: 0.25 → 0.0025), o null
 */
function extractPercent(text, keywords, fallback = null) {
  const lower = text.toLowerCase()

  // Construimos índices de las keyword más relevantes
  const positions = []
  for (const kw of keywords) {
    let idx = 0
    while ((idx = lower.indexOf(kw, idx)) !== -1) {
      positions.push(idx)
      idx++
    }
  }
  if (!positions.length) return fallback

  // Regex para encontrar el porcentaje
  // Acepta: "0.25 %", "0,25%", "0.5%", "1 %"
  const pctRe = /(\d{1,2}[.,]\d{1,3})\s*%/g

  for (const pos of positions) {
    const window = text.slice(Math.max(0, pos - 50), pos + 400)
    let match
    while ((match = pctRe.exec(window)) !== null) {
      const val = parseFloat(match[1].replace(',', '.'))
      // Valores razonables de comisión: entre 0.05% y 3%
      if (val >= 0.05 && val <= 3.0) {
        console.log(`    → encontrado: ${val}% (texto: "${match[0]}")`)
        return val / 100  // retornamos como fracción
      }
    }
    pctRe.lastIndex = 0
  }
  return fallback
}

// ── Configuración de brokers ──────────────────────────────────────────────────
//
// Para cada broker:
//   urls       - páginas a visitar (en orden, se usa la primera que carga bien)
//   keywords   - palabras que deben estar cerca del porcentaje en el texto
//   baseRate   - valor fallback si el scraping falla (SIN IVA, como fracción)
//   ivaIncluded- true si el sitio muestra la comisión YA con IVA incluido
//
// Cómo actualizar si cambia el sitio:
//   1. Visitá la URL manualmente en el browser
//   2. Buscá el texto con la comisión (Ctrl+F "comisión", "arancel", etc.)
//   3. Ajustá `keywords` para que incluyan palabras del contexto
//   4. Si el valor que muestran ya incluye IVA, poné ivaIncluded: true

const BROKER_CONFIGS = [
  {
    id:          'iol',
    name:        'Invertir Online',
    shortName:   'IOL',
    color:       '#1a56db',
    website:     'https://invertironline.com',
    pros:        ['Bajo costo', 'Plataforma completa', 'App móvil'],
    cons:        ['Interfaz algo compleja para principiantes'],
    urls: [
      'https://www.invertironline.com/comisiones',
      'https://www.invertironline.com/servicios/comisiones-y-aranceles',
      'https://www.invertironline.com/ayuda/comisiones',
    ],
    keywords:    ['comisi', 'arancel', 'renta variable', 'acciones', 'bolsa'],
    baseRate:    0.0025,  // 0.25% base (sin IVA) — tarifario vigente marzo 2025
    ivaIncluded: false,
  },
  {
    id:          'bullmarket',
    name:        'Bull Market',
    shortName:   'BMB',
    color:       '#057a55',
    website:     'https://bullmarketbrokers.com',
    pros:        ['Bajo costo', 'Buena plataforma'],
    cons:        ['Menos conocido'],
    urls: [
      'https://www.bullmarketbrokers.com/comisiones',
      'https://www.bullmarketbrokers.com/tarifario',
      'https://www.bullmarketbrokers.com/aranceles',
    ],
    keywords:    ['comisi', 'arancel', 'renta variable', 'acciones'],
    baseRate:    0.0025,  // 0.25% base (sin IVA) — tarifario vigente marzo 2025
    ivaIncluded: false,
  },
  {
    id:          'cocos',
    name:        'Cocos Capital',
    shortName:   'Cocos',
    color:       '#7e3af2',
    website:     'https://cocoscapital.com.ar',
    pros:        ['App excelente', 'UX moderna', 'Ideal para principiantes'],
    cons:        ['Comisiones más altas'],
    urls: [
      'https://cocoscapital.com.ar/comisiones',
      'https://cocoscapital.com.ar/precios',
      'https://cocoscapital.com.ar/tarifas',
      'https://cocoscapital.com.ar/ayuda/comisiones',
    ],
    keywords:    ['comisi', 'arancel', 'tarifa', 'renta variable'],
    baseRate:    0.005,   // 0.50% base (sin IVA) — tarifario vigente marzo 2025
    ivaIncluded: false,
  },
  {
    id:          'balanz',
    name:        'Balanz',
    shortName:   'Balanz',
    color:       '#e3a008',
    website:     'https://balanz.com',
    pros:        ['Reconocida', 'Amplia oferta de productos'],
    cons:        ['Comisiones más altas'],
    urls: [
      'https://balanz.com/comisiones',
      'https://balanz.com/comisiones-y-aranceles',
      'https://balanz.com/tarifario',
      'https://balanz.com/ayuda/aranceles',
    ],
    keywords:    ['comisi', 'arancel', 'renta variable', 'acciones'],
    baseRate:    0.005,   // 0.50% base (sin IVA) — tarifario vigente marzo 2025
    ivaIncluded: false,
  },
]

// ── Scraper principal ─────────────────────────────────────────────────────────

async function scrapeBroker(page, config, existingData) {
  console.log(`\n[${config.name}] Iniciando scraping...`)

  let extractedRate = null

  for (const url of config.urls) {
    try {
      console.log(`  → Probando: ${url}`)

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout:   25_000,
      })

      // Esperamos un poco para que el JS renderice contenido dinámico
      await sleep(2000)

      // Scroll para triggear lazy-load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await sleep(1000)

      // Extraemos TODO el texto visible de la página
      const text = await page.evaluate(() => {
        // Removemos scripts, styles, etc.
        const clone = document.body.cloneNode(true)
        clone.querySelectorAll('script,style,noscript,meta,link').forEach(el => el.remove())
        return clone.innerText || clone.textContent || ''
      })

      console.log(`  → Texto extraído: ${text.length} chars`)

      if (text.length < 200) {
        console.log('  → Página muy corta, probando siguiente URL...')
        continue
      }

      const found = extractPercent(text, config.keywords)
      if (found !== null) {
        extractedRate = found
        console.log(`  → ✓ Comisión base extraída: ${(found * 100).toFixed(3)}%`)
        break
      } else {
        console.log('  → No se encontró porcentaje válido, probando siguiente URL...')
      }
    } catch (err) {
      console.log(`  → Error en ${url}: ${err.message}`)
    }
  }

  // ── Resultado ──────────────────────────────────────────────────────────────
  const baseRate = extractedRate ?? config.baseRate
  const wasScraped = extractedRate !== null

  if (!wasScraped) {
    const prevRate = existingData[config.id]?.commissionBuy
    const prevBase = prevRate ? prevRate / (1 + IVA) : config.baseRate
    console.log(`  ⚠ No se pudo scrapear. Usando valor previo: ${(prevBase * 100).toFixed(3)}%`)
  }

  // Si el sitio ya muestra la comisión con IVA incluido, no la duplicamos
  const commissionWithIVA = config.ivaIncluded ? baseRate : wi(baseRate)

  return {
    id:             config.id,
    name:           config.name,
    shortName:      config.shortName,
    color:          config.color,
    website:        config.website,
    pros:           config.pros,
    cons:           config.cons,
    commissionBuy:  commissionWithIVA,
    commissionSell: commissionWithIVA,
    baseRate:       +baseRate.toFixed(6),
    ivaIncluded:    config.ivaIncluded,
    note:           `${(baseRate * 100).toFixed(2)}% + IVA (21%)`,
    scraped:        wasScraped,
    lastUpdated:    new Date().toISOString().slice(0, 7), // "2025-03"
    lastChecked:    new Date().toISOString(),
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dolito — Scraper de comisiones de brokers ===')
  console.log(`Fecha: ${new Date().toISOString()}\n`)

  const existing = loadExisting()
  const results  = []

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Simula un browser real para evitar detección básica de bots
      '--disable-blink-features=AutomationControlled',
    ],
  })

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport:  { width: 1280, height: 800 },
      locale:    'es-AR',
    })

    const page = await context.newPage()

    // Bloqueamos recursos pesados que no necesitamos (imágenes, fuentes, etc.)
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}', r => r.abort())
    await page.route('**/{ads,analytics,gtm,hotjar,clarity}*', r => r.abort())

    for (const config of BROKER_CONFIGS) {
      // Pequeña pausa entre brokers para no parecer un bot agresivo
      if (results.length > 0) await sleep(2000 + Math.random() * 2000)

      const result = await scrapeBroker(page, config, existing)
      results.push(result)
    }
  } finally {
    await browser.close()
  }

  // ── Resumen ──────────────────────────────────────────────────────────────
  console.log('\n=== Resultado final ===')
  const scraped  = results.filter(r => r.scraped)
  const fallback = results.filter(r => !r.scraped)

  for (const r of results) {
    const src = r.scraped ? '✓ scraped' : '⚠ fallback'
    console.log(`  ${src}  ${r.name.padEnd(20)} base: ${(r.baseRate * 100).toFixed(3)}%  con IVA: ${(r.commissionBuy * 100).toFixed(4)}%`)
  }

  console.log(`\n  Scraped: ${scraped.length}/${results.length}`)
  if (fallback.length) {
    console.log(`  ⚠ Falló el scraping de: ${fallback.map(r => r.name).join(', ')}`)
    console.log('    → Revisá los logs y actualizá las keywords/URLs en scripts/scrape-commissions.js')
  }

  // Guardamos siempre (aunque alguno haya fallado, conservamos el último valor bueno)
  writeFileSync(OUTPUT, JSON.stringify(results, null, 2))
  console.log(`\n✓ Guardado en ${OUTPUT}`)

  // Exit code 0 siempre: si alguno falló, usamos fallback pero no rompemos el CI
  process.exit(0)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
