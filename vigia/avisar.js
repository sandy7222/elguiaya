// El Vigía: manda el aviso por Telegram (principal) y por correo (respaldo).
// Salen los dos siempre; si Telegram falla, el correo lo cuenta.
// Los datos de cada canal son variables de Vercel (ver docs/VIGIA.md); acá no hay ningún valor.

const LIMITE_TELEGRAM = 4096;
const ESPERA_MS = 10_000;
// Variables cuyos valores nunca pueden aparecer en una respuesta, un registro o un aviso.
const SECRETOS = ['CRON_SECRET', 'TELEGRAM_BOT_TOKEN', 'SMTP_PASS', 'GROQ_API_KEY', 'GEMINI_API_KEY'];

// Un espacio o salto de línea de más al pegar el valor en Vercel no debe romper nada.
const variable = (env, nombre) => String(env[nombre] ?? '').trim();

export function taparSecretos(texto, env = {}) {
  let salida = String(texto);
  for (const nombre of SECRETOS) {
    for (const valor of [env[nombre], variable(env, nombre)]) {
      if (valor && valor.length >= 6) salida = salida.split(valor).join('***');
    }
  }
  return salida;
}

function motivo(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'no respondió a tiempo';
  if (error?.message === 'fetch failed') return 'no hubo conexión';
  return error?.message || String(error);
}

async function mandarTelegram({ texto, env, fetch }) {
  const token = variable(env, 'TELEGRAM_BOT_TOKEN');
  const chat = variable(env, 'TELEGRAM_CHAT_ID');
  if (!token || !chat) throw new Error('faltan las variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
  const corte = '\n… (sigue en el correo)';
  const recortado = texto.length > LIMITE_TELEGRAM ? texto.slice(0, LIMITE_TELEGRAM - corte.length) + corte : texto;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: recortado, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(ESPERA_MS),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok || !datos.ok) {
    let pista = '';
    if (r.status === 401 || r.status === 404) pista = ' (revisá TELEGRAM_BOT_TOKEN en Vercel: está mal copiado o ya no es válido)';
    else if (/chat not found/i.test(datos.description || '')) pista = ' (revisá TELEGRAM_CHAT_ID en Vercel y que hayas tocado Iniciar en el bot)';
    throw new Error(`Telegram respondió ${r.status}${datos.description ? `: ${datos.description}` : ''}${pista}`);
  }
}

async function mandarCorreo({ asunto, texto, env, crearTransporte }) {
  const [SMTP_HOST, SMTP_USER, SMTP_PASS, VIGIA_CORREO_PARA] = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'VIGIA_CORREO_PARA'].map((n) => variable(env, n));
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !VIGIA_CORREO_PARA) {
    throw new Error('faltan variables del correo (SMTP_HOST, SMTP_USER, SMTP_PASS o VIGIA_CORREO_PARA)');
  }
  // Con Zoho o Gmail el remitente es la misma casilla; con Resend el usuario es "resend" y hay que indicarlo.
  const remitente = variable(env, 'VIGIA_CORREO_DE') || SMTP_USER;
  if (!remitente.includes('@')) throw new Error('falta la variable VIGIA_CORREO_DE (la dirección que figura como remitente)');
  const puerto = Number(variable(env, 'SMTP_PORT') || 465);
  let crear = crearTransporte;
  if (!crear) {
    const nodemailer = (await import('nodemailer')).default;
    crear = (config) => nodemailer.createTransport(config);
  }
  const transporte = crear({
    host: SMTP_HOST,
    port: puerto,
    secure: puerto === 465, // 465: conexión cifrada desde el principio; 587: STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: ESPERA_MS,
    greetingTimeout: ESPERA_MS,
    socketTimeout: 15_000,
  });
  await transporte.sendMail({
    from: `El Vigía de El Guía YA <${remitente}>`,
    to: VIGIA_CORREO_PARA,
    subject: asunto,
    text: texto,
  });
}

// Devuelve cómo le fue a cada canal: 'ok' o 'error: <motivo>' (sin secretos).
export async function avisar({ asunto, texto, env, fetch = globalThis.fetch, crearTransporte }) {
  const canales = {};
  try {
    await mandarTelegram({ texto, env, fetch });
    canales.telegram = 'ok';
  } catch (e) {
    canales.telegram = `error: ${taparSecretos(motivo(e), env)}`;
  }
  const nota = canales.telegram === 'ok' ? '' : `\n\n(Ojo: este aviso no salió por Telegram. ${canales.telegram})`;
  try {
    await mandarCorreo({ asunto, texto: texto + nota, env, crearTransporte });
    canales.correo = 'ok';
  } catch (e) {
    canales.correo = `error: ${taparSecretos(motivo(e), env)}`;
  }
  return canales;
}
