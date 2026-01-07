-- =====================================================
-- FIX: Políticas RLS para Administración de Perfiles
-- =====================================================
-- Este script permite que los administradores puedan:
-- 1. Actualizar cualquier perfil (no solo el suyo)
-- 2. Eliminar cualquier perfil
-- =====================================================

-- 1. Política para UPDATE
-- Permitir a los admins actualizar cualquier perfil
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    -- El usuario actual debe tener rol 'admin' en su propio perfil
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 2. Política para DELETE (ya que estamos aquí, aseguramos esto también)
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
CREATE POLICY "Admins can delete any profile" ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Mensaje de confirmación
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Políticas RLS actualizadas: Ahora los admins pueden editar y eliminar perfiles';
END $$;

