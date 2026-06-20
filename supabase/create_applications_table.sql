-- =====================================================
-- TABLA: applications (Postulaciones de fundaciones/rescatistas)
-- =====================================================
-- Persiste las postulaciones enviadas desde el ApplicationModal del sitio
-- público, además del envío por Telegram/email, para que el admin pueda
-- revisarlas, aprobarlas o rechazarlas desde el panel.
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- =====================================================

-- 1. Tabla
CREATE TABLE IF NOT EXISTS public.applications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text NOT NULL CHECK (type IN ('foundation', 'rescuer')),
  organization_name text NOT NULL,
  contact_name      text NOT NULL,
  email             text NOT NULL,
  phone             text NOT NULL,
  city              text NOT NULL,
  address           text,
  description       text,
  experience        text,
  instagram         text,
  facebook          text,
  website           text,
  references_info   text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  reviewed_at       timestamptz
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS applications_status_idx     ON public.applications (status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON public.applications (created_at DESC);

-- 3. RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 3a. Cualquiera (anónimo o autenticado) puede ENVIAR una postulación.
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
CREATE POLICY "Anyone can submit an application" ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3b. Solo los admins pueden LEER las postulaciones.
DROP POLICY IF EXISTS "Admins can read applications" ON public.applications;
CREATE POLICY "Admins can read applications" ON public.applications
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3c. Solo los admins pueden ACTUALIZAR (aprobar/rechazar).
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications" ON public.applications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3d. Solo los admins pueden ELIMINAR.
DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;
CREATE POLICY "Admins can delete applications" ON public.applications
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Tabla applications creada con RLS (envío público, gestión solo admin)';
END $$;
