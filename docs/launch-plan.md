# Plan de lanzamiento — Paws Pasto Adopciones

> **Última actualización:** 2026-06-28  
> **Estado del proyecto:** en desarrollo — no listo para lanzamiento público completo  
> **Alcance:** plan maestro de producto + ejecución técnica, alineado con decisiones de negocio recientes

---

## 1. Sobre los scripts SQL (aclaración importante)

**No se ha verificado el estado real de la base de datos en Supabase.** La observación anterior de que “los scripts podrían no estar aplicados” se basó únicamente en señales del repositorio:

| Señal en el código/docs | Qué implica |
|-------------------------|-------------|
| Scripts sueltos en `supabase/*.sql` (no migraciones versionadas) | Hay que ejecutarlos manualmente en el SQL Editor |
| `docs/admin-audit-plan.md` lista scripts como “acción requerida del usuario” | El equipo ya documentó que dependen de aplicación manual |
| RPCs y tablas referenciadas en código (`applications`, `mark_pet_in_process`) | Si no existen en BD, esas funciones fallan en runtime (best-effort o error) |

**Acción concreta antes de cualquier fase:** crear un checklist de verificación en Supabase (no asumir nada):

```sql
-- Verificar tablas clave
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'foundations', 'pets', 'applications', 'site_settings', 'adoptions');

-- Verificar RPC
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'mark_pet_in_process';

-- Verificar bucket
SELECT id, public FROM storage.buckets WHERE id = 'images';
```

Registrar en este documento (o en un `docs/supabase-status.md`) qué está aplicado y qué falta, **consultando el proyecto real en Supabase**, no el repo.

---

## 2. Decisiones de producto (actualizadas)

### 2.1 Modelo de autenticación — mínima fricción

| Tipo de usuario | ¿Debe iniciar sesión? | Comportamiento |
|-----------------|----------------------|----------------|
| **Visitante / adoptante casual** | No | Navega catálogo, comparte mascotas, postula vía WhatsApp sin cuenta |
| **Adoptante con cuenta (opcional)** | Sí, voluntario | Perfil, presumir adopciones, donaciones acumuladas, fotos de mascota |
| **Fundación verificada** | Sí | Panel self-service para mascotas, donaciones reportadas, validar adopciones |
| **Admin** | Sí | Moderación global |

**Favoritos:** persistencia en **localStorage** (sin login). No usar tabla `favorites` de BD por ahora. Conectar el hook `useLocalStorage` existente a las tarjetas y al modal.

**Registro de adoptantes:** opcional pero incentivado (perfil público, rankings de donadores, historial de adopciones). No bloquear flujos core.

### 2.2 Adopción — flujo actual (sin cambios de UX)

- No hay formulario in-app de postulación.
- El CTA abre **WhatsApp directo con la fundación**.
- ~~RPC `mark_pet_in_process`~~ → **eliminar** (ver §2.5).
- El estado `in_process` / `adopted` lo gestionan **fundación o admin** manualmente.

### 2.3 Donaciones — intención registrada + enlace de pago

Flujo propuesto en `/donar` (y tarjetas de fundación):

```
Usuario elige fundación
    → Modal/paso intermedio: monto estimado + nota opcional
    → (Opcional) login/registro rápido para acumular en su perfil
    → Registro en BD como donación "reportada" (sin verificación automática)
    → Redirección al link de pago (Nequi, etc.) o WhatsApp
    → Admin y fundación ven listado; pueden marcar como falsa / confirmada manualmente
```

**Tabla nueva sugerida:** `donation_reports` (nombre provisional)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `foundation_id` | uuid | FK |
| `profile_id` | uuid nullable | Null si anónimo; si hay login, acumula |
| `reporter_name` | text nullable | Para anónimos que dejen nombre |
| `amount_cop` | integer | Monto que *dice* que va a donar |
| `note` | text nullable | Mensaje para fundación / equipo Paws |
| `status` | enum | `reported` · `confirmed` · `rejected` |
| `reviewed_by` | uuid nullable | admin o fundación |
| `reviewed_at` | timestamptz | |
| `review_notes` | text nullable | Motivo de rechazo |
| `created_at` | timestamptz | |

**Rankings públicos (requieren registro):**

- Pestaña **Top donadores del mes** (suma de `confirmed` en el mes)
- Pestaña **Top donadores históricos**
- Solo donaciones `confirmed` cuentan para el ranking; las `reported` son pendientes de revisión

**Nota:** las donaciones `reported` también deben ser visibles en admin/fundación para detectar patrones sospechosos antes de confirmar.

### 2.4 Adopciones reclamadas — iniciativa dual

