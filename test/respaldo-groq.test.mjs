// Respaldo de Groq de los chats del sitio: tiene que usar un modelo vivo.
// llama-3.3-70b-versatile se apagó el 2026-08-16 (lo detectó el Vigía el 2026-10-09).
// Correr: node --test test/respaldo-groq.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { callGroq as groqChatTienda } from '../api/chat-tienda.js';
import { callGroq as groqAsistente } from '../api/gemini/assistant.js';
import { leerRetirosGroq, modelosEnCodigo } from '../vigia/revisar.js';
import { piezas } from '../vigia/config.js';

// El mismo modelo y el mismo ajuste de razonamiento que ya usa la app (función ia-proxy de Supabase).
const MODELO = 'openai/gpt-oss-120b';
const leer = (ruta) => readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8');
const RETIROS_GROQ = leerRetirosGroq(leer('test/fixtures/vigia/groq-retiros-2026-10-08.md'));

function groqFalso(t, respuesta) {
  const llamadas = [];
  t.mock.method(globalThis, 'fetch', async (url, opciones) => {
    llamadas.push({ url: String(url), cuerpo: JSON.parse(opciones.body) });
    return new Response(JSON.stringify(respuesta), { status: 200 });
  });
  return llamadas;
}

const RESPUESTA = { choices: [{ message: { content: 'Sí, hacemos envíos a domicilio.', reasoning: 'El cliente pregunta por envíos…' } }] };

for (const [archivo, callGroq, tope] of [['api/chat-tienda.js', groqChatTienda, 1024], ['api/gemini/assistant.js', groqAsistente, 2048]]) {
  test(`${archivo}: el respaldo pide ${MODELO} con razonamiento "low" y devuelve solo la respuesta`, async (t) => {
    const llamadas = groqFalso(t, RESPUESTA);
    const texto = await callGroq('¿Hacen envíos?', [{ role: 'user', text: 'Hola' }, { role: 'assistant', text: '¡Hola! ¿En qué te ayudo?' }], 'clave-falsa');
    assert.equal(texto, 'Sí, hacemos envíos a domicilio.');
    assert.equal(llamadas.length, 1);
    assert.equal(llamadas[0].url, 'https://api.groq.com/openai/v1/chat/completions');
    const { cuerpo } = llamadas[0];
    assert.equal(cuerpo.model, MODELO);
    assert.equal(cuerpo.reasoning_effort, 'low');
    assert.equal(cuerpo.max_completion_tokens, tope);
    assert.equal(cuerpo.max_tokens, undefined, 'max_tokens es el nombre viejo: con gpt-oss va max_completion_tokens');
    assert.equal(cuerpo.messages.at(-1).content, '¿Hacen envíos?');
  });

  test(`${archivo}: si Groq devuelve el texto vacío (gastó todo pensando), falla en vez de mandar un mensaje en blanco`, async (t) => {
    groqFalso(t, { choices: [{ message: { content: '', reasoning: 'pensó mucho' } }] });
    await assert.rejects(() => callGroq('hola', [], 'clave-falsa'), /vacía/);
  });
}

test('server.ts (el servidor para probar en la PC) usa el mismo respaldo', () => {
  const codigo = leer('server.ts');
  assert.match(codigo, /model: 'openai\/gpt-oss-120b'/);
  assert.match(codigo, /reasoning_effort: 'low'/);
  assert.match(codigo, /max_completion_tokens: 2048/);
});

test('ningún archivo del sitio usa un modelo que Groq ya retiró', () => {
  const retirados = new Set(RETIROS_GROQ.map((r) => r.modelo));
  for (const archivo of ['api/chat-tienda.js', 'api/gemini/assistant.js', 'server.ts']) {
    const usados = [...modelosEnCodigo(leer(archivo), retirados)];
    assert.deepEqual(usados, [], `${archivo} usa un modelo retirado: ${usados.join(', ')}`);
  }
});

test('la ficha del Vigía dice lo mismo que el código del sitio', () => {
  const sitio = piezas.find((p) => p.codigo.some((c) => c.repo === 'sandy7222/elguiaya'));
  const anotados = sitio.modelos.map((m) => m.id).sort();
  const conocidos = new Set([...anotados, ...RETIROS_GROQ.map((r) => r.modelo), MODELO]);
  const enCodigo = new Set(sitio.codigo.flatMap((c) => [...modelosEnCodigo(leer(c.archivo), conocidos)]));
  assert.deepEqual([...enCodigo].sort(), anotados);
});
