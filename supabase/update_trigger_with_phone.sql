-- =====================================================
-- UPDATE: Trigger ROBUSTO para incluir teléfono y rol
-- =====================================================
-- Versión mejorada que maneja casting seguro y logs
-- Ejecutar en SQL Editor de Supabase
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role_str text;
  v_role_enum public.user_role;
  v_phone text;
  v_full_name text;
  v_avatar text;
BEGIN
  -- 1. Extraer valores del JSONB de metadatos con seguridad
  -- Usamos ->> para obtener texto directamente
  v_role_str := NEW.raw_user_meta_data->>'role';
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- 2. Intentar convertir el rol al enum
  -- Si falla o es nulo, usamos 'adopter' por defecto
  BEGIN
    IF v_role_str IS NOT NULL THEN
      v_role_enum := v_role_str::public.user_role;
    ELSE
      v_role_enum := 'adopter'::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Si el casting falla (ej. valor inválido), fallback a adopter
    v_role_enum := 'adopter'::public.user_role;
  END;

  -- 3. Insertar en profiles
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url, 
    phone, 
    role
  )
  VALUES (
    NEW.id,
    COALESCE(v_full_name, split_part(NEW.email, '@', 1)),
    v_avatar,
    v_phone, -- Puede ser NULL, eso está bien
    v_role_enum
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log detallado del error para debug
    RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.id, SQLERRM;
    -- Intentar inserción mínima de emergencia para no romper el registro
    BEGIN
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (NEW.id, split_part(NEW.email, '@', 1), 'adopter'::public.user_role);
    EXCEPTION WHEN OTHERS THEN
      -- Si incluso esto falla, no hacemos nada (el usuario se crea en auth pero sin perfil)
      RAISE WARNING 'Fallo crítico creando perfil de emergencia: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verificación
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Trigger handle_new_user actualizado correctamente';
END $$;
