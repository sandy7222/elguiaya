-- Postulaciones / CV (Trabajá con Nosotros)
-- Proyecto: CapitanYA-MASTER (ymgsxwfwntbqvguvbhoa)

CREATE TABLE IF NOT EXISTS public.postulaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL DEFAULT '',
  area_interes text NOT NULL,
  presentacion text NULL,
  acepta_datos_at timestamptz NULL,
  cv_path text NULL,
  cv_nombre_original text NULL,
  cv_mime text NULL,
  cv_size_bytes bigint NULL CHECK (cv_size_bytes IS NULL OR (cv_size_bytes > 0 AND cv_size_bytes <= 5242880)),
  estado text NOT NULL DEFAULT 'pendiente_cv'
    CHECK (estado IN ('pendiente_cv', 'nueva', 'en_revision', 'contactado', 'entrevista', 'descartado', 'contratado')),
  notas_admin text NULL,
  revisada_por uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  revisada_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_estado
  ON public.postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_area
  ON public.postulaciones(area_interes);
CREATE INDEX IF NOT EXISTS idx_postulaciones_created
  ON public.postulaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_postulaciones_email
  ON public.postulaciones(email);

-- Compatibilidad con inserts viejos (area / cv_url) vía columnas generadas no; se normaliza en API/app.

DROP TRIGGER IF EXISTS trg_postulaciones_updated_at ON public.postulaciones;
CREATE TRIGGER trg_postulaciones_updated_at
  BEFORE UPDATE ON public.postulaciones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;

-- Solo admin lee / actualiza
DROP POLICY IF EXISTS postulaciones_admin_select ON public.postulaciones;
CREATE POLICY postulaciones_admin_select ON public.postulaciones
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS postulaciones_admin_update ON public.postulaciones;
CREATE POLICY postulaciones_admin_update ON public.postulaciones
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Sin INSERT público: la web/app usan API con service role
DROP POLICY IF EXISTS postulaciones_admin_insert ON public.postulaciones;
CREATE POLICY postulaciones_admin_insert ON public.postulaciones
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

GRANT SELECT, UPDATE ON public.postulaciones TO authenticated;

-- Bucket privado para CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'postulaciones-cv',
  'postulaciones-cv',
  false,
  5242880,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: solo admin lee; uploads vía service role / signed upload URL
DROP POLICY IF EXISTS postulaciones_cv_admin_select ON storage.objects;
CREATE POLICY postulaciones_cv_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'postulaciones-cv'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS postulaciones_cv_admin_update ON storage.objects;
CREATE POLICY postulaciones_cv_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'postulaciones-cv'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'postulaciones-cv'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS postulaciones_cv_admin_delete ON storage.objects;
CREATE POLICY postulaciones_cv_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'postulaciones-cv'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
