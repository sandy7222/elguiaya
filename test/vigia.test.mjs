// El Vigía, paso 1: lee las páginas de retiros de Groq y Gemini, las compara con la ficha
// (vigia/config.js) y con el código de GitHub, y arma el aviso.
// Las páginas de test/fixtures/vigia son copias reales bajadas el 2026-10-08.
// Correr: node --test test/vigia.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  leerRetirosGroq, leerRetirosGemini, leerClasificacionGroq, leerListaGroq, leerListaGemini,
  modelosEnCodigo, hoyArgentina, esLunes, evaluar, armarMensaje, simularRetiro,
} from '../vigia/revisar.js';
import { juntarFuentes, URLS } from '../vigia/fuentes.js';
import { piezas as piezasReales, claves as clavesReales } from '../vigia/config.js';

const fixture = (nombre) => readFileSync(new URL(`./fixtures/vigia/${nombre}`, import.meta.url), 'utf8');
const GROQ_RETIROS = fixture('groq-retiros-2026-10-08.md');
const GROQ_MODELOS = fixture('groq-modelos-2026-10-08.md');
const GEMINI_RETIROS = fixture('gemini-retiros-2026-10-08.md');

const JUEVES = '2026-10-08';
const LUNES = '2026-10-12';

function sumarDias(fecha, dias) {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

const pieza = (nombre, modelos, codigo = []) => ({
  nombre,
  modelos: modelos.map(([proveedor, id]) => ({ proveedor, id })),
  codigo,
});

// Lo que Groq y Gemini ofrecían el 2026-10-08 (formato de sus listas de modelos).
const LISTA_GROQ = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'whisper-large-v3', 'whisper-large-v3-turbo', 'qwen/qwen3.8-27b'];
const LISTA_GEMINI = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-pro-preview'];

function fuentesDeHoy(cambios = {}) {
  return {
    groq: {
      retiros: leerRetirosGroq(GROQ_RETIROS),
      lista: new Set(LISTA_GROQ),
      clasificacion: leerClasificacionGroq(GROQ_MODELOS),
      ...cambios.groq,
    },
    gemini: {
      retiros: leerRetirosGemini(GEMINI_RETIROS),
      lista: new Set(LISTA_GEMINI),
      ...cambios.gemini,
    },
    codigo: cambios.codigo || [],
    errores: cambios.errores || [],
    leidas: cambios.leidas || [],
  };
}

const revisar = (piezas, fuentes = fuentesDeHoy(), hoy = JUEVES, claves = []) => evaluar({ piezas, claves, fuentes, hoy });

// ── Página de retiros de Groq ───────────────────────────────────────────────

test('Groq: encuentra llama-3.3-70b-versatile apagado el 16/08/26 y su reemplazo', () => {
  const retiros = leerRetirosGroq(GROQ_RETIROS);
  const llama = retiros.find((r) => r.modelo === 'llama-3.3-70b-versatile');
  assert.ok(llama, 'no encontró llama-3.3-70b-versatile');
  assert.equal(llama.fecha, '2026-08-16');
  assert.match(llama.reemplazo, /openai\/gpt-oss-120b/);
  assert.equal(retiros.find((r) => r.modelo === 'llama-3.1-8b-instant').fecha, '2026-08-16');
  assert.equal(retiros.find((r) => r.modelo === 'groq/compound').fecha, '2026-09-21');
});

test('Groq: entiende fechas con un solo dígito (1/6/25) y lee todas las tablas', () => {
  const retiros = leerRetirosGroq(GROQ_RETIROS);
  assert.equal(retiros.find((r) => r.modelo === 'llama3-groq-8b-8192-tool-use-preview').fecha, '2025-01-06');
  assert.ok(retiros.length >= 40, `leyó solo ${retiros.length} filas`);
  for (const r of retiros) assert.match(r.fecha, /^\d{4}-\d{2}-\d{2}$/, `fecha rara en ${r.modelo}: ${r.fechaTexto}`);
});

