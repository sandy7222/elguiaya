// Corre la revisión del Vigía desde la PC, con internet de verdad, SIN mandar ningún aviso:
// solo muestra el mensaje que mandaría. Sirve para probar cambios en vigia/config.js.
// Uso: node scripts/vigia-local.mjs [--resumen] [--simulacro] [--hoy=AAAA-MM-DD]
// Sin GROQ_API_KEY ni GEMINI_API_KEY no puede leer las listas de modelos, y lo dice en el aviso.
import { revisarHoy } from '../vigia/correr.js';
import { hoyArgentina } from '../vigia/revisar.js';

const args = process.argv.slice(2);
const hoy = (args.find((a) => a.startsWith('--hoy=')) || '').slice('--hoy='.length) || hoyArgentina();
const { mensaje } = await revisarHoy({
  env: process.env,
  fetch,
  hoy,
  simulacro: args.includes('--simulacro'),
  forzarResumen: args.includes('--resumen'),
});
console.log(mensaje ? `Asunto: ${mensaje.asunto}\n\n${mensaje.texto}` : `Hoy (${hoy}) no hay nada que avisar: el Vigía no mandaría ningún mensaje.`);