Cualquiera puede tomar la iniciativa; la fundación valida:

| Iniciador | Acción |
|-----------|--------|
| **Usuario registrado** | Marca “adopté a [mascota]”, sube fotos, escribe nota |
| **Fundación** | Asigna adoptante a mascota desde su panel, o confirma/rechaza reclamo del usuario |

**Tabla nueva sugerida:** `adoption_claims`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `pet_id` | uuid | FK |
| `profile_id` | uuid | FK adoptante |
| `foundation_id` | uuid | FK (denormalizado para queries) |
| `status` | enum | `pending` · `confirmed` · `rejected` |
| `story` | text nullable | Texto del adoptante |
| `photo_urls` | text[] | Storage `images/adoptions/` |
| `initiated_by` | enum | `adopter` · `foundation` |
| `confirmed_at` | timestamptz | |
| `created_at` | timestamptz | |

Al **confirmar**: mascota pasa a `adopted`; el perfil del adoptante muestra la adopción en su “vitrina”.

**Perfil público del adoptante (futuro cercano):**

- Adopciones confirmadas + fotos
- Total donado (confirmado)
- Badges simples (“Donador del mes”, “Familia Paws”, etc.)

### 2.5 Eliminar `mark_pet_in_process`

**Decisión:** quitar la RPC y cualquier llamada desde el frontend.

Motivo: cualquier visitante anónimo podía marcar mascotas como “en proceso” sin validación.

**Cambios técnicos:**

1. Eliminar `void supabase.rpc("mark_pet_in_process", …)` en `PetDetailModal.tsx`
2. Deprecar / no aplicar `supabase/mark_pet_in_process.sql` en entornos nuevos
3. Opcional: script de limpieza `DROP FUNCTION IF EXISTS public.mark_pet_in_process(uuid);`
4. Estado de mascota: solo vía admin o panel fundación (`available` → `in_process` → `adopted` / `paused`)

### 2.6 Stats del Home — hardcoded pero realistas

Mantener valores estáticos (proyecto recién arrancando). Valores acordados:

| Stat | Valor | Label sugerido |
|------|-------|----------------|
| 1 | `12` | Adoptados |
| 2 | `2` | Fundaciones aliadas |
| 3 | `10` | Familias felices |

*(Ajustar copy en `Home.tsx` cuando se implemente.)*

### 2.7 Compartir mascota — implementar ya

**Ruta:** `/adoptar?pet={uuid}` (query param, sin nueva ruta)

Comportamiento:

1. Al cargar `/adoptar`, si hay `?pet=`, abrir modal de esa mascota automáticamente
2. Botón “Compartir” en modal y/o tarjeta → `navigator.share()` o copiar URL
3. Meta tags OG básicos en `index.html` + título dinámico por mascota (ideal: `document.title` al abrir modal; OG dinámico completo requiere SSR o meta tags por ruta — fase posterior)

### 2.8 Self-service para fundaciones — confirmado

Panel `/fundacion` (o `/panel`) con rol `foundation`:

- CRUD de **sus** mascotas
- Cambio de estado (`available`, `in_process`, `adopted`, `paused`)
- Ver donaciones reportadas hacia su fundación + confirmar/rechazar
- Gestionar reclamos de adopción + asignar adoptante
- Editar perfil de fundación (logo, WhatsApp, redes, link de donación)

Admin conserva acceso total + verificación de nuevas fundaciones vía `applications`.

### 2.9 Notificaciones — alcance revisado

~~“Notificar a la fundación cuando alguien postula”~~ **Fuera de alcance:** el adoptante ya contacta directo por WhatsApp. No hay botón de postulación in-app.

Notificaciones que **sí** tienen sentido:

| Evento | Canal | Destinatario |
|--------|-------|--------------|
| Nueva postulación de fundación/rescatista | Telegram / email | Equipo Paws (admin) — ya existe |
| Nueva donación reportada | Telegram (Edge Function) | Admin + opcional alerta a fundación |
| Reclamo de adopción pendiente | In-app / email futuro | Fundación |

---

## 3. Estado actual vs. objetivo

| Capacidad | Hoy | Objetivo |
|-----------|-----|----------|
| Catálogo + modal | ✅ | + compartir link |
| Postulación adopción | WhatsApp directo | Sin cambio |
| Favoritos | UI local falsa | localStorage real |
| Donaciones | Link directo / WhatsApp | Paso intermedio + tabla + rankings |
| Registro adoptantes | Login básico | Perfil + vitrina |
| Reclamos adopción | No existe | Tabla + flujo dual |
| Panel fundación | No existe | Self-service completo |
| Panel admin | ✅ ~90% | + donaciones + reclamos |
| `mark_pet_in_process` | Activo en código | Eliminar |
| Stats Home | 500+ / 25+ | 12 / 2 / 10 |
| Seguridad Telegram | Token en cliente | Edge Function (Fase 1) |

