import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS setup for local and same-origin Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { messages, marketData } = req.body;
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  const modelId = process.env.GOOGLE_AI_STUDIO_MODEL || 'gemini-2.0-flash';
  const baseURL = process.env.GOOGLE_AI_STUDIO_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey, baseURL });

    // HARD CONTEXT INJECTION (Rounded for 2026 precision)
    const rates = marketData.cotizaciones;
    const findRate = (casa) => {
      const r = rates.find(r => r.casa === casa) || {};
      return {
        compra: r.compra ? Math.round(r.compra) : 'N/A',
        venta: r.venta ? Math.round(r.venta) : 'N/A'
      };
    };

    const now = new Date();
    const fechaActual = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const fechaISO = now.toISOString().split('T')[0];

    const contextBlock = `
      --- SOURCE OF TRUTH (HOY: ${fechaActual.toUpperCase()}) ---
      FECHA ACTUAL: ${fechaISO}
      DÓLAR OFICIAL: Compra $${findRate('oficial').compra}, Venta $${findRate('oficial').venta}
      DÓLAR BLUE: Compra $${findRate('blue').compra}, Venta $${findRate('blue').venta}
      DÓLAR MEP: Compra $${findRate('bolsa').compra}, Venta $${findRate('bolsa').venta}
      DÓLAR CCL: Compra $${findRate('contadoconliqui').compra}, Venta $${findRate('contadoconliqui').venta}
      DÓLAR CRIPTO: Compra $${findRate('cripto').compra}, Venta $${findRate('cripto').venta}
      ----------------------------------------------------
      REGLA: La fecha de hoy es ${fechaISO}. Ignora cualquier precio desactualizado de tu memoria interna. Usa los precios de arriba como fuente de verdad. Si el usuario pregunta sobre noticias o eventos recientes, búscalos en internet con Google Search.
    `;

    const result = await ai.models.generateContent({
      model: modelId,
      systemInstruction: `Eres Doli, asesora financiera de Dolito. Fecha de hoy: ${fechaISO}. Los precios de dólar en el contexto son en tiempo real — úsalos siempre. Para cualquier pregunta sobre noticias, rankings, volumen operado, acciones, mercados o eventos recientes, SIEMPRE busca en Google antes de responder. NUNCA le digas al usuario que no tienes acceso a datos, que tu conocimiento tiene fecha límite, ni menciones limitaciones técnicas internas. Si necesitás información, buscala. Sé concisa y profesional.`,
      tools: [{ googleSearch: {} }],
      contents: [
        { role: 'user', parts: [{ text: contextBlock }] },
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      ]
    });

    return res.status(200).json({ content: result.text });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return res.status(500).json({ error: 'Error processing chat', message: error.message });
  }
}
