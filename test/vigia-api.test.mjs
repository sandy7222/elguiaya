// El Vigía, paso 2: la puerta (api/vigia.js, protegida con CRON_SECRET) y los avisos por Telegram y correo.
// Todo con internet y correo de mentira: estos tests no mandan nada de verdad.
// Correr: node --test test/vigia-api.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearHandler } from '../api/vigia.js';
import { avisar, taparSecretos } from '../vigia/avisar.js';
import { URLS } from '../vigia/fuentes.js';

const fixture = (nombre) => readFileSync(new URL(`./fixtures/vigia/${nombre}`, import.meta.url), 'utf8');

const SECRETO = 'secreto-de-prueba-con-mas-de-16-caracteres';
const ENV = Object.freeze({
  CRON_SECRET: SECRETO,
  GROQ_API_KEY: 'clave-falsa-de-groq',
  GEMINI_API_KEY: 'clave-falsa-de-gemini',
  TELEGRAM_BOT_TOKEN: '123456:token-falso-de-telegram',
  TELEGRAM_CHAT_ID: '987654',
  SMTP_HOST: 'smtp.zoho.com',
  SMTP_PORT: '465',
  SMTP_USER: 'avisos@elguiaya.com',
  SMTP_PASS: 'clave-falsa-del-correo',
  VIGIA_CORREO_PARA: 'dueno@elguiaya.com',
});
const SECRETOS = [SECRETO, ENV.GROQ_API_KEY, ENV.GEMINI_API_KEY, ENV.TELEGRAM_BOT_TOKEN, ENV.SMTP_PASS];
const BEARER = `Bearer ${SECRETO}`;
const JUEVES = new Date('2026-10-08T11:00:00Z'); // 8 de la mañana en Argentina
const LUNES = new Date('2026-10-12T11:00:00Z');

const pieza = (nombre, ...modelos) => ({ nombre, modelos: modelos.map(([proveedor, id]) => ({ proveedor, id })), codigo: [] });
const FICHA_CON_PROBLEMA = { piezas: [pieza('Sitio', ['groq', 'llama-3.3-70b-versatile'])], claves: [] };
const FICHA_SANA = { piezas: [pieza('App', ['groq', 'openai/gpt-oss-120b'], ['gemini', 'gemini-2.5-flash'])], claves: [] };

const resp = (cuerpo, status = 200) => () => new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), { status });

