export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const allowedOrigins = [
    'https://www.elguiaya.com',
    'https://elguiaya.com',
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { numero_pedido, email } = req.body || {};

  if (!numero_pedido || !email) {
    return res.status(400).json({ error: 'Ingresá el número de pedido y tu email.' });
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SB_URL || !SB_KEY) {
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Accept': 'application/json',
  };

  try {
    // Buscar el pedido por número (tipo tienda)
    const numLimpio = numero_pedido.trim().toUpperCase();
    const pedidoRes = await fetch(
      `${SB_URL}/rest/v1/pedidos?numero_pedido=eq.${encodeURIComponent(numLimpio)}&tipo_checkout=eq.tienda&select=id,numero_pedido,estado,estado_logistico,monto_total,created_at,tracking_codigo,tracking_url,despachado_at,entregado_at`,
      { headers }
    );
    const pedidos = await pedidoRes.json();

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return res.status(404).json({ error: 'No encontramos ningún pedido con ese número.' });
    }

    const pedido = pedidos[0];

    // Verificar que el email coincide con el envío
    const envioRes = await fetch(
      `${SB_URL}/rest/v1/envio_domicilio?pedido_id=eq.${pedido.id}&select=nombre_receptor,email_receptor,calle,localidad,provincia,codigo_postal`,
      { headers }
    );
    const envios = await envioRes.json();

    if (!Array.isArray(envios) || envios.length === 0) {
      return res.status(404).json({ error: 'No encontramos información de envío para este pedido.' });
    }

    const envio = envios[0];

    // Validar email del comprador (case-insensitive)
    if (envio.email_receptor?.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(403).json({ error: 'El email no coincide con el registrado para este pedido.' });
    }

    // Buscar ítems del pedido
    const itemsRes = await fetch(
      `${SB_URL}/rest/v1/pedido_items?pedido_id=eq.${pedido.id}&select=nombre_producto,cantidad,precio_unitario,subtotal`,
      { headers }
    );
    const items = await itemsRes.json();

    return res.status(200).json({
      pedido: {
        numero: pedido.numero_pedido,
        estado: pedido.estado,
        estado_logistico: pedido.estado_logistico,
        monto_total: pedido.monto_total,
        fecha: pedido.created_at,
        tracking_codigo: pedido.tracking_codigo || null,
        tracking_url: pedido.tracking_url || null,
        despachado_at: pedido.despachado_at || null,
        entregado_at: pedido.entregado_at || null,
      },
      envio: {
        nombre: envio.nombre_receptor,
        calle: envio.calle,
        localidad: envio.localidad,
        provincia: envio.provincia,
        codigo_postal: envio.codigo_postal,
      },
      items: Array.isArray(items) ? items : [],
    });

  } catch (err) {
    console.error('[consultar-pedido]', err);
    return res.status(500).json({ error: 'Error al consultar el pedido. Intentá de nuevo.' });
  }
}
