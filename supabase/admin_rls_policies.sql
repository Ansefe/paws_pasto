-- =====================================================
-- POLÍTICAS RLS PARA OPERACIONES DE ADMINISTRACIÓN
-- =====================================================
-- Consolida los permisos que necesita el panel /admin para gestionar
-- mascotas, fundaciones y adopciones, además del bucket de Storage `images`.
--
-- Complementa:
--   - fix_rls_policies.sql          (profiles: UPDATE/DELETE admin)
--   - create_applications_table.sql (applications: gestión admin)
--
-- Patrón de detección de admin: el usuario actual debe tener un perfil
-- con role = 'admin'.
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- =====================================================

-- Helper de legibilidad: la condición de admin se repite en cada política.
-- (No creamos función para mantener el script autocontenido y simple.)

-- =====================================================
-- 1. PETS  (lectura pública; escritura solo admin)
-- =====================================================
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert pets" ON public.pets;
CREATE POLICY "Admins can insert pets" ON public.pets
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update pets" ON public.pets;
CREATE POLICY "Admins can update pets" ON public.pets
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete pets" ON public.pets;
CREATE POLICY "Admins can delete pets" ON public.pets
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 2. FOUNDATIONS  (lectura pública; escritura solo admin)
-- =====================================================
ALTER TABLE public.foundations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert foundations" ON public.foundations;
CREATE POLICY "Admins can insert foundations" ON public.foundations
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update foundations" ON public.foundations;
CREATE POLICY "Admins can update foundations" ON public.foundations
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete foundations" ON public.foundations;
CREATE POLICY "Admins can delete foundations" ON public.foundations
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 3. ADOPTIONS  (lectura/gestión por admin)
-- =====================================================
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read adoptions" ON public.adoptions;
CREATE POLICY "Admins can read adoptions" ON public.adoptions
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update adoptions" ON public.adoptions;
CREATE POLICY "Admins can update adoptions" ON public.adoptions
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete adoptions" ON public.adoptions;
CREATE POLICY "Admins can delete adoptions" ON public.adoptions
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 4. STORAGE: bucket `images` (logos y fotos de mascotas)
-- =====================================================
-- 4a. Crear el bucket público si no existe.
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4b. Lectura pública de los objetos del bucket `images`.
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- 4c. Subida de imágenes por usuarios autenticados (admin/fundaciones).
DROP POLICY IF EXISTS "Authenticated upload images" ON storage.objects;
CREATE POLICY "Authenticated upload images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- 4d. Actualización/eliminación de imágenes por usuarios autenticados.
DROP POLICY IF EXISTS "Authenticated update images" ON storage.objects;
CREATE POLICY "Authenticated update images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated delete images" ON storage.objects;
CREATE POLICY "Authenticated delete images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS de admin aplicadas (pets, foundations, adoptions) y bucket images configurado';
END $$;
