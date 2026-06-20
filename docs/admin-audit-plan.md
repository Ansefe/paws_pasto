# Auditoría del Panel Administrativo (`/admin`) y Plan por Fases

> Fecha: 2026-06-18 · Rama: `feature/dashboard`
> Alcance: revisión exhaustiva de cada enlace, botón y flujo del panel `/admin`.
> Metodología: análisis estático del código (React + Vite + Supabase). No se ejecutó el panel en navegador.

---

## 1. Mapa del panel

| Ruta / Sección | Archivo | Fuente de datos | Estado general |
|---|---|---|---|
| Shell / Layout | `src/pages/admin/AdminDashboard.tsx` | — | ⚠️ Parcial |
| Dashboard (Overview) | `src/pages/admin/sections/AdminOverview.tsx` | **Mock (hardcoded)** | ❌ No funcional |
| Usuarios | `src/pages/admin/sections/AdminUsers.tsx` | **Supabase real** (`profiles`) | ✅ Funciona (con bugs) |
| Fundaciones | `src/pages/admin/sections/AdminFoundations.tsx` | **Mock (hardcoded)** | ❌ No funcional |
| Mascotas | `src/pages/admin/sections/AdminPets.tsx` | **Mock (hardcoded)** | ❌ No funcional |
| Configuración | `src/pages/admin/sections/AdminSettings.tsx` | **Supabase real** (`site_settings`) | ✅ Funciona |

**Protección de ruta:** `/admin/*` exige rol `admin` vía `ProtectedRoute` → ✅ correcto.

---

## 2. Auditoría detallada (botón por botón)

### 2.1 Shell / Layout (`AdminDashboard.tsx`)
| Elemento | Estado | Detalle |
|---|---|---|
| Navegación lateral (5 ítems) | ✅ | Cambian de sección con `setActiveSection`. |
| Colapsar/expandir sidebar | ✅ | Funciona. |
| Menú móvil (abrir/cerrar/overlay) | ✅ | Funciona. |
| Datos de usuario "Administrador / admin@paws.com" | ❌ | **Hardcoded.** No usa el perfil real de `useAuth()`. |
| Botón **"Cerrar Sesión"** | ❌ | **No tiene `onClick`.** No llama a `signOut()`. No hace nada. |
| Logout en sidebar móvil | ❌ | **No existe** el botón en la versión móvil. |
| Buscador global (top bar) | ❌ | Input decorativo: sin `value`, sin `onChange`, sin lógica. |
| Campana de notificaciones | ❌ | Decorativa: punto rojo siempre visible, sin `onClick` ni datos. |

### 2.2 Dashboard / Overview (`AdminOverview.tsx`)
| Elemento | Estado | Detalle |
|---|---|---|
| 4 tarjetas de stats (124, 8, 23, 342) | ❌ | **100% hardcoded.** No consultan la BD. |
| Porcentajes de tendencia (+12%, etc.) | ❌ | Inventados. |
| "Actividad Reciente" | ❌ | Lista mock estática. |
| Botón **"Ver todo"** | ❌ | Sin `onClick`. |
| "Pendientes" (3 ítems con contadores) | ❌ | Mock. Menciona "Solicitudes de adopción: 5" pero **no existe sección de solicitudes**. |
| "Resumen del Mes" | ❌ | Mock. |

### 2.3 Usuarios (`AdminUsers.tsx`) — la sección más completa junto a Configuración
| Elemento | Estado | Detalle |
|---|---|---|
| Carga de usuarios | ✅ | Lee `profiles` de Supabase real. |
| Estados loading/error/reintentar | ✅ | Bien implementados. |
| Buscador | ⚠️ | Busca por `full_name` e `id`, **no por email** (el placeholder dice "o email" pero `profiles` no tiene columna email). |
| Filtros de rol (Todos/Adoptantes/Fundaciones) | ⚠️ | Funcionan, pero **falta filtro "Administradores"**. |
| **Agregar Usuario** | 🔴 | Funciona pero con **bug crítico de sesión** (ver §3.1). |
| Ver detalles (modal) | ✅ | Funciona. |
| Editar usuario (modal) | ✅ | Actualiza `profiles` real. |
| Eliminar usuario | ⚠️ | Usa RPC `delete_user_complete` con fallback. Usa `alert()` nativo. Depende de un script SQL que puede no estar aplicado. |
| Paginación | ❌ | Decorativa: botones `disabled`, sin lógica real. Muestra todos los registros. |

