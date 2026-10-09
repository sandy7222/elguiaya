// Ficha del Vigía: qué modelo de IA usa cada pieza y qué clave vence cuándo.
// Mantenela al día cuando cambies un modelo o una clave (ver docs/VIGIA.md).
// NUNCA escribas acá el valor de una clave: solo su nombre, dónde está y la fecha en que vence.

// proveedor: 'groq' o 'gemini'.
// codigo: archivos públicos de GitHub donde el Vigía busca los nombres de modelos, para avisar si esta
//   ficha quedó desactualizada. alias: nombres viejos que el código traduce a otro modelo antes de
//   llamar al proveedor; aparecen en el archivo pero no cuentan como uso.
export const piezas = [
  {
    nombre: 'App (El Guía), función ia-proxy de Supabase',
    modelos: [
      { proveedor: 'groq', id: 'openai/gpt-oss-120b' },
      { proveedor: 'gemini', id: 'gemini-2.5-flash' },
    ],
    codigo: [
      {
        repo: 'sandy7222/elguiaya-plataforma',
        rama: 'fase-0-contencion',
        archivo: 'supabase/functions/ia-proxy/index.ts',
        alias: ['llama-3.3-70b-versatile'],
      },
      { repo: 'sandy7222/elguiaya-plataforma', rama: 'fase-0-contencion', archivo: 'lib/config/groq_config.dart' },
      { repo: 'sandy7222/elguiaya-plataforma', rama: 'fase-0-contencion', archivo: 'lib/config/gemini_config.dart' },
    ],
  },
  {
    nombre: 'Sitio (chat de la tienda)',
    modelos: [
      { proveedor: 'gemini', id: 'gemini-2.5-flash' },
      // Respaldo. Groq lo apagó el 2026-08-16: hay que cambiarlo.
      { proveedor: 'groq', id: 'llama-3.3-70b-versatile' },
    ],
    codigo: [
      { repo: 'sandy7222/elguiaya', rama: 'main', archivo: 'api/chat-tienda.js' },
      { repo: 'sandy7222/elguiaya', rama: 'main', archivo: 'api/gemini/assistant.js' },
      { repo: 'sandy7222/elguiaya', rama: 'main', archivo: 'server.ts' },
    ],
  },
  {
    // No está en GitHub: el Vigía no puede leer su código.
    // Si cambiás LLM_MODEL o STT_MODEL en su .env, cambialo también acá.
    nombre: 'Centralita (bot de WhatsApp y voz)',
    modelos: [
      { proveedor: 'groq', id: 'openai/gpt-oss-20b' },
      { proveedor: 'groq', id: 'whisper-large-v3-turbo' },
    ],
    codigo: [],
  },
];

// vence: 'AAAA-MM-DD', 'nunca' (si al crearla elegiste que no venza) o null (todavía no está anotada).
// Avisa a 30 y a 7 días, todos los días desde 3 días antes y todos los días una vez vencida.
export const claves = [
  { nombre: 'GROQ_API_KEY', donde: 'Vercel, sitio: chat de la tienda y Vigía', vence: null },
  { nombre: 'GEMINI_API_KEY', donde: 'Vercel, sitio: chat de la tienda y Vigía', vence: null },
  { nombre: 'GROQ_API_KEY_LIBRERIA3', donde: 'Supabase, función ia-proxy de la app', vence: null },
  { nombre: 'GEMINI_API_KEY', donde: 'Supabase, función ia-proxy de la app', vence: null },
  { nombre: 'GROQ_API_KEY', donde: 'Centralita, archivo .env en la PC', vence: null },
  { nombre: 'WHATSAPP_SYSTEM_USER_TOKEN', donde: 'Centralita, archivo .env en la PC', vence: null },
];
