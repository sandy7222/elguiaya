/**
 * Lista pedidos del cliente autenticado (JWT de Supabase Auth).
 * GET /api/mis-compras  Authorization: Bearer <access_token>
 */

export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const allowedOrigins = [
    'https://www.elguiaya.com',
    'https://elguiaya.com',
    'https://app.elguiaya.com',
    'http://localhost:3000',
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Falta token de sesión.' });

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SB_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SB_URL || !SB_SERVICE_KEY) {
    return res.status(500).json({ error: 'Variables de Supabase no configuradas.' });
  }

  try {
    // Validar JWT del usuario con la anon key (Auth API)
    const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        apikey: SB_ANON_KEY || SB_SERVICE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }
    const user = await userRes.json();
    const userId = user?.id;
    if (!userId) return res.status(401).json({ error: 'Usuario no encontrado.' });

    const sbHeaders = {
      'Content-Type': 'application/json',
      apikey: SB_SERVICE_KEY,
      Authorization: `Bearer ${SB_SERVICE_KEY}`,
    };

    const pedidosRes = await fetch(
      `${SB_URL}/rest/v1/pedidos?cliente_id=eq.${userId}&tipo_checkout=eq.tienda&select=id,numero_pedido,estado,estado_logistico,monto_total,created_at&order=created_at.desc&limit=50`,
      { headers: sbHeaders }
    );
    if (!pedidosRes.ok) {
      const err = await pedidosRes.text();
      throw new Error(`Error al listar pedidos: ${err}`);
    }
    const pedidos = await pedidosRes.json();

    return res.status(200).json({ ok: true, pedidos });
  } catch (err) {
    console.error('[mis-compras]', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
