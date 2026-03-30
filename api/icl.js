export default async function handler(req, res) {
  // Add CORS headers for local development if needed, 
  // though Vercel handles this on the same origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');

  try {
    const response = await fetch('https://api.dolarito.ar/api/frontend/indices/icl', {
      headers: {
        'auth-client': 'f7d471ab0a4ff2b7947759d985ed1db0',
        'referer': 'https://www.dolarito.ar/indices/indice-icl',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('ICL Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch ICL data', message: error.message });
  }
}
