# Funcionalidad: Agregar Usuarios

## Descripción

Se ha implementado la funcionalidad completa para crear nuevos usuarios desde el panel administrativo.

## Componentes Creados

### 1. `AddUserModal.tsx`
**Ubicación:** `src/components/admin/AddUserModal.tsx`

Modal para crear nuevos usuarios con los siguientes campos:
- Nombre completo (requerido)
- Email (requerido)
- Contraseña (requerido, mínimo 6 caracteres)
- Teléfono (opcional)
- Rol (requerido: adopter, foundation, admin)

**Características:**
- Validación de formularios
- Estados de loading, error y success
- Integración con Supabase Auth
- Actualización automática del perfil después de crear el usuario
- Cierre automático después de crear exitosamente

### 2. `AdminUsers.tsx` (Actualizado)
**Ubicación:** `src/pages/admin/sections/AdminUsers.tsx`

**Cambios realizados:**
- ✅ Integración con Supabase (reemplazó datos mock)
- ✅ Fetch de usuarios reales desde la tabla `profiles`
- ✅ Estados de loading y error
- ✅ Funcionalidad del botón "Agregar Usuario"
- ✅ Recarga automática de la lista después de crear un usuario
- ✅ Filtrado por búsqueda y rol funcionando con datos reales
- ✅ Paginación (UI básica, lógica pendiente)

## Flujo de Creación de Usuario

1. Admin hace clic en "Agregar Usuario"
2. Se abre el modal con el formulario
3. Admin completa los campos:
   - Nombre
   - Email
   - Contraseña temporal
   - Teléfono (opcional)
   - Rol (adopter/foundation/admin)
4. Al enviar:
   - Se crea el usuario en `auth.users` (Supabase Auth) con metadata
   - El metadata incluye: `full_name`, `phone`, `role`, `avatar_url`
   - El trigger de base de datos crea automáticamente el perfil en `profiles` usando el metadata
   - **Método de respaldo:** Si el trigger no incluye todos los campos, se hace un UPDATE adicional
   - Se verifica que el perfil existe con polling (hasta 10 intentos)
   - Se actualiza el perfil con todos los datos garantizando consistencia
5. Mensaje de éxito y recarga de la lista
6. Modal se cierra automáticamente

### 📝 Importante: Trigger Actualizado

Para que el teléfono y el rol se guarden correctamente **DESDE EL PRIMER MOMENTO**, 
debes ejecutar el script de actualización del trigger:

**Ejecutar en Supabase SQL Editor:**
```sql
-- Opción 1: Ejecutar el script completo de actualización
-- Archivo: supabase/update_trigger_with_phone.sql
```

O manualmente:

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

### 🔄 Método de Respaldo (Doble Escritura)

El código actual implementa un **método de respaldo** que funciona así:

1. **Primera escritura (Trigger):** Al crear el usuario, el trigger intenta guardar todo desde el metadata
2. **Segunda escritura (Update):** El código hace un UPDATE adicional para garantizar que todo se guardó
3. **Verificación:** Usa polling para asegurar que el perfil existe antes de actualizar

Esto garantiza que **siempre** se guarden todos los datos, incluso si:
- El trigger no está actualizado
- El trigger falla parcialmente
- Hay demora en la creación del perfil

## Seguridad

### Políticas RLS (Row Level Security)
**IMPORTANTE:** Asegúrate de tener las políticas correctas en Supabase:

