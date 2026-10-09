// Prueba real del respaldo de Groq del chat de la tienda (la misma función que usa api/chat-tienda.js),
// sin Supabase ni Gemini. Hace una sola pregunta y muestra la respuesta. Necesita GROQ_API_KEY.
// Uso (PowerShell, en la carpeta del sitio; te pide la clave sin mostrarla):
//   $s = Read-Host "Pegá la clave de Groq" -AsSecureString; $env:GROQ_API_KEY = [System.Net.NetworkCredential]::new('', $s).Password; node scripts/probar-respaldo-groq.mjs; Remove-Item Env:GROQ_API_KEY
import { callGroq } from '../api/chat-tienda.js';

const clave = String(process.env.GROQ_API_KEY ?? '').trim();
if (!clave) {
  console.error('Falta GROQ_API_KEY.');
  process.exit(1);
}
const pregunta = process.argv.slice(2).join(' ') || '¿Hacen envíos a domicilio?';
const inicio = Date.now();
try {
  const respuesta = await callGroq(pregunta, [], clave);
  console.log(`Pregunta: ${pregunta}\n\nRespuesta (${((Date.now() - inicio) / 1000).toFixed(1)} s):\n${respuesta}`);
} catch (e) {
  console.error(`El respaldo falló: ${String(e?.message || e).split(clave).join('***')}`);
  process.exit(1);
}
