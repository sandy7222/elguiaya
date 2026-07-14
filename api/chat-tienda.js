/**
 * Chat híbrido de la tienda web.
 * POST /api/chat-tienda  { action: 'enviar' | 'historial' | 'escalar', ... }
 * Visitantes usan guest_token; usuarios logueados envían JWT.
 */

import { randomUUID } from 'crypto';

const ALLOWED_ORIGINS = [
  'https://www.elguiaya.com',
  'https://elguiaya.com',
  'https://app.elguiaya.com',
  'http://localhost:3000',
];

const TIENDA_SYSTEM_PROMPT = `Sos el asistente de atención de la tienda online El Guía Ya (pesca, camping y náutica) en Argentina.

Podés ayudar con:
- Productos del catálogo (características generales, categorías).
- Cómo comprar, Mi Cuenta, carrito y favoritos en la web.
- Envíos a domicilio (no se entrega en muelles/embarcaderos salvo promoción).
- Pagos con Mercado Pago, seguimiento de pedidos.
- Políticas generales de devolución (48 hs, estado del producto).

Reglas:
- Respondé en español rioplatense, claro y breve (máx. ~180 palabras salvo que pidan detalle).
- No inventes stock, precios exactos ni promesas de entrega concretas.
- Si no sabés algo o el cliente necesita gestión de un pedido concreto / reclamo / hablar con persona, sugerí usar el botón "Hablar con una persona" o indicá que vas a pasar la consulta a soporte humano.
- No digas que sos Google/Gemini/Groq; sos el asistente de El Guía Ya.
- WhatsApp sigue disponible como canal alternativo; no digas que lo reemplazaste.`;

const HUMAN_INTENT = /hablar\s+con\s+(alguien|una\s+persona|un\s+humano|soporte|agente|operador)|quiero\s+(un\s+)?(humano|persona|agente)|pasar\s+a\s+(humano|persona)|atenci[oó]n\s+humana|operador|asesor\s+humano|representante/i;

// Rate limit muy simple por IP (por instancia serverless)
const rateBuckets = new Map();
function rateOk(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  let b = rateBuckets.get(key);
  if (!b || now - b.start > windowMs) {
    b = { start: now, count: 0 };
    rateBuckets.set(key, b);
  }
  b.count += 1;
  return b.count <= limit;
}

function cors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sbHeaders(serviceKey) {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=representation',
  };
}

async function resolveUser(req, SB_URL, SB_ANON_KEY, SB_SERVICE_KEY) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !SB_URL) return null;
  try {
    const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        apikey: SB_ANON_KEY || SB_SERVICE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userRes.ok) return null;
    const user = await userRes.json();
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

async function callGemini(prompt, history, apiKey) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const contents = [];
  for (const msg of history) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: { systemInstruction: TIENDA_SYSTEM_PROMPT },
  });
  const text = response.text;
  if (!text) throw new Error('Respuesta vacía de Gemini');
  return text;
}

async function callGroq(prompt, history, apiKey) {
  const messages = [{ role: 'system', content: TIENDA_SYSTEM_PROMPT }];
  for (const msg of history) {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text,
    });
  }
  messages.push({ role: 'user', content: prompt });
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.5,
      max_tokens: 1024,
    }),
  });
  if (!groqResponse.ok) throw new Error(`Groq error: ${groqResponse.status}`);
  const data = await groqResponse.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respuesta vacía de Groq');
  return text;
}

async function replyWithAI(prompt, history) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (geminiKey && geminiKey.trim()) {
    try {
      return { text: await callGemini(prompt, history, geminiKey), engine: 'gemini' };
    } catch (e) {
      console.error('[chat-tienda] Gemini:', e.message || e);
    }
  }
  if (groqKey && groqKey.trim()) {
    try {
      return { text: await callGroq(prompt, history, groqKey), engine: 'groq' };
    } catch (e) {
      console.error('[chat-tienda] Groq:', e.message || e);
    }
  }
  return {
    text: 'Gracias por tu consulta. Puedo ayudarte con compras, envíos y Mi Cuenta. Si necesitás una persona, tocá «Hablar con una persona» y un agente te va a atender desde soporte. WhatsApp también sigue disponible en el pie de la tienda.',
    engine: 'fallback',
  };
}