test('Groq: si la página cambia de formato, falla en voz alta (no dice "todo en orden")', () => {
  assert.throws(() => leerRetirosGroq('<html><body>Cargando…</body></html>'), /formato/);
  assert.throws(() => leerRetirosGroq(GROQ_RETIROS.replaceAll('Shutdown Date', 'Fin')), /formato/);
});

// ── Página de retiros de Gemini ─────────────────────────────────────────────

test('Gemini: gemini-2.5-flash figura sin fecha de apagado', () => {
  const flash = leerRetirosGemini(GEMINI_RETIROS).find((r) => r.modelo === 'gemini-2.5-flash');
  assert.ok(flash, 'no encontró gemini-2.5-flash');
  assert.equal(flash.fecha, null);
  assert.equal(flash.sinFecha, true);
  assert.equal(flash.preview, false);
});

test('Gemini: lee fechas en inglés y marca los Preview', () => {
  const retiros = leerRetirosGemini(GEMINI_RETIROS);
  const prev = retiros.find((r) => r.modelo === 'gemini-2.5-flash-preview-05-20');
  assert.equal(prev.fecha, '2025-11-18');
  assert.equal(prev.preview, true);
  assert.equal(prev.reemplazo, 'gemini-3.6-flash');
  const lite = retiros.find((r) => r.modelo === 'gemini-3.1-flash-lite');
  assert.equal(lite.fecha, '2027-05-07');
  assert.equal(lite.preview, false);
  for (const r of retiros) assert.ok(r.sinFecha || /^\d{4}-\d{2}-\d{2}$/.test(r.fecha), `fecha rara en ${r.modelo}: ${r.fechaTexto}`);
});

test('Gemini: si la página cambia de formato, falla en voz alta', () => {
  assert.throws(() => leerRetirosGemini(''), /formato/);
  assert.throws(() => leerRetirosGemini(GEMINI_RETIROS.replaceAll('Shutdown date', 'Fin')), /formato/);
});

// ── Página de modelos de Groq (Production / Preview) ────────────────────────

test('Groq: separa modelos Production, Preview y los que quedaron solo para Enterprise', () => {
  const c = leerClasificacionGroq(GROQ_MODELOS);
  for (const id of ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'whisper-large-v3-turbo']) {
    assert.ok(c.production.has(id), `${id} debería ser Production`);
    assert.ok(!c.enterprise.has(id), `${id} no es solo Enterprise`);
  }
  assert.ok(c.preview.has('qwen/qwen3.8-27b'));
  assert.ok(!c.production.has('qwen/qwen3.8-27b'));
  assert.ok(c.enterprise.has('llama-3.3-70b-versatile'));
  assert.throws(() => leerClasificacionGroq('# nada'), /formato/);
});

// ── Listas de modelos que ofrecen hoy ───────────────────────────────────────

test('lista de Groq: solo cuenta los modelos activos', () => {
  const lista = leerListaGroq({ object: 'list', data: [{ id: 'openai/gpt-oss-120b', active: true }, { id: 'viejo', active: false }] });
  assert.ok(lista.has('openai/gpt-oss-120b'));
  assert.ok(!lista.has('viejo'));
  assert.throws(() => leerListaGroq({ error: 'x' }), /formato/);
});

test('lista de Gemini: junta varias páginas y saca el prefijo "models/"', () => {
  const lista = leerListaGemini([{ models: [{ name: 'models/gemini-2.5-flash' }] }, { models: [{ name: 'models/gemini-3.8-flash' }] }]);
  assert.deepEqual([...lista].sort(), ['gemini-2.5-flash', 'gemini-3.8-flash']);
  assert.throws(() => leerListaGemini([{ error: 'x' }]), /formato/);
});

// ── Nombres de modelos en el código ─────────────────────────────────────────

