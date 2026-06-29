# Estado real de Supabase — verificación Fase 0

> Verificado el 2026-06-28 vía MCP de Supabase (read-only) contra el proyecto `negehfyvwvpwwjugfbie`.
> Esta verificación reemplaza las suposiciones del repo: ahora es el estado **real** de la BD.

## Tablas (schema `public`)

| Tabla | Existe | RLS | Filas | Notas |
|-------|--------|-----|-------|-------|
| `profiles` | ✅ | ✅ | **0** | FK a `auth.users` |
| `foundations` | ✅ | ✅ | **0** | |
| `pets` | ✅ | ✅ | **0** | tiene columna `adopted_at` (no está en `database.types.ts`) |
| `favorites` | ✅ | ✅ | **0** | el plan la deprecó → favoritos en localStorage |
| `adoptions` | ✅ | ✅ | **0** | flujo legacy, sin UI |
| `site_settings` | ✅ | ✅ | **0** | usa default config hasta que se guarde |
| `applications` | ✅ | ✅ | **0** | columnas coinciden con `ApplicationModal` / `AdminApplications` |

🔴 **La base de datos está completamente vacía (0 filas en todas las tablas).** No hay datos piloto: el catálogo público y el admin no muestran nada real. **Bloquea el criterio de aceptación de la Fase 0** ("catálogo público muestra datos reales").

## Funciones (RPC)

| Función | Estado | Acción |
|---------|--------|--------|
| `handle_new_user()` | ✅ existe (trigger de perfiles) | OK |
| `mark_pet_in_process(uuid)` | ✅ existe | **DROP** (plan §2.5) — llamada en frontend ya eliminada |
| `update_site_settings_updated_at()` | ✅ | OK |
| `update_updated_at_column()` | ✅ | OK |
| `delete_user_complete(uuid)` | ❌ **NO existe** | El borrado de usuarios en admin la invoca y **falla**, cayendo al fallback (borra solo `profiles`, deja el usuario en `auth.users` huérfano). Aplicar `supabase/rpc_delete_user.sql`. |

## Storage
- Bucket `images` ✅ existe y es **público**.

## Migraciones
- **Ninguna migración versionada** (`list_migrations` vacío). Todo el schema se aplicó manualmente vía scripts sueltos en `supabase/*.sql`. No hay historial reproducible.

## Edge Functions
- **Ninguna** desplegada.

## Advisors de seguridad (nivel WARN)
1. `delete_user_complete` ausente (ver arriba) — **funcional, no solo seguridad**.
2. `mark_pet_in_process` y `handle_new_user` son `SECURITY DEFINER` ejecutables por `anon`/`authenticated`. Al dropear `mark_pet_in_process` se resuelve una.
3. RLS de `applications` INSERT con `WITH CHECK (true)` — abierto a público (intencional para postulaciones; añadir honeypot/rate-limit en Fase 5).
4. Bucket público `images` permite **listar** todos los archivos (política SELECT amplia).
5. Funciones con `search_path` mutable (`update_updated_at_column`, `update_site_settings_updated_at`).
6. Protección de contraseñas filtradas (HaveIBeenPwned) **desactivada** en Auth.

## Conclusión Fase 0
- ✅ **Infraestructura presente**: todas las tablas, RLS, bucket y triggers base existen.
- 🔴 **Faltan dos cosas para cerrar Fase 0** (ambas requieren **escritura**, no disponibles con el MCP read-only):
  1. **Cargar datos piloto** (2 fundaciones, ~10 mascotas, 1 admin). Existen `supabase/seed.sql` y `supabase/restore_data*.sql`.
  2. **Aplicar `rpc_delete_user.sql`** (crear `delete_user_complete`) y **dropear `mark_pet_in_process`**.
- Para ejecutar escrituras: correr esos scripts en el SQL Editor de Supabase, **o** re-agregar el MCP sin `read_only=true` para que yo aplique las migraciones.
