// El Vigía de punta a punta: baja las fuentes, compara con la ficha y arma el mensaje.
// Lo usan la función de Vercel (api/vigia.js) y la prueba desde la PC (scripts/vigia-local.mjs).
import { piezas, claves } from './config.js';
import { juntarFuentes } from './fuentes.js';
import { evaluar, armarMensaje, simularRetiro } from './revisar.js';

export async function revisarHoy({ env, fetch, hoy, simulacro = false, forzarResumen = false, ficha = { piezas, claves } }) {
  let fuentes = await juntarFuentes({ piezas: ficha.piezas, env, fetch });
  if (simulacro) fuentes = simularRetiro(fuentes, ficha.piezas, hoy);
  const resultado = evaluar({ piezas: ficha.piezas, claves: ficha.claves, fuentes, hoy });
  return { resultado, mensaje: armarMensaje(resultado, { hoy, forzarResumen, simulacro }) };
}