test('código: encuentra los modelos escritos entre comillas (JS, TS y Dart)', () => {
  const conocidos = new Set(['gemini-2.5-flash', 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b']);
  const js = "model: 'gemini-2.5-flash',\nheaders: { 'Content-Type': 'application/json' },\nmodel: \"llama-3.3-70b-versatile\",";
  assert.deepEqual([...modelosEnCodigo(js, conocidos)].sort(), ['gemini-2.5-flash', 'llama-3.3-70b-versatile']);
  const dart = "static const String defaultModel = 'openai/gpt-oss-120b';";
  assert.deepEqual([...modelosEnCodigo(dart, conocidos)], ['openai/gpt-oss-120b']);
  assert.deepEqual([...modelosEnCodigo('const m = "models/gemini-2.5-flash";', conocidos)], ['gemini-2.5-flash']);
  assert.deepEqual([...modelosEnCodigo('// antes se usaba llama-3.3-70b-versatile', conocidos)], []);
});

// ── Evaluación: modelos ─────────────────────────────────────────────────────

const SITIO = pieza('Sitio (chat de la tienda)', [['gemini', 'gemini-2.5-flash'], ['groq', 'llama-3.3-70b-versatile']]);

test('hoy: el respaldo del sitio usa un modelo que Groq apagó el 16/08/2026 → un aviso urgente', () => {
  const r = revisar([SITIO]);
  const avisos = r.urgentes.filter((t) => t.includes('llama-3.3-70b-versatile'));
  assert.equal(avisos.length, 1, `esperaba un solo aviso, hubo: ${JSON.stringify(avisos)}`);
  assert.match(avisos[0], /16\/08\/2026/);
  assert.match(avisos[0], /Sitio \(chat de la tienda\)/);
  assert.match(avisos[0], /openai\/gpt-oss-120b/);
});

test('modelos vivos y de producción no generan avisos', () => {
  const r = revisar([pieza('App', [['groq', 'openai/gpt-oss-120b'], ['gemini', 'gemini-2.5-flash'], ['groq', 'whisper-large-v3-turbo']])]);
  assert.deepEqual(r.urgentes, []);
  assert.deepEqual(r.semanales, []);
});

test('un modelo usado por dos piezas da un solo aviso que nombra a las dos', () => {
  const r = revisar([pieza('Pieza Uno', [['groq', 'llama-3.3-70b-versatile']]), pieza('Pieza Dos', [['groq', 'llama-3.3-70b-versatile']])]);
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /Pieza Uno/);
  assert.match(r.urgentes[0], /Pieza Dos/);
});

test('modelo en uso que desapareció de la lista de Groq → urgente (ya está caído)', () => {
  const sinVeinte = new Set(LISTA_GROQ.filter((m) => m !== 'openai/gpt-oss-20b'));
  const r = revisar([pieza('Centralita', [['groq', 'openai/gpt-oss-20b']])], fuentesDeHoy({ groq: { lista: sinVeinte } }));
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /openai\/gpt-oss-20b/);
  assert.match(r.urgentes[0], /ya no figura/);
});

test('modelo en uso que desapareció de la lista de Gemini → urgente', () => {
  const r = revisar([pieza('App', [['gemini', 'gemini-2.5-flash']])], fuentesDeHoy({ gemini: { lista: new Set(['gemini-3.8-flash']) } }));
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /gemini-2\.5-flash/);
  assert.match(r.urgentes[0], /ya no figura/);
});

test('apagado anunciado: a 20 y a 30 días → urgente; a 60 días → solo en el resumen semanal', () => {
  const conRetiro = (fecha) => fuentesDeHoy({
    groq: { retiros: [...leerRetirosGroq(GROQ_RETIROS), { modelo: 'openai/gpt-oss-120b', fecha, fechaTexto: fecha, reemplazo: 'otro-modelo' }] },
  });
  const app = [pieza('App', [['groq', 'openai/gpt-oss-120b']])];

  const a20 = revisar(app, conRetiro(sumarDias(JUEVES, 20)));
  assert.equal(a20.urgentes.length, 1);
  assert.match(a20.urgentes[0], /faltan 20 días/);
  assert.match(a20.urgentes[0], /otro-modelo/);

  assert.equal(revisar(app, conRetiro(sumarDias(JUEVES, 30))).urgentes.length, 1);

  const a60 = revisar(app, conRetiro(sumarDias(JUEVES, 60)));
  assert.deepEqual(a60.urgentes, []);
  assert.equal(a60.semanales.length, 1);
  assert.match(a60.semanales[0], /faltan 60 días/);
});

