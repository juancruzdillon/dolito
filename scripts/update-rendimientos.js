/**
 * update-rendimientos.js
 * ----------------------
 * Script CLI para actualizar tasas de billeteras manualmente.
 * Las billeteras no exponen la TNA en páginas scrapeables (son SPAs).
 *
 * Uso:
 *   node scripts/update-rendimientos.js                     # muestra valores actuales
 *   node scripts/update-rendimientos.js mercadopago=26.5    # actualiza Mercado Pago
 *   node scripts/update-rendimientos.js uala=23.5 brubank=22 naranjax=21 # múltiples
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.join(__dirname, '../src/data/rendimientos-live.json')

const VALID_IDS = ['mercadopago', 'carrefour', 'fiwind', 'uala', 'personal', 'naranjax', 'brubank']

function load() {
  if (!existsSync(OUTPUT)) return { billeteras: [], fondos: [], lastUpdated: null }
  try { return JSON.parse(readFileSync(OUTPUT, 'utf8')) }
  catch { return { billeteras: [], fondos: [], lastUpdated: null } }
}

const data = load()
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('=== Tasas actuales en rendimientos-live.json ===\n')
  if (!data.billeteras?.length) {
    console.log('  (vacío — ninguna tasa definida)')
    console.log('\n  Uso: node scripts/update-rendimientos.js mercadopago=26.5 uala=23\n')
  } else {
    for (const b of data.billeteras) {
      console.log(`  ${b.id.padEnd(15)} ${b.tna != null ? b.tna + '%' : '?'}  (${b.lastChecked?.slice(0, 10) || '?'})`)
    }
  }
  console.log(`\n  IDs válidos: ${VALID_IDS.join(', ')}`)
  console.log(`  Última actualización: ${data.lastUpdated || 'nunca'}`)
  process.exit(0)
}

// Parse updates
const updates = {}
for (const arg of args) {
  const [id, val] = arg.split('=')
  if (!VALID_IDS.includes(id)) {
    console.error(`✗ ID inválido: "${id}". Válidos: ${VALID_IDS.join(', ')}`)
    process.exit(1)
  }
  const tna = parseFloat(val)
  if (isNaN(tna) || tna < 1 || tna > 100) {
    console.error(`✗ TNA inválida para ${id}: "${val}". Debe ser un número entre 1 y 100.`)
    process.exit(1)
  }
  updates[id] = tna
}

// Apply updates
const existingMap = Object.fromEntries(
  (data.billeteras || []).map(b => [b.id, b])
)

for (const [id, tna] of Object.entries(updates)) {
  existingMap[id] = {
    ...(existingMap[id] || {}),
    id,
    name: existingMap[id]?.name || id,
    tna,
    scraped: true,
    lastChecked: new Date().toISOString(),
  }
}

data.billeteras = VALID_IDS.map(id => existingMap[id] || { id, name: id, tna: null })
data.lastUpdated = new Date().toISOString()

writeFileSync(OUTPUT, JSON.stringify(data, null, 2))

console.log('\n✓ Actualizado rendimientos-live.json:\n')
for (const [id, tna] of Object.entries(updates)) {
  console.log(`  ${id.padEnd(15)} → ${tna}%`)
}
console.log(`\n  Reiniciá npm run dev para ver los cambios.`)
