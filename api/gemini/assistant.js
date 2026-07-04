import { GoogleGenAI } from '@google/genai';

const MOCK_RESPONSES = [
  { keywords: ['solunar', 'lunar', 'luna', 'marea'], text: `🌕 **Tabla Solunar y el Pique en el Paraná (Asistente El GuIA)** 🤖🎣

¡Buenas chamigo! Hablemos de la **Tabla Solunar**, la biblia del pescador deportivo en la cuenca del Plata. Esta teoría establece que la atracción del Sol y la Luna activa el comportamiento alimentario de especies cazadoras como el **Dorado** y el **Surubí**:

*   **Períodos Mayores (Máxima actividad - 1.5 a 2 horas):** Ocurren cuando la Luna está justo sobre nuestras cabezas (Tránsito) o exactamente bajo nuestros pies (Tránsito Opuesto). En estos bloques de tiempo, los grandes predadores acechan en las correderas buscando alimento de forma voraz.
*   **Períodos Menores (Actividad moderada - 45 a 60 min):** Coinciden con la salida (*Moonrise*) y puesta de la Luna (*Moonset*).

**Fases Lunares recomendadas para la cuenca del Paraná:**
1.  **Luna Nueva (Excelente pesca nocturna):** Sin luz nocturna en el río, los grandes **Surubíes** de profundidad se sienten seguros e ingresan a las correderas lodosas a cazar morenas o anguilas de fondo. El aparejo debe tocar el suelo.
2.  **Luna Llena (Dilema del pescador):** Al haber extrema luz natural durante la noche, los peces se alimentan intensamente a la madrugada y bajo la luna. El pique diurno suele bajar drásticamente. Si salís con luna llena, buscá correderas de agua verde/turbia o pescá de noche tarde.
3.  **Cuarto Creciente / Menguante (Tránsito estable):** Gran momento para la pesca variada diurna: **Bogues** gigantes con cebaderos de maíz y aceite, **Pacúes** con corazón o grasa, y **Tarariras** agresivas en lagunas costeras.

*¡Consejo de El GuIA:* Programá siempre tus lances combinando un Período Mayor con la salida del sol o el atardecer. ¡Es éxito asegurado en El Guía Ya!` },
  { keywords: ['clima', 'viento', 'temporal', 'pronostico', 'lluvia', 'sudestada'], text: `🌬️ **Análisis Climático y Vientos del Paraná** 🛥️

¡Hola chamigo! En el río Paraná, el viento manda más que el capitán. El viento define el oleaje, la claridad de las aguas y la seguridad a bordo:

*   **Viento Norte o Noreste (Viento amigo):** Suele traer días templados y cálidos en primavera-verano. Fomenta el movimiento activo de peces cazadores en superficie y desborda aguas más claras. ¡Muy recomendado para señuelos artificiales!
*   **Viento Sur o Sudeste (El temido "Pampero" o "Sudestada"):** Enfría el agua velozmente, frena la corriente del río y revuelve el fondo barroso. En estas condiciones, los peces tienden a aletargarse en pozones y el pique se reduce notablemente.
*   **Altura del Río (Creciente vs Bajante):**
    *   *En Creciente:* El agua sale limpia de lagunas internas; buscá el pique en los desaguaderos o bocas de arroyos.
    *   *En Bajante:* Las morenas y sábalos vuelven al río principal; hacé lances largos sobre las puntas de islas y correderas pedregosas.

*¡Alerta de El GuIA:* Antes de zarpar, recordá consultar el parte de la **Prefectura Naval Argentina** (Canal 16 de VHF).` },
  { keywords: ['carnada', 'señuelo', 'morena', 'dorado', 'surubí', 'pescar', 'boga'], text: `🐟 **Guía de Carnadas y Señuelos para Especies del Paraná** 🎣

¡Qué lindo debatir esto con unos ricos mates, patrón! Dependiendo de tu objetivo deportivo, el menú cambia de manera tajante:

**1. Para el Dorado (El Tigre del Río):**
*   *Carnada Viva:* La **Morena** es el manjar favorito del Dorado. Se encarna por la boca saliendo por el lomo con anzuelos circulares robustos (7/0 a 9/0).
*   *Señuelos Artificiales:* Señuelos de media agua con paleta corta en colores contrastantes (cardenal blanco y rojo, verde flúor o negro mate con detalles amarillos).

**2. Para el Surubí (El Gigante de la Noche):**
*   *Carnada Viva:* La **Anguila criolla**, el cascarudo resistente o morena pesada. El aparejo debe reposar en el fondo del cauce.
*   *Trolling:* Señuelos de paleta larga profunda arrastrados lentamente contra corriente.

**3. Para Bogas y Pacúes:**
*   **Bogas:** Granos de maíz remojados en almíbar saborizado con vainilla, dados de salamín seco o bolitas de masa dulce.
*   **Pacú:** Frutos nativos de árboles costeros, corazón vacuno en cubos o flores de calabaza de temporada.

*¡El GuIA aconseja:* Respetá siempre las medidas mínimas permitidas y practicá la pesca con devolución!` },
  { keywords: ['documentacion', 'prefectura', 'timonel', 'carnet', 'matricula', 'requisito', 'seguridad'], text: `🛡️ **Documentación Obligatoria y Seguridad Náutica de Prefectura** ⚓

¡Atención timonel! Prefectura Naval Argentina exige:

**Papelería:**
1. DNI siempre a mano.
2. Carnet de Conductor Náutico o Timonel de Yate vigente.
3. Matrícula de la Embarcación.
4. Licencia de Pesca Provincial vigente.

**Elementos de Seguridad:**
*   Chalecos Salvavidas: uno por tripulante con silbato.
*   Ancla completa con grillete, cadena y cabo de 8mm.
*   Elementos acústicos y visuales (silbato, espejo de señales).
*   Pirotecnia náutica: dos bengalas rojas vigentes.
*   Matafuegos tipo ABC de 1kg con carga vigente.
*   Radio VHF operando en Canal 16.

*¡Con El Guía Ya salimos en regla, pescamos en regla y regresamos a puerto sanos y salvos!*` }
];