test('Gemini con fecha de apagado: aclara que Google la da como la fecha más temprana', () => {
  const lista = new Set([...LISTA_GEMINI, 'gemini-3.1-flash-lite']);
  const r = revisar([pieza('App', [['gemini', 'gemini-3.1-flash-lite']])], fuentesDeHoy({ gemini: { lista } }));
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /07\/05\/2027/);
  assert.match(r.semanales[0], /más temprana/);
});

test('modelo Preview de Groq en uso → riesgo en el resumen semanal', () => {
  const r = revisar([pieza('Prueba', [['groq', 'qwen/qwen3.8-27b']])]);
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /Preview/);
});

test('modelo Preview de Gemini en uso → riesgo en el resumen semanal', () => {
  const r = revisar([pieza('Prueba', [['gemini', 'gemini-3.1-pro-preview']])]);
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /Preview/);
});

test('modelo de Groq que quedó solo para Enterprise (sin retiro anunciado) → urgente', () => {
  const clasificacion = leerClasificacionGroq(GROQ_MODELOS);
  clasificacion.enterprise.add('openai/gpt-oss-120b');
  const r = revisar([pieza('App', [['groq', 'openai/gpt-oss-120b']])], fuentesDeHoy({ groq: { clasificacion } }));
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /Enterprise/);
});

test('Gemini: un modelo que no figura en la página de retiros se avisa en el semanal (no se puede saber su fecha)', () => {
  const lista = new Set([...LISTA_GEMINI, 'gemini-nuevo']);
  const r = revisar([pieza('App', [['gemini', 'gemini-nuevo']])], fuentesDeHoy({ gemini: { lista } }));
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /no figura en la página de retiros/);
});

// ── Evaluación: la ficha contra el código ───────────────────────────────────

const archivo = (nombre, alias) => ({ repo: 'sandy7222/elguiaya', rama: 'main', archivo: nombre, ...(alias ? { alias } : {}) });
const leido = (nombre, texto) => ({ repo: 'sandy7222/elguiaya', rama: 'main', archivo: nombre, texto });

test('el alias que el ia-proxy traduce a otro modelo no cuenta como uso', () => {
  const app = pieza('App', [['groq', 'openai/gpt-oss-120b']], [archivo('index.ts', ['llama-3.3-70b-versatile'])]);
  const codigo = [leido('index.ts', 'const alias = { "llama-3.3-70b-versatile": "openai/gpt-oss-120b" };')];
  const r = revisar([app], fuentesDeHoy({ codigo }));
  assert.deepEqual(r.urgentes, []);
  assert.deepEqual(r.semanales, []);
});

test('el código usa un modelo apagado que no está en la ficha → urgente igual (manda el código)', () => {
  const sitio = pieza('Sitio', [['gemini', 'gemini-2.5-flash']], [archivo('api/chat-tienda.js')]);
  const codigo = [leido('api/chat-tienda.js', "model: 'gemini-2.5-flash'\nmodel: 'llama-3.3-70b-versatile'")];
  const r = revisar([sitio], fuentesDeHoy({ codigo }));
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /llama-3\.3-70b-versatile/);
  assert.match(r.urgentes[0], /api\/chat-tienda\.js/);
  assert.ok(r.semanales.some((t) => /ficha/i.test(t) && t.includes('llama-3.3-70b-versatile')));
});

test('el código usa un modelo vivo que no está en la ficha → ficha desactualizada (semanal)', () => {
  const sitio = pieza('Sitio', [['gemini', 'gemini-2.5-flash']], [archivo('api/chat-tienda.js')]);
  const codigo = [leido('api/chat-tienda.js', "model: 'gemini-2.5-flash'\nmodel: 'openai/gpt-oss-120b'")];
  const r = revisar([sitio], fuentesDeHoy({ codigo }));
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /openai\/gpt-oss-120b/);
  assert.match(r.semanales[0], /no está anotado/);
});

