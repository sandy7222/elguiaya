// El Vigía: baja de internet las páginas y listas que revisa.
// Cada fuente que falla queda anotada como error (nunca se calla) y las claves viajan
// en encabezados, nunca en la dirección.
import {
  leerRetirosGroq, leerRetirosGemini, leerClasificacionGroq, leerListaGroq, leerListaGemini,
} from './revisar.js';

export const URLS = {
  groqRetiros: 'https://console.groq.com/docs/deprecations.md',
  groqModelos: 'https://console.groq.com/docs/models.md',
  groqLista: 'https://api.groq.com/openai/v1/models',
  geminiRetiros: 'https://ai.google.dev/gemini-api/docs/deprecations.md.txt',
  geminiLista: 'https://generativelanguage.googleapis.com/v1beta/models',
};

const ESPERA_MS = 10_000;
const MAX_PAGINAS_GEMINI = 10;

// variableClave: si el proveedor rechaza la clave, el error dice qué variable de Vercel revisar.
// avisoNoEncontrado: texto extra para un 404 (GitHub responde 404, no 403, ante un repo privado sin permiso).
async function bajar(fetch, url, { headers = {}, comoJson = false, variableClave = null, avisoNoEncontrado = '' } = {}) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'ElGuiaYA-Vigia/1.0', ...headers },
    signal: AbortSignal.timeout(ESPERA_MS),
  });
  if (!r.ok) {
    let detalle = '';
    if (variableClave && [400, 401, 403].includes(r.status)) {
      detalle = `: la clave ${variableClave} de Vercel no es válida o fue dada de baja`;
    } else if (variableClave && r.status === 404) {
      detalle = `: o el archivo no existe, o la clave ${variableClave} de Vercel no tiene permiso sobre ese repositorio`;
    } else if (r.status === 404) {
      detalle = avisoNoEncontrado;
    }
    throw new Error(`respondió ${r.status}${detalle}`);
  }
  return comoJson ? r.json() : r.text();
}

function motivo(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'no respondió a tiempo';
  if (error?.message === 'fetch failed') return 'no hubo conexión';
  return error?.message || String(error);
}

export async function juntarFuentes({ piezas = [], env = {}, fetch = globalThis.fetch } = {}) {
  const errores = [];
  const leidas = [];
  // Un espacio o salto de línea de más al pegar la clave en Vercel no debe romper nada.
  const claveGroq = String(env.GROQ_API_KEY ?? '').trim();
  const claveGemini = String(env.GEMINI_API_KEY ?? '').trim();
  // Para leer el código de repos privados (permiso de solo lectura, ver docs/VIGIA.md).
  const claveGitHub = String(env.GITHUB_TOKEN ?? '').trim();
  const intentar = async (nombre, tarea, { anotarLeida = true } = {}) => {
    try {
      const valor = await tarea();
      if (anotarLeida) leidas.push(nombre);
      return valor;
    } catch (e) {
      errores.push(`${nombre}: ${motivo(e)}`);
      return null;
    }
  };

  const archivos = [];
  for (const p of piezas) {
    for (const a of p.codigo || []) {
      if (!archivos.some((x) => x.repo === a.repo && x.rama === a.rama && x.archivo === a.archivo)) archivos.push(a);
    }
  }

  const [groqRetiros, groqClasificacion, groqLista, geminiRetiros, geminiLista, codigo] = await Promise.all([
    intentar('la página de retiros de Groq', async () => leerRetirosGroq(await bajar(fetch, URLS.groqRetiros))),
    intentar('la página de modelos de Groq', async () => leerClasificacionGroq(await bajar(fetch, URLS.groqModelos))),
    intentar('la lista de modelos de Groq', async () => {
      if (!claveGroq) throw new Error('falta la variable GROQ_API_KEY');
      return leerListaGroq(await bajar(fetch, URLS.groqLista, {
        headers: { Authorization: `Bearer ${claveGroq}` }, comoJson: true, variableClave: 'GROQ_API_KEY',
      }));
    }),
    intentar('la página de retiros de Gemini', async () => leerRetirosGemini(await bajar(fetch, URLS.geminiRetiros))),
    intentar('la lista de modelos de Gemini', async () => {
      if (!claveGemini) throw new Error('falta la variable GEMINI_API_KEY');
      const paginas = [];
      let token = '';
      for (let i = 0; i < MAX_PAGINAS_GEMINI; i++) {
        const url = `${URLS.geminiLista}?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
        const pagina = await bajar(fetch, url, {
          headers: { 'x-goog-api-key': claveGemini }, comoJson: true, variableClave: 'GEMINI_API_KEY',
        });
        paginas.push(pagina);
        token = pagina?.nextPageToken;
        if (!token) break;
      }
      return leerListaGemini(paginas);
    }),
    Promise.all(archivos.map(async (a) => ({
      repo: a.repo,
      rama: a.rama,
      archivo: a.archivo,
      texto: await intentar(
        `${a.archivo} (${a.repo}, rama ${a.rama})`,
        () => (claveGitHub
          ? bajar(fetch, `https://api.github.com/repos/${a.repo}/contents/${a.archivo}?ref=${encodeURIComponent(a.rama)}`, {
            headers: { Authorization: `Bearer ${claveGitHub}`, Accept: 'application/vnd.github.raw+json' },
            variableClave: 'GITHUB_TOKEN',
          })
          : bajar(fetch, `https://raw.githubusercontent.com/${a.repo}/${a.rama}/${a.archivo}`, {
            avisoNoEncontrado: ': si el repositorio es privado, falta la variable GITHUB_TOKEN en Vercel',
          })),
        { anotarLeida: false },
      ),
    }))),
  ]);

  const leidosDeGitHub = codigo.filter((c) => c.texto !== null).length;
  if (leidosDeGitHub) leidas.push(`${leidosDeGitHub} ${leidosDeGitHub === 1 ? 'archivo' : 'archivos'} de código en GitHub`);

  return {
    groq: { retiros: groqRetiros, lista: groqLista, clasificacion: groqClasificacion },
    gemini: { retiros: geminiRetiros, lista: geminiLista },
    codigo,
    errores,
    leidas,
  };
}
