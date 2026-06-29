-- =====================================================
-- TABLA: adoption_claims (Reclamos de adopción)
-- =====================================================
-- Iniciativa dual: un adoptante registrado dice "adopté a X" (con foto/historia),
-- o la fundación asigna un adoptante. La fundación/admin confirma o rechaza.
-- Al CONFIRMAR, la mascota pasa a 'adopted' automáticamente (trigger).
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- =====================================================

-- 1. Enum de estado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_status') THEN
    CREATE TYPE public.claim_status AS ENUM ('pending', 'confirmed', 'rejected');
  END IF;
END $$;

-- 2. Tabla
CREATE TABLE IF NOT EXISTS public.adoption_claims (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  foundation_id uuid NOT NULL REFERENCES public.foundations(id) ON DELETE CASCADE,
  status        public.claim_status NOT NULL DEFAULT 'pending',
  story         text,
  photo_urls    text[] NOT NULL DEFAULT '{}',
  initiated_by  text NOT NULL CHECK (initiated_by IN ('adopter', 'foundation')),
  confirmed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS adoption_claims_pet_idx        ON public.adoption_claims (pet_id);
CREATE INDEX IF NOT EXISTS adoption_claims_profile_idx    ON public.adoption_claims (profile_id);
CREATE INDEX IF NOT EXISTS adoption_claims_foundation_idx ON public.adoption_claims (foundation_id);
CREATE INDEX IF NOT EXISTS adoption_claims_status_idx     ON public.adoption_claims (status);

-- 4. RLS
ALTER TABLE public.adoption_claims ENABLE ROW LEVEL SECURITY;

-- 4a. El adoptante crea su propio reclamo.
DROP POLICY IF EXISTS "Adopter creates own claim" ON public.adoption_claims;
CREATE POLICY "Adopter creates own claim" ON public.adoption_claims
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- 4b. Lectura: el adoptante dueño, la fundación dueña, o un admin.
DROP POLICY IF EXISTS "Read own or related claims" ON public.adoption_claims;
CREATE POLICY "Read own or related claims" ON public.adoption_claims
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.foundations f
      WHERE f.id = adoption_claims.foundation_id AND f.profile_id = auth.uid()
    )
  );

-- 4c. Actualización: el adoptante (mientras pending), la fundación dueña, o admin.
DROP POLICY IF EXISTS "Update own or related claims" ON public.adoption_claims;
CREATE POLICY "Update own or related claims" ON public.adoption_claims
  FOR UPDATE TO authenticated
  USING (
    (profile_id = auth.uid() AND status = 'pending')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.foundations f
      WHERE f.id = adoption_claims.foundation_id AND f.profile_id = auth.uid()
    )
  );

-- 4d. Solo admin elimina.
DROP POLICY IF EXISTS "Admins delete claims" ON public.adoption_claims;
CREATE POLICY "Admins delete claims" ON public.adoption_claims
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Al confirmar un reclamo, marcar la mascota como adoptada.
CREATE OR REPLACE FUNCTION public.handle_claim_confirmed()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    NEW.confirmed_at := now();
    UPDATE public.pets
    SET status = 'adopted', adopted_at = now()
    WHERE id = NEW.pet_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_claim_confirmed ON public.adoption_claims;
CREATE TRIGGER trg_claim_confirmed
  BEFORE UPDATE ON public.adoption_claims
  FOR EACH ROW EXECUTE FUNCTION public.handle_claim_confirmed();

DO $$
BEGIN
  RAISE NOTICE '✅ adoption_claims creada con RLS + trigger (confirmar → mascota adopted)';
END $$;
