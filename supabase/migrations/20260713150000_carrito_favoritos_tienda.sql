-- Carrito y Favoritos de la tienda web (clientes registrados)
-- Proyecto: CapitanYA-MASTER (ymgsxwfwntbqvguvbhoa)

CREATE TABLE IF NOT EXISTS public.carrito_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes_tienda(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL,
  cantidad integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_carrito_items_cliente_id
  ON public.carrito_items(cliente_id);

CREATE TABLE IF NOT EXISTS public.favoritos_tienda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes_tienda(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_tienda_cliente_id
  ON public.favoritos_tienda(cliente_id);

DROP TRIGGER IF EXISTS trg_carrito_items_updated_at ON public.carrito_items;
CREATE TRIGGER trg_carrito_items_updated_at
  BEFORE UPDATE ON public.carrito_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.carrito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos_tienda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS carrito_items_select_own ON public.carrito_items;
CREATE POLICY carrito_items_select_own ON public.carrito_items
  FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS carrito_items_insert_own ON public.carrito_items;
CREATE POLICY carrito_items_insert_own ON public.carrito_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS carrito_items_update_own ON public.carrito_items;
CREATE POLICY carrito_items_update_own ON public.carrito_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS carrito_items_delete_own ON public.carrito_items;
CREATE POLICY carrito_items_delete_own ON public.carrito_items
  FOR DELETE TO authenticated
  USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS favoritos_tienda_select_own ON public.favoritos_tienda;
CREATE POLICY favoritos_tienda_select_own ON public.favoritos_tienda
  FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS favoritos_tienda_insert_own ON public.favoritos_tienda;
CREATE POLICY favoritos_tienda_insert_own ON public.favoritos_tienda
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS favoritos_tienda_delete_own ON public.favoritos_tienda;
CREATE POLICY favoritos_tienda_delete_own ON public.favoritos_tienda
  FOR DELETE TO authenticated
  USING (auth.uid() = cliente_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrito_items TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favoritos_tienda TO authenticated;