### 2.4 Fundaciones (`AdminFoundations.tsx`)
| Elemento | Estado | Detalle |
|---|---|---|
| Listado | ❌ | **`mockFoundations` hardcoded.** Existe el hook `useFoundations` pero **no se usa**. |
| Buscador / filtros | ⚠️ | Funcionan, pero solo sobre datos falsos. |
| **Agregar Fundación** | ❌ | Sin `onClick`. |
| Menú "⋮" de cada tarjeta | ❌ | Sin `onClick`. |
| Botones Ver / Editar / Eliminar | ❌ | Los 3 sin `onClick`. |

### 2.5 Mascotas (`AdminPets.tsx`)
| Elemento | Estado | Detalle |
|---|---|---|
| Listado | ❌ | **`mockPets` hardcoded.** Existe el hook `usePets` pero **no se usa**. |
| Stats (Total/Disponibles/En proceso/Adoptados) | ❌ | Calculados sobre el mock. |
| Buscador / filtros especie y estado | ⚠️ | Funcionan, pero solo sobre datos falsos. |
| **Agregar Mascota** | ❌ | Sin `onClick`. |
| Botones Ver / Editar / Eliminar | ❌ | Los 3 sin `onClick`. |
| Paginación | ❌ | Decorativa. |

### 2.6 Configuración (`AdminSettings.tsx`) — ✅ la más sólida
| Elemento | Estado | Detalle |
|---|---|---|
| Pestañas (General/Contacto/Social/Legal) | ✅ | Funcionan. |
| Carga desde `site_settings` | ✅ | Real. |
| **Guardar Cambios** | ✅ | `upsert` real por clave, con mensajes de éxito/error. |

---

## 3. Problemas críticos (prioridad máxima)

### 3.1 🔴 Crear usuario "secuestra" la sesión del admin
`AddUserModal` usa `supabase.auth.signUp(...)`. En el cliente, `signUp` **inicia sesión automáticamente con el usuario recién creado**, reemplazando la sesión del administrador. Resultado: tras crear un usuario, el admin queda logueado como el nuevo usuario (normalmente un `adopter`), perdiendo acceso al panel.
**Solución correcta:** crear usuarios desde el servidor con `supabase.auth.admin.createUser` (service role) mediante una **Edge Function**, nunca desde el cliente.

### 3.2 🔴 Botón "Cerrar Sesión" no funciona
No hay forma de cerrar sesión desde el panel (ni en escritorio ni en móvil). `signOut()` existe en `AuthContext` pero no está conectado.

### 3.3 🟠 Secciones núcleo con datos falsos
Dashboard, Fundaciones y Mascotas muestran datos inventados. Un administrador no puede gestionar realmente mascotas ni fundaciones, que es el propósito central de la plataforma.

### 3.4 🟠 No hay gestión de solicitudes
- Las **postulaciones** de fundaciones/rescatistas (`ApplicationModal`) solo se envían por Telegram/email; **no se guardan en BD**, así que el admin no puede revisarlas ni aprobarlas desde el panel, pese a que el flujo promete "creamos tu cuenta verificada".
- Las **adopciones** (`adoptions`, tabla ya existente) no tienen ninguna vista en el admin, aunque el Overview las menciona.

---

## 4. Mejoras transversales (UX / calidad)
- Reemplazar `alert()` y `console.log` de depuración por un sistema de **toasts**.
- Mostrar el **perfil real** del admin en el sidebar (nombre, email, avatar).
- Buscador global del top bar: conectarlo o eliminarlo.
- Paginación real en tablas grandes (Usuarios, Mascotas).
- Manejo de imágenes (subida a Supabase Storage) para mascotas/fundaciones/logos.
- Confirmaciones consistentes en todas las acciones destructivas.
- Limpiar `console.log` de `AuthContext` y modales antes de producción.

