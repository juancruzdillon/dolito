import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const BANK_ASSET_MAP = {
  'NACION': 'bna.png',
  'GALICIA': 'bgalicia.png',
  'SANTANDER': 'bsantander.png',
  'BBVA': 'bbvaargentina.png',
  'MACRO': 'bmacro.png',
  'ICBC': 'bicbc.png',
  'INDUSTRIAL': 'bicbc.png',
  'PATAGONIA': 'bpatagonia.svg',
  'CIUDAD': 'bciudad.png',
  'SUPERVIELLE': 'bsupervielle.svg',
  'COMAFI': 'bcomafi.png',
  'HIPOTECARIO': 'bhipotecario.png',
  'SOL': 'bdelsol.svg',
  'BRUBANK': 'bbrubank.svg',
  'BANCOR': 'bbancor.svg',
  'CORDOBA': 'bbancor.svg',
  'CORRIENTES': 'bdecorrientes.svg',
  'CHUBUT': 'bdelchubut.png',
  'CREDICOOP': 'bcredicop.png',
  'ROSARIO': 'bmunicipalrosario.svg',
  'MUNICIPAL': 'bmunicipalrosario.svg',
  'NEUQUEN': 'bbancodelneuquensvg.svg',
  'VILLA': 'bgrupopetersen.svg',
  'SANTA CRUZ': 'bsantacruz.svg',
  'SAN JUAN': 'bsanjuan.svg',
  'ENTRE RIOS': 'bentrerios.svg',
  'SANTA FE': 'bsantafe.svg',
  'TIERRA DEL FUEGO': 'btierradelfuego.svg',
  'VOII': 'bvoii.png',
  'CARREFOUR': 'bcarrefour.png',
  'MERCADO PAGO': 'bmercadopago.png',
  'DINO': 'bdino.svg'
}

// Map real API strings directly for 100% accuracy
const COMMERCIAL_NAMES = {
  'INDUSTRIAL AND COMMERCIAL BANK OF CHINA': 'ICBC',
  'ICBC': 'ICBC',
  'BANCO DE LA NACION ARGENTINA': 'Nación',
  'BANCO DE GALICIA Y BUENOS AIRES': 'Galicia',
  'BANCO SANTANDER ARGENTINA': 'Santander',
  'BANCO BBVA ARGENTINA': 'BBVA',
  'BANCO DE LA PROVINCIA DE CORDOBA': 'Bancor',
  'BANCO DE LA PROVINCIA DE BUENOS AIRES': 'Banco Provincia',
  'BANCO PROVINCIA DE BUENOS AIRES': 'Banco Provincia',
  'BANCO DE LA CIUDAD DE BUENOS AIRES': 'Ciudad',
  'BANCO DE EL CHUBUT': 'Banco del Chubut',
  'BANCO MUNICIPAL DE ROSARIO': 'Bco. Municipal',
  'PROVINCIA DEL NEUQUEN': 'Bco. del Neuquén',
  'BANCO PROVINCIA DEL NEUQUÉN': 'Bco. del Neuquén',
  'BANCO CREDICOOP': 'Credicoop',
  'BANCO COMAFI': 'Comafi',
  'BANCO PATAGONIA': 'Patagonia',
  'BANCO MACRO': 'Macro',
  'BANCO DE SAN JUAN': 'Banco San Juan',
  'BANCO DE SANTA CRUZ': 'Banco Santa Cruz',
  'BANCO PROVINCIA DE TIERRA DEL FUEGO': 'BTF',
  'NUEVO BANCO DE SANTA FE': 'Banco Santa Fe',
  'NUEVO BANCO DE ENTRE RIOS': 'Banco Entre Ríos'
}

function normalize(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export const useMortgageStore = defineStore('mortgage', () => {
  const loading = ref(false)
  const lastUpdated = ref(null)
  const rates = ref([])
  const showSalaryRates = ref(true) // Default to "Con Sueldo" as it's often more convenient
  const itemsPerPage = ref(6)
  const visibleItemsCount = ref(6)

  // Deduplicate and filter by "Con Sueldo" toggle
  const filteredRates = computed(() => {
    if (!rates.value.length) return []

    const bestByBank = new Map()

    rates.value.forEach(item => {
      const bankKey = item.bankName.toUpperCase()
      const isSalary = item.isSalaryAccount

      // Filter by salary toggle
      if (isSalary !== showSalaryRates.value) return

      const existing = bestByBank.get(bankKey)
      if (!existing || item.tna < existing.tna) {
        bestByBank.set(bankKey, item)
      }
    })

    return Array.from(bestByBank.values()).sort((a, b) => a.tna - b.tna)
  })

  const paginatedRates = computed(() => {
    return filteredRates.value.slice(0, visibleItemsCount.value)
  })

  const hasMore = computed(() => {
    return visibleItemsCount.value < filteredRates.value.length
  })

  function loadMore() {
    visibleItemsCount.value += itemsPerPage.value
  }

  function transformBcraData(bcraResults) {
    return bcraResults
      .filter(item => item.denominacion === 'UVA')
      .map(item => {
        const fullName = item.descripcionEntidad.trim()
        const normFullName = normalize(fullName)

        // Match logo using normalized name
        let matchedLogo = null
        for (const [key, val] of Object.entries(BANK_ASSET_MAP)) {
          if (normFullName.includes(key)) {
            matchedLogo = val
            break
          }
        }

        // Commercial Name Logic (Normalization + Map search)
        let bankName = fullName.split(' S.A.')[0]
          .replace('BANCO DE LA ', '')
          .replace('BANCO DE ', '')
          .replace('BANCO ', '')
          .replace('SOCIEDAD ANONIMA', '')
          .replace('SOCIEDAD ANÓNIMA', '')
          .trim()

        // Search in COMMERCIAL_NAMES using normalization for comparison
        for (const [legal, comm] of Object.entries(COMMERCIAL_NAMES)) {
          if (normFullName.includes(normalize(legal))) {
            bankName = comm
            break
          }
        }

        return {
          id: `bank-${item.codigoEntidad}-${item.tasaEfectivaAnualMaxima}-${item.beneficiario}`,
          bankName: bankName,
          fullName: fullName,
          logo: matchedLogo,
          tna: item.tasaEfectivaAnualMaxima,
          term: `${item.plazoMaximoOtorgable / 12} años`,
          financing: `${item.relacionMontoTasacion || 75}%`,
          affectation: `${item.relacionCuotaIngreso || 25}%`,
          isSalaryAccount: item.beneficiario?.toLowerCase().includes('sueldo') || false,
          updatedAt: item.fechaInformacion || new Date().toISOString().split('T')[0]
        }
      })
  }

  async function fetchMortgageRates(force = false) {
    if (loading.value && !force) return
    loading.value = true

    try {
      const response = await fetch('https://api.bcra.gob.ar/transparencia/v1.0/Prestamos/Hipotecarios')
      const data = await response.json()

      if (data && data.results) {
        rates.value = transformBcraData(data.results)
      }

      lastUpdated.value = new Date().toLocaleDateString('es-AR')
    } catch (err) {
      console.error('Error fetching BCRA mortgages:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    rates,
    filteredRates,
    paginatedRates,
    hasMore,
    loading,
    lastUpdated,
    showSalaryRates,
    fetchMortgageRates,
    loadMore
  }
})
