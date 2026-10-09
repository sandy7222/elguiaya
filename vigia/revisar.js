// El Vigía: lee las páginas de retiros y las listas de modelos, las compara con la ficha
// (vigia/config.js) y con el código, y arma el aviso. Acá no se usa internet: es solo cálculo,
// así se puede probar con copias de las páginas (test/fixtures/vigia).

const MESES = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
const AVISO_FORMATO = '(¿cambió el formato de la página?)';

// ── Fechas ──────────────────────────────────────────────────────────────────

function armarFecha(anio, mes, dia) {
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCFullYear() !== anio || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return d.toISOString().slice(0, 10);
}

function esFechaValida(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto));
  return !!m && armarFecha(Number(m[1]), Number(m[2]), Number(m[3])) === texto;
}

// Groq escribe M/D/AA (08/16/26 o 1/6/25).
function fechaGroq(texto) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const anio = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
  return armarFecha(anio, Number(m[1]), Number(m[2]));
}

// Gemini escribe "June 17, 2025".
function fechaGemini(texto) {
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(texto.trim());
  if (!m || !MESES[m[1].toLowerCase()]) return null;
  return armarFecha(Number(m[3]), MESES[m[1].toLowerCase()], Number(m[2]));
}

export function hoyArgentina(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(fecha);
  const parte = (tipo) => partes.find((p) => p.type === tipo).value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
}

export function esLunes(hoy) {
  return new Date(`${hoy}T12:00:00Z`).getUTCDay() === 1;
}

function diasEntre(desde, hasta) {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);
}

const fechaLinda = (iso) => iso.split('-').reverse().join('/');
const faltan = (dias) => (dias === 1 ? 'falta 1 día' : `faltan ${dias} días`);

// ── Tablas de Markdown ──────────────────────────────────────────────────────