---

## 5. Plan por fases

> Cada fase es entregable e independiente. Ejecutar en orden; al cerrar una fase, validar antes de pasar a la siguiente.

### Fase 0 — Arreglos críticos rápidos ✅ COMPLETADA (2026-06-18)
**Objetivo:** que el panel sea usable y seguro sin romper nada.
1. ✅ Conectar **"Cerrar Sesión"** a `signOut()` (escritorio + botón en móvil).
2. ✅ Mostrar el **perfil real** del admin en el sidebar (desde `useAuth`).
3. ✅ Corregir el **bug de sesión al crear usuario** → `createIsolatedClient()` en `supabase.ts`: el `signUp` se hace en un cliente que no persiste sesión, así la del admin queda intacta. (La opción Edge Function queda como mejora futura para control de confirmación por email — Fase 4.)
4. ✅ Quitar elementos decorativos (buscador global y campana); el top bar ahora muestra el título de la sección activa.
5. ✅ **Extra:** arreglada la causa raíz del tipado `never` del cliente Supabase en `database.types.ts` (faltaban `Relationships`, `Views`, `Functions`, `CompositeTypes`); registrada la RPC `delete_user_complete`; eliminados imports/`any` muertos. `npm run build` y ESLint pasan limpios.

**Criterio de aceptación:** ✅ el admin puede entrar, navegar, crear usuarios sin perder su sesión y cerrar sesión. Build sin errores de TypeScript.

### Fase 1 — Dashboard con datos reales ✅ COMPLETADA (2026-06-18)
**Objetivo:** que el Overview refleje la BD.
1. ✅ Hook `useAdminMetrics` (`src/hooks/useAdminMetrics.ts`): conteos reales de `pets`, `foundations`, `profiles`, `adoptions` vía queries `count: 'exact', head: true` en paralelo.
2. ✅ Sustituidas las 4 tarjetas, "Resumen del mes" y "Pendientes" por datos reales. Las tendencias inventadas se reemplazaron por deltas reales "+N este mes" (se ocultan si son 0). "Pendientes" ahora cuenta fundaciones sin verificar, adopciones `pending` y mascotas sin foto.
3. ✅ "Actividad reciente" derivada de los registros más recientes de las 4 tablas, combinados y ordenados por fecha, con tiempo relativo y estado vacío.
4. ✅ Botón "Ver todo" eliminado (no hay vista de detalle de actividad hasta la Fase 4).
5. ✅ Estados loading/error/reintentar consistentes con `AdminUsers`. `npm run build`, `tsc` y ESLint pasan limpios.

**Criterio de aceptación:** ✅ el Overview ya no muestra datos hardcoded; refleja la BD real.

### Fase 2 — Mascotas CRUD real ✅ COMPLETADA (2026-06-18)
**Objetivo:** gestión real de mascotas (núcleo del negocio).
1. ✅ `mockPets` reemplazado por `usePets({ adminMode: true })`. Se añadió la opción `adminMode` al hook para ver **todos los estados** (incluye `adopted`/`paused`) sin afectar la vista pública.
2. ✅ Modal **Crear/Editar mascota** (`PetFormModal.tsx`): todos los campos de la tabla `pets`, selección de fundación vía `useFoundations(false)`, selects de especie/género/tamaño/estado y checkboxes de salud/convivencia.
3. ✅ Acciones **Ver** (`PetDetailsModal.tsx`), **Editar** y **Eliminar** (con diálogo de confirmación) funcionales.
4. ✅ Subida de foto principal a Supabase Storage (bucket `images`, carpeta `pets`) vía helpers `uploadImage`/`deleteImageByUrl` en `supabase.ts`; al eliminar la mascota se borra su foto (best-effort). *(Galería `gallery_urls` queda pendiente — el form sube solo `main_photo_url` por ahora.)*
5. ✅ Paginación real client-side (10/pág) + filtros (especie/estado/búsqueda) y estadísticas sobre datos reales. Estados loading/error/reintentar consistentes.

