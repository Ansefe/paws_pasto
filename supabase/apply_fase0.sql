-- =====================================================
-- Fase 0 — cambios seguros de funciones (correr en SQL Editor)
-- Verificado contra el proyecto el 2026-06-28.
-- =====================================================

-- 1) Crear delete_user_complete (NO existe en la BD; el admin la necesita).
--    Es seguro re-ejecutar (CREATE OR REPLACE).
CREATE OR REPLACE FUNCTION public.delete_user_complete(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Solo un admin puede ejecutarla.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para eliminar usuarios.';
  END IF;

  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error eliminando usuario %: %', target_user_id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) Eliminar la RPC insegura mark_pet_in_process (la llamada del frontend ya se quitó).
DROP FUNCTION IF EXISTS public.mark_pet_in_process(uuid);

-- 3) (Opcional, mejora del advisor) fijar search_path en triggers existentes:
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_site_settings_updated_at() SET search_path = public;
