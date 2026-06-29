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

### Fase 0 — Verificación de infraestructura (1–2 días)

**Objetivo:** saber con certeza qué hay en Supabase y dejar staging funcional.

- [ ] Ejecutar checklist SQL del §1 contra el proyecto real
- [ ] Documentar resultado en `docs/supabase-status.md` (tablas, RPCs, buckets, políticas)
- [ ] Aplicar scripts faltantes: `create_applications_table.sql`, `admin_rls_policies.sql`, `fix_rls_policies.sql`, trigger de perfiles
- [ ] **No aplicar** `mark_pet_in_process.sql` en entornos nuevos; planificar DROP en existentes
- [ ] Cargar datos piloto: 2 fundaciones, ~10 mascotas, 1 admin
- [ ] `npm install && npm run build && npm run lint`
- [ ] Actualizar `README.md` raíz (sustituir template Vite)

**Criterio:** admin puede CRUD mascotas/fundaciones; catálogo público muestra datos reales.

---

### Fase 1 — Quick wins de producto (3–5 días)

**Objetivo:** cambios acordados de bajo riesgo en el sitio público.

#### 1.1 Eliminar `mark_pet_in_process`
- [ ] Quitar llamada RPC en `PetDetailModal.tsx`
- [ ] Script SQL para DROP en Supabase si ya existía
- [ ] Revisar copy del modal (“en proceso” solo refleja lo que ponga admin/fundación)

#### 1.2 Stats realistas en Home
- [ ] Cambiar a: 12 adoptados · 2 fundaciones · 10 familias felices (o labels acordados)

#### 1.3 Favoritos en localStorage
- [ ] Hook `useFavoritePets()` sobre `useLocalStorage<string[]>` (IDs de mascotas)
- [ ] Conectar corazón en tarjetas y modal (sin login)
- [ ] Página o drawer `/favoritos` leyendo IDs + fetch de mascotas
- [ ] Botón “Mis Favoritos” en header móvil/desktop

#### 1.4 Compartir mascota
- [ ] Leer `?pet=` en `AdoptPage` → abrir modal
- [ ] Botón compartir (Web Share API + fallback copiar URL)
- [ ] Actualizar `document.title` al abrir modal

**Criterio:** favoritos persisten al recargar; link compartido abre la mascota; stats muestran valores realistas; nadie puede marcar “en proceso” desde el público.

---

### Fase 2 — Donaciones reportadas + rankings (1 semana)

**Objetivo:** registrar intención de donación y habilitar top donadores.

#### 2.1 Base de datos
- [ ] Migración `donation_reports` + enum `donation_status`
- [ ] RLS: insert público (anon + auth); lectura propia si autenticado; gestión admin + fundación dueña
- [ ] Índices por `foundation_id`, `profile_id`, `status`, `created_at`

#### 2.2 UX en `/donar`
- [ ] Modal intermedio antes de link de pago / WhatsApp: monto (COP) + nota
- [ ] CTA “Continuar a donar” → insert `reported` → abrir enlace externo
- [ ] Invitación suave a registrarse: “¿Quieres aparecer en top donadores? Crea tu cuenta”
- [ ] Si autenticado, vincular `profile_id` automáticamente

#### 2.3 Rankings
- [ ] Sección en `/donar` o `/nosotros`: tabs “Del mes” / “Histórico”
- [ ] Query: suma de montos `confirmed` agrupados por `profile_id`
- [ ] Mostrar nombre público del perfil (campo `display_name` o `full_name`)

#### 2.4 Panel admin
- [ ] Sección “Donaciones”: listar `reported` / `confirmed` / `rejected`
- [ ] Acciones: confirmar, rechazar (con notas)
- [ ] Métricas: total reportado vs confirmado del mes

**Criterio:** flujo donación registra intención; admin confirma manualmente; ranking solo muestra confirmadas.

---

### Fase 3 — Registro adoptante + reclamos de adopción (1–1.5 semanas)

**Objetivo:** usuarios registrados presumir adopciones; fundación valida.

#### 3.1 Registro / login adoptante (sin fricción forzada)
- [ ] Registro simple: email, password, nombre, foto opcional
- [ ] Header: si hay sesión adoptante → avatar, “Mi perfil”, logout
- [ ] No redirigir adoptantes al admin

#### 3.2 Tabla `adoption_claims`
- [ ] Migración + RLS (adoptante crea/edita propio pending; fundación gestiona de su fundación; admin todo)
- [ ] Subida de fotos a Storage

#### 3.3 Flujo adoptante
- [ ] Desde modal o perfil: “¡Adopté a [nombre]!” → formulario + fotos
- [ ] Estado `pending` hasta validación
- [ ] Perfil `/perfil` o `/mi-cuenta`: adopciones confirmadas, donaciones, stats

#### 3.4 Flujo fundación (parcial — completa en Fase 4)
- [ ] Ver reclamos pendientes
- [ ] Confirmar → pet `adopted` + claim `confirmed`
- [ ] Rechazar con motivo
- [ ] Asignar adoptante a mascota (iniciativa fundación)

**Criterio:** adoptante reclama adopción; fundación confirma; mascota pasa a adoptada; perfil muestra vitrina.

---

### Fase 4 — Panel self-service fundaciones (1.5–2 semanas)

**Objetivo:** fundaciones gestionan su operación sin depender del admin.

- [ ] Ruta `/fundacion/*` + `ProtectedRoute requiredRole="foundation"`
- [ ] Dashboard: resumen mascotas, reclamos pendientes, donaciones reportadas
- [ ] CRUD mascotas propias (reutilizar/adaptar `PetFormModal`)
- [ ] Cambio de estado de mascotas
- [ ] Gestión completa de `adoption_claims`
- [ ] Gestión de `donation_reports` (confirmar / rechazar)
- [ ] Edición de perfil de fundación
- [ ] RLS: fundación solo ve/edita filas donde `foundation.profile_id = auth.uid()`

**Post-aprobación de `applications`:**
- [ ] Edge Function: crear usuario + fundación + email credenciales (mejora sobre flujo manual actual)

**Criterio:** fundación verificada publica mascota, confirma adopción y revisa donación sin tocar admin.

---

### Fase 5 — Seguridad e infra producción (1 semana)

**Objetivo:** listo para tráfico real.

- [ ] Edge Function para Telegram (eliminar `VITE_TELEGRAM_BOT_TOKEN` del cliente)
- [ ] Edge Function `createUser` para admin (reemplazar `signUp` aislado)
- [ ] Endurecer Storage RLS (escritura por rol/carpeta)
- [ ] Rate limit / honeypot en inserts públicos (`applications`, `donation_reports`)
- [ ] CI: GitHub Actions (build + lint)
- [ ] Deploy (Vercel/Netlify) + variables de entorno
- [ ] SEO: `lang="es"`, meta description, OG estático mínimo
- [ ] Error boundaries + 404
- [ ] Sincronizar docs (`user-flows.md`, `database.md`, `api.md`) con decisiones de este plan

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