```sql
-- Solo admins pueden crear usuarios
-- Esta operación se hace desde el cliente autenticado como admin
-- El admin debe tener permisos para llamar a auth.signUp()

-- Política para que admins puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que admins puedan actualizar perfiles
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Consideraciones
- La creación de usuarios desde el cliente requiere que el admin esté autenticado
- No se envía email de confirmación (emailRedirectTo: undefined)
- La contraseña es temporal y debería ser cambiada por el usuario

## Mejoras Futuras

### Corto Plazo
1. **Email de bienvenida:** Implementar envío de email con instrucciones de primer login
2. **Generación de contraseña:** Botón para generar contraseña segura automáticamente
3. **Validación de email único:** Verificar si el email ya existe antes de enviar
4. **Editar usuario:** Funcionalidad para editar usuarios existentes
5. **Eliminar usuario:** Funcionalidad para eliminar usuarios (con confirmación)

### Mediano Plazo
6. **Paginación real:** Implementar paginación con cursores o offset
7. **Exportar usuarios:** Botón para exportar lista a CSV/Excel
8. **Filtros avanzados:** Fecha de registro, último login, etc.
9. **Búsqueda mejorada:** Incluir búsqueda por ID completo
10. **Vista de detalles:** Modal para ver toda la información del usuario

### Largo Plazo
11. **Logs de actividad:** Ver acciones del usuario en el sistema
12. **Estadísticas:** Dashboard con métricas de usuarios
13. **Notificaciones:** Sistema para notificar a usuarios vía email/SMS
14. **Importación masiva:** Subir CSV con múltiples usuarios

## Pruebas Recomendadas

### Casos de Prueba
1. ✅ Crear usuario adoptante básico
2. ✅ Crear usuario fundación
3. ✅ Crear usuario admin
4. ⚠️ Intentar crear usuario con email duplicado (debe fallar)
5. ⚠️ Intentar crear usuario con contraseña corta (debe fallar)
6. ✅ Cancelar creación de usuario
7. ✅ Verificar que la lista se actualiza después de crear
8. ✅ Buscar usuario recién creado
9. ✅ Filtrar por rol

## Comandos de Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Acceder al panel admin
# http://localhost:5173/admin
# (Requiere usuario con rol 'admin')
```

## Troubleshooting

### Problema: El teléfono no se guarda

**Solución 1: Actualizar el trigger (RECOMENDADO)**

Ejecuta el script de actualización del trigger en Supabase:

```bash
# En Supabase SQL Editor
# Ejecutar: supabase/update_trigger_with_phone.sql
```

Esto hará que el trigger lea el teléfono y rol del metadata automáticamente.

**Solución 2: El código ya tiene respaldo automático**

El código actual implementa un sistema de respaldo que:
1. Espera a que el trigger cree el perfil (polling con reintentos)
2. Hace un UPDATE adicional para garantizar que todos los campos estén guardados
3. Lanza error claro si algo falla

Si ves el teléfono guardado correctamente, el respaldo está funcionando.
Si no se guarda, verifica:
- Los logs de la consola del navegador
- Que el usuario admin tenga permisos UPDATE en la tabla profiles
- Las políticas RLS de Supabase

### "No tienes un perfil autorizado"
- **Causa:** El trigger de base de datos no creó el perfil
- **Solución:** Verificar que el trigger `handle_new_user()` esté activo en Supabase

### Usuario creado pero no aparece en la lista
- **Causa:** Error al actualizar el perfil o en políticas RLS
- **Solución:** 
  1. Verificar políticas RLS en tabla `profiles`
  2. Revisar logs en consola del navegador
  3. Verificar en Supabase Dashboard que el usuario existe

### "Email already exists"
- **Causa:** Ya existe un usuario con ese email
- **Solución:** Usar un email diferente o eliminar el usuario existente

### Trigger no funciona
- **Solución:** Ejecutar el script `supabase/fix_auth_trigger.sql`

```sql
-- En Supabase SQL Editor
-- Ejecutar el contenido de fix_auth_trigger.sql
```

## Archivos Relacionados

- `src/components/admin/AddUserModal.tsx` - Modal de creación (con sistema de respaldo)
- `src/pages/admin/sections/AdminUsers.tsx` - Página de gestión de usuarios
- `src/contexts/AuthContext.tsx` - Contexto de autenticación
- `src/types/database.types.ts` - Tipos de TypeScript
- `supabase/schema.sql` - Schema de base de datos
- `supabase/fix_auth_trigger.sql` - Trigger completo (incluye phone y role)
- `supabase/update_trigger_with_phone.sql` - **NUEVO**: Solo actualiza el trigger para phone y role

---

## 🔄 Changelog

### Versión 1.1.0 (Actual)
- ✅ Sistema de respaldo con polling para verificar creación del perfil
- ✅ Doble escritura (trigger + update) para garantizar consistencia
- ✅ Manejo robusto de errores con mensajes descriptivos
- ✅ Logs detallados en consola para debugging
- ✅ Trigger actualizado para leer phone y role del metadata
- ✅ Script SQL dedicado para actualizar solo el trigger

### Versión 1.0.0 (Inicial)
- Creación básica de usuarios
- Modal con formulario
- Integración con Supabase Auth

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.1.0