const celdas = (linea) => linea.trim().replace(/^\|/, '').replace(/\|$/, '').split('|')
  .map((c) => c.replace(/`|\*\*/g, '').trim());
const esSeparador = (c) => c.every((x) => x === '' || /^:?-+:?$/.test(x));

// Recorre las tablas cuyo encabezado tiene una columna de modelo y una de "Shutdown date".
function filasDeRetiros(md, columnaModelo, alVerFila) {
  let columnas = null;
  for (const linea of String(md).split(/\r?\n/)) {
    if (!linea.trim().startsWith('|')) { columnas = null; continue; }
    const c = celdas(linea);
    if (!columnas) {
      const modelo = c.findIndex((x) => columnaModelo.test(x));
      const fecha = c.findIndex((x) => /^shutdown date$/i.test(x));
      if (modelo >= 0 && fecha >= 0) columnas = { modelo, fecha, reemplazo: c.findIndex((x) => /replacement/i.test(x)), nueva: true };
      continue;
    }
    if (esSeparador(c)) continue;
    alVerFila(c, columnas);
    columnas.nueva = false;
  }
}

export function leerRetirosGroq(md) {
  const retiros = [];
  filasDeRetiros(md, /^(deprecated model|model id)$/i, (c, col) => {
    const modelo = c[col.modelo];
    if (!modelo) return;
    const fechaTexto = c[col.fecha] || '';
    retiros.push({ modelo, fecha: fechaGroq(fechaTexto), fechaTexto, reemplazo: c[col.reemplazo] || '' });
  });
  if (retiros.length === 0) throw new Error(`no encontré ninguna tabla de retiros ${AVISO_FORMATO}`);
  return retiros;
}

export function leerRetirosGemini(md) {
  const retiros = [];
  let preview = false;
  filasDeRetiros(md, /^(model|agent)$/i, (c, col) => {
    if (col.nueva) preview = false;
    // Fila con texto solo en la primera celda ("Preview models", "Preview agents"): es un rótulo.
    if (c[0] && c.slice(1).every((x) => x === '')) { preview = /preview/i.test(c[0]); return; }
    const modelo = c[col.modelo];
    if (!modelo) return;
    const fechaTexto = c[col.fecha] || '';
    const sinFecha = /no shutdown date/i.test(fechaTexto);
    retiros.push({
      modelo,
      fecha: sinFecha ? null : fechaGemini(fechaTexto),
      fechaTexto,
      sinFecha,
      preview: preview || /preview/i.test(modelo),
      reemplazo: c[col.reemplazo] || '',
    });
  });
  if (retiros.length === 0) throw new Error(`no encontré ninguna tabla de retiros ${AVISO_FORMATO}`);
  return retiros;
}

// Página de modelos de Groq: secciones "Production Models" y "Preview Models". Los que Groq dejó
// solo para clientes con contrato aparecen con la palabra "Enterprise" pegada al enlace.
export function leerClasificacionGroq(md) {
  const production = new Set();
  const preview = new Set();
  const enterprise = new Set();
  let seccion = null;
  for (const linea of String(md).split(/\r?\n/)) {
    const titulo = /^##\s+(.*)/.exec(linea);
    if (titulo) {
      seccion = /production/i.test(titulo[1]) ? production : /preview/i.test(titulo[1]) ? preview : null;
      continue;
    }
    if (!seccion || !linea.trim().startsWith('|')) continue;
    for (const m of linea.matchAll(/\]\(\/docs\/model\/([^)\s]+)\)(Enterprise)?/g)) {
      seccion.add(m[1]);
      if (m[2]) enterprise.add(m[1]);
    }
  }
  if (production.size === 0 && preview.size === 0) {
    throw new Error(`no encontré las secciones Production y Preview ${AVISO_FORMATO}`);
  }
  return { production, preview, enterprise };
}

export function leerListaGroq(json) {
  if (!json || !Array.isArray(json.data)) throw new Error('la respuesta no trae la lista de modelos (¿cambió el formato?)');
  return new Set(json.data.filter((m) => m && m.id && m.active !== false).map((m) => m.id));
}

const sinPrefijo = (id) => id.replace(/^models\//, '');

export function leerListaGemini(paginas) {
  const ids = new Set();
  for (const pagina of paginas) {
    if (!pagina || !Array.isArray(pagina.models)) throw new Error('la respuesta no trae la lista de modelos (¿cambió el formato?)');
    for (const m of pagina.models) if (m && m.name) ids.add(sinPrefijo(m.name));
  }
  return ids;
}

// ── Código ──────────────────────────────────────────────────────────────────

// Textos entre comillas simples, dobles o invertidas. Recorre carácter por carácter para no
// confundirse con un apóstrofo suelto (por ejemplo en un comentario): ese texto termina en el
// fin de línea y se descarta.
function textosEntreComillas(texto) {
  const salida = [];
  let i = 0;
  while (i < texto.length) {
    const comilla = texto[i];
    if (comilla !== '"' && comilla !== "'" && comilla !== '`') { i++; continue; }
    let j = i + 1;
    let valor = '';
    let cerrado = false;
    while (j < texto.length) {
      const ch = texto[j];
      if (ch === '\\') { valor += texto[j + 1] ?? ''; j += 2; continue; }
      if (ch === comilla) { cerrado = true; break; }
      if ((ch === '\n' || ch === '\r') && comilla !== '`') break;
      valor += ch;
      j++;
    }
    if (cerrado) salida.push(valor);
    i = cerrado ? j + 1 : j;
  }
  return salida;
}

export function modelosEnCodigo(texto, conocidos) {
  const encontrados = new Set();
  for (const valor of textosEntreComillas(String(texto))) {
    const id = sinPrefijo(valor.trim());
    if (conocidos.has(id)) encontrados.add(id);
  }
  return encontrados;
}

// ── Evaluación ──────────────────────────────────────────────────────────────

function textoReemplazo(reemplazo, proveedor) {
  if (!reemplazo || /^[—–-]+$/.test(reemplazo)) return '';
  return ` Reemplazo que recomienda ${proveedor}: ${reemplazo.replace(/ or /g, ' o ')}.`;
}

