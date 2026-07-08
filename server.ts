/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const SYSTEM_PROMPT = `Sos el consultor náutico experto de El Guía Ya. Tu nombre es "El GuIA".
Sos un carismático robot flotante que vuela sobre los ríos de Argentina.
Asistís a pescadores deportivos y capitanes. Tenés conocimiento enciclopédico de los ríos Paraná, Uruguay, Paraguay, el Río de la Plata y lagunas argentinas.

Tono de comunicación:
- Auténticamente argentino, cálido, amigable, campero pero profesional.
- Decí cosas como "¡Hola chamigo!", "¡Buenas de pesca!" cuando sea propicio.
- Priorizá siempre la seguridad náutica y respetar las vedas de pesca.

Funciones:
- Pronóstico climático y estado de vientos.
- Tabla lunar y pique recomendado.
- Recomendación de zonas para pescar Dorado, Surubí, Pacú, Pejerrey, boga o tarariras.
- Consejos de equipo, líneas, carnadas o señuelos según temporada.

Usá formato Markdown claro y prolijo.`;

async function callGemini(prompt: string, chatHistory: Array<{ role: string; text: string }>, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const msg of chatHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: { systemInstruction: SYSTEM_PROMPT },
  });

  const text = response.text;
  if (!text) throw new Error('Respuesta vacía de Gemini');
  return text;
}

async function callGroq(prompt: string, chatHistory: Array<{ role: string; text: string }>, apiKey: string) {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];
  for (const msg of chatHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.text });
    }
  }
  messages.push({ role: 'user', content: prompt });

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!groqResponse.ok) throw new Error(`Groq error: ${groqResponse.status}`);

  const data = await groqResponse.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respuesta vacía de Groq');
  return text;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory pre-registrations list
const registrations: any[] = [];

// API: Pre-registration
app.post('/api/pre-register', (req, res) => {
  const { name, email, role, location, experience, boatInfo } = req.body;
  if (!name || !email || !role) {
    res.status(400).json({ error: 'Faltan campos obligatorios.' });
    return;
  }
  const newReg = {
    id: Date.now().toString(),
    name,
    email,
    role,
    location: location || 'No especificada',
    experience: experience || '',
    boatInfo: boatInfo || '',
    timestamp: new Date().toISOString()
  };
  registrations.push(newReg);
  console.log('[Pre-Registro] Guardado:', newReg);
  const queueNumber = registrations.length + 154;
  res.json({ success: true, message: '¡Gracias por registrarte antes de tiempo en El Guía Ya!', data: newReg, queueNumber });
});

