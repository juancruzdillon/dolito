import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { GoogleGenAI } from '@google/genai'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      {
        name: 'doli-ai-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = new URL(req.url, 'http://localhost');
            if (parsedUrl.pathname === '/api/chat' && req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', async () => {
                try {
                  const { messages, marketData } = JSON.parse(body)
                  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY
                  const modelId = env.GOOGLE_AI_STUDIO_MODEL || 'gemini-3.1-flash-lite-preview'
                  const baseURL = env.GOOGLE_AI_STUDIO_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
                  
                  if (!apiKey) {
                    console.error('❌ Doli Error: GOOGLE_AI_STUDIO_API_KEY no encontrada')
                    res.statusCode = 500
                    return res.end(JSON.stringify({ error: 'Configuración: Falta GOOGLE_AI_STUDIO_API_KEY en .env' }))
                  }

                  const ai = new GoogleGenAI({ apiKey, baseURL })

                  const rates = marketData.cotizaciones
                  const findRate = (casa) => {
                    const r = rates.find(r => r.casa === casa) || {}
                    return {
                      compra: r.compra ? Math.round(r.compra) : 'N/A',
                      venta: r.venta ? Math.round(r.venta) : 'N/A'
                    }
                  }

                  const now = new Date()
                  const fechaActual = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  const fechaISO = now.toISOString().split('T')[0]

                  const contextBlock = `
                    --- SOURCE OF TRUTH (HOY: ${fechaActual.toUpperCase()}) ---
                    FECHA ACTUAL: ${fechaISO}
                    DÓLAR OFICIAL: Compra $${findRate('oficial').compra}, Venta $${findRate('oficial').venta}
                    DÓLAR BLUE: Compra $${findRate('blue').compra}, Venta $${findRate('blue').venta}
                    DÓLAR MEP: Compra $${findRate('bolsa').compra}, Venta $${findRate('bolsa').venta}
                    DÓLAR CCL: Compra $${findRate('contadoconliqui').compra}, Venta $${findRate('contadoconliqui').venta}
                    DÓLAR CRIPTO: Compra $${findRate('cripto').compra}, Venta $${findRate('cripto').venta}
                    ----------------------------------------------------
                    IMPORTANTE: La fecha de hoy es ${fechaISO}. Ignora fechas desactualizadas de tu memoria interna. Usa SOLAMENTE los precios de arriba.
                  `

                  const result = await ai.models.generateContent({
                    model: modelId,
                    systemInstruction: `Eres Doli, asesora financiera de Dolito. Fecha de hoy: ${fechaISO}. Los precios de dólar en el contexto son en tiempo real — úsalos siempre. Para cualquier pregunta sobre noticias, rankings, volumen operado, acciones, mercados o eventos recientes, SIEMPRE busca en Google antes de responder. NUNCA le digas al usuario que no tienes acceso a datos, que tu conocimiento tiene fecha límite, ni menciones limitaciones técnicas internas. Si necesitás información, buscala. Sé concisa y profesional.`,
                    contents: [
                      { role: 'user', parts: [{ text: contextBlock }] },
                      ...messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                      }))
                    ]
                  })

                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ content: result.text }))
                } catch (err) {
                  console.error('❌ Doli Backend Error:', err.message)
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: err.message }))
                }
              })
              return
            }
            next()
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api/icl': {
          target: 'https://api.dolarito.ar',
          changeOrigin: true,
          rewrite: (path) => '/api/frontend/indices/icl',
          headers: {
            'auth-client': 'f7d471ab0a4ff2b7947759d985ed1db0',
            'referer': 'https://www.dolarito.ar/indices/indice-icl'
          }
        },
        '/api/ipc': {
          target: 'https://api.argentinadatos.com',
          changeOrigin: true,
          rewrite: (path) => '/v1/finanzas/indices/inflacion'
        }
      }
    }
  }
})
