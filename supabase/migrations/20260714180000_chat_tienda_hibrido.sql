-- Chat híbrido tienda web (IA + humano en app admin)
-- Proyecto: CapitanYA-MASTER (ymgsxwfwntbqvguvbhoa)

CREATE TABLE IF NOT EXISTS public.chat_conversaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NULL REFERENCES public.clientes_tienda(id) ON DELETE SET NULL,
  guest_token uuid NULL,
  nombre text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'bot'
    CHECK (estado IN ('bot', 'humano', 'cerrada')),
  asunto text NULL,
  ultimo_mensaje_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversaciones_cliente_id
  ON public.chat_conversaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversaciones_estado
  ON public.chat_conversaciones(estado);
CREATE INDEX IF NOT EXISTS idx_chat_conversaciones_ultimo
  ON public.chat_conversaciones(ultimo_mensaje_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversaciones_guest_token
  ON public.chat_conversaciones(guest_token)
  WHERE guest_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.chat_mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id uuid NOT NULL REFERENCES public.chat_conversaciones(id) ON DELETE CASCADE,
  rol text NOT NULL CHECK (rol IN ('cliente', 'bot', 'agente')),
  cuerpo text NOT NULL,
  agente_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_mensajes_conversacion
  ON public.chat_mensajes(conversacion_id, created_at ASC);

ALTER TABLE public.chat_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensajes ENABLE ROW LEVEL SECURITY;

-- Clientes autenticados: solo lo suyo
DROP POLICY IF EXISTS chat_conversaciones_select_own ON public.chat_conversaciones;
CREATE POLICY chat_conversaciones_select_own ON public.chat_conversaciones
  FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id);

DROP POLICY IF EXISTS chat_conversaciones_insert_own ON public.chat_conversaciones;
CREATE POLICY chat_conversaciones_insert_own ON public.chat_conversaciones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS chat_conversaciones_update_own ON public.chat_conversaciones;
CREATE POLICY chat_conversaciones_update_own ON public.chat_conversaciones
  FOR UPDATE TO authenticated
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS chat_mensajes_select_own ON public.chat_mensajes;
CREATE POLICY chat_mensajes_select_own ON public.chat_mensajes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversaciones c
      WHERE c.id = conversacion_id AND c.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS chat_mensajes_insert_own_cliente ON public.chat_mensajes;
CREATE POLICY chat_mensajes_insert_own_cliente ON public.chat_mensajes
  FOR INSERT TO authenticated
  WITH CHECK (
    rol = 'cliente'
    AND EXISTS (
      SELECT 1 FROM public.chat_conversaciones c
      WHERE c.id = conversacion_id AND c.cliente_id = auth.uid()
    )
  );

-- Admin (app_metadata.role = admin): ver y responder
DROP POLICY IF EXISTS chat_conversaciones_admin_all ON public.chat_conversaciones;
CREATE POLICY chat_conversaciones_admin_all ON public.chat_conversaciones
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS chat_mensajes_admin_all ON public.chat_mensajes;
CREATE POLICY chat_mensajes_admin_all ON public.chat_mensajes
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

GRANT SELECT, INSERT, UPDATE ON public.chat_conversaciones TO authenticated;
GRANT SELECT, INSERT ON public.chat_mensajes TO authenticated;

-- Realtime para que el cliente/admin vean mensajes nuevos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_mensajes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_conversaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversaciones;
  END IF;
END $$;