test('la ficha anota un modelo que ya no aparece en el código → ficha desactualizada (semanal)', () => {
  const sitio = pieza('Sitio', [['gemini', 'gemini-2.5-flash'], ['groq', 'openai/gpt-oss-120b']], [archivo('api/chat-tienda.js')]);
  const codigo = [leido('api/chat-tienda.js', "model: 'gemini-2.5-flash'")];
  const r = revisar([sitio], fuentesDeHoy({ codigo }));
  assert.deepEqual(r.urgentes, []);
  assert.equal(r.semanales.length, 1);
  assert.match(r.semanales[0], /no lo encontré/);
});

test('si no se pudo leer el código, no acusa a la ficha de desactualizada', () => {
  const sitio = pieza('Sitio', [['gemini', 'gemini-2.5-flash']], [archivo('api/chat-tienda.js')]);
  const r = revisar([sitio], fuentesDeHoy({ codigo: [leido('api/chat-tienda.js', null)] }));
  assert.deepEqual(r.semanales, []);
});

// ── Evaluación: fuentes que no se pudieron leer ─────────────────────────────

test('si no pudo leer una fuente, avisa como urgente (el silencio nunca significa "no pude mirar")', () => {
  const fuentes = fuentesDeHoy({ groq: { retiros: null }, errores: ['la página de retiros de Groq: respondió 503'] });
  const r = revisar([SITIO], fuentes);
  assert.ok(r.urgentes.some((t) => /No pude revisar/.test(t) && /retiros de Groq/.test(t)));
  assert.notEqual(armarMensaje(revisar([], fuentes), { hoy: JUEVES }), null);
});

// ── Evaluación: claves ──────────────────────────────────────────────────────

test('claves: avisa a 30 y a 7 días, todos los días desde 3 antes y después de vencida', () => {
  const clave = (dias) => ({ nombre: `CLAVE_${dias}`, donde: 'Vercel', vence: sumarDias(JUEVES, dias) });
  const dias = [45, 31, 30, 29, 12, 8, 7, 6, 4, 3, 1, 0, -1, -20];
  const r = revisar([], fuentesDeHoy(), JUEVES, dias.map(clave));
  const urgente = (d) => r.urgentes.some((t) => t.includes(`CLAVE_${d} `));
  const semanal = (d) => r.semanales.some((t) => t.includes(`CLAVE_${d} `));
  for (const d of [30, 7, 3, 1, 0, -1, -20]) assert.ok(urgente(d), `a ${d} días debería ser urgente`);
  for (const d of [29, 12, 8, 6, 4]) assert.ok(!urgente(d) && semanal(d), `a ${d} días debería ir al semanal`);
  for (const d of [45, 31]) assert.ok(!urgente(d) && !semanal(d), `a ${d} días no debería avisar`);
  assert.ok(r.urgentes.find((t) => t.includes('CLAVE_0 ')).includes('vence hoy'));
  assert.ok(r.urgentes.find((t) => t.includes('CLAVE_-1 ')).includes('venció'));
});

test('claves: sin fecha → semanal; "nunca" → nada; fecha mal escrita → urgente', () => {
  const r = revisar([], fuentesDeHoy(), JUEVES, [
    { nombre: 'SIN_FECHA', donde: 'Vercel', vence: null },
    { nombre: 'ETERNA', donde: 'Vercel', vence: 'nunca' },
    { nombre: 'MAL_ESCRITA', donde: 'Vercel', vence: '15/01/2027' },
  ]);
  assert.ok(r.semanales.some((t) => t.includes('SIN_FECHA') && /no tiene fecha/.test(t)));
  assert.ok(!r.urgentes.some((t) => t.includes('ETERNA')) && !r.semanales.some((t) => t.includes('ETERNA')));
  assert.ok(r.urgentes.some((t) => t.includes('MAL_ESCRITA') && /mal escrita/.test(t)));
});

// ── El mensaje ──────────────────────────────────────────────────────────────

const R = (urgentes = [], semanales = []) => ({ urgentes, semanales, revisado: ['Revisé 3 modelos.'] });

test('un jueves sin urgencias no manda nada', () => {
  assert.equal(armarMensaje(R([], ['para revisar']), { hoy: JUEVES }), null);
});

