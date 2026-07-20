-- Alinear RLS de postulaciones con is_admin_user() (profiles.admin / JWT)

DROP POLICY IF EXISTS "postulaciones_admin_select" ON public.postulaciones;
DROP POLICY IF EXISTS "postulaciones_admin_update" ON public.postulaciones;
DROP POLICY IF EXISTS "postulaciones_admin_insert" ON public.postulaciones;
DROP POLICY IF EXISTS "postulaciones_cv_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "postulaciones_cv_admin_update" ON storage.objects;

CREATE POLICY "postulaciones_admin_select"
  ON public.postulaciones FOR SELECT TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "postulaciones_admin_update"
  ON public.postulaciones FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Inserts públicos solo vía API (service role). Admins pueden insertar si hace falta.
CREATE POLICY "postulaciones_admin_insert"
  ON public.postulaciones FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "postulaciones_cv_admin_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'postulaciones-cv' AND public.is_admin_user());

CREATE POLICY "postulaciones_cv_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'postulaciones-cv' AND public.is_admin_user())
  WITH CHECK (bucket_id = 'postulaciones-cv' AND public.is_admin_user());