function internetFalso(cambios = {}) {
  const rutas = {
    [URLS.groqRetiros]: resp(fixture('groq-retiros-2026-10-08.md')),
    [URLS.groqModelos]: resp(fixture('groq-modelos-2026-10-08.md')),
    [URLS.groqLista]: resp({ object: 'list', data: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'].map((id) => ({ id, active: true })) }),
    [URLS.geminiRetiros]: resp(fixture('gemini-retiros-2026-10-08.md')),
    [URLS.geminiLista]: resp({ models: [{ name: 'models/gemini-2.5-flash' }] }),
    'https://api.telegram.org/': resp({ ok: true, result: { message_id: 1 } }),
    ...cambios,
  };
  const llamadas = [];
  const fetchFalso = async (url, opciones = {}) => {
    llamadas.push({ url: String(url), opciones });
    const prefijo = Object.keys(rutas).filter((p) => String(url).startsWith(p)).sort((a, b) => b.length - a.length)[0];
    if (!prefijo) return new Response('no encontrado', { status: 404 });
    return rutas[prefijo](String(url), opciones);
  };
  fetchFalso.llamadas = llamadas;
  return fetchFalso;
}

function correoFalso({ falla = false } = {}) {
  const enviados = [];
  const configs = [];
  const crearTransporte = (config) => {
    configs.push(config);
    return {
      sendMail: async (correo) => {
        if (falla) throw new Error(`535 Authentication failed for ${config.auth.user} / ${config.auth.pass}`);
        enviados.push(correo);
        return { messageId: 'x' };
      },
    };
  };
  crearTransporte.enviados = enviados;
  crearTransporte.configs = configs;
  return crearTransporte;
}

function respuestaFalsa() {
  return {
    statusCode: 200,
    body: undefined,
    status(codigo) { this.statusCode = codigo; return this; },
    json(cuerpo) { this.body = cuerpo; return this; },
    setHeader() {},
    end() { return this; },
  };
}

async function llamar({
  metodo = 'GET', autorizacion = BEARER, modo, env = ENV, ahora = JUEVES, ficha = FICHA_CON_PROBLEMA,
  internet = internetFalso(), correo = correoFalso(),
} = {}) {
  const handler = crearHandler({ env, fetch: internet, crearTransporte: correo, ahora: () => ahora, ficha });
  const req = {
    method: metodo,
    headers: autorizacion === null ? {} : { authorization: autorizacion },
    query: modo ? { modo } : {},
    url: `/api/vigia${modo ? `?modo=${encodeURIComponent(modo)}` : ''}`,
  };
  const res = respuestaFalsa();
  await handler(req, res);
  const telegram = internet.llamadas.filter((l) => l.url.startsWith('https://api.telegram.org/'));
  return { res, internet, correo, telegram, textoTelegram: telegram[0] && JSON.parse(telegram[0].opciones.body).text };
}

const noHizoNada = ({ internet, correo }) => {
  assert.equal(internet.llamadas.length, 0, 'no debería salir a internet');
  assert.equal(correo.enviados.length, 0, 'no debería mandar correos');
};

// ── La puerta ───────────────────────────────────────────────────────────────

test('sin el encabezado Authorization → 401 y no hace nada', async () => {
  const r = await llamar({ autorizacion: null });
  assert.equal(r.res.statusCode, 401);
  noHizoNada(r);
});

test('secreto equivocado, sin "Bearer" o con otro esquema → 401 y no hace nada', async () => {
  for (const autorizacion of ['Bearer otro-secreto-cualquiera-largo', SECRETO, `Bearer ${SECRETO}x`, `Basic ${SECRETO}`, 'Bearer ', '']) {
    const r = await llamar({ autorizacion });
    assert.equal(r.res.statusCode, 401, `pasó con: ${autorizacion}`);
    noHizoNada(r);
  }
});

test('si falta CRON_SECRET en Vercel, no corre (ni con "Bearer " ni con "Bearer undefined")', async () => {
  const { CRON_SECRET, ...sinSecreto } = ENV;
  for (const autorizacion of [null, 'Bearer ', 'Bearer undefined', 'Bearer null']) {
    const r = await llamar({ env: sinSecreto, autorizacion });
    assert.equal(r.res.statusCode, 500, `con ${autorizacion}`);
    noHizoNada(r);
  }
});

test('CRON_SECRET demasiado corto (menos de 16 caracteres) → no corre', async () => {
  const r = await llamar({ env: { ...ENV, CRON_SECRET: 'corto' }, autorizacion: 'Bearer corto' });
  assert.equal(r.res.statusCode, 500);
  noHizoNada(r);
});

test('otro método (POST) → 405 y no hace nada', async () => {
  const r = await llamar({ metodo: 'POST' });
  assert.equal(r.res.statusCode, 405);
  noHizoNada(r);
});

test('modo desconocido → 400 y no hace nada', async () => {
  const r = await llamar({ modo: 'borrar-todo' });
  assert.equal(r.res.statusCode, 400);
  noHizoNada(r);
});

// ── La revisión diaria ──────────────────────────────────────────────────────

test('con el secreto correcto y un modelo apagado: avisa por Telegram y por correo', async () => {
  const r = await llamar();
  assert.equal(r.res.statusCode, 200);
  assert.equal(r.res.body.enviado, true);
  assert.deepEqual(r.res.body.canales, { telegram: 'ok', correo: 'ok' });
  assert.ok(r.res.body.urgentes >= 1);

  assert.equal(r.telegram.length, 1);
  assert.equal(r.telegram[0].url, `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`);
  const cuerpo = JSON.parse(r.telegram[0].opciones.body);
  assert.equal(cuerpo.chat_id, '987654');
  assert.match(cuerpo.text, /llama-3\.3-70b-versatile/);

  assert.equal(r.correo.enviados.length, 1);
  const correo = r.correo.enviados[0];
  assert.equal(correo.to, 'dueno@elguiaya.com');
  assert.match(correo.from, /avisos@elguiaya\.com/);
  assert.match(correo.subject, /urgente/i);
  assert.match(correo.text, /llama-3\.3-70b-versatile/);
  assert.deepEqual(r.correo.configs[0], {
    host: 'smtp.zoho.com', port: 465, secure: true,
    auth: { user: 'avisos@elguiaya.com', pass: ENV.SMTP_PASS },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
  });
});

test('un jueves sin problemas: revisa pero no manda nada', async () => {
  const r = await llamar({ ficha: FICHA_SANA });
  assert.equal(r.res.statusCode, 200);
  assert.equal(r.res.body.enviado, false);
  assert.ok(r.internet.llamadas.length > 0, 'debería haber revisado las fuentes');
  assert.equal(r.telegram.length, 0);
  assert.equal(r.correo.enviados.length, 0);
});

test('un lunes sin problemas: manda el resumen "nada urgente" (así el silencio no se confunde con una falla)', async () => {
  const r = await llamar({ ficha: FICHA_SANA, ahora: LUNES });
  assert.equal(r.res.statusCode, 200);
  assert.equal(r.telegram.length, 1);
  assert.match(r.textoTelegram, /✅/);
  assert.equal(r.correo.enviados.length, 1);
});

// ── Los modos para probar ───────────────────────────────────────────────────

test('modo=prueba: aviso de prueba por los dos canales, sin revisar nada', async () => {
  const r = await llamar({ modo: 'prueba', ficha: FICHA_SANA });
  assert.equal(r.res.statusCode, 200);
  assert.match(r.textoTelegram, /prueba/i);
  assert.equal(r.correo.enviados.length, 1);
  assert.match(r.correo.enviados[0].subject, /prueba/i);
  assert.equal(r.internet.llamadas.length, 1, 'solo la llamada a Telegram');
});

test('modo=simulacro: avisa un modelo "apagado hoy" marcado SIMULACRO aunque todo esté bien', async () => {
  const r = await llamar({ modo: 'simulacro', ficha: FICHA_SANA });
  assert.equal(r.res.statusCode, 200);
  assert.match(r.textoTelegram, /SIMULACRO/);
  assert.match(r.textoTelegram, /openai\/gpt-oss-120b/);
  assert.match(r.correo.enviados[0].subject, /SIMULACRO/);
});

test('modo=resumen: manda el resumen semanal aunque no sea lunes', async () => {
  const r = await llamar({ modo: 'resumen', ficha: FICHA_SANA });
  assert.equal(r.telegram.length, 1);
  assert.match(r.textoTelegram, /✅/);
});

// ── Cuando algo falla ───────────────────────────────────────────────────────

test('si Telegram falla, el correo sale igual y cuenta que Telegram falló', async () => {
  const internet = internetFalso({ 'https://api.telegram.org/': resp({ ok: false, description: 'Unauthorized' }, 401) });
  const r = await llamar({ internet });
  assert.equal(r.res.statusCode, 200);
  assert.match(r.res.body.canales.telegram, /^error: .*401/);
  assert.equal(r.res.body.canales.correo, 'ok');
  assert.match(r.correo.enviados[0].text, /no salió por Telegram/);
});

test('si Telegram contesta 200 pero con ok:false, también cuenta como falla', async () => {
  const internet = internetFalso({ 'https://api.telegram.org/': resp({ ok: false, description: 'chat not found' }) });
  const r = await llamar({ internet });
  assert.match(r.res.body.canales.telegram, /chat not found/);
});

test('si fallan los dos canales → 500 (queda en el registro de Vercel)', async () => {
  const internet = internetFalso({ 'https://api.telegram.org/': resp({ ok: false }, 500) });
  const r = await llamar({ internet, correo: correoFalso({ falla: true }) });
  assert.equal(r.res.statusCode, 500);
  assert.equal(r.res.body.enviado, false);
});

test('si falta configurar un canal, lo dice y usa el otro', async () => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ...sinTelegram } = ENV;
  const r = await llamar({ env: sinTelegram });
  assert.equal(r.res.statusCode, 200);
  assert.match(r.res.body.canales.telegram, /TELEGRAM_BOT_TOKEN/);
  assert.equal(r.res.body.canales.correo, 'ok');
  assert.equal(r.telegram.length, 0);
});