test('un lunes sin urgencias manda el resumen "nada urgente" con lo que revisó y lo que hay que revisar', () => {
  const m = armarMensaje(R([], ['para revisar']), { hoy: LUNES });
  assert.match(m.asunto, /resumen semanal/i);
  assert.match(m.texto, /✅/);
  assert.match(m.texto, /para revisar/);
  assert.match(m.texto, /Revisé 3 modelos/);
});

test('un jueves con urgencias manda solo lo urgente', () => {
  const m = armarMensaje(R(['se cayó algo'], ['para revisar']), { hoy: JUEVES });
  assert.match(m.asunto, /urgente/i);
  assert.match(m.texto, /se cayó algo/);
  assert.doesNotMatch(m.texto, /para revisar/);
});

test('un lunes con urgencias manda lo urgente y también lo que hay que revisar', () => {
  const m = armarMensaje(R(['se cayó algo'], ['para revisar']), { hoy: LUNES });
  assert.match(m.texto, /se cayó algo/);
  assert.match(m.texto, /para revisar/);
});

test('el resumen se puede pedir cualquier día y el simulacro queda marcado', () => {
  assert.notEqual(armarMensaje(R(), { hoy: JUEVES, forzarResumen: true }), null);
  const m = armarMensaje(R(['algo']), { hoy: JUEVES, simulacro: true });
  assert.match(m.asunto, /SIMULACRO/);
  assert.match(m.texto, /SIMULACRO/);
});

test('la fecha de hoy se calcula en hora argentina', () => {
  assert.equal(hoyArgentina(new Date('2026-10-12T02:30:00Z')), '2026-10-11');
  assert.equal(hoyArgentina(new Date('2026-10-12T11:00:00Z')), '2026-10-12');
  assert.equal(esLunes('2026-10-12'), true);
  assert.equal(esLunes('2026-10-11'), false);
});

test('simulacro de "modelo retirado": un modelo en uso aparece apagado hoy → urgente, sin tocar los datos reales', () => {
  const app = [pieza('App', [['groq', 'openai/gpt-oss-120b']])];
  const reales = fuentesDeHoy();
  const cantidad = reales.groq.retiros.length;
  const r = revisar(app, simularRetiro(reales, app, JUEVES));
  assert.equal(r.urgentes.length, 1);
  assert.match(r.urgentes[0], /openai\/gpt-oss-120b/);
  assert.equal(reales.groq.retiros.length, cantidad);
});

// ── Juntar las fuentes (con internet de mentira) ────────────────────────────

const resp = (cuerpo, status = 200) => () => new Response(typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo), { status });

function internetFalso(cambios = {}) {
  const rutas = {
    [URLS.groqRetiros]: resp(GROQ_RETIROS),
    [URLS.groqModelos]: resp(GROQ_MODELOS),
    [URLS.groqLista]: resp({ object: 'list', data: LISTA_GROQ.map((id) => ({ id, active: true })) }),
    [URLS.geminiRetiros]: resp(GEMINI_RETIROS),
    [URLS.geminiLista]: resp({ models: LISTA_GEMINI.map((id) => ({ name: `models/${id}` })) }),
    'https://raw.githubusercontent.com/': resp("model: 'gemini-2.5-flash'"),
    ...cambios,
  };
  const llamadas = [];
  const fetchFalso = async (url, opciones = {}) => {
    llamadas.push({ url: String(url), opciones });
    const prefijo = Object.keys(rutas).filter((p) => p !== 'undefined' && String(url).startsWith(p)).sort((a, b) => b.length - a.length)[0];
    if (!prefijo) return new Response('no encontrado', { status: 404 });
    return rutas[prefijo](String(url), opciones);
  };
  fetchFalso.llamadas = llamadas;
  return fetchFalso;
}

const ENV = { GROQ_API_KEY: 'clave-falsa-groq', GEMINI_API_KEY: 'clave-falsa-gemini' };
const CON_CODIGO = [pieza('Sitio', [['gemini', 'gemini-2.5-flash']], [archivo('api/chat-tienda.js')])];
const encabezado = (llamada, nombre) => new Headers(llamada.opciones.headers).get(nombre);

