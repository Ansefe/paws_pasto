-- =====================================================
-- Fase 5 — Seguridad: solo un admin puede cambiar is_verified
-- =====================================================
-- La RLS "Foundations can update own data" permite a la fundación actualizar
-- su fila, lo que incluiría is_verified (auto-verificarse vía API). Este trigger
-- revierte cualquier cambio de is_verified/verified_at hecho por un no-admin.
-- (El panel ya oculta el toggle, pero esto lo blinda a nivel de base de datos.)
-- =====================================================

CREATE OR REPLACE FUNCTION public.protect_foundation_verification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.is_verified := OLD.is_verified;
      NEW.verified_at := OLD.verified_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_foundation_verification ON public.foundations;
CREATE TRIGGER trg_protect_foundation_verification
  BEFORE UPDATE ON public.foundations
  FOR EACH ROW EXECUTE FUNCTION public.protect_foundation_verification();

DO $$ BEGIN RAISE NOTICE '✅ Protección de is_verified activa (solo admin puede verificar)'; END $$;
