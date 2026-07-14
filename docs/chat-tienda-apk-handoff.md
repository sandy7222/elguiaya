# Handoff APK: Chat de la Tienda (híbrido IA + humano)

Contrato de datos para la bandeja de soporte en Flutter (`capitan11.5.2026` / plataforma), junto a pedidos.

## Nombres de UI

| Lado | Label |
|------|--------|
| Web (cliente) | Botón flotante **Consultas** en la tienda |
| APK (admin) | **Soporte / Chat tienda** |

WhatsApp de la tienda web **no se anula**; el chat es un canal extra.

## Proyecto Supabase

- URL: `https://ymgsxwfwntbqvguvbhoa.supabase.co` (CapitanYA-MASTER)
- Migración: `supabase/migrations/20260714180000_chat_tienda_hibrido.sql`
- Tablas: `chat_conversaciones`, `chat_mensajes`
- Realtime habilitado en ambas tablas

## Tabla `chat_conversaciones`

| Columna | Tipo | Notas |
|---------|------|--------|
| `id` | uuid PK | |
| `cliente_id` | uuid null | → `clientes_tienda.id` si está logueado |
| `guest_token` | uuid null | visitantes anónimos |
| `nombre` | text | |
| `email` | text | |
| `estado` | text | `bot` \| `humano` \| `cerrada` |
| `asunto` | text null | primeros chars del primer mensaje |
| `ultimo_mensaje_at` | timestamptz | |
| `created_at` | timestamptz | |

## Tabla `chat_mensajes`

| Columna | Tipo | Notas |
|---------|------|--------|
| `id` | uuid PK | |
| `conversacion_id` | uuid FK | → `chat_conversaciones.id` |
| `rol` | text | `cliente` \| `bot` \| `agente` |
| `cuerpo` | text | |
| `agente_id` | uuid null | id del operador admin (opcional) |
| `created_at` | timestamptz | |

## Flujo

1. Cliente escribe en la web → API `/api/chat-tienda` guarda mensaje y responde IA (`rol=bot`) si `estado=bot`.
2. Cliente pide persona o toca «Hablar con persona» → `estado=humano`.
3. Admin en la APK lista `estado=humano`, responde insertando `chat_mensajes` con `rol=agente`.
4. La web hace polling y muestra la respuesta.

## Queries sugeridas (admin con `app_metadata.role = 'admin'` o service role)

### Cola de pendientes

```sql
select id, nombre, email, asunto, ultimo_mensaje_at, cliente_id
from chat_conversaciones
where estado = 'humano'
order by ultimo_mensaje_at asc;
```

### Detalle + mensajes

```sql
select * from chat_conversaciones where id = :id;

select id, rol, cuerpo, created_at, agente_id
from chat_mensajes
where conversacion_id = :id
order by created_at asc;
```

### Responder como agente

```sql
insert into chat_mensajes (conversacion_id, rol, cuerpo, agente_id)
values (:id, 'agente', :texto, :auth_uid);

update chat_conversaciones
set ultimo_mensaje_at = now()
where id = :id;
```

### Cerrar conversación

```sql
update chat_conversaciones
set estado = 'cerrada', ultimo_mensaje_at = now()
where id = :id;
```

### Contador badge

```sql
select count(*) from chat_conversaciones where estado = 'humano';
```

## Seguridad

- No usar `user_metadata` para autorización admin.
- Usar `app_metadata.role = 'admin'` (RLS ya contempla este claim) o service role solo en backend admin seguro.
- Visitantes no escriben directo a PostgREST: pasan por `/api/chat-tienda` (service role + rate limit).
- El cliente autenticado solo ve conversaciones con su `cliente_id`.

## UI admin sugerida

1. Lista “Pendientes humanos” + filtro Todas / Bot / Cerradas.
2. Hilo de mensajes (cliente / bot / agente) con realtime o refresh.
3. Input de respuesta + cerrar conversación.
4. Badge en menú con count de `estado = humano`.

## API web (referencia)

`POST /api/chat-tienda`

- `action: 'enviar'` — mensaje del cliente (+ crea conversación)
- `action: 'historial'` — mensajes de una conversación
- `action: 'escalar'` — fuerza `estado = humano`

Auth opcional: `Authorization: Bearer <access_token>`. Visitantes envían `guest_token` devuelto al crear la conversación.