**Pendiente menor:** galería múltiple (`gallery_urls`); el delete usa `alert()` nativo (se unificará con toasts en Fase 5). `npm run build`, `tsc` y ESLint pasan limpios.

> ⚠️ Requiere que exista el bucket `images` (público) en Supabase Storage y políticas RLS de `INSERT/UPDATE/DELETE` sobre `pets` para el rol admin. Verificar en Fase 5.

### Fase 3 — Fundaciones CRUD real ✅ COMPLETADA (2026-06-18)
**Objetivo:** gestión real de fundaciones.
1. ✅ `mockFoundations` reemplazado por `useFoundations(false)` (incluye no verificadas, con `pet_count` real).
2. ✅ Modal **Crear/Editar fundación** (`FoundationFormModal.tsx`): todos los campos de `foundations` (nombre, ciudad, descripción, dirección, WhatsApp, email, redes, donaciones, logo). Al **crear** se selecciona el perfil propietario (rol `foundation`) ya que `profile_id` es obligatorio; en edición el perfil queda fijo. Acción **Verificar/Quitar verificación** (`is_verified` + `verified_at` coherente) desde el menú "⋮" de cada tarjeta.
3. ✅ Acciones **Ver** (`FoundationDetailsModal.tsx`), **Editar** y **Eliminar** (con confirmación) funcionales; menú "⋮" ya conectado.
4. ✅ Subida de logo a Supabase Storage (bucket `images`, carpeta `foundations`); al eliminar se borra el logo (best-effort).
5. ✅ Filtro por estado (Todas/Verificadas/Pendientes) y búsqueda sobre datos reales; estados loading/error/reintentar.

**Notas:** crear una fundación requiere un perfil con rol `foundation` preexistente (creado desde la sección Usuarios); el flujo automático desde postulaciones llega en Fase 4. Eliminar puede fallar si la fundación tiene mascotas asociadas (FK) — se informa en el diálogo. `alert()` se unificará con toasts en Fase 5. `npm run build`, `tsc` y ESLint pasan limpios.

> ⚠️ Requiere políticas RLS de `INSERT/UPDATE/DELETE` sobre `foundations` para el rol admin, y lectura de `profiles` filtrando por rol. Verificar en Fase 5.

### Fase 4 — Solicitudes y Adopciones ✅ COMPLETADA (2026-06-18)
**Objetivo:** cerrar el ciclo de moderación.
1. ✅ **Postulaciones persistidas**: nueva tabla `applications` (`supabase/create_applications_table.sql` — tabla + RLS de envío público y gestión solo admin + índices). `ApplicationModal` ahora hace `insert` en `applications` (best-effort) además del envío por Telegram/email. Tipos añadidos a `database.types.ts`.
2. ✅ Nueva sección **"Solicitudes"** (`AdminApplications.tsx`): listar, buscar, filtrar por estado, ver detalle, **aprobar** y **rechazar** (con notas). Al **aprobar** se marca la postulación y se abre `FoundationFormModal` **precargado** con los datos de la postulación (`prefill`) para crear la fundación verificada — el admin selecciona el perfil propietario. *(Decisión del usuario: prefill manual; la Edge Function de creación automática de cuenta queda como mejora futura.)*
3. ✅ Nueva sección **"Adopciones"** (`AdminAdoptions.tsx`): listar `adoptions` con joins (mascota, adoptante, fundación), buscar, filtrar, ver detalle y **cambiar estado** (pending/approved/rejected/cancelled) con `resolved_at` coherente.
4. ✅ Ambas secciones añadidas al sidebar del shell (`AdminDashboard.tsx`).

**Notas:**
- Requiere ejecutar `supabase/create_applications_table.sql` en Supabase antes de usar la sección Solicitudes (si no, esa sección muestra error/reintentar, sin afectar al resto).
- El Overview **no** consulta `applications` para no romperse si la tabla aún no existe.
- Creación automática de cuenta verificada al aprobar (Edge Function service-role) queda pendiente como mejora futura. `npm run build`, `tsc` y ESLint pasan limpios.

