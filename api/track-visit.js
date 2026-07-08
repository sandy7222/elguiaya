const SB_URL =
  process.env.SUPABASE_URL || 'https://ymgsxwfwntbqvguvbhoa.supabase.co';
const SB_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZ3N4d2Z3bnRicXZndXZiaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODgxMzQsImV4cCI6MjA5MzM2NDEzNH0.ZT2xlCIAnSyr_tR9qZAKIB7QAVQjJO2Jv0cwb51f1Uw';

function detectDevice(userAgent) {
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Otro';
}

function pickQuery(value) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const source = req.method === 'POST' ? req.body || {} : req.query;
  const tipo = pickQuery(source.tipo) || 'pageview';
  const ruta = pickQuery(source.ruta) || '/';
  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  const payload = {
    tipo,
    ruta,
    dispositivo: device,
    utm_source: pickQuery(source.utm_source),
    utm_medium: pickQuery(source.utm_medium),
    utm_campaign: pickQuery(source.utm_campaign),
    referrer: pickQuery(source.referrer),
  };

  try {
    await fetch(`${SB_URL}/rest/v1/eventos_web`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Track Visit Error]:', err);
  }

  res.status(204).end();
}
