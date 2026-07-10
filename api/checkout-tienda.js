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

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    // Datos del comprador
    email, nombre_comprador, telefono,
    // Datos del envío
    calle, numero, piso, localidad, provincia, codigo_postal,
    // Datos del producto
    producto_id, nombre_producto, precio, cantidad,
  } = req.body || {};

  // Validaciones mínimas
  if (!nombre_comprador || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan datos del comprador (nombre, email, teléfono).' });
  }
  if (!calle || !localidad || !provincia || !codigo_postal) {
    return res.status(400).json({ error: 'Faltan datos de envío (calle, localidad, provincia, CP).' });
  }
  if (!producto_id || !nombre_producto || precio == null || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos del producto.' });
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  if (!SB_URL || !SB_SERVICE_KEY) {
    return res.status(500).json({ error: 'Variables de Supabase no configuradas.' });
  }
  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado.' });
  }

  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': SB_SERVICE_KEY,
    'Authorization': `Bearer ${SB_SERVICE_KEY}`,
    'Prefer': 'return=representation',
  };

  try {
    // ── 1. Generar número de pedido ─────────────────────────────────────────
    const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/generar_numero_pedido`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify({ p_tipo: 'tienda' }),
    });
    const numeroPedido = await rpcRes.json();

    // ── 2. Crear el pedido ──────────────────────────────────────────────────
    const monto_total = Number(precio) * Number(cantidad);

    const pedidoRes = await fetch(`${SB_URL}/rest/v1/pedidos`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify({
        numero_pedido: numeroPedido,
        tipo_checkout: 'tienda',
        estado: 'pendiente_pago',
        estado_logistico: 'pendiente_pago',
        monto_total,
        notas: `Compra web — ${nombre_comprador} — ${email} — Tel: ${telefono}`,
      }),
    });
    if (!pedidoRes.ok) {
      const err = await pedidoRes.text();
      throw new Error(`Error al crear pedido: ${err}`);
    }
    const [pedido] = await pedidoRes.json();
    const pedido_id = pedido.id;

    // ── 3. Crear el ítem del pedido ─────────────────────────────────────────
    await fetch(`${SB_URL}/rest/v1/pedido_items`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        pedido_id,
        producto_id,
        nombre_producto,
        cantidad: Number(cantidad),
        precio_unitario: Number(precio),
        subtotal: monto_total,
      }),
    });

    // ── 4. Guardar dirección de envío ───────────────────────────────────────
    const direccion_completa = [calle, numero, piso].filter(Boolean).join(' ');
    await fetch(`${SB_URL}/rest/v1/envio_domicilio`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        pedido_id,
        nombre_receptor: nombre_comprador,
        telefono_receptor: telefono,
        email_receptor: email,
        calle: direccion_completa,
        localidad,
        provincia,
        codigo_postal,
        notas_entrega: `Compra vía tienda web`,
      }),
    });

    // ── 5. Crear preferencia de MercadoPago ─────────────────────────────────
    const baseUrl = 'https://www.elguiaya.com';
    const mpBody = {
      external_reference: pedido_id,
      items: [{
        id: producto_id,
        title: nombre_producto,
        quantity: Number(cantidad),
        unit_price: Number(precio),
        currency_id: 'ARS',
      }],
      payer: {
        name: nombre_comprador,
        email,
      },
      back_urls: {
        success: `${baseUrl}/seguimiento?pedido=${encodeURIComponent(numeroPedido)}`,
        failure: `${baseUrl}/seguimiento?pedido=${encodeURIComponent(numeroPedido)}&estado=fallido`,
        pending: `${baseUrl}/seguimiento?pedido=${encodeURIComponent(numeroPedido)}&estado=pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mp-webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(mpBody),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      throw new Error(`Error de MercadoPago: ${mpData.message || JSON.stringify(mpData)}`);
    }

    return res.status(200).json({
      ok: true,
      pedido_id,
      numero_pedido: numeroPedido,
      init_point: mpData.init_point,
    });

  } catch (err) {
    console.error('[checkout-tienda]', err);
    return res.status(500).json({ error: err.message });
  }
}