test('junta todo sin errores: retiros, listas y código de GitHub', async () => {
  const fetch = internetFalso();
  const f = await juntarFuentes({ piezas: CON_CODIGO, env: ENV, fetch });
  assert.deepEqual(f.errores, []);
  assert.ok(f.groq.retiros.some((r) => r.modelo === 'llama-3.3-70b-versatile'));
  assert.ok(f.groq.lista.has('openai/gpt-oss-120b'));
  assert.ok(f.groq.clasificacion.preview.has('qwen/qwen3.8-27b'));
  assert.ok(f.gemini.retiros.some((r) => r.modelo === 'gemini-2.5-flash'));
  assert.ok(f.gemini.lista.has('gemini-2.5-flash'));
  assert.equal(f.codigo[0].texto, "model: 'gemini-2.5-flash'");
  assert.ok(fetch.llamadas.some((l) => l.url === 'https://raw.githubusercontent.com/sandy7222/elguiaya/main/api/chat-tienda.js'));
  assert.ok(f.leidas.length >= 6);
});

test('las claves viajan en encabezados, nunca en la dirección', async () => {
  const fetch = internetFalso();
  await juntarFuentes({ piezas: CON_CODIGO, env: ENV, fetch });
  const groq = fetch.llamadas.find((l) => l.url.startsWith(URLS.groqLista));
  const gemini = fetch.llamadas.find((l) => l.url.startsWith(URLS.geminiLista));
  assert.equal(encabezado(groq, 'authorization'), 'Bearer clave-falsa-groq');
  assert.equal(encabezado(gemini, 'x-goog-api-key'), 'clave-falsa-gemini');
  for (const l of fetch.llamadas) assert.ok(!l.url.includes('clave-falsa'), `clave en la dirección: ${l.url}`);
});

test('sin GROQ_API_KEY ni GEMINI_API_KEY: lo avisa y no llama a esas listas', async () => {
  const fetch = internetFalso();
  const f = await juntarFuentes({ piezas: CON_CODIGO, env: {}, fetch });
  assert.ok(f.errores.some((e) => e.includes('GROQ_API_KEY')));
  assert.ok(f.errores.some((e) => e.includes('GEMINI_API_KEY')));
  assert.equal(f.groq.lista, null);
  assert.equal(f.gemini.lista, null);
  assert.ok(!fetch.llamadas.some((l) => l.url.startsWith(URLS.groqLista) || l.url.startsWith(URLS.geminiLista)));
  assert.ok(f.groq.retiros.length > 0, 'las páginas públicas se leen igual');
});

test('página de retiros de Groq caída o con otro formato → error que nombra la fuente', async () => {
  const caida = await juntarFuentes({ piezas: [], env: ENV, fetch: internetFalso({ [URLS.groqRetiros]: resp('error', 503) }) });
  assert.ok(caida.errores.some((e) => /retiros de Groq/.test(e) && /503/.test(e)));
  assert.equal(caida.groq.retiros, null);
  const otra = await juntarFuentes({ piezas: [], env: ENV, fetch: internetFalso({ [URLS.groqRetiros]: resp('<html>nuevo diseño</html>') }) });
  assert.ok(otra.errores.some((e) => /retiros de Groq/.test(e) && /formato/.test(e)));
});

test('sin conexión: no se cae, lo anota como error', async () => {
  const sinRed = () => { throw new TypeError('fetch failed'); };
  const f = await juntarFuentes({ piezas: [], env: ENV, fetch: internetFalso({ [URLS.geminiRetiros]: sinRed }) });
  assert.ok(f.errores.some((e) => /retiros de Gemini/.test(e)));
});

test('un archivo de código que no existe en GitHub → error que nombra el archivo', async () => {
  const fetch = internetFalso({ 'https://raw.githubusercontent.com/': resp('404: Not Found', 404) });
  const f = await juntarFuentes({ piezas: CON_CODIGO, env: ENV, fetch });
  assert.ok(f.errores.some((e) => e.includes('api/chat-tienda.js')));
  assert.equal(f.codigo[0].texto, null);
});

