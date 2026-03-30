<div align="center">
  <br />
  <img src="public/favicon.svg" width="64" height="64" alt="Dolito" />
  <h1>dolito</h1>
  <p><strong>El precio real del dólar para el argentino que quiere entrar en finanzas y no sabe cómo.</strong></p>
  <p>Cotizaciones en vivo · MEP con comisiones reales · Calculadoras · Guía para invertir</p>
  <br />

  ![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
  ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
  ![Sin backend](https://img.shields.io/badge/sin_backend-100%25_estático-22c55e?style=flat-square)

  <br /><br />
</div>

---

## El problema que resuelve

Tu broker muestra **Dólar MEP: $1.420**. Operás. Recibís $1.387.

La diferencia son las comisiones: el broker cobra en la compra del bono (en pesos) *y* en la venta (en dólares). Nadie te lo avisa hasta que ya operaste.

**Dolito calcula el precio real** antes de que muevas un peso.

---

## Qué hace

<table>
<tr>
<td valign="top" width="50%">

#### 💱 Cotizaciones en tiempo real
Oficial · Blue · MEP · CCL · Tarjeta · Mayorista · Cripto

Actualización automática cada **5 minutos** con caché local. Muestra la mejor cotización del día y la brecha con el oficial.

</td>
<td valign="top" width="50%">

#### 🎯 MEP con comisiones reales
El corazón de Dolito. Ingresás el monto en pesos y ves exactamente cuántos dólares recibís en cada broker, con las comisiones ya descontadas.

```
Mercado:    $1.420,00
IOL:        $1.428,61  (+0.60%)
Bull Mkt:   $1.428,61  (+0.60%)
Cocos:      $1.437,27  (+1.22%)
Balanz:     $1.437,27  (+1.22%)
```

</td>
</tr>
<tr>
<td valign="top">

#### 📈 Histórico de precios
Gráfico de evolución para cualquier tipo de cambio. Período seleccionable: 7 días, 1 mes, 3 meses, 6 meses, 1 año. Estadísticas de máximo, mínimo y variación.

</td>
<td valign="top">

#### 🧮 Calculadoras financieras
- **Plazo fijo** — TNA → intereses, total, TEA
- **LECAP** — precio de mercado → TIR real
- **Bono** — YTM via Newton-Raphson
- **Inflación** — rendimiento real ajustado

</td>
</tr>
<tr>
<td valign="top">

#### 📚 Guía para invertir
De cero a operando. Tipos de dólar explicados, paso a paso para abrir cuenta en un broker, cómo comprar tu primer MEP, instrumentos disponibles (FCI, LECAP, bonos, CEDEARs) y glosario completo.

</td>
<td valign="top">

#### ⚖️ Comparaciones
Todas las cotizaciones lado a lado con barras visuales. Responde "¿con $100.000 cuántos dólares obtengo por cada método?" incluyendo el MEP real por broker.

</td>
</tr>
</table>

---

## Comisiones siempre actualizadas

Las comisiones de los brokers cambian. Dolito las scrapea automáticamente todos los días.

```
Cron diario (8am ARG)
  └─ GitHub Action
       └─ Playwright abre cada página de broker en Chromium
            └─ Extrae el % de comisión del texto visible
                 ├─ ¿Encontró valor válido? → lo guarda
                 └─ ¿Falló? → conserva el último valor conocido
                      └─ Commitea public/brokers.json al repo
                           └─ Vercel/Netlify rebuild automático
```

La app indica en tiempo real de dónde vienen los datos:

| Estado | Significado |
|--------|-------------|
| 🟢 Comisiones actualizadas | Scrapeó correctamente hoy |
| 🟡 Comisiones por defecto | Falló el scraping, usando último valor conocido |

La app **nunca se rompe**: si el scraping falla, usa el último dato bueno.

---

## Stack

| | Tecnología | Decisión |
|-|-----------|----------|
| Framework | Vue 3 + Composition API | Reactivo sin overhead |
| Build | Vite 5 | Dev instantáneo, chunks automáticos |
| Estilos | Tailwind CSS 3 | Diseño consistente sin CSS custom |
| Estado | Pinia | Store simple, sin boilerplate |
| Gráficos | Chart.js + vue-chartjs | Liviano y flexible |
| Íconos | lucide-vue-next | Tree-shakeable, consistentes |
| Scraping | Playwright (Chromium) | Soporta SPAs con JS rendering |
| CI | GitHub Actions | Gratuito, cron nativo |
| APIs | dolarapi.com + argentinadatos.com | Públicas, CORS habilitado |
| Deploy | Vercel / Netlify | Free tier, rebuild por commit |

> **Sin backend propio.** Todo corre en el browser. Costo de infraestructura: $0.

---

## Instalación

```bash
git clone https://github.com/TU_USUARIO/dolito.git
cd dolito
npm install
npm run dev
```

Abre `http://localhost:5173`.

### Variables de entorno

```bash
cp .env.example .env
```

```env
# Opcional: URL alternativa para el JSON de comisiones
# Si no se configura, usa /brokers.json del mismo repo
VITE_BROKERS_CONFIG_URL=
```

### Correr el scraper manualmente

```bash
npx playwright install chromium   # solo la primera vez
npm run scrape                     # actualiza public/brokers.json
```

---

## Estructura

```
dolito/
├── public/
│   └── brokers.json                 # ← generado por el bot diario
├── src/
│   ├── stores/
│   │   ├── dolar.js                 # cotizaciones + caché
│   │   └── brokers.js               # comisiones + cálculo MEP real
│   ├── views/
│   │   ├── HomeView.vue             # inicio: cotizaciones + MEP
│   │   ├── HistoricalView.vue       # gráfico histórico
│   │   ├── ComparacionView.vue      # comparación de tipos
│   │   ├── CalculadorasView.vue     # calculadoras financieras
│   │   └── AprendizajeView.vue      # guía para invertir
│   └── components/
│       ├── home/
│       │   ├── BestRateBanner.vue   # mejor cotización del día
│       │   ├── RateCard.vue         # card de cotización individual
│       │   └── MEPSection.vue       # MEP real por broker
│       └── historical/
│           └── PriceChart.vue       # gráfico Chart.js
├── scripts/
│   └── scrape-commissions.js        # scraper Playwright
└── .github/
    └── workflows/
        └── scrape-commissions.yml   # cron diario 8am ARG
```

---

## Deploy

### Vercel

```bash
npx vercel --prod
```

O conectá el repo en vercel.com → cada commit del bot dispara rebuild automático.

### Netlify

Conectá el repo en netlify.com con:

```
Build command:   npm run build
Publish dir:     dist
```

---

## APIs

| API | Endpoint usado | Costo |
|-----|----------------|-------|
| [dolarapi.com](https://dolarapi.com) | `GET /v1/dolares` — todas las cotizaciones actuales | Gratis |
| [argentinadatos.com](https://api.argentinadatos.com) | `GET /v1/cotizaciones/dolares/{tipo}` — serie histórica | Gratis |

---

## Roadmap

- [ ] Notificaciones push cuando el MEP baja de un precio objetivo
- [ ] Modo oscuro
- [ ] PWA (instalable en el celular)
- [ ] Alertas de brecha cambiaria
- [ ] Soporte para más brokers

---

## Contribuir

Pull requests bienvenidos. Para cambios grandes, abrí un issue primero.

Si las comisiones de un broker cambiaron y el scraper no las detectó, el lugar para arreglarlo es [`scripts/scrape-commissions.js`](scripts/scrape-commissions.js) — buscá el broker correspondiente y ajustá `urls` o `keywords`.

---

<div align="center">
  <sub>Los datos son referenciales. No constituyen asesoramiento financiero. Verificá siempre con tu broker antes de operar.</sub>
</div>