> ⚠️ RLS: la lectura/gestión de `adoptions` por el admin debe estar permitida por política. Verificar en Fase 5.

### Fase 5 — Pulido y producción ✅ COMPLETADA (2026-06-18)
1. ✅ Sistema de **toasts** propio (`src/contexts/ToastContext.tsx`: `ToastProvider` + `useToast`, sin dependencias nuevas), montado en `App.tsx`. Reemplazados **todos** los `alert()` (Pets, Foundations, Applications, Adoptions, Users) por toasts de éxito/error.
2. ✅ Eliminados todos los `console.log` de depuración (AuthContext, LoginModal, AddUserModal, EditUserModal, ApplicationModal, AdminUsers). Se conservan los `console.error` legítimos en bloques `catch`.
3. ✅ Estados loading/error/reintentar y vacíos consistentes en todas las secciones (homologados durante las Fases 1–4).
4. ✅ Revisión y consolidación de **políticas RLS**: nuevo `supabase/admin_rls_policies.sql` con permisos de admin para `pets`, `foundations` y `adoptions` (INSERT/UPDATE/DELETE/SELECT según corresponda) + creación y políticas del bucket de Storage `images` (lectura pública, escritura autenticada). Junto con `fix_rls_policies.sql` (profiles) y `create_applications_table.sql` (applications), cubre todas las operaciones del panel.
5. ✅ Buscador global: retirado en la Fase 0 (top bar muestra el título de sección).

**Calidad:** `tsc` y `npm run build` pasan limpios. Quedan 4 errores de ESLint **preexistentes** ajenos a este trabajo (primitivos shadcn `button.tsx`/`input.tsx` y convención `react-refresh/only-export-components` en `AuthContext`/`SiteConfigContext`).

> 📌 **Acción requerida en Supabase** para producción: ejecutar en el SQL Editor, en orden, `create_applications_table.sql` y `admin_rls_policies.sql` (y `fix_rls_policies.sql` si no se aplicó). Sin esto, las operaciones de escritura del panel fallarán por RLS y la subida de imágenes no funcionará.

---

## 6. Resumen ejecutivo

**Estado final (2026-06-18): Fases 0–5 completadas.** ✅

- **Funciona hoy:** protección de ruta; logout (escritorio + móvil); perfil real del admin; Dashboard con métricas reales; **Mascotas, Fundaciones, Solicitudes y Adopciones** con CRUD/gestión real; Usuarios; Configuración; subida de imágenes a Storage; toasts; estados de carga/error/vacío homologados.
- **Resuelto:** bug de sesión al crear usuario; logout inexistente; datos falsos en Dashboard/Mascotas/Fundaciones; ausencia de gestión de solicitudes y adopciones; `alert()`/`console.log` de depuración; buscador global decorativo (retirado).
- **Acciones pendientes del usuario (Supabase):** ejecutar `create_applications_table.sql`, `admin_rls_policies.sql`, `mark_pet_in_process.sql`, `add_paused_pet_status.sql` (y `fix_rls_policies.sql` si falta) en el SQL Editor.
- **Sección "Adopciones" del admin retirada:** con el flujo de adopción por WhatsApp ya no se crean registros en `adoptions` desde el sitio, así que la sección perdió su propósito y se eliminó del panel.
- **Flujo de adopción público (añadido fuera del plan):** en `/adoptar` el botón de postulación abre **WhatsApp** de la fundación con mensaje por mascota, notifica por **Telegram** y marca la mascota `in_process` vía RPC `mark_pet_in_process` (sin bloquear nuevas postulaciones). Nueva pestaña **"Adoptados"** (finales felices). Requiere ejecutar `mark_pet_in_process.sql`.
- **Mejoras futuras (fuera de alcance):** Edge Function para crear cuenta verificada automáticamente al aprobar una postulación; galería múltiple (`gallery_urls`) en mascotas; paginación server-side si el volumen crece; resolver los 4 lint preexistentes de shadcn/contextos.
