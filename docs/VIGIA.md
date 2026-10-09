# El Vigía

Avisa por **Telegram** y por **correo** cuando un modelo de IA que usamos está por dejar de existir
(o ya se apagó) y cuando una clave está por vencer.

Nació porque el 2026-10-08 la Centralita dejó de contestar: Groq retiró `llama-3.1-8b-instant` el
2026-08-16 y el aviso de Groq no llegó a tiempo.

## Cómo funciona

- Todos los días a las **8 de la mañana** (11:00 UTC, con ±1 hora en el plan Hobby de Vercel), Vercel llama
  a `api/vigia.js` (tarea programada en `vercel.json`).
- La función lee:
  - la página de retiros de **Groq** (`console.groq.com/docs/deprecations.md`) y su página de modelos
    (Production / Preview);
  - la lista de modelos que Groq ofrece hoy (necesita `GROQ_API_KEY`);
  - la página de retiros de **Gemini** (`ai.google.dev/gemini-api/docs/deprecations.md.txt`) y la lista de
    modelos de Gemini (necesita `GEMINI_API_KEY`);
  - el código público de GitHub de cada pieza (para ver si la ficha quedó desactualizada).
- Compara todo con la ficha **`vigia/config.js`** y avisa.
- La dirección es pública, pero solo corre si llega el encabezado `Authorization: Bearer <CRON_SECRET>`,
  que es lo que manda Vercel. Sin eso contesta 401 y no hace nada.

## Cuándo avisa

**Urgente, todos los días hasta que se arregle:**
- un modelo en uso se apagó, o ya no figura en la lista del proveedor (está caído);
- un modelo en uso se apaga en 30 días o menos;
- Groq dejó un modelo en uso "solo para Enterprise";
- no pudo leer alguna fuente (así el silencio nunca significa "no pude mirar");
- una clave vence en 30 días, en 7, en 3 o menos, hoy, o ya venció.

**Los lunes, en el resumen semanal** (llega aunque esté todo bien: si un lunes no llega nada, el Vigía
está roto):
- apagados anunciados para dentro de más de 30 días;
- modelos "Preview" en uso (se pueden retirar con poco aviso);
- ficha desactualizada: el código usa un modelo que no está anotado, o al revés;
- claves sin fecha de vencimiento anotada, o que vencen en menos de 30 días.

El Vigía no guarda memoria de un día para otro: por eso lo urgente se repite cada día hasta que se arregla.

## Archivos

| Archivo | Qué es |
|---|---|
| `vigia/config.js` | **La ficha**: qué modelo usa cada pieza y qué clave vence cuándo. Es lo único que hay que tocar a mano. |
| `api/vigia.js` | La puerta: revisa el secreto, elige el modo y manda el aviso. |
| `vigia/fuentes.js` | Baja las páginas y listas. |
| `vigia/revisar.js` | Compara y arma el mensaje (sin internet: se prueba con copias). |
| `vigia/avisar.js` | Manda por Telegram y por correo. |
| `scripts/vigia-local.mjs` | Prueba desde la PC: muestra el mensaje **sin mandarlo**. |
| `test/vigia.test.mjs`, `test/vigia-api.test.mjs` | Tests. Las copias de las páginas están en `test/fixtures/vigia/`. |

## Puesta en marcha (una sola vez)

Nunca pegues un token o una clave en un chat, en un archivo o en un documento: van solo en Vercel.

### 1. Crear el bot de Telegram

1. En Telegram buscá **@BotFather** (tiene la tilde azul de verificado) y mandale `/newbot`.
2. Nombre visible: por ejemplo `Vigía El Guía YA`.
3. Nombre de usuario: tiene que terminar en `bot`, por ejemplo `ElGuiaYaVigiaBot` (si está tomado, probá otro).
4. BotFather te contesta con el **token** (empieza con números, dos puntos y letras). Es una clave: copialo
   y guardalo en tu gestor de contraseñas.
5. Abrí tu bot nuevo (el enlace `t.me/...` que te dio BotFather) y tocá **Iniciar**. Sin esto el bot no
   te puede escribir.

### 2. Averiguar tu identificador de chat

En PowerShell (te pide el token sin mostrarlo en pantalla):

```powershell
$s = Read-Host "Pegá el token del bot" -AsSecureString
$token = [System.Net.NetworkCredential]::new('', $s).Password
(Invoke-RestMethod "https://api.telegram.org/bot$token/getUpdates").result.message.chat | Select-Object id, first_name -Unique
```

El número de la columna `id` es tu **identificador de chat**. Si no aparece nada, mandale cualquier mensaje
al bot y repetí el último renglón.

### 3. Elegir cómo sale el correo

El correo te llega a tu casilla de Zoho (`elguiaya.com` recibe en Zoho). Para **mandarlo** hay dos caminos:

- **Zoho (si tu plan es pago):** en Zoho Mail → Configuración → Cuentas de correo → tu cuenta → **Servidor
  saliente (SMTP)** figura el servidor (con dominio propio y plan pago suele ser `smtppro.zoho.com`, puerto
  465). Como contraseña usá una **contraseña de aplicación**, no la tuya; se crea en la seguridad de tu
  cuenta Zoho (sección de contraseñas específicas de aplicación). El plan gratis de Zoho puede no permitir SMTP.
- **Resend (gratis):** creá una cuenta en resend.com **con la dirección donde querés recibir los avisos** (en
  el plan gratis solo entrega a esa dirección) y creá una API key.

### 4. Inventar el CRON_SECRET

