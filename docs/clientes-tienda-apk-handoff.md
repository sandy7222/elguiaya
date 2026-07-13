# Handoff APK: Clientes de la Tienda

Contrato de datos para la pantalla administrativa en Flutter (`capitan11.5.2026` / plataforma).

## Nombres de UI

| Lado | Label |
|------|--------|
| Web (cliente) | **Mi Cuenta** |
| APK (admin) | **Clientes de la Tienda** |

## Proyecto Supabase

- URL: `https://ymgsxwfwntbqvguvbhoa.supabase.co`
- Tablas nuevas: `clientes_tienda`, `direcciones_cliente`
- Columna nueva en `pedidos`: `cliente_id` (uuid nullable → `clientes_tienda.id`)

## Tabla `clientes_tienda`

| Columna | Tipo | Notas |
|---------|------|--------|
| `id` | uuid PK | = `auth.users.id` |
| `nombre_completo` | text | |
| `email` | text unique | |
| `telefono` | text | |
| `dni_cuit` | text null | opcional |
| `acepta_terminos_at` | timestamptz null | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

## Tabla `direcciones_cliente`

| Columna | Tipo | Notas |
|---------|------|--------|
| `id` | uuid PK | |
| `cliente_id` | uuid FK | → `clientes_tienda.id` |
| `etiqueta` | text | default `principal` |
| `calle`, `numero`, `piso`, `localidad`, `provincia`, `codigo_postal` | text | |
| `es_principal` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

## Queries sugeridas (admin con service role o rol `app_metadata.role = 'admin'`)

### Lista

```sql
select id, nombre_completo, email, telefono, created_at
from clientes_tienda
order by created_at desc;
```

Búsqueda: `ilike` sobre `nombre_completo`, `email`, `telefono`.

### Detalle

```sql
select * from clientes_tienda where id = :id;

select * from direcciones_cliente
where cliente_id = :id and es_principal = true
limit 1;

select id, numero_pedido, estado, estado_logistico, monto_total, created_at
from pedidos
where cliente_id = :id
order by created_at desc
limit 20;
```

## Seguridad

- No usar `user_metadata` para autorización admin.
- Usar `app_metadata.role = 'admin'` o service role solo en backend/admin seguro.
- RLS: el cliente autenticado solo ve su propia fila; la APK admin no debe usar la anon key del comprador.

## Migración

Archivo: `supabase/migrations/20260710013000_clientes_tienda_mi_cuenta.sql`

Ya aplicada en el proyecto remoto `ymgsxwfwntbqvguvbhoa` (CapitanYA-MASTER) vía `supabase db query --linked`.

## Auth (dashboard Supabase)

En Authentication → URL Configuration, agregar:

- Site URL: `https://www.elguiaya.com`
- Redirect URLs: `https://www.elguiaya.com/#cuenta`, `https://elguiaya.com/#cuenta`, `http://localhost:3000/#cuenta`

Activar Email + Password. La confirmación de email puede quedar activada (el flujo web ya maneja “revisá tu bandeja”).

## Variables Vercel (landing)

Además de `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, conviene tener `SUPABASE_ANON_KEY` para validar JWT en:

- `api/checkout-tienda.js`
- `api/mis-compras.js`