test('ningún secreto aparece en la respuesta ni en el registro, aunque un error los traiga adentro', async (t) => {
  const registro = [];
  t.mock.method(console, 'log', (...a) => registro.push(a.join(' ')));
  t.mock.method(console, 'error', (...a) => registro.push(a.join(' ')));
  const internet = internetFalso({
    'https://api.telegram.org/': (url) => { throw new Error(`no pude conectar con ${url}`); },
  });
  const r = await llamar({ internet, correo: correoFalso({ falla: true }) });
  const todo = JSON.stringify(r.res.body) + registro.join('\n');
  assert.match(todo, /error/);
  for (const s of SECRETOS) assert.ok(!todo.includes(s), `se filtró un secreto: ${s.slice(0, 6)}…`);
});

// ── Los canales por separado ────────────────────────────────────────────────

test('Telegram: un mensaje largo se recorta a 4096 caracteres; el correo lo lleva entero', async () => {
  const fetch = internetFalso();
  const correo = correoFalso();
  const texto = 'x'.repeat(10_000);
  await avisar({ asunto: 'largo', texto, env: ENV, fetch, crearTransporte: correo });
  const enviado = JSON.parse(fetch.llamadas[0].opciones.body).text;
  assert.ok(enviado.length <= 4096, `largo: ${enviado.length}`);
  assert.match(enviado, /sigue en el correo/);
  assert.equal(correo.enviados[0].text.length, 10_000);
});