function getMockResponse(query) {
  for (const r of MOCK_RESPONSES) {
    if (r.keywords.some(k => query.includes(k))) return r.text;
  }
  return `🧉 *¡Hola chamigo!* Soy **El GuIA**, tu baqueano náutico flotante. 🤖🎣

Actualmente estoy en modo simulación. Consultame sobre:
1. 🌒 Tabla Solunar (mareas y fases lunares)
2. 🌬️ Clima y Viento (sudestada, norte, creciente)
3. 🐟 Carnada (señuelos y carnadas vivas según la especie)
4. 🛡️ Requisitos de Prefectura (documentación náutica y seguridad)

¿Sobre qué te gustaría charlar hoy?`;
}

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

async function callGemini(prompt, chatHistory, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const contents = [];
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

async function callGroq(prompt, chatHistory, apiKey) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
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

export default async function handler(req, res) {
  const origin = req.headers['origin'] || '';
  const allowedOrigins = [
    'https://www.elguiaya.com',
    'https://elguiaya.com',
    'https://app.elguiaya.com',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, chatHistory = [], debug = false } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });

  const cleanPrompt = prompt.toLowerCase().trim();
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const debugInfo = {
    geminiKeyPresent: !!(geminiKey && geminiKey.trim() !== ''),
    groqKeyPresent: !!(groqKey && groqKey.trim() !== ''),
  };

  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const text = await callGemini(prompt, chatHistory, geminiKey);
      return res.json({ text, sources: [], engine: 'gemini', ...(debug ? { debug: debugInfo } : {}) });
    } catch (err) {
      console.error('[Gemini API error]:', err);
      debugInfo.geminiError = err instanceof Error ? err.message : String(err);
    }
  }

  if (groqKey && groqKey.trim() !== '') {
    try {
      const text = await callGroq(prompt, chatHistory, groqKey);
      return res.json({ text, sources: [], engine: 'groq', ...(debug ? { debug: debugInfo } : {}) });
    } catch (err) {
      console.error('[Groq API error]:', err);
      debugInfo.groqError = err instanceof Error ? err.message : String(err);
    }
  }

  return res.json({ text: getMockResponse(cleanPrompt), sources: [], engine: 'mock', ...(debug ? { debug: debugInfo } : {}) });
}
