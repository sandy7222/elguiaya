/**
 * El Vigía: lo llama una vez por día la tarea programada de Vercel (vercel.json → crons).
 * Revisa si algún modelo de IA que usamos se retiró o está por retirarse, y si alguna clave
 * está por vencer, y avisa por Telegram y por correo. Ver docs/VIGIA.md.
 *
 * La dirección es pública: solo corre si llega "Authorization: Bearer <CRON_SECRET>", que es
 * lo que manda Vercel cuando es él quien llama. Sin eso contesta 401 y no hace nada.
 *   GET /api/vigia                  revisión diaria (lo urgente todos los días; el resumen, los lunes)
 *   GET /api/vigia?modo=prueba      aviso de prueba por los dos canales (no revisa nada)
 *   GET /api/vigia?modo=simulacro   revisa como si el primer modelo de la ficha se hubiera apagado hoy
 *   GET /api/vigia?modo=resumen     manda el resumen semanal aunque no sea lunes
 */

import { createHash, timingSafeEqual } from 'crypto';
import { revisarHoy } from '../vigia/correr.js';
import { hoyArgentina } from '../vigia/revisar.js';
import { avisar, taparSecretos } from '../vigia/avisar.js';

const MODOS = ['normal', 'prueba', 'simulacro', 'resumen'];
const LARGO_MINIMO_SECRETO = 16;

// Compara resúmenes de largo fijo para no dar pistas por el tiempo de respuesta.
function autorizado(encabezado, secreto) {
  const esperado = createHash('sha256').update(`Bearer ${secreto}`).digest();
  const recibido = createHash('sha256').update(String(encabezado ?? '')).digest();
  return timingSafeEqual(esperado, recibido);
}

function leerModo(req) {
  let modo = req.query?.modo;
  if (Array.isArray(modo)) modo = modo[0];
  if (!modo && req.url) modo = new URL(req.url, 'http://localhost').searchParams.get('modo');
  return modo || 'normal';
}

export function crearHandler({ env = process.env, fetch = globalThis.fetch, crearTransporte, ahora = () => new Date(), ficha } = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });

    const secreto = String(env.CRON_SECRET ?? '').trim();
    if (secreto.length < LARGO_MINIMO_SECRETO) {
      console.error('[vigia] Falta CRON_SECRET (o tiene menos de 16 caracteres): no corro.');
      return res.status(500).json({ error: 'El Vigía no está configurado.' });
    }
    if (!autorizado(req.headers?.authorization, secreto)) return res.status(401).json({ error: 'No autorizado.' });

    const modo = leerModo(req);
    if (!MODOS.includes(modo)) return res.status(400).json({ error: `Modo desconocido. Opciones: ${MODOS.join(', ')}.` });

    const hoy = hoyArgentina(ahora());
    try {
      let mensaje;
      let cuenta = {};
      if (modo === 'prueba') {
        mensaje = {
          asunto: 'Vigía: aviso de prueba',
          texto: `🧪 Aviso de prueba del Vigía de El Guía YA (${hoy}).\nSi te llegó, este canal funciona. No hay que hacer nada.`,
        };
      } else {
        const revision = await revisarHoy({
          env, fetch, hoy, simulacro: modo === 'simulacro', forzarResumen: modo === 'resumen', ...(ficha ? { ficha } : {}),
        });
        mensaje = revision.mensaje;
        cuenta = { urgentes: revision.resultado.urgentes.length, para_revisar: revision.resultado.semanales.length };
      }

      if (!mensaje) {
        console.log(`[vigia] ${hoy} ${modo}: nada que avisar.`);
        return res.status(200).json({ ok: true, modo, hoy, enviado: false, ...cuenta });
      }

      const canales = await avisar({ ...mensaje, env, fetch, crearTransporte });
      const enviado = Object.values(canales).includes('ok');
      const cuerpo = { ok: enviado, modo, hoy, enviado, canales, ...cuenta, asunto: mensaje.asunto };
      (enviado ? console.log : console.error)(`[vigia] ${hoy} ${modo}: ${taparSecretos(JSON.stringify(cuerpo), env)}`);
      return res.status(enviado ? 200 : 500).json(cuerpo);
    } catch (e) {
      const motivo = taparSecretos(e?.message || String(e), env);
      console.error(`[vigia] ${hoy} ${modo}: error inesperado: ${motivo}`);
      return res.status(500).json({ ok: false, modo, hoy, error: motivo });
    }
  };
}

export default crearHandler();
