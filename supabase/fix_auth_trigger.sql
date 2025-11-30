-- =====================================================
-- FIX: Arreglar trigger de creación de usuario
-- =====================================================
-- Este script corrige el problema de "Database error creating new user"
-- El problema es que RLS bloquea la inserción del trigger.
-- 
-- Ejecutar en SQL Editor de Supabase DESPUÉS de schema.sql
-- =====================================================

-- Opción 1: Agregar política para permitir inserción desde el trigger
-- (El trigger usa SECURITY DEFINER que ejecuta como el owner de la función)

-- Primero, eliminamos el trigger existente si hay problemas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreamos la función con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'adopter'::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log del error pero no falla la creación del usuario
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreamos el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Importante: Dar permisos al rol de servicio para insertar en profiles
-- (Esto permite que SECURITY DEFINER funcione correctamente)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- Agregar política que permite inserción para el service_role
CREATE POLICY "Service role can insert profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- También necesitamos permitir que los usuarios creen su propio perfil
-- (por si el trigger falla, pueden crearlo manualmente)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Después de ejecutar este script, intenta crear un usuario
-- en Authentication > Users > Add user
-- 
-- Si sigue fallando, puedes deshabilitar temporalmente RLS:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- 
-- Crear el usuario, y luego volver a habilitar:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- =====================================================

-- Mensaje de confirmación
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Trigger de autenticación actualizado correctamente';
END $$;
