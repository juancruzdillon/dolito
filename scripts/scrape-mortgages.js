import { chromium } from 'playwright'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT    = path.join(__dirname, '../public/mortgages.json')

const sleep = ms => new Promise(r => setTimeout(r, ms))

const BANK_CONFIGS = [
  {
    id: 'bna',
    name: 'Banco Nación',
    logo: '🏛️',
    url: 'https://www.bna.com.ar/Personas/CreditosHipotecarios/UVA',
    baseTna: 4.5,
    scrapeFn: async (page) => {
      await page.goto('https://www.bna.com.ar/Personas/CreditosHipotecarios/UVA', { waitUntil: 'domcontentloaded' })
      const text = await page.innerText('body')
      const match = text.match(/UVA\s?\+\s?([0-9.,]+)%/i)
      return match ? parseFloat(match[1].replace(',', '.')) : null
    }
  },
  {
    id: 'ciudad',
    name: 'Banco Ciudad',
    logo: '🏙️',
    url: 'https://www.bancociudad.com.ar/personas/creditos/hipotecarios',
    baseTna: 5.5,
    scrapeFn: async (page) => {
      await page.goto('https://www.bancociudad.com.ar/personas/creditos/hipotecarios', { waitUntil: 'domcontentloaded' })
      const text = await page.innerText('body')
      const match = text.match(/TNA\s?([0-9.,]+)%/i)
      return match ? parseFloat(match[1].replace(',', '.')) : null
    }
  },
  {
    id: 'supervielle',
    name: 'Banco Supervielle',
    logo: '🚩',
    url: 'https://www.supervielle.com.ar/personas/prestamos/hipotecarios-uva',
    baseTna: 4.0,
    scrapeFn: async (page) => {
      await page.goto('https://www.supervielle.com.ar/personas/prestamos/hipotecarios-uva', { waitUntil: 'domcontentloaded' })
      const text = await page.innerText('body')
      const match = text.match(/tasa.*?([0-9.,]+)%/i)
      return match ? parseFloat(match[1].replace(',', '.')) : null
    }
  },
  {
    id: 'galicia',
    name: 'Banco Galicia',
    logo: '🍊',
    url: 'https://www.galicia.com.ar/personas/prestamos/hipotecarios-uva',
    baseTna: 5.5,
    scrapeFn: async (page) => {
      await page.goto('https://www.galicia.com.ar/personas/prestamos/hipotecarios-uva', { waitUntil: 'domcontentloaded' })
      const text = await page.innerText('body')
      const match = text.match(/([0-9.,]+)%\s?\+\s?UVA/i) || text.match(/UVA\s?\+\s?([0-9.,]+)%/i)
      return match ? parseFloat(match[1].replace(',', '.')) : null
    }
  }
]

async function main() {
  console.log('=== Dolito — Scraper de Tasas Hipotecarias UVA ===')
  
  const browser = await chromium.launch({ headless: true })
  const results = []

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()
    // Speed up by blocking non-essential resources
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2}', r => r.abort())

    for (const bank of BANK_CONFIGS) {
      console.log(`Scraping ${bank.name}...`)
      let tna = bank.baseTna
      try {
        const scraped = await bank.scrapeFn(page)
        if (scraped && scraped > 0 && scraped < 20) {
          tna = scraped
          console.log(`  → ✓ Encontrado: ${tna}%`)
        } else {
          console.log(`  → ⚠ Usando fallback: ${tna}%`)
        }
      } catch (e) {
        console.log(`  → ✖ Error: ${e.message}. Usando fallback: ${tna}%`)
      }

      results.push({
        id: bank.id,
        bankName: bank.name,
        logo: bank.logo,
        tna: tna,
        term: bank.id === 'bna' || bank.id === 'supervielle' ? '30 años' : '20 años',
        financing: bank.id === 'supervielle' ? '80%' : '75%',
        affectation: '25%',
        isSalaryAccount: true,
        link: bank.url,
        updatedAt: new Date().toISOString()
      })
      await sleep(1000)
    }
  } finally {
    await browser.close()
  }

  writeFileSync(OUTPUT, JSON.stringify(results, null, 2))
  console.log(`\n✓ Finalizado. Datos guardados en ${OUTPUT}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
