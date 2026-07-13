-- Mi Cuenta / Clientes de la Tienda
-- Aplicar en el proyecto Supabase ymgsxwfwntbqvguvbhoa

CREATE TABLE IF NOT EXISTS public.clientes_tienda (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo text NOT NULL,
  email text NOT NULL UNIQUE,
  telefono text NOT NULL,
  dni_cuit text NULL,
  acepta_terminos_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.direcciones_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes_tienda(id) ON DELETE CASCADE,
  etiqueta text NOT NULL DEFAULT 'principal',
  calle text NOT NULL DEFAULT '',
  numero text NOT NULL DEFAULT '',
  piso text NULL,
  localidad text NOT NULL DEFAULT '',
  provincia text NOT NULL DEFAULT '',
  codigo_postal text NOT NULL DEFAULT '',
  es_principal boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direcciones_cliente_cliente_id
  ON public.direcciones_cliente(cliente_id);

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cliente_id uuid NULL REFERENCES public.clientes_tienda(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id
  ON public.pedidos(cliente_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clientes_tienda_updated_at ON public.clientes_tienda;
CREATE TRIGGER trg_clientes_tienda_updated_at
  BEFORE UPDATE ON public.clientes_tienda
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_direcciones_cliente_updated_at ON public.direcciones_cliente;
CREATE TRIGGER trg_direcciones_cliente_updated_at
  BEFORE UPDATE ON public.direcciones_cliente
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_tienda_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clientes_tienda (id, nombre_completo, email, telefono, acepta_terminos_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
    CASE
      WHEN (NEW.raw_user_meta_data->>'acepta_terminos') = 'true' THEN now()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_tienda ON auth.users;
CREATE TRIGGER on_auth_user_created_tienda
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tienda_user();

ALTER TABLE public.clientes_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direcciones_cliente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clientes_tienda_select_own ON public.clientes_tienda;
CREATE POLICY clientes_tienda_select_own ON public.clientes_tienda
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS clientes_tienda_update_own ON public.clientes_tienda;
CREATE POLICY clientes_tienda_update_own ON public.clientes_tienda
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS clientes_tienda_insert_own ON public.clientes_tienda;
CREATE POLICY clientes_tienda_insert_own ON public.clientes_tienda
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS direcciones_cliente_select_own ON public.direcciones_cliente;
CREATE POLICY direcciones_cliente_select_own ON public.direcciones_cliente
  FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS direcciones_cliente_insert_own ON public.direcciones_cliente;
CREATE POLICY direcciones_cliente_insert_own ON public.direcciones_cliente
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS direcciones_cliente_update_own ON public.direcciones_cliente;
CREATE POLICY direcciones_cliente_update_own ON public.direcciones_cliente
  FOR UPDATE TO authenticated
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS direcciones_cliente_delete_own ON public.direcciones_cliente;
CREATE POLICY direcciones_cliente_delete_own ON public.direcciones_cliente
  FOR DELETE TO authenticated
  USING (auth.uid() = cliente_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos' AND policyname = 'pedidos_select_own_cliente'
  ) THEN
    CREATE POLICY pedidos_select_own_cliente ON public.pedidos
      FOR SELECT TO authenticated
      USING (cliente_id = auth.uid());
  END IF;
END $$;

GRANT SELECT, UPDATE, INSERT ON public.clientes_tienda TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direcciones_cliente TO authenticated;
GRANT SELECT ON public.pedidos TO authenticated;
