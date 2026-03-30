import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT    = path.join(__dirname, '../public/icl.json')

async function main() {
  console.log('=== Dolito — Scraper de Índice ICL (Dolarito.ar) ===')
  
  try {
    const res = await fetch('https://api.dolarito.ar/api/frontend/indices/icl', {
      headers: {
        'auth-client': 'f7d471ab0a4ff2b7947759d985ed1db0',
        'referer': 'https://www.dolarito.ar/indices/indice-icl',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    })

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`)
    }

    const data = await res.json()
    
    // Sort and clean if needed, but the original structure is key-value (Date: Value)
    // We'll keep it as is for easy lookup.
    
    writeFileSync(OUTPUT, JSON.stringify(data, null, 2))
    console.log(`\n✓ Finalizado. Datos guardados en ${OUTPUT}`)
    console.log(`✓ Registros obtenidos: ${Object.keys(data).length}`)
    
  } catch (err) {
    console.error(`\n✖ Error crítico: ${err.message}`)
    process.exit(1)
  }
}

main()