test('la lista de Gemini en varias páginas se lee entera', async () => {
  const paginada = (url) => new Response(JSON.stringify(url.includes('pageToken=p2')
    ? { models: [{ name: 'models/gemini-3.8-flash' }] }
    : { models: [{ name: 'models/gemini-2.5-flash' }], nextPageToken: 'p2' }));
  const f = await juntarFuentes({ piezas: [], env: ENV, fetch: internetFalso({ [URLS.geminiLista]: paginada }) });
  assert.deepEqual([...f.gemini.lista].sort(), ['gemini-2.5-flash', 'gemini-3.8-flash']);
});

// ── La ficha real ───────────────────────────────────────────────────────────

test('la ficha real (vigia/config.js) está bien armada', () => {
  assert.ok(piezasReales.length > 0);
  for (const p of piezasReales) {
    assert.ok(p.nombre && Array.isArray(p.modelos) && p.modelos.length > 0, `pieza mal armada: ${p.nombre}`);
    for (const m of p.modelos) assert.ok(['groq', 'gemini'].includes(m.proveedor) && m.id, `${p.nombre}: modelo mal anotado`);
    for (const c of p.codigo) assert.ok(/^[\w.-]+\/[\w.-]+$/.test(c.repo) && c.rama && c.archivo, `${p.nombre}: archivo mal anotado`);
  }
  for (const c of clavesReales) {
    assert.ok(c.nombre && c.donde, 'clave sin nombre o sin lugar');
    assert.ok(c.vence === null || c.vence === 'nunca' || /^\d{4}-\d{2}-\d{2}$/.test(c.vence), `${c.nombre}: fecha mal escrita`);
  }
});

test('la ficha real no contiene valores de claves', () => {
  const texto = readFileSync(new URL('../vigia/config.js', import.meta.url), 'utf8');
  const parecidosAClaves = [
    /gsk_[A-Za-z0-9]{10,}/, // Groq
    /AIza[0-9A-Za-z_-]{20,}/, // Google
    /\bsk-[A-Za-z0-9_-]{10,}/,
    /\b\d{6,}:[A-Za-z0-9_-]{30,}/, // Telegram
    /APP_USR-[0-9a-f-]{10,}/, // Mercado Pago
    /\bEAA[A-Za-z0-9]{20,}/, // Meta / WhatsApp
    /\bre_[A-Za-z0-9_]{16,}/, // Resend
  ];
  for (const patron of parecidosAClaves) assert.doesNotMatch(texto, patron);
});

// ── Claves mal pegadas ──────────────────────────────────────────────────────

test('las claves con espacios o saltos de línea al principio o al final igual funcionan', async () => {
  const fetch = internetFalso();
  await juntarFuentes({ piezas: [], env: { GROQ_API_KEY: '  clave-falsa-groq \n', GEMINI_API_KEY: '\tclave-falsa-gemini\r\n' }, fetch });
  const groq = fetch.llamadas.find((l) => l.url.startsWith(URLS.groqLista));
  const gemini = fetch.llamadas.find((l) => l.url.startsWith(URLS.geminiLista));
  assert.equal(encabezado(groq, 'authorization'), 'Bearer clave-falsa-groq');
  assert.equal(encabezado(gemini, 'x-goog-api-key'), 'clave-falsa-gemini');
});

test('si el proveedor rechaza la clave, el aviso dice qué variable revisar', async () => {
  const f = await juntarFuentes({
    piezas: [],
    env: ENV,
    fetch: internetFalso({ [URLS.groqLista]: resp({ error: 'invalid' }, 401), [URLS.geminiLista]: resp({ error: 'API_KEY_INVALID' }, 400) }),
  });
  assert.ok(f.errores.some((e) => /lista de modelos de Groq/.test(e) && /401/.test(e) && /GROQ_API_KEY/.test(e) && /no es válida/.test(e)), JSON.stringify(f.errores));
  assert.ok(f.errores.some((e) => /lista de modelos de Gemini/.test(e) && /GEMINI_API_KEY/.test(e) && /no es válida/.test(e)), JSON.stringify(f.errores));
});
