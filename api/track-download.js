const APK_URL =
  'https://github.com/sandy7222/elguiaya-plataforma/releases/latest/download/ElGuiaYA-latest.apk';

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const source = typeof req.query.source === 'string' ? req.query.source : 'direct_url';
  const userAgent = req.headers['user-agent'] || '';
  const device = detectDevice(userAgent);

  try {
    await fetch(`${SB_URL}/rest/v1/descargas_app`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        origen: source,
        dispositivo: device,
      }),
    });
  } catch (err) {
    console.error('[Track Download Error]:', err);
  }

  res.writeHead(302, { Location: APK_URL });
  res.end();
}
