export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const allowedOrigins = [
    'https://www.elguiaya.com',
    'https://elguiaya.com',
    'https://app.elguiaya.com',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { producto_id, nombre, precio, cantidad } = req.body || {};

  if (!producto_id || !nombre || precio == null || !cantidad) {
    return res.status(400).json({ error: 'Faltan campos requeridos: producto_id, nombre, precio, cantidad' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado' });
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [{
          id: producto_id,
          title: nombre,
          quantity: Number(cantidad),
          unit_price: Number(precio),
          currency_id: 'ARS',
        }],
        back_urls: {
          success: 'https://www.elguiaya.com/tienda',
          failure: 'https://www.elguiaya.com/tienda',
          pending: 'https://www.elguiaya.com/tienda',
        },
        auto_return: 'approved',
      }),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return res.status(mpRes.status).json({ error: data.message || 'Error de MercadoPago' });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