En PowerShell (lo copia al portapapeles sin mostrarlo):

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); ([BitConverter]::ToString($b) -replace '-','') | Set-Clipboard
```

Pegalo en Vercel (paso 5) y guardalo también en tu gestor de contraseñas (lo vas a necesitar para las pruebas).

### 5. Cargar las variables en Vercel

Vercel → proyecto del sitio → **Settings → Environment Variables**. Cada una con entorno **Production**
(y tildá "Sensitive" en las claves).

| Variable | Qué poner | Con Zoho | Con Resend |
|---|---|---|---|
| `CRON_SECRET` | el del paso 4 | | |
| `TELEGRAM_BOT_TOKEN` | el token del paso 1 | | |
| `TELEGRAM_CHAT_ID` | el número del paso 2 | | |
| `SMTP_HOST` | servidor de salida | el que figura en Zoho | `smtp.resend.com` |
| `SMTP_PORT` | puerto | `465` | `465` |
| `SMTP_USER` | usuario | tu dirección completa | `resend` |
| `SMTP_PASS` | contraseña | la contraseña de aplicación | la API key |
| `VIGIA_CORREO_PARA` | dónde recibís los avisos | tu dirección | la de tu cuenta de Resend |
| `VIGIA_CORREO_DE` | remitente | (no hace falta) | `onboarding@resend.dev` |

`GROQ_API_KEY` y `GEMINI_API_KEY` ya están cargadas porque las usa el chat de la tienda: fijate que sigan ahí.

Las variables valen para las publicaciones **nuevas**: cargalas antes de publicar el Vigía (o volvé a
publicar después de cargarlas).

### 6. Probar

1. Sin secreto, `https://www.elguiaya.com/api/vigia` tiene que contestar `{"error":"No autorizado."}`.
2. Vercel → proyecto → **Settings → Cron Jobs** → botón **Run** junto a `/api/vigia`. Así la llama Vercel,
   con el secreto: te tiene que llegar el aviso por Telegram y por correo.
3. Aviso de prueba y simulacro desde PowerShell (te pide el CRON_SECRET sin mostrarlo):

```powershell
$s = Read-Host "Pegá el CRON_SECRET" -AsSecureString
$secreto = [System.Net.NetworkCredential]::new('', $s).Password
Invoke-RestMethod "https://www.elguiaya.com/api/vigia?modo=prueba" -Headers @{ Authorization = "Bearer $secreto" }
Invoke-RestMethod "https://www.elguiaya.com/api/vigia?modo=simulacro" -Headers @{ Authorization = "Bearer $secreto" }
```

La respuesta dice cómo le fue a cada canal (`ok` o `error: ...`). Errores comunes:
- Telegram `chat not found`: el identificador de chat está mal o no tocaste **Iniciar** en el bot.
- Telegram `Unauthorized` (401) o `Not Found` (404): el token está mal copiado. Volvé a copiarlo de BotFather
  (`/mybots` → el bot → **API Token**) y reemplazalo en Vercel.
- Correo `Invalid login` o `535`: usuario o contraseña mal, o tu plan de Zoho no permite SMTP (usá Resend).
- "No pude revisar la lista de modelos de Groq: respondió 401": la `GROQ_API_KEY` de Vercel no sirve más.
  Creá una nueva en console.groq.com → API Keys y reemplazala en Vercel (también la usa el chat de la tienda).

Los espacios o saltos de línea de más al principio o al final de un valor no importan: el Vigía los ignora.
Después de cambiar una variable en Vercel hay que volver a publicar (Deployments → la última → `···` →
**Redeploy**) para que la función use el valor nuevo.

Modos: `?modo=prueba` (aviso de prueba, no revisa nada), `?modo=simulacro` (hace como si el primer modelo
de la ficha se hubiera apagado hoy), `?modo=resumen` (manda el resumen semanal aunque no sea lunes).
El registro de cada corrida está en Vercel → proyecto → **Logs** (buscá `vigia`).

## Mantenimiento

- **Cambiaste el modelo de alguna pieza:** actualizá `vigia/config.js`. Si te olvidás, el lunes llega
  "ficha desactualizada" (salvo la Centralita, que no está en GitHub: esa hay que acordarse).
- **Creaste o renovaste una clave con vencimiento:** anotá la fecha en `claves` de `vigia/config.js`
  (`'AAAA-MM-DD'`, o `'nunca'` si no vence). Groq no deja consultar el vencimiento: se mira en su consola.
- **Llegó "No pude revisar ...":** puede ser una caída momentánea (si al otro día no se repite, nada que
  hacer) o que la página cambió de formato: hay que ajustar `vigia/revisar.js`. Bajá la página nueva a
  `test/fixtures/vigia/`, hacé que los tests fallen con ella y recién ahí arreglá.
- **Probar un cambio sin mandar nada:** `node scripts/vigia-local.mjs --resumen` (en la PC no hay claves, así
  que va a decir que no pudo leer las listas de modelos: es normal).
- **Tests:** `npm test`.

## Límites y riesgos conocidos

- **La Centralita no está en GitHub:** sus modelos están anotados a mano. Además, su `config.py` usa como
  modelo de reserva `llama3-8b-8192` (retirado): si su `.env` pierde la línea `LLM_MODEL`, se cae de nuevo.
- **El Vigía lee el código de GitHub, no lo que está publicado** (por ejemplo la función `ia-proxy` de
  Supabase): si algo se publica sin subir a GitHub, el Vigía no lo ve.
- **Gemini 2.5:** Google dice que `gemini-2.5-flash` no tiene fecha de apagado, pero que limita los modelos
  2.5 a quienes ya los venían usando. Si un proyecto deja de usarlo un tiempo, podría perder el acceso.
- **Las fechas de Gemini son "la más temprana posible":** Google confirma la fecha exacta más cerca del día.
- **Plan Hobby:** una corrida por día, con ±1 hora de diferencia.