export function evaluar({ piezas = [], claves = [], fuentes, hoy }) {
  const urgentes = [];
  const semanales = [];
  const revisado = [];
  const groq = fuentes.groq || {};
  const gemini = fuentes.gemini || {};

  for (const error of fuentes.errores || []) urgentes.push(`⚠️ No pude revisar ${error}.`);

  // Nombres de modelos que conocemos, para reconocerlos en el código.
  const conocidos = {
    groq: new Set([
      ...(groq.retiros || []).map((r) => r.modelo),
      ...(groq.lista || []),
      ...(groq.clasificacion ? [...groq.clasificacion.production, ...groq.clasificacion.preview] : []),
    ]),
    gemini: new Set([...(gemini.retiros || []).map((r) => r.modelo), ...(gemini.lista || [])]),
  };
  for (const p of piezas) for (const m of p.modelos) conocidos[m.proveedor]?.add(m.id);
  const todosConocidos = new Set([...conocidos.groq, ...conocidos.gemini]);

  // En uso = lo que dice la ficha más lo que aparece en el código (si no coinciden, manda el código).
  const enUso = new Map();
  const anotar = (proveedor, id, pieza, archivo) => {
    const clave = `${proveedor}:${id}`;
    if (!enUso.has(clave)) enUso.set(clave, { proveedor, id, piezas: new Set(), archivos: new Set() });
    enUso.get(clave).piezas.add(pieza);
    if (archivo) enUso.get(clave).archivos.add(archivo);
  };

  for (const p of piezas) {
    for (const m of p.modelos) anotar(m.proveedor, m.id, p.nombre);
    const enCodigo = new Set();
    const noAnotados = new Map();
    let codigoCompleto = p.codigo.length > 0;
    for (const a of p.codigo) {
      const leido = (fuentes.codigo || []).find((c) => c.repo === a.repo && c.rama === a.rama && c.archivo === a.archivo);
      if (!leido || typeof leido.texto !== 'string') { codigoCompleto = false; continue; }
      const alias = new Set(a.alias || []);
      for (const id of modelosEnCodigo(leido.texto, todosConocidos)) {
        if (alias.has(id)) continue;
        enCodigo.add(id);
        anotar(conocidos.groq.has(id) ? 'groq' : 'gemini', id, p.nombre, a.archivo);
        if (!p.modelos.some((m) => m.id === id)) {
          if (!noAnotados.has(id)) noAnotados.set(id, []);
          noAnotados.get(id).push(`${a.archivo} (${a.repo})`);
        }
      }
    }
    for (const [id, archivos] of noAnotados) {
      semanales.push(`📝 Ficha desactualizada: ${archivos.join(', ')} usa ${id}, que no está anotado en "${p.nombre}" (vigia/config.js).`);
    }
    if (codigoCompleto) {
      for (const m of p.modelos) {
        if (!enCodigo.has(m.id)) semanales.push(`📝 Ficha desactualizada: según vigia/config.js, "${p.nombre}" usa ${m.id}, pero no lo encontré en su código.`);
      }
    }
  }

  for (const u of enUso.values()) {
    const usa = `Lo usa: ${[...u.piezas].join(', ')}.${u.archivos.size ? ` Aparece en: ${[...u.archivos].join(', ')}.` : ''}`;
    const esGroq = u.proveedor === 'groq';
    const fuente = esGroq ? groq : gemini;
    const proveedor = esGroq ? 'Groq' : 'Gemini';
    const nombre = `${u.id} (${proveedor})`;
    const retiro = (fuente.retiros || []).find((r) => r.modelo === u.id);
    const falta = fuente.lista ? !fuente.lista.has(u.id) : false;
    const dias = retiro && retiro.fecha ? diasEntre(hoy, retiro.fecha) : null;
    const reemplazo = retiro ? textoReemplazo(retiro.reemplazo, proveedor) : '';
    const temprana = esGroq ? '' : ' (Google la da como la fecha más temprana posible)';

    if (retiro && !retiro.fecha && !retiro.sinFecha) {
      urgentes.push(`🔴 ${nombre} figura en la página de retiros, pero no entendí la fecha ("${retiro.fechaTexto}"). ${usa}`);
    } else if (dias !== null && dias <= 0) {
      const cuando = dias === 0 ? `se apaga hoy (${fechaLinda(retiro.fecha)})` : `se apagó el ${fechaLinda(retiro.fecha)}`;
      urgentes.push(`🔴 ${nombre} ${cuando}${falta ? ' y ya no figura en la lista de modelos que ofrece' : ''}. ${usa}${reemplazo}`);
    } else if (falta) {
      urgentes.push(`🔴 ${nombre} ya no figura en la lista de modelos que ${proveedor} ofrece hoy: lo más probable es que ya no ande. ${usa}${reemplazo}`);
    } else if (dias !== null && dias <= 30) {
      urgentes.push(`🟠 ${nombre} se apaga el ${fechaLinda(retiro.fecha)}${temprana} (${faltan(dias)}). ${usa}${reemplazo}`);
    } else if (esGroq && groq.clasificacion?.enterprise.has(u.id)) {
      urgentes.push(`🟠 ${nombre}: Groq lo marca como solo para clientes Enterprise; con una cuenta común puede no andar. ${usa}`);
    }

    if (dias !== null && dias > 30) {
      semanales.push(`🟡 ${nombre} se apaga el ${fechaLinda(retiro.fecha)}${temprana} (${faltan(dias)}). ${usa}${reemplazo}`);
    }
    const esPreview = esGroq ? !!groq.clasificacion?.preview.has(u.id) : (retiro?.preview || /preview/i.test(u.id));
    if (esPreview) {
      semanales.push(`🟡 ${nombre} es un modelo "Preview": ${proveedor} lo puede retirar con poco aviso. ${usa}`);
    }
    if (!esGroq && !retiro && gemini.retiros) {
      semanales.push(`🟡 ${nombre} no figura en la página de retiros de Gemini: no puedo saber si tiene fecha de apagado. ${usa}`);
    }
  }

  const clavesRevisadas = [];
  for (const c of claves) {
    const nombre = `${c.nombre} (${c.donde})`;
    if (c.vence === 'nunca') { clavesRevisadas.push(`${nombre}: no vence`); continue; }
    if (c.vence === null || c.vence === undefined) {
      semanales.push(`🔑 La clave ${nombre} no tiene fecha de vencimiento anotada en vigia/config.js.`);
      continue;
    }
    if (!esFechaValida(c.vence)) {
      urgentes.push(`🔑 La fecha de vencimiento de la clave ${nombre} está mal escrita en vigia/config.js ("${c.vence}"): tiene que ser AAAA-MM-DD, "nunca" o null.`);
      continue;
    }
    const dias = diasEntre(hoy, c.vence);
    const cuando = fechaLinda(c.vence);
    if (dias < 0) urgentes.push(`🔑🔴 La clave ${nombre} venció el ${cuando}. Si ya la cambiaste, anotá la fecha nueva en vigia/config.js.`);
    else if (dias === 0) urgentes.push(`🔑🔴 La clave ${nombre} vence hoy (${cuando}).`);
    else if (dias <= 3 || dias === 7 || dias === 30) urgentes.push(`🔑 La clave ${nombre} vence el ${cuando} (${faltan(dias)}).`);
    else if (dias <= 30) semanales.push(`🔑 La clave ${nombre} vence el ${cuando} (${faltan(dias)}).`);
    else clavesRevisadas.push(`${nombre}: vence el ${cuando}`);
  }

  if (enUso.size) revisado.push(`Modelos en uso (${enUso.size}): ${[...enUso.values()].map((u) => u.id).join(', ')}.`);
  if (clavesRevisadas.length) revisado.push(`Claves: ${clavesRevisadas.join('; ')}.`);
  if (fuentes.leidas?.length) revisado.push(`Leí: ${fuentes.leidas.join(', ')}.`);

  return { urgentes, semanales, revisado };
}