---

## 4. Plan por fases (actualizado)

> Ejecutar en orden. Cada fase cierra con criterios de aceptación verificables.

---

### Fase 0 — Verificación de infraestructura — ✅ COMPLETADA (2026-06-28)

**Objetivo:** saber con certeza qué hay en Supabase y dejar staging funcional.

- [x] Ejecutar checklist SQL del §1 contra el proyecto real (vía MCP)
- [x] Documentar resultado en **`docs/supabase-status.md`**
- [x] `delete_user_complete` creada (corrido `apply_fase0.sql`) ✔ verificado en BD
- [x] `mark_pet_in_process` eliminada de la BD ✔ verificado
- [x] Datos piloto cargados: **4 fundaciones, 12 mascotas (11 disponibles), 1 admin, 1 postulación, 4 adopciones** ✔
- [x] `npm run build && npm run lint` — pasan limpios
- [ ] Actualizar `README.md` raíz (sustituir template Vite) — pendiente menor

**Criterio:** ✅ infraestructura y datos reales presentes; admin puede operar; catálogo público muestra datos reales.

---

### Fase 1 — Quick wins de producto — ✅ COMPLETADA (frontend) (2026-06-28)

**Objetivo:** cambios acordados de bajo riesgo en el sitio público.

#### 1.1 Eliminar `mark_pet_in_process`
- [x] Quitar llamada RPC en `PetDetailModal.tsx` (+ import `supabase` sin uso)
- [ ] 🔒 Script SQL para DROP en Supabase (requiere escritura — ver Fase 0)
- [x] Copy del modal ya refleja solo lo que pone admin/fundación

#### 1.2 Stats realistas en Home
- [x] `Home.tsx`: 12 Adoptados · 2 Fundaciones aliadas · 10 Familias felices

#### 1.3 Favoritos en localStorage
- [x] Hook **`useFavorites`** (`useSyncExternalStore` → sincroniza en vivo entre tarjetas/modal/header)
- [x] Corazón conectado en tarjetas (`Adopt`, `Home`) y modal (sin login)
- [x] Página **`/favoritos`** (`FavoritesPage`) leyendo IDs + fetch de mascotas
- [x] Botón "Mis Favoritos" con contador en header desktop y móvil

#### 1.4 Compartir mascota
- [x] `AdoptPage` lee `?pet=` → abre modal (vía `usePet`, derivado sin efecto)
- [x] Botón compartir en modal (Web Share API + fallback copiar URL)
- [x] `document.title` dinámico al abrir modal + meta tags OG básicos en `index.html` (`lang="es"`)

**Criterio:** ✅ favoritos persisten al recargar; link compartido abre la mascota; stats realistas; el público ya no marca "en proceso". Build + lint limpios.

---

### Fase 2 — Donaciones reportadas + rankings — ✅ COMPLETADA (2026-06-28)

**Objetivo:** registrar intención de donación y habilitar top donadores.

> ⚠️ Requiere correr **`supabase/create_donation_reports_table.sql`** en el SQL Editor para que funcione (tabla + enum + RLS + RPC `top_donors`).

#### 2.1 Base de datos — ✅ (script listo para correr)
- [x] Migración `donation_reports` + enum `donation_status` → `supabase/create_donation_reports_table.sql`
- [x] RLS: insert público (no falsifica `profile_id`); lectura propia/fundación/admin; update admin+fundación
- [x] Índices por `foundation_id`, `profile_id`, `status`, `created_at`
- [x] RPC `top_donors(period, max_rows)` SECURITY DEFINER para rankings públicos

#### 2.2 UX en `/donar` — ✅
- [x] Modal intermedio (`DonationModal`): monto (COP, con chips rápidos) + nota
- [x] CTA "Continuar a donar" → insert `reported` → abrir enlace oficial / WhatsApp
- [x] Invitación suave a registrarse; nombre opcional para anónimos
- [x] Si autenticado, vincula `profile_id` automáticamente

#### 2.3 Rankings — ✅
- [x] Componente `TopDonors` en `/donar`: tabs "Este mes" / "Histórico"
- [x] Suma de `confirmed` por `profile_id` vía RPC `top_donors`
- [x] Muestra `full_name` (o "Anónimo")

