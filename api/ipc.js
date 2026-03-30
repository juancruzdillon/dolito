export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

  try {
    const response = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion');
    
    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('IPC Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch IPC data', message: error.message });
  }
}