// API: Get total registrations count
app.get('/api/registrations/count', (req, res) => {
  res.json({ count: registrations.length + 154 }); // Offset for premium feeling
});
// API: Prototipo IA de Pesca Deportiva en Argentina
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt, chatHistory = [] } = req.body;
  
  if (!prompt) {
    res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    return;
  }

  const cleanPrompt = prompt.toLowerCase().trim();

  // 🎣 High-quality coherent pre-cooked mock responses (Spanish)
  const getSimulatedResponse = (query: string) => {
    if (query.includes('solunar') || query.includes('lunar') || query.includes('luna') || query.includes('marea')) {
      return {
        text: `🌕 **Tabla Solunar y el Pique en el Paraná (Asistente El GuIA)** 🤖🎣

¡Buenas chamigo! Hablemos de la **Tabla Solunar**, la biblia del pescador deportivo en la cuenca del Plata. Esta teoría establece que la atracción del Sol y la Luna activa el comportamiento alimentario de especies cazadoras como el **Dorado** y el **Surubí**:

*   **Períodos Mayores (Máxima actividad - 1.5 a 2 horas):** Ocurren cuando la Luna está justo sobre nuestras cabezas (Tránsito) o exactamente bajo nuestros pies (Tránsito Opuesto). En estos bloques de tiempo, los grandes predadores acechan en las correderas buscando alimento de forma voraz.
*   **Períodos Menores (Actividad moderada - 45 a 60 min):** Coinciden con la salida (*Moonrise*) y puesta de la Luna (*Moonset*).

**Fases Lunares recomendadas para la cuenca del Paraná:**
1.  **Luna Nueva (Excelente pesca nocturna):** Sin luz nocturna en el río, los grandes **Surubíes** de profundidad se sienten seguros e ingresan a las correderas lodosas a cazar morenas o anguilas de fondo. El aparejo debe tocar el suelo.
2.  **Luna Llena (Dilema del pescador):** Al haber extrema luz natural durante la noche, los peces se alimentan intensamente a la madrugada y bajo la luna. El pique diurno suele bajar drásticamente. Si salís con luna llena, buscá correderas de agua verde/turbia o pescá de noche tarde.
3.  **Cuarto Creciente / Menguante (Tránsito estable):** Gran momento para la pesca variada diurna: **Bogues** gigantes con cebaderos de maíz y aceite, **Pacúes** con corazón o grasa, y **Tarariras** agresivas en lagunas costeras.

*¡Consejo de El GuIA:* Programá siempre tus lances combinando un Período Mayor con la salida del sol o el atardecer. ¡Es éxito asegurado en El Guía Ya!`,
        sources: [
          { title: "Tabla Solunar Río Paraná - Calendario de Mareas", url: "https://www.argentina.gob.ar/interior/ambiente" },
          { title: "Manual del Buen Pescador Deportivo de la Cuenca del Plata", url: "https://www.prefecturanaval.gob.ar" }
        ]
      };
    }

    if (query.includes('clima') || query.includes('viento') || query.includes('temporal') || query.includes('pronostico') || query.includes('lluvia') || query.includes('sudestada')) {
      return {
        text: `🌬️ **Análisis Climático y Vientos del Paraná** 🛥️

¡Hola chamigo! En el río Paraná, el viento manda más que el capitán. El viento define el oleaje, la claridad de las aguas y la seguridad a bordo:

*   **Viento Norte o Noreste (Viento amigo):** Suele traer días templados y cálidos en primavera-verano. Fomenta el movimiento activo de peces cazadores en superficie y desborda aguas más claras. ¡Muy recomendado para señuelos artificiales!
*   **Viento Sur o Sudeste (El temido "Pampero" o "Sudestada"):** Enfría el agua velozmente, frena la corriente del río y revuelve el fondo barroso. En estas condiciones, los peces tienden a aletargarse en pozones y el pique se reduce notablemente. Se pesca de fondo con plomada pesada y carnadas vivas perfumadas (como carnada blanca cortada o tripero de pollo).
*   **Altura del Río (Creciente vs Bajante):**
    *   *En Creciente:* El agua sale limpia de lagunas internas; buscá el pique en los desaguaderos o bocas de arroyos.
    *   *En Bajante:* Las morenas y sábalos vuelven al río principal; hacé lances largos sobre las puntas de islas y correderas pedregosas.

*¡Alerta de El GuIA:* Antes de zarpar, recordá consultar el parte de la **Prefectura Naval Argentina** (Canal 16 de VHF) ante la más mínima sospecha de tormenta eléctrica o ráfagas mayores a 25 nudos.`,
        sources: [
          { title: "Servicio Meteorológico Nacional de Argentina", url: "https://www.smn.gob.ar" },
          { title: "Central de Hidrología del Río Paraná - Alturas de Puertos", url: "https://www.argentina.gob.ar/puertos" }
        ]
      };
    }

    if (query.includes('carnada') || query.includes('señulo') || query.includes('señuelo') || query.includes('morena') || query.includes('dorado') || query.includes('surubí') || query.includes('pescar') || query.includes('boga')) {
      return {
        text: `🐟 **Guía de Carnadas y Señuelos para Especies del Paraná** 🎣

¡Qué lindo debatir esto con unos ricos mates, patrón! Dependiendo de tu objetivo deportivo, el menú cambia de manera tajante:

**1. Para el Dorado (El Tigre del Río):**
*   *Carnada Viva (Eficacia 100%):* La **Morena** (especialmente la de tipo "botellona") es el manjar favorito del Dorado. Se encarna por la boca saliendo por el lomo con anzuelos circulares robustos (7/0 a 9/0) y un cable conductor de acero de 40 libras de resistencia para evitar que sus afilados dientes lo corten.
*   *Señuelos Artificiales:* Para la técnica de "pesca al golpe", se usan señuelos de media agua con paleta corta en colores súper contrastantes (cardenal blanco y rojo, verde flúor o negro mate con detalles amarillos).

**2. Para el Surubí (El Gigante de la Noche):**
*   *Carnada Viva:* La **Anguila criolla**, el cascarudo resistente o morena pesada. El aparejo debe reposar completamente en el fondo del cauce, preferentemente en pozones cercanos a barrancadas de arroyos secundarios.
*   *Trolling:* Señuelos de paleta larga profunda arrastrados lentamente a velocidad mínima contra corriente de la lancha.

**3. Para Bogas y Pacúes:**
*   **Bogas:** Preferentemente granos de maíz remojados en almíbar saborizado con vainilla, dados de salamín seco o bolitas duras de maza dulce de harina de trigo.
*   **Pacú:** Frutos nativos de árboles costeros (por ejemplo, el fruto del ubajay o del ingá), corazón vacuno en cubos o flores de calabaza de temporada.

*¡El GuIA aconseja:* Respetá siempre las medidas mínimas permitidas por provincia y practicá la pesca deportiva con devolución para cuidar la fauna de nuestro amado río Paraná!`,
        sources: [
          { title: "Especies Reguladas y Vedas del Ministerio de Ambiente", url: "https://www.argentina.gob.ar/interior/ambiente" },
          { title: "Técnicas de Pesca Deportiva Sostenible en el Litoral", url: "https://www.elguiaya.com.ar" }
        ]
      };
    }

    if (query.includes('documentacion') || query.includes('prefectura') || query.includes('timonel') || query.includes('carnet') || query.includes('matricula') || query.includes('requisito') || query.includes('requisitos') || query.includes('seguridad')) {
      return {
        text: `🛡️ **Documentación Obligatoria y Seguridad Náutica de Prefectura** ⚓

¡Atención timonel! Si vas a salir al río, tener los papeles al día no es opcional: es la garantía de una navegación libre de sobresaltos. Prefectura Naval Argentina (PNA) exige los siguientes puntos en cualquier operativo:

**Papelería del Capitán e Invitados:**
1.  **DNI (Documento Nacional de Identidad):** Siempre a mano para control de seguridad y cruzamiento.
2.  **Carnet Certificado de Conductor Náutico o Timonel de Yate:** Con fecha de vigencia válida.
3.  **Matrícula de la Embarcación:** Título de propiedad o constancia de matrícula expedida legalmente por la PNA.
4.  **Licencia de Pesca Provincial vigente:** Requerido por fauna para evitar la confiscación de equipos de pesca.

**Elementos de Seguridad Indispensables en tu lancha (Controlados por El Guía Ya):**
*   **Chalecos Salvavidas Reglamentarios:** Uno por cada tripulante a bordo, equipados con silbatos de emergencia. Los capitanes de El Guía Ya proveen esto por defecto.
*   **Ancla de fondeo:** Completa con su grillete, cadena y al menos 20-30 metros de cabo de seguridad de 8mm.
*   **Elementos acústicos y visuales:** Espejo de señales de emergencia, silbato incorporado y par de palas-remo de auxilio.
*   **Pirotecnia Náutica:** Dos bengalas de mano de color rojo vigentes (revisá siempre la fecha de vencimiento impresa).
*   **Matafuegos reglamentario:** Tipo ABC de 1kg con carga vigente e indicador de aguja verde.
*   **Equipo radioeléctrico:** Radio VHF operando correctamente en **VHF Canal 16 (Canal Internacional para Emergencias Fluviales)**.

*¡Con El Guía Ya salimos en regla, pescamos en regla y regresamos a puerto sanos y salvos!*`,
        sources: [
          { title: "Prefectura Naval Argentina - Guía e Inspección Náutica Deportiva", url: "https://www.prefecturanaval.gob.ar" },
          { title: "Licencias de Pesca Deportiva - Provincia de Santa Fe / Corrientes", url: "https://www.argentina.gob.ar" }
        ]
      };
    }

    // Default friendly guide response
    return {
      text: `🧉 *¡Hola chamigo!* Me alegra mucho saludarte. Soy **El GuIA**, tu baqueano náutico flotante y asesor digital de El Guía Ya. 🤖🎣

Actualmente el sistema está ejecutándose en modo de simulación interactiva inteligente. 

Como guía veterano del litoral, te sugiero consultarme sobre temas específicos escribiendo por ejemplo:
1.  **🌒 "Tabla Solunar":** Para saber de mareas, fases lunares y horarios de máxima actividad de dorados y surubíes.
2.  **🌬️ "Clima y Viento":** Para entender los vientos del Paraná (sudestada, norte, creciente) y recomendaciones del río.
3.  **🐟 "Carnada":** Para conocer qué señuelos y carnadas vivas (morena, anguila, masa) usar según la especie.
4.  **🛡️ "Requisitos de Prefectura":** Para chequear la documentación náutica obligatoria, carnet de timonel y kit de seguridad a bordo.

Si querés conectar la **Inteligencia Artificial con búsquedas satelitales automáticas en Google Search de fondo**, recordá configurar tu clave secreta \`GEMINI_API_KEY\` en la sección de Variables de Entorno del panel de configuración.

¿Sobre qué te gustaría que charlemos hoy a la orilla del Paraná? ¡Preguntame con confianza!`,
      sources: [
        { title: "Página Oficial de El Guía Ya - Plataforma Náutica", url: "https://www.elguiaya.com.ar" },
        { title: "Información de Navegación del Ministerio de Transporte", url: "https://www.argentina.gob.ar/transporte" }
      ]
    };
  };

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const text = await callGemini(prompt, chatHistory, geminiKey);
      res.json({ text, sources: [], engine: 'gemini' });
      return;
    } catch (err) {
      console.error('[Gemini API error]:', err);
      // Sigue al fallback de Groq
    }
  }

  if (groqKey && groqKey.trim() !== '') {
    try {
      const text = await callGroq(prompt, chatHistory, groqKey);
      res.json({ text, sources: [], engine: 'groq' });
      return;
    } catch (err) {
      console.error('[Groq API error]:', err);
      // Sigue al fallback simulado
    }
  }

  const simulated = getSimulatedResponse(cleanPrompt);
  res.json({ ...simulated, engine: 'mock' });
});

