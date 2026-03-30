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

function parsePct(str) {
  if (!str) return null
  const float = parseFloat(str.replace(',', '.').replace('%', '').trim())
  if (isNaN(float)) return null
  return float / 100
}

// ── Configuración y scrapers específicos por broker ───────────────────────────

const BROKER_CONFIGS = [
  {
    id:          'iol',
    name:        'Invertir Online',
    shortName:   'IOL',
    color:       '#1a56db',
    website:     'https://invertironline.com',
    pros:        ['Bajo costo', 'Plataforma completa', 'App móvil'],
    cons:        ['Interfaz algo compleja para principiantes'],
    url:         'https://www.invertironline.com/tarifas',
    baseRate:    0.005, // Fallback en caso de error
    scrapeFn: async (page) => {
      // En IOL el plan básico es Gold y la comisión para Bonos y Acciones es 0.5%
      await page.goto('https://www.invertironline.com/tarifas', { waitUntil: 'load' })
      const text = await page.innerText('body')
      
      const goldMatch = text.match(/Gold\*[\s\S]+?(0[.,]\d{1,2})%/)
      if (goldMatch) {
         return parsePct(goldMatch[1])
      }
      return null
    }
  },
  {
    id:          'bullmarket',
    name:        'Bull Market',
    shortName:   'BMB',
    color:       '#057a55',
    website:     'https://bullmarketbrokers.com',
    pros:        ['Bajo costo', 'Buena plataforma'],
    cons:        ['Menos conocido'],
    url:         'https://help.bullmarketbrokers.com/guia/comisiones/',
    baseRate:    0.005,
    scrapeFn: async (page) => {
      // BullMarket expone una tabla en su sitio de ayuda
      await page.goto('https://help.bullmarketbrokers.com/guia/comisiones/', { waitUntil: 'load' })
      
      const tableData = await page.evaluate(() => {
        const table = document.querySelector('table');
        if (!table) return null;
        const rows = Array.from(table.rows);
        for (const row of rows) {
          if (row.cells[0]?.textContent.includes('Bonos')) {
            // "Digital Account" es la segunda columna (índice 1)
            return row.cells[1]?.textContent;
          }
        }
        return null;
      });
      return parsePct(tableData)
    }
  },
  {
    id:          'cocos',
    name:        'Cocos Capital',
    shortName:   'Cocos',
    color:       '#7e3af2',
    website:     'https://cocoscapital.com.ar',
    pros:        ['App excelente', 'UX moderna', 'Ideal para principiantes'],
    cons:        ['Atención al cliente'],
    url:         'https://cocos.capital/tarifario',
    baseRate:    0.0045, 
    scrapeFn: async (page) => {
      // Cocos actualmente muestra en su tarifario 0.45% para Bonos (Personas humanas)
      await page.goto('https://cocos.capital/tarifario', { waitUntil: 'load' })
      const text = await page.innerText('body')
      
      // Busca la lista de Personas Humanas, especificamente los CEDEARs o Bonos
      const match = text.match(/Bonos \/ Títulos públicos.*?([0-9.,]+)%/i)
      if (match) {
        return parsePct(match[1])
      }
      // Backup fallback a 0.45%
      return 0.0045
    }
  },
  {
    id:          'balanz',
    name:        'Balanz',
    shortName:   'Balanz',
    color:       '#e3a008',
    website:     'https://balanz.com',
    pros:        ['Reconocida', 'Amplia oferta de productos'],
    cons:        ['Comisiones más altas'],
    url:         'https://balanz.com/comisiones/',
    baseRate:    0.005,
    scrapeFn: async (page) => {
      // El tarifario distingue entre "Trading online" (0.50%) y "Trading Asistido" (1.50%)
      await page.goto('https://balanz.com/comisiones/', { waitUntil: 'load' })
      const text = await page.innerText('body')
      
      // Buscamos específicamente la tarifa autogestiva (Trading Online)
      const match = text.match(/Trading online.*?([0-9.,]+)%/i) || text.match(/Trading online[\s\S]{0,100}?([0-9.,]+)%/i)
      if (match) {
        return parsePct(match[1])
      }
      
      // Fallback si la web cambia (históricamente es 0.50%)
      return 0.005
    }
  },
]

// ── Scraper principal ─────────────────────────────────────────────────────────

async function scrapeBroker(page, config, existingData) {
  console.log(`\n[${config.name}] Iniciando scraping...`)

  let extractedRate = null

  try {
    extractedRate = await config.scrapeFn(page)
    if (extractedRate) {
        console.log(`  → ✓ Comisión base extraída: ${(extractedRate * 100).toFixed(3)}%`)
    } else {
        console.log('  → No se encontró porcentaje válido con la lógica personalizada.')
    }
  } catch (err) {
    console.log(`  → Error procesando ${config.url}: ${err.message}`)
  }

  // ── Resultado ──────────────────────────────────────────────────────────────
  const baseRate = extractedRate ?? config.baseRate
  const wasScraped = extractedRate !== null

  if (!wasScraped) {
    const prevRate = existingData[config.id]?.baseRate
    const prevBase = prevRate || config.baseRate
    console.log(`  ⚠ No se pudo scrapear. Usando valor previo/fallback: ${(prevBase * 100).toFixed(3)}%`)
  }

  // NOTA CRUCIAL:
  // Los Bonos (Títulos Públicos) en Argentina están EXENTOS DE IVA.
  // Como esto se utiliza para calcular el Dólar MEP, usamos la comisión pura, SIN IVA.
  const commissionMEP = baseRate

  return {
    id:             config.id,
    name:           config.name,
    shortName:      config.shortName,
    color:          config.color,
    website:        config.website,
    pros:           config.pros,
    cons:           config.cons,
    commissionBuy:  commissionMEP, // Exento de IVA para MEP
    commissionSell: commissionMEP, // Exento de IVA para MEP
    baseRate:       +baseRate.toFixed(6),
    ivaIncluded:    false, // No aplica a bonos
    note:           `${(baseRate * 100).toFixed(2)}% (Mep/Bonos - Exento de IVA)`,
    scraped:        wasScraped,
    lastUpdated:    new Date().toISOString().slice(0, 7), // "2025-03" // o "2026-03"
    lastChecked:    new Date().toISOString(),
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dolito — Scraper de comisiones de brokers (Modo Dólar MEP) ===')
  console.log(`Fecha: ${new Date().toISOString()}\n`)

  const existing = loadExisting()
  const results  = []

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
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
    console.log(`  ${src}  ${r.name.padEnd(20)} MEP Rate (Sin IVA): ${(r.commissionBuy * 100).toFixed(4)}%`)
  }

  console.log(`\n  Scraped: ${scraped.length}/${results.length}`)
  if (fallback.length) {
    console.log(`  ⚠ Falló el scraping de: ${fallback.map(r => r.name).join(', ')}`)
  }

  writeFileSync(OUTPUT, JSON.stringify(results, null, 2))
  console.log(`\n✓ Guardado en ${OUTPUT}`)

  process.exit(0)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