#### 2.4 Panel admin — ✅
- [x] Sección "Donaciones" (`AdminDonations`): listar `reported` / `confirmed` / `rejected` + filtros
- [x] Acciones: confirmar, rechazar (con notas); registra `reviewed_by` / `reviewed_at`
- [x] Métricas: reportado pendiente + confirmado del mes + total registros
- [x] Agregada al menú del `AdminDashboard`

**Criterio:** ✅ flujo donación registra intención; admin confirma/rechaza; ranking solo muestra confirmadas. Build + lint limpios. Funciona end-to-end al correr `create_donation_reports_table.sql`.

---

### Fase 3 — Registro adoptante + reclamos de adopción — ✅ COMPLETADA (frontend) (2026-06-28)

**Objetivo:** usuarios registrados presumir adopciones; fundación valida.

> ⚠️ Requiere correr **`supabase/create_adoption_claims_table.sql`** (tabla + enum + RLS + trigger confirmar→adopted).

#### 3.1 Registro / login adoptante — ✅
- [x] Registro simple en `LoginModal` (toggle login/registro: nombre, email, password)
- [x] Header con sesión: avatar + menú (Mi perfil, Favoritos, Cerrar sesión; Panel si admin) — desktop y móvil
- [x] Adoptantes NO se redirigen al admin (solo admins van a `/admin`)

#### 3.2 Tabla `adoption_claims` — ✅ (script listo para correr)
- [x] Migración + RLS (adoptante crea/edita propio pending; fundación gestiona la suya; admin todo)
- [x] Trigger: al confirmar → mascota pasa a `adopted` (+ `adopted_at`)
- [ ] Subida de fotos a Storage (en flujo adoptante 3.3)

#### 3.3 Flujo adoptante — ✅
- [x] Desde el modal de mascota (con sesión): "¿Ya lo adoptaste?" → `ClaimAdoptionModal` con historia + fotos
- [x] Subida de fotos a Storage (`images/adoptions/{userId}/...`)
- [x] Estado `pending` hasta validación
- [x] Perfil `/perfil` (`ProfilePage`): vitrina con adopciones + donaciones + stats

#### 3.4 Gestión de reclamos — ✅ (vía admin; panel de fundación llega en Fase 4)
- [x] Sección admin "Reclamos" (`AdminClaims`): listar + filtros + ver historia/fotos
- [x] Confirmar → trigger marca la mascota `adopted`; Rechazar
- [ ] Asignar adoptante desde la fundación (iniciativa fundación) → Fase 4

**Criterio:** ✅ adoptante reclama adopción; admin confirma → mascota adoptada; perfil muestra vitrina. Build limpio. **Probado end-to-end en navegador (2026-06-28).**

> 🐛 Bug encontrado y corregido en pruebas: el modal de reclamo quedaba inerte por el focus-trap del `Dialog` de radix (el reclamo es un overlay hermano). Fix: el `Dialog` de la mascota se cierra mientras se muestra el reclamo (`open={isOpen && !showClaim}`).

---

### Fase 4 — Panel self-service fundaciones — ✅ COMPLETADA (2026-06-29)

**Objetivo:** fundaciones gestionan su operación sin depender del admin.

- [x] Ruta `/fundacion/*` + `ProtectedRoute requiredRole="foundation"`
- [x] Dashboard: resumen mascotas + reclamos/donaciones pendientes (con badges en el menú)
- [x] CRUD mascotas propias (`PetFormModal` con `lockedFoundationId`) — **probado en vivo (crear/editar/borrar)**
- [x] Cambio de estado de mascotas (selector en el form)
- [x] Gestión de `adoption_claims` (confirmar → mascota `adopted` vía trigger / rechazar)
- [x] Gestión de `donation_reports` (confirmar / rechazar)
- [x] Edición de perfil de fundación (`FoundationFormModal` con `selfEdit`: oculta "verificada" y selector de dueño) — **probado en vivo**
- [x] RLS: verificada — la fundación solo ve/edita sus filas (`foundation.profile_id = auth.uid()`)

> Hook `useMyFoundation`; panel `src/pages/foundation/FoundationDashboard.tsx`. Probado en navegador con cuenta empresa real (`Refugio Huellitas`). Build + lint limpios.
> 🐛 Bug encontrado y corregido en pruebas: `pets.main_photo_url` era `NOT NULL` y el form permitía crear sin foto (400). Fix aplicado en BD (`drop not null`, coherente con los fallbacks de emoji en la UI).

**Post-aprobación de `applications` (queda para Fase 5):**
- [ ] Edge Function: crear usuario + fundación + email credenciales (mejora sobre flujo manual actual)

**Criterio:** fundación verificada publica mascota, confirma adopción y revisa donación sin tocar admin.

