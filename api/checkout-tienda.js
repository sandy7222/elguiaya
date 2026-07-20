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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const {
    email, nombre_comprador, telefono,
    calle, numero, piso, localidad, provincia, codigo_postal,
    producto_id, nombre_producto, precio, cantidad,
    vaciar_carrito,
  } = body;

  // Normalizar items: array multi-ítem o un solo producto (compat)
  let items = Array.isArray(body.items) ? body.items : null;
  if (!items || !items.length) {
    if (producto_id && nombre_producto != null && precio != null && cantidad) {
      items = [{
        producto_id,
        nombre_producto,
        precio: Number(precio),
        cantidad: Number(cantidad),
      }];
    } else {
      items = [];
    }
  }

  items = items.map((it) => ({
    producto_id: it.producto_id,
    nombre_producto: String(it.nombre_producto || '').trim(),
    precio: Number(it.precio),
    cantidad: Number(it.cantidad) || 1,
  })).filter((it) => it.producto_id && it.nombre_producto && Number.isFinite(it.precio) && it.cantidad > 0);

  if (!nombre_comprador || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan datos del comprador (nombre, email, teléfono).' });
  }
  if (!calle || !localidad || !provincia || !codigo_postal) {
    return res.status(400).json({ error: 'Faltan datos de envío (calle, localidad, provincia, CP).' });
  }
  if (!items.length) {
    return res.status(400).json({ error: 'Faltan datos del producto o el carrito está vacío.' });
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SB_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  let cliente_id = null;
  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (accessToken && SB_URL) {
    try {
      const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
        headers: {
          apikey: SB_ANON_KEY || SB_SERVICE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (userRes.ok) {
        const user = await userRes.json();
        if (user?.id) cliente_id = user.id;
      }
    } catch (e) {
      console.warn('[checkout-tienda] No se pudo validar sesión:', e.message);
    }
  }

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
    const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/generar_numero_pedido`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify({ p_tipo: 'tienda' }),
    });
    const numeroPedido = await rpcRes.json();

    const monto_total = items.reduce((sum, it) => sum + (it.precio * it.cantidad), 0);

    const pedidoPayload = {
      numero_pedido: numeroPedido,
      tipo_checkout: 'tienda',
      estado: 'pendiente_pago',
      estado_logistico: 'pendiente_pago',
      monto_total,
      notas: `Compra web — ${nombre_comprador} — ${email} — Tel: ${telefono}` +
        (items.length > 1 ? ` — ${items.length} ítems` : ''),
    };
    if (cliente_id) pedidoPayload.cliente_id = cliente_id;

    const pedidoRes = await fetch(`${SB_URL}/rest/v1/pedidos`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify(pedidoPayload),
    });
    if (!pedidoRes.ok) {
      const err = await pedidoRes.text();
      throw new Error(`Error al crear pedido: ${err}`);
    }
    const [pedido] = await pedidoRes.json();
    const pedido_id = pedido.id;

    const pedidoItems = items.map((it) => ({
      pedido_id,
      producto_id: it.producto_id,
      nombre_producto: it.nombre_producto,
      cantidad: it.cantidad,
      precio_unitario: it.precio,
      subtotal: it.precio * it.cantidad,
    }));

    const itemsRes = await fetch(`${SB_URL}/rest/v1/pedido_items`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify(pedidoItems),
    });
    if (!itemsRes.ok) {
      const err = await itemsRes.text();
      throw new Error(`Error al crear ítems del pedido: ${err}`);
    }

    const calleLimpia = String(calle || '').trim();
    const numeroLimpio = String(numero || '').trim() || 'S/N';
    const localidadLimpia = String(localidad || '').trim();
    const envioPayload = {
      pedido_id,
      nombre_receptor: nombre_comprador,
      telefono_receptor: telefono,
      email_receptor: email,
      calle: calleLimpia,
      numero: numeroLimpio,
      ciudad: localidadLimpia,
      localidad: localidadLimpia,
      provincia,
      codigo_postal,
      piso_depto: piso || null,
      notas_entrega: 'Compra vía tienda web',
      acepta_aviso_ausencia: true,
    };
    if (cliente_id) envioPayload.usuario_id = cliente_id;

    const envioRes = await fetch(`${SB_URL}/rest/v1/envio_domicilio`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify(envioPayload),
    });
    if (!envioRes.ok) {
      const err = await envioRes.text();
      throw new Error(`Error al guardar datos de envío: ${err}`);
    }

    const baseUrl = 'https://www.elguiaya.com';
    const mpBody = {
      external_reference: pedido_id,
      items: items.map((it) => ({
        id: String(it.producto_id),
        title: it.nombre_producto,
        quantity: it.cantidad,
        unit_price: it.precio,
        currency_id: 'ARS',
      })),
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

    if (vaciar_carrito && cliente_id) {
      try {
        await fetch(`${SB_URL}/rest/v1/carrito_items?cliente_id=eq.${cliente_id}`, {
          method: 'DELETE',
          headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        });
      } catch (e) {
        console.warn('[checkout-tienda] No se pudo vaciar carrito:', e.message);
      }
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
