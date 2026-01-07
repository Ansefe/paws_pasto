-- =====================================================
-- RPC: Eliminar Usuario Completo (Auth + Perfil)
-- =====================================================
-- Esta función permite a un administrador eliminar un usuario
-- tanto de la tabla de autenticación como de perfiles.
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_user_complete(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Verificar que el usuario que ejecuta la función es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para eliminar usuarios.';
  END IF;

  -- Eliminar de public.profiles (si no hay borrado en cascada)
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Eliminar de auth.users (esto borrará sesiones y credenciales)
  DELETE FROM auth.users WHERE id = target_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error eliminando usuario %: %', target_user_id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje de confirmación
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Función delete_user_complete creada exitosamente';
END $$;