// API: Registrar descarga y redirigir
app.get('/api/track-download', async (req, res) => {
  const source = (req.query.source as string) || 'direct_url';
  const userAgent = req.headers['user-agent'] || '';
  
  // Determinar dispositivo
  let device = 'Otro';
  if (/android/i.test(userAgent)) {
    device = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    device = 'iOS';
  }
  
  try {
    const SB_URL = 'https://ymgsxwfwntbqvguvbhoa.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZ3N4d2Z3bnRicXZndXZiaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODgxMzQsImV4cCI6MjA5MzM2NDEzNH0.ZT2xlCIAnSyr_tR9qZAKIB7QAVQjJO2Jv0cwb51f1Uw';
    
    await fetch(`${SB_URL}/rest/v1/descargas_app`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        origen: source,
        dispositivo: device
      })
    });
  } catch (err) {
    console.error('[Track Download Error]:', err);
  }
  
  // Redirigir al APK real en GitHub
  res.redirect('https://github.com/sandy7222/elguiaya-plataforma/releases/latest/download/ElGuiaYA-latest.apk');
});

// API: Registrar visita o evento web (pageview, whatsapp_click)
app.get('/api/track-visit', async (req, res) => {
  const tipo = (req.query.tipo as string) || 'pageview';
  const ruta = (req.query.ruta as string) || '/';
  const userAgent = req.headers['user-agent'] || '';

  let device = 'Otro';
  if (/android/i.test(userAgent)) device = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) device = 'iOS';

  const pick = (v: unknown) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null;

  try {
    const SB_URL = 'https://ymgsxwfwntbqvguvbhoa.supabase.co';
    const SB_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZ3N4d2Z3bnRicXZndXZiaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODgxMzQsImV4cCI6MjA5MzM2NDEzNH0.ZT2xlCIAnSyr_tR9qZAKIB7QAVQjJO2Jv0cwb51f1Uw';

    await fetch(`${SB_URL}/rest/v1/eventos_web`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tipo: pick(tipo) || 'pageview',
        ruta: pick(ruta) || '/',
        dispositivo: device,
        utm_source: pick(req.query.utm_source),
        utm_medium: pick(req.query.utm_medium),
        utm_campaign: pick(req.query.utm_campaign),
        referrer: pick(req.query.referrer),
      }),
    });
  } catch (err) {
    console.error('[Track Visit Error]:', err);
  }

  res.status(204).end();
});