function newGuestToken() {
  return randomUUID();
}

async function loadConversacion(SB_URL, headers, conversacionId) {
  const r = await fetch(
    `${SB_URL}/rest/v1/chat_conversaciones?id=eq.${conversacionId}&select=*&limit=1`,
    { headers }
  );
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0] || null;
}

async function loadMensajes(SB_URL, headers, conversacionId) {
  const r = await fetch(
    `${SB_URL}/rest/v1/chat_mensajes?conversacion_id=eq.${conversacionId}&select=id,rol,cuerpo,created_at,agente_id&order=created_at.asc`,
    { headers }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function canAccessConversacion(conv, user, guestToken) {
  if (!conv) return false;
  if (user?.id && conv.cliente_id === user.id) return true;
  if (guestToken && conv.guest_token && conv.guest_token === guestToken) return true;
  return false;
}

async function insertMensaje(SB_URL, headers, conversacionId, rol, cuerpo, agenteId = null) {
  const body = { conversacion_id: conversacionId, rol, cuerpo };
  if (agenteId) body.agente_id = agenteId;
  const r = await fetch(`${SB_URL}/rest/v1/chat_mensajes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Error al guardar mensaje: ${await r.text()}`);
  const rows = await r.json();
  return rows[0];
}

async function touchConversacion(SB_URL, headers, conversacionId, patch = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/chat_conversaciones?id=eq.${conversacionId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ ultimo_mensaje_at: new Date().toISOString(), ...patch }),
  });
  if (!r.ok) throw new Error(`Error al actualizar conversación: ${await r.text()}`);
  const rows = await r.json();
  return rows[0];
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString().split(',')[0].trim();
  if (!rateOk(ip)) {
    return res.status(429).json({ error: 'Demasiados mensajes. Probá en un momento.' });
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SB_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SB_URL || !SB_SERVICE_KEY) {
    return res.status(500).json({ error: 'Variables de Supabase no configuradas.' });
  }

  const headers = sbHeaders(SB_SERVICE_KEY);
  const body = req.body || {};
  const action = body.action || 'enviar';

  try {
    const user = await resolveUser(req, SB_URL, SB_ANON_KEY, SB_SERVICE_KEY);

    if (action === 'historial') {
      const conversacionId = body.conversacion_id;
      const guestToken = body.guest_token || null;
      if (!conversacionId) return res.status(400).json({ error: 'Falta conversacion_id.' });
      const conv = await loadConversacion(SB_URL, headers, conversacionId);
      if (!canAccessConversacion(conv, user, guestToken)) {
        return res.status(403).json({ error: 'No tenés acceso a esta conversación.' });
      }
      const mensajes = await loadMensajes(SB_URL, headers, conversacionId);
      return res.status(200).json({
        ok: true,
        conversacion: {
          id: conv.id,
          estado: conv.estado,
          nombre: conv.nombre,
          email: conv.email,
          guest_token: conv.guest_token,
          ultimo_mensaje_at: conv.ultimo_mensaje_at,
        },
        mensajes,
      });
    }

    if (action === 'escalar') {
      const conversacionId = body.conversacion_id;
      const guestToken = body.guest_token || null;
      if (!conversacionId) return res.status(400).json({ error: 'Falta conversacion_id.' });
      const conv = await loadConversacion(SB_URL, headers, conversacionId);
      if (!canAccessConversacion(conv, user, guestToken)) {
        return res.status(403).json({ error: 'No tenés acceso a esta conversación.' });
      }
      if (conv.estado === 'cerrada') {
        return res.status(400).json({ error: 'La conversación está cerrada.' });
      }
      await touchConversacion(SB_URL, headers, conversacionId, { estado: 'humano' });
      const aviso =
        'Te derivamos con un agente de El Guía Ya. En breve van a responderte por este mismo chat. Mientras tanto, podés seguir escribiendo acá.';
      const botMsg = await insertMensaje(SB_URL, headers, conversacionId, 'bot', aviso);
      const mensajes = await loadMensajes(SB_URL, headers, conversacionId);
      return res.status(200).json({
        ok: true,
        conversacion: { id: conversacionId, estado: 'humano', guest_token: conv.guest_token },
        mensaje_bot: botMsg,
        mensajes,
      });
    }

    // action === 'enviar'
    const mensaje = String(body.mensaje || '').trim();
    if (!mensaje || mensaje.length > 2000) {
      return res.status(400).json({ error: 'El mensaje es obligatorio (máx. 2000 caracteres).' });
    }

    let conversacionId = body.conversacion_id || null;
    let guestToken = body.guest_token || null;
    let nombre = String(body.nombre || '').trim();
    let email = String(body.email || '').trim().toLowerCase();
    const pedirHumano = !!body.pedir_humano || HUMAN_INTENT.test(mensaje);

    let conv = null;
    if (conversacionId) {
      conv = await loadConversacion(SB_URL, headers, conversacionId);
      if (!canAccessConversacion(conv, user, guestToken)) {
        return res.status(403).json({ error: 'No tenés acceso a esta conversación.' });
      }
    } else {
      if (user?.id) {
        if (!nombre) nombre = user.user_metadata?.nombre_completo || (user.email || '').split('@')[0] || 'Cliente';
        if (!email) email = (user.email || '').toLowerCase();
      }
      if (!nombre || !email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        return res.status(400).json({ error: 'Para iniciar el chat necesitamos nombre y email válidos.' });
      }
      if (!user?.id) guestToken = newGuestToken();

      const insertBody = {
        nombre,
        email,
        estado: 'bot',
        asunto: mensaje.slice(0, 80),
        ultimo_mensaje_at: new Date().toISOString(),
      };
      if (user?.id) insertBody.cliente_id = user.id;
      else insertBody.guest_token = guestToken;

      const createRes = await fetch(`${SB_URL}/rest/v1/chat_conversaciones`, {
        method: 'POST',
        headers,
        body: JSON.stringify(insertBody),
      });
      if (!createRes.ok) throw new Error(`Error al crear conversación: ${await createRes.text()}`);
      const created = await createRes.json();
      conv = created[0];
      conversacionId = conv.id;
      guestToken = conv.guest_token || guestToken;
    }

    if (conv.estado === 'cerrada') {
      return res.status(400).json({ error: 'La conversación está cerrada. Abrí un chat nuevo.' });
    }

    await insertMensaje(SB_URL, headers, conversacionId, 'cliente', mensaje);

    let estado = conv.estado;
    let mensajeBot = null;

    if (pedirHumano && estado === 'bot') {
      estado = 'humano';
      await touchConversacion(SB_URL, headers, conversacionId, { estado: 'humano' });
      const aviso =
        'Te derivamos con un agente de El Guía Ya. En breve van a responderte por este mismo chat. Mientras tanto, podés seguir escribiendo acá.';
      mensajeBot = await insertMensaje(SB_URL, headers, conversacionId, 'bot', aviso);
    } else if (estado === 'bot') {
      const prev = await loadMensajes(SB_URL, headers, conversacionId);
      const history = prev
        .filter((m) => m.rol === 'cliente' || m.rol === 'bot')
        .slice(-12)
        .map((m) => ({
          role: m.rol === 'bot' ? 'assistant' : 'user',
          text: m.cuerpo,
        }));
      // el último ya es el mensaje actual; sacarlo del history para no duplicar en prompt
      if (history.length && history[history.length - 1].role === 'user') history.pop();
      const ai = await replyWithAI(mensaje, history);
      mensajeBot = await insertMensaje(SB_URL, headers, conversacionId, 'bot', ai.text);
      await touchConversacion(SB_URL, headers, conversacionId, {});
    } else {
      // estado humano: solo persistir y esperar agente
      await touchConversacion(SB_URL, headers, conversacionId, {});
    }

    const mensajes = await loadMensajes(SB_URL, headers, conversacionId);
    const convFresh = await loadConversacion(SB_URL, headers, conversacionId);

    return res.status(200).json({
      ok: true,
      conversacion: {
        id: conversacionId,
        estado: convFresh.estado,
        nombre: convFresh.nombre,
        email: convFresh.email,
        guest_token: convFresh.guest_token,
        ultimo_mensaje_at: convFresh.ultimo_mensaje_at,
      },
      mensaje_bot: mensajeBot,
      mensajes,
    });
  } catch (err) {
    console.error('[chat-tienda]', err);
    return res.status(500).json({ error: err.message || 'Error interno del chat.' });
  }
}