---

### Fase 5 — Seguridad e infra producción — 🟡 EN CURSO (2026-06-29)

**Objetivo:** listo para tráfico real.

**Hecho en código (build + lint limpios; lint de todo `src` ahora en 0 errores):**
- [x] **Error boundary** (`src/components/ErrorBoundary.tsx`) envuelve la app + **404** (`src/pages/NotFound.tsx`, ruta `*`) — probado en navegador
- [x] **SEO**: `lang="es"`, meta description, OG (hecho en Fase 1.4)
- [x] **CI**: GitHub Actions `.github/workflows/ci.yml` (lint + build en push/PR a main)
- [x] Limpieza de 4 errores de lint pre-existentes (ui/contexts)

**Listo para que ejecutes (no requiere mi rewire previo):**
- [x] 📦 Edge Function Telegram: `supabase/functions/notify-telegram/index.ts` → deploy + secrets, luego rewire del cliente (lo aplico tras el deploy para no romper notificaciones)
- [x] 📦 Endurecer `is_verified` a nivel BD: `supabase/harden_is_verified.sql` (trigger: solo admin verifica)

**Pendiente (requiere deploy / cuentas externas):**
- [ ] Edge Function `admin-create-user` (service role) para reemplazar el `signUp` aislado del admin — la escribo cuando digas; el rewire de `AddUserModal` va después del deploy
- [ ] Endurecer Storage RLS (escritura por rol/carpeta en bucket `images`)
- [ ] Rate limit / honeypot en inserts públicos (`applications`, `donation_reports`)
- [ ] Deploy (Vercel/Netlify) + variables de entorno
- [ ] Sincronizar docs (`user-flows.md`, `database.md`, `api.md`)

**Criterio:** token Telegram no visible en bundle; deploy automatizado; documentación al día.

---

### Fase 6 — Crecimiento post-lanzamiento (continuo)

- [ ] OG dinámico por mascota (requiere SSR, Edge o servicio de meta tags)
- [ ] Galería múltiple en mascotas (`gallery_urls`)
- [ ] Badges y gamificación en perfiles
- [ ] PWA / cache offline del catálogo
- [ ] Analytics (Plausible/Umami)
- [ ] Historias de adopción destacadas en Home
- [ ] Paginación server-side si el volumen crece

---

## 5. Esquema de datos nuevo (resumen)

```
profiles
    ├── donation_reports (1:N)     ← intenciones de donación
    ├── adoption_claims (1:N)      ← reclamos de adopción
    └── foundations (1:1 si rol foundation)

foundations
    ├── pets (1:N)
    ├── donation_reports (1:N)
    └── adoption_claims (1:N, vía pets)

pets
    └── adoption_claims (1:N, idealmente 1 confirmed)
```

**Deprecar / no usar por ahora:**

- Tabla `favorites` → reemplazada por localStorage en cliente
- Tabla `adoptions` (flujo antiguo in-app) → evaluar migrar a `adoption_claims` o mantener legacy sin UI
- RPC `mark_pet_in_process` → eliminar

---

## 6. Orden de prioridad recomendado

```
Fase 0  →  Fase 1  →  Fase 2  →  Fase 3  →  Fase 4  →  Fase 5  →  Fase 6
  │          │           │           │           │
  │          │           │           │           └── Self-service fundaciones (bloqueante para escalar)
  │          │           │           └── Registro + reclamos adopción
  │          │           └── Donaciones + top donadores
  │          └── Quick wins (share, favoritos, stats, quitar RPC)
  └── Verificar Supabase de verdad
```

**MVP mínimo para anunciar en Pasto:** Fases 0 + 1 + 4 (catálogo pulido + fundaciones autónomas).  
**MVP con comunidad y donaciones:** añadir Fases 2 + 3 antes del anuncio amplio.

---

## 7. Veredicto actualizado

| Escenario | ¿Listo? | Requiere |
|-----------|---------|----------|
| Piloto con 1–2 fundaciones gestionadas 100% por admin | Casi | Fase 0 + 1 |
| Lanzamiento con fundaciones self-service | No | Fases 0–1–4 |
| Plataforma con donadores top + perfiles adoptantes | No | Fases 0–3 |
| Producción segura | No | Fase 5 |

---

## 8. Changelog de este documento

| Fecha | Cambio |
|-------|--------|
| 2026-06-28 | Plan inicial post-auditoría, alineado con decisiones de producto: localStorage favoritos, donaciones reportadas, reclamos adopción, eliminar `mark_pet_in_process`, share links, stats realistas, self-service fundaciones, aclaración sobre scripts SQL |
