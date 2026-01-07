# 🔧 Fix: Guardar Teléfono al Crear Usuario

## Problema
Al crear un usuario desde el panel admin, el número de teléfono no se está guardando.

## Solución Rápida ⚡

### Paso 1: Actualizar el Trigger en Supabase

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega este código:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'adopter'::user_role)
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

4. Click en **Run** o presiona `Ctrl + Enter`
5. Deberías ver: `✅ Success. No rows returned`

### Paso 2: Verificar que Funciona

1. Ve al panel admin → Usuarios
2. Click en "+ Agregar Usuario"
3. Completa todos los campos **incluyendo el teléfono**
4. Click en "Crear Usuario"
5. Verifica en la tabla que el teléfono aparece ✅

---

## ¿Qué hace este fix?

### Antes ❌
El trigger solo guardaba:
- ID
- Nombre
- Avatar
- Rol (siempre "adopter")

### Ahora ✅
El trigger guarda TAMBIÉN:
- **Teléfono** (del metadata)
- **Rol real** (admin, foundation, adopter)

---

## Sistema de Respaldo

El código del modal ya tiene un **sistema de respaldo** que funciona así:

```typescript
// 1. Crea usuario con metadata
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: formData.fullName,
      phone: formData.phone,        // ← Se pasa al metadata
      role: formData.role,           // ← Se pasa al metadata
    }
  }
})

// 2. Espera a que el trigger cree el perfil (polling con reintentos)
let profileExists = false
while (!profileExists && attempts < 10) {
  // Verifica cada 500ms si el perfil existe
}

// 3. Hace UPDATE para garantizar que TODO se guardó
await supabase
  .from('profiles')
  .update({
    role: formData.role,
    phone: formData.phone,
    full_name: formData.fullName,
  })
  .eq('id', userId)
```

**Esto significa:** Incluso sin actualizar el trigger, el teléfono DEBERÍA guardarse gracias al UPDATE.

---

## Si Aún Así No Funciona

### 1. Verifica los Logs

Abre la **Consola del Navegador** (F12) y busca:
- ✅ `"Usuario creado: [uuid]"`
- ✅ `"Perfil encontrado, actualizando..."`
- ✅ `"Perfil actualizado exitosamente:"`

Si ves errores, cópialos y revisa.

### 2. Verifica Políticas RLS

El usuario admin debe tener permisos para **UPDATE** en la tabla `profiles`:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Crear política si no existe
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3. Verifica el Usuario Admin

```sql
-- Ver tu perfil actual
SELECT * FROM profiles WHERE id = auth.uid();

-- Asegúrate de que tu role sea 'admin'
-- Si no lo es, actualízalo:
UPDATE profiles 
SET role = 'admin' 
WHERE id = '[TU_USER_ID]';
```

### 4. Prueba Manual en Supabase

1. Ve a **Table Editor** → `profiles`
2. Intenta actualizar un registro manualmente
3. Si no puedes, hay un problema con RLS

---

## Archivos Modificados

- ✅ `src/components/admin/AddUserModal.tsx` - Sistema de respaldo con polling
- ✅ `supabase/fix_auth_trigger.sql` - Trigger actualizado
- ✅ `supabase/update_trigger_with_phone.sql` - **NUEVO** Script solo para el fix
- ✅ `docs/admin-add-user.md` - Documentación actualizada

---

## Resumen

1. **Ejecuta el SQL del Paso 1** en Supabase SQL Editor
2. **Prueba crear un usuario** con teléfono
3. **Verifica que se guardó** en la tabla

Si después de esto sigue sin funcionar, revisa los logs de la consola y las políticas RLS.

---

**¿Necesitas ayuda?** Revisa los logs en la consola del navegador (F12) y busca errores.



