-- =====================================================
-- RPC: mark_pet_in_process
-- =====================================================
-- Permite que un visitante (anónimo o autenticado) marque una mascota como
-- "en proceso" al postularse desde el sitio público, SIN darle permiso general
-- de escritura sobre `pets` (que sigue siendo solo de admin por RLS).
--
-- Es SECURITY DEFINER: corre con los privilegios del dueño de la función,
-- saltándose RLS, pero acotada: solo cambia available -> in_process.
-- No bloquea más postulaciones: la mascota sigue visible y postulable.
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_pet_in_process(pet_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pets
  SET status = 'in_process'
  WHERE id = pet_id
    AND status = 'available';
$$;

GRANT EXECUTE ON FUNCTION public.mark_pet_in_process(uuid) TO anon, authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ RPC mark_pet_in_process creada (available -> in_process, acotada)';
END $$;
