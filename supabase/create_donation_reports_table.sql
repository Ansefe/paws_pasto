-- =====================================================
-- TABLA: donation_reports (Donaciones reportadas)
-- =====================================================
-- Registra la INTENCIÓN de donar (Paws no procesa dinero). El usuario reporta
-- cuánto va a donar y a qué fundación; admin/fundación confirman o rechazan.
-- Solo las 'confirmed' cuentan para los rankings de top donadores.
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- =====================================================

-- 1. Enum de estado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status') THEN
    CREATE TYPE public.donation_status AS ENUM ('reported', 'confirmed', 'rejected');
  END IF;
END $$;

-- 2. Tabla
CREATE TABLE IF NOT EXISTS public.donation_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES public.foundations(id) ON DELETE CASCADE,
  profile_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name text,
  amount_cop    integer NOT NULL CHECK (amount_cop > 0),
  note          text,
  status        public.donation_status NOT NULL DEFAULT 'reported',
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  review_notes  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS donation_reports_foundation_idx ON public.donation_reports (foundation_id);
CREATE INDEX IF NOT EXISTS donation_reports_profile_idx    ON public.donation_reports (profile_id);
CREATE INDEX IF NOT EXISTS donation_reports_status_idx      ON public.donation_reports (status);
CREATE INDEX IF NOT EXISTS donation_reports_created_idx     ON public.donation_reports (created_at DESC);

-- 4. RLS
ALTER TABLE public.donation_reports ENABLE ROW LEVEL SECURITY;

-- 4a. Cualquiera puede REPORTAR una donación. Si está autenticado, no puede
--     falsificar el profile_id de otra persona.
DROP POLICY IF EXISTS "Anyone can report a donation" ON public.donation_reports;
CREATE POLICY "Anyone can report a donation" ON public.donation_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (profile_id IS NULL OR profile_id = auth.uid());

-- 4b. El usuario autenticado puede LEER sus propios reportes.
DROP POLICY IF EXISTS "Users read own donations" ON public.donation_reports;
CREATE POLICY "Users read own donations" ON public.donation_reports
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- 4c. La fundación dueña puede LEER los reportes dirigidos a ella.
DROP POLICY IF EXISTS "Foundation reads its donations" ON public.donation_reports;
CREATE POLICY "Foundation reads its donations" ON public.donation_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.foundations f
      WHERE f.id = donation_reports.foundation_id AND f.profile_id = auth.uid()
    )
  );

-- 4d. El admin puede LEER todo.
DROP POLICY IF EXISTS "Admins read all donations" ON public.donation_reports;
CREATE POLICY "Admins read all donations" ON public.donation_reports
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4e. Admin y fundación dueña pueden ACTUALIZAR (confirmar / rechazar).
DROP POLICY IF EXISTS "Admin or foundation update donations" ON public.donation_reports;
CREATE POLICY "Admin or foundation update donations" ON public.donation_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.foundations f
      WHERE f.id = donation_reports.foundation_id AND f.profile_id = auth.uid()
    )
  );

-- 4f. Solo admin puede ELIMINAR.
DROP POLICY IF EXISTS "Admins delete donations" ON public.donation_reports;
CREATE POLICY "Admins delete donations" ON public.donation_reports
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Rankings públicos: función SECURITY DEFINER que devuelve el top de
--    donadores SOLO con donaciones 'confirmed' (sin exponer filas crudas ni
--    depender de la RLS de profiles). period: 'month' | 'all'.
CREATE OR REPLACE FUNCTION public.top_donors(period text DEFAULT 'all', max_rows integer DEFAULT 10)
RETURNS TABLE (profile_id uuid, display_name text, total_cop bigint, donations bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.profile_id,
         COALESCE(p.full_name, 'Anónimo') AS display_name,
         SUM(d.amount_cop)::bigint AS total_cop,
         COUNT(*)::bigint AS donations
  FROM public.donation_reports d
  LEFT JOIN public.profiles p ON p.id = d.profile_id
  WHERE d.status = 'confirmed'
    AND d.profile_id IS NOT NULL
    AND (period <> 'month' OR d.created_at >= date_trunc('month', now()))
  GROUP BY d.profile_id, p.full_name
  ORDER BY total_cop DESC
  LIMIT GREATEST(max_rows, 1);
$$;

GRANT EXECUTE ON FUNCTION public.top_donors(text, integer) TO anon, authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ donation_reports + top_donors creados (reporte público, gestión admin/fundación)';
END $$;