test('correo: con el puerto 587 usa STARTTLS; con Resend hay que indicar el remitente', async () => {
  const correo = correoFalso();
  await avisar({ asunto: 'a', texto: 'b', env: { ...ENV, SMTP_PORT: '587' }, fetch: internetFalso(), crearTransporte: correo });
  assert.equal(correo.configs[0].port, 587);
  assert.equal(correo.configs[0].secure, false);

  const resend = { ...ENV, SMTP_HOST: 'smtp.resend.com', SMTP_USER: 'resend' };
  const sinRemitente = await avisar({ asunto: 'a', texto: 'b', env: resend, fetch: internetFalso(), crearTransporte: correoFalso() });
  assert.match(sinRemitente.correo, /VIGIA_CORREO_DE/);
  const correoResend = correoFalso();
  await avisar({ asunto: 'a', texto: 'b', env: { ...resend, VIGIA_CORREO_DE: 'onboarding@resend.dev' }, fetch: internetFalso(), crearTransporte: correoResend });
  assert.match(correoResend.enviados[0].from, /onboarding@resend\.dev/);
});

test('taparSecretos reemplaza los valores de las claves por ***', () => {
  assert.equal(taparSecretos(`falló https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/x`, ENV), 'falló https://api.telegram.org/bot***/x');
  assert.equal(taparSecretos(`auth ${ENV.SMTP_PASS} y ${SECRETO}`, ENV), 'auth *** y ***');
  assert.equal(taparSecretos('nada que tapar', ENV), 'nada que tapar');
});

// ── La tarea programada ─────────────────────────────────────────────────────