// Lo urgente sale todos los días; el resumen (con lo "para revisar"), los lunes.
// Devuelve null cuando no hay que mandar nada.
export function armarMensaje({ urgentes, semanales, revisado }, { hoy, forzarResumen = false, simulacro = false }) {
  const resumen = forzarResumen || esLunes(hoy);
  if (urgentes.length === 0 && !resumen) return null;

  const marca = simulacro ? '🧪 SIMULACRO (no es real) · ' : '';
  const asunto = urgentes.length
    ? `${marca}Vigía: ${urgentes.length === 1 ? '1 aviso urgente' : `${urgentes.length} avisos urgentes`}`
    : `${marca}Vigía: resumen semanal, nada urgente`;

  const lineas = [urgentes.length ? `🚨 ${asunto}` : `✅ ${asunto}`];
  for (const t of urgentes) lineas.push('', t);
  if (resumen) {
    if (semanales.length) lineas.push('', 'Para revisar:', ...semanales.map((t) => `• ${t}`));
    if (revisado.length) lineas.push('', 'Lo que revisé:', ...revisado.map((t) => `• ${t}`));
  }
  lineas.push('', `El Vigía de El Guía YA · ${fechaLinda(hoy)} · Cómo seguir: docs/VIGIA.md en el repo del sitio.`);
  return { asunto, texto: lineas.join('\n') };
}

// Para probar el aviso de punta a punta: el primer modelo de la ficha figura apagado hoy.
// Devuelve una copia; no toca los datos reales.
export function simularRetiro(fuentes, piezas, hoy) {
  const elegido = piezas.flatMap((p) => p.modelos)[0];
  if (!elegido) return fuentes;
  const lado = elegido.proveedor === 'gemini' ? 'gemini' : 'groq';
  const falso = { modelo: elegido.id, fecha: hoy, fechaTexto: hoy, reemplazo: '', sinFecha: false, preview: false };
  return {
    ...fuentes,
    [lado]: { ...fuentes[lado], retiros: [falso, ...(fuentes[lado]?.retiros || [])] },
  };
}