// Vite mode versus Production server mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Redirecciones
    app.get(['/tienda', '/tienda/*'], (req, res) => {
      res.redirect(301, '/');
    });
    app.get(['/descarga', '/descarga/*'], (req, res) => {
      res.redirect(301, '/app/descarga');
    });

    // Descarga del APK
    app.get(['/app/descarga', '/app/descarga/'], (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'descarga.html'));
    });

    // Tienda oficial en /
    app.get('/', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'tienda', 'index.html'));
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    // Mapear la app de React en /app
    app.use('/app', (req, res, next) => {
      if (!req.url.includes('.')) {
        req.url = '/app.html';
      }
      vite.middlewares(req, res, next);
    });

    // Para resolver los archivos fuentes y dependencias que pide el navegador
    app.use(vite.middlewares);
  } else {
    // Redirecciones
    app.get(['/tienda', '/tienda/*'], (req, res) => {
      res.redirect(301, '/');
    });
    app.get(['/descarga', '/descarga/*'], (req, res) => {
      res.redirect(301, '/app/descarga');
    });

    // Descarga del APK
    app.get(['/app/descarga', '/app/descarga/'], (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'descarga.html'));
    });

    // Tienda oficial en /
    app.get('/', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'tienda', 'index.html'));
    });

    // Servir recursos estáticos compilados en producción
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Si entran a la app de viajes
    app.get('/app*', (req, res) => {
      res.sendFile(path.join(distPath, 'app.html'));
    });

    // Fallback general a la tienda
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'tienda', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[El Guía Ya Server] Iniciado en http://localhost:${PORT}`);
  });
}

startServer();