test('vercel.json: una tarea diaria a /api/vigia a las 11 UTC (8 de la mañana en Argentina) con tiempo suficiente', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const tareas = (vercel.crons || []).filter((c) => c.path === '/api/vigia');
  assert.equal(tareas.length, 1, 'tiene que haber exactamente una tarea para /api/vigia');
  const [minuto, hora, ...resto] = tareas[0].schedule.split(' ');
  assert.match(minuto, /^\d+$/, 'plan Hobby: un solo horario por día');
  assert.equal(Number(hora), 11);
  assert.deepEqual(resto, ['*', '*', '*'], 'todos los días');
  assert.ok(vercel.functions?.['api/vigia.js']?.maxDuration >= 30, 'la revisión baja varias páginas: necesita más de 10 segundos');
  assert.ok(vercel.rewrites.some((r) => r.source === '/(.*)' && r.destination === '/tienda/index.html'), 'las reglas de la tienda siguen igual');
});

// ── Datos mal pegados en Vercel ─────────────────────────────────────────────

test('Telegram y correo funcionan aunque las variables tengan espacios o saltos de línea de más', async () => {
  const fetch = internetFalso();
  const correo = correoFalso();
  const env = {
    ...ENV,
    TELEGRAM_BOT_TOKEN: ` ${ENV.TELEGRAM_BOT_TOKEN}\n`,
    TELEGRAM_CHAT_ID: ' 987654 ',
    SMTP_HOST: ' smtp.zoho.com',
    SMTP_PORT: '465 ',
    SMTP_USER: 'avisos@elguiaya.com\n',
    SMTP_PASS: ` ${ENV.SMTP_PASS} `,
    VIGIA_CORREO_PARA: ' dueno@elguiaya.com\r\n',
  };
  const canales = await avisar({ asunto: 'a', texto: 'b', env, fetch, crearTransporte: correo });
  assert.deepEqual(canales, { telegram: 'ok', correo: 'ok' });
  assert.equal(fetch.llamadas[0].url, `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`);
  assert.equal(JSON.parse(fetch.llamadas[0].opciones.body).chat_id, '987654');
  assert.equal(correo.configs[0].host, 'smtp.zoho.com');
  assert.equal(correo.configs[0].port, 465);
  assert.deepEqual(correo.configs[0].auth, { user: 'avisos@elguiaya.com', pass: ENV.SMTP_PASS });
  assert.equal(correo.enviados[0].to, 'dueno@elguiaya.com');
});

test('el CRON_SECRET con un espacio o salto de línea de más igual se reconoce', async () => {
  const r = await llamar({ env: { ...ENV, CRON_SECRET: `${SECRETO}\n` }, ficha: FICHA_SANA });
  assert.equal(r.res.statusCode, 200);
});

test('los secretos se tapan aunque en Vercel tengan espacios de más', () => {
  const env = { ...ENV, TELEGRAM_BOT_TOKEN: ` ${ENV.TELEGRAM_BOT_TOKEN}\n` };
  assert.equal(taparSecretos(`falló bot${ENV.TELEGRAM_BOT_TOKEN}/x`, env), 'falló bot***/x');
});

test('si Telegram rechaza el token o el chat, el error dice qué variable revisar', async () => {
  const casos = [
    [404, { ok: false, error_code: 404, description: 'Not Found' }, /TELEGRAM_BOT_TOKEN/],
    [401, { ok: false, error_code: 401, description: 'Unauthorized' }, /TELEGRAM_BOT_TOKEN/],
    [400, { ok: false, error_code: 400, description: 'Bad Request: chat not found' }, /TELEGRAM_CHAT_ID/],
  ];
  for (const [status, cuerpo, pista] of casos) {
    const fetch = internetFalso({ 'https://api.telegram.org/': resp(cuerpo, status) });
    const canales = await avisar({ asunto: 'a', texto: 'b', env: ENV, fetch, crearTransporte: correoFalso() });
    assert.match(canales.telegram, pista, `con ${status}: ${canales.telegram}`);
  }
});
