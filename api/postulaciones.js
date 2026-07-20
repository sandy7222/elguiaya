/**
 * Postulaciones / CV — Trabajá con Nosotros
 * POST /api/postulaciones
 *   action: 'preparar' | 'finalizar'
 *
 * preparar: crea fila pendiente_cv + signed upload URL
 * finalizar: verifica archivo en storage y pasa a estado nueva
 */

import { randomUUID } from 'crypto';

const ALLOWED_ORIGINS = [
  'https://www.elguiaya.com',
  'https://elguiaya.com',
  'https://app.elguiaya.com',
  'http://localhost:3000',
];

const BUCKET = 'postulaciones-cv';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_EXT = new Set(['pdf', 'doc', 'docx']);
const AREAS = new Set([
  'Promotor de Ventas',
  'Guía / Capitán',
  'Logística y Operaciones',
  'Administración',
  'Tecnología y Diseño',
  'Administración y Finanzas',
  'Desarrollador / Diseñador',
]);

const rateBuckets = new Map();
function rateOk(key, limit = 8, windowMs = 60_000) {
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

function sbHeaders(serviceKey, extra = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=representation',
    ...extra,
  };
}

function sanitizeFileName(name) {
  return String(name || 'cv')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 120);
}

function extFromName(name) {
  const parts = String(name || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function mimeFromExt(ext) {
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'doc') return 'application/msword';
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return '';
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
  if (!rateOk(ip)) {
    return res.status(429).json({ error: 'Demasiadas postulaciones. Probá en unos minutos.' });
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SB_URL || !SB_SERVICE_KEY) {
    return res.status(500).json({ error: 'Variables de Supabase no configuradas.' });
  }

  const body = req.body || {};
  const action = body.action || 'preparar';
  const headers = sbHeaders(SB_SERVICE_KEY);

  try {
    if (action === 'preparar') {
      const nombre = String(body.nombre || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const telefono = String(body.telefono || '').trim();
      const area = String(body.area_interes || body.area || '').trim();
      const presentacion = String(body.presentacion || '').trim().slice(0, 2000);
      const aceptaDatos = !!body.acepta_datos;
      const fileName = String(body.file_name || '').trim();
      const fileSize = Number(body.file_size || 0);
      let fileMime = String(body.file_mime || '').trim().toLowerCase();

      if (!nombre || nombre.length < 2) {
        return res.status(400).json({ error: 'Ingresá tu nombre completo.' });
      }
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        return res.status(400).json({ error: 'Ingresá un email válido.' });
      }
      if (!telefono || telefono.length < 6) {
        return res.status(400).json({ error: 'Ingresá un teléfono / WhatsApp.' });
      }
      if (!AREAS.has(area)) {
        return res.status(400).json({ error: 'Seleccioná un área de interés válida.' });
      }
      if (!aceptaDatos) {
        return res.status(400).json({ error: 'Debés aceptar el tratamiento de datos laborales.' });
      }
      if (!fileName || !fileSize) {
        return res.status(400).json({ error: 'Adjuntá tu CV (PDF, DOC o DOCX).' });
      }
      if (fileSize <= 0 || fileSize > MAX_BYTES) {
        return res.status(400).json({ error: 'El CV debe pesar como máximo 5 MB.' });
      }

      const ext = extFromName(fileName);
      if (!ALLOWED_EXT.has(ext)) {
        return res.status(400).json({ error: 'Solo se permiten archivos PDF, DOC o DOCX.' });
      }
      if (!fileMime) fileMime = mimeFromExt(ext);
      if (!ALLOWED_MIME.has(fileMime)) {
        // Algunos navegadores mandan application/octet-stream; validamos por extensión
        if (fileMime !== 'application/octet-stream') {
          return res.status(400).json({ error: 'Tipo de archivo no permitido.' });
        }
        fileMime = mimeFromExt(ext);
      }

      if (!rateOk(`email:${email}`, 5, 10 * 60_000)) {
        return res.status(429).json({ error: 'Ya enviaste varias postulaciones. Esperá un rato.' });
      }

      const year = new Date().getUTCFullYear();
      const month = String(new Date().getUTCMonth() + 1).padStart(2, '0');
      const uuid = randomUUID();
      const safeName = sanitizeFileName(fileName);
      const cvPath = `${year}/${month}/${uuid}_${safeName}`;

      const insertRes = await fetch(`${SB_URL}/rest/v1/postulaciones`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          area_interes: area,
          presentacion: presentacion || null,
          acepta_datos_at: new Date().toISOString(),
          cv_path: cvPath,
          cv_nombre_original: fileName.slice(0, 200),
          cv_mime: fileMime,
          cv_size_bytes: fileSize,
          estado: 'pendiente_cv',
        }),
      });
      if (!insertRes.ok) {
        const err = await insertRes.text();
        throw new Error(`No se pudo crear la postulación: ${err}`);
      }
      const rows = await insertRes.json();
      const postulacion = rows[0];

      // Signed upload URL (Storage API)
      const signRes = await fetch(
        `${SB_URL}/storage/v1/object/upload/sign/${BUCKET}/${cvPath}`,
        {
          method: 'POST',
          headers: {
            apikey: SB_SERVICE_KEY,
            Authorization: `Bearer ${SB_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      if (!signRes.ok) {
        // rollback fila
        await fetch(`${SB_URL}/rest/v1/postulaciones?id=eq.${postulacion.id}`, {
          method: 'DELETE',
          headers: { ...headers, Prefer: 'return=minimal' },
        });
        const err = await signRes.text();
        throw new Error(`No se pudo preparar la carga del CV: ${err}`);
      }
      const signData = await signRes.json();
      // Respuesta típica: { url: "/object/upload/sign/..." } o { signedUrl, path, token }
      let uploadUrl = signData.signedUrl || signData.url || '';
      if (uploadUrl && uploadUrl.startsWith('/')) {
        uploadUrl = `${SB_URL}/storage/v1${uploadUrl}`;
      }
      const token = signData.token || null;
      if (!uploadUrl) {
        await fetch(`${SB_URL}/rest/v1/postulaciones?id=eq.${postulacion.id}`, {
          method: 'DELETE',
          headers: { ...headers, Prefer: 'return=minimal' },
        });
        throw new Error('No se recibió URL de carga firmada.');
      }

      return res.status(200).json({
        ok: true,
        postulacion_id: postulacion.id,
        cv_path: cvPath,
        upload_url: uploadUrl,
        token,
        content_type: fileMime,
      });
    }

    if (action === 'finalizar') {
      const postulacionId = body.postulacion_id;
      if (!postulacionId) {
        return res.status(400).json({ error: 'Falta postulacion_id.' });
      }

      const getRes = await fetch(
        `${SB_URL}/rest/v1/postulaciones?id=eq.${encodeURIComponent(postulacionId)}&select=*&limit=1`,
        { headers }
      );
      if (!getRes.ok) throw new Error(await getRes.text());
      const list = await getRes.json();
      const postulacion = list[0];
      if (!postulacion) {
        return res.status(404).json({ error: 'Postulación no encontrada.' });
      }
      if (postulacion.estado !== 'pendiente_cv' && postulacion.estado !== 'nueva') {
        return res.status(400).json({ error: 'La postulación ya fue procesada.' });
      }
      if (!postulacion.cv_path) {
        return res.status(400).json({ error: 'La postulación no tiene ruta de CV.' });
      }

      // Verificar que el objeto exista en storage
      const infoRes = await fetch(
        `${SB_URL}/storage/v1/object/info/${BUCKET}/${postulacion.cv_path}`,
        {
          headers: {
            apikey: SB_SERVICE_KEY,
            Authorization: `Bearer ${SB_SERVICE_KEY}`,
          },
        }
      );
      if (!infoRes.ok) {
        // fallback: listar carpeta
        const parts = postulacion.cv_path.split('/');
        const fileName = parts.pop();
        const prefix = parts.join('/');
        const listRes = await fetch(
          `${SB_URL}/storage/v1/object/list/${BUCKET}`,
          {
            method: 'POST',
            headers: {
              apikey: SB_SERVICE_KEY,
              Authorization: `Bearer ${SB_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prefix, limit: 100 }),
          }
        );
        const listed = listRes.ok ? await listRes.json() : [];
        const found = Array.isArray(listed) && listed.some((f) => f.name === fileName);
        if (!found) {
          return res.status(400).json({ error: 'No se encontró el archivo del CV. Volvé a adjuntarlo.' });
        }
      }

      const patchRes = await fetch(
        `${SB_URL}/rest/v1/postulaciones?id=eq.${encodeURIComponent(postulacionId)}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ estado: 'nueva' }),
        }
      );
      if (!patchRes.ok) throw new Error(await patchRes.text());
      const updated = await patchRes.json();

      return res.status(200).json({
        ok: true,
        postulacion: updated[0] || { id: postulacionId, estado: 'nueva' },
      });
    }

    return res.status(400).json({ error: 'Acción no válida.' });
  } catch (err) {
    console.error('[postulaciones]', err);
    return res.status(500).json({ error: err.message || 'Error interno.' });
  }
}
