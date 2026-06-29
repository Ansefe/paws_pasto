# Resumen de implementación — Fases 1 a 6

> Última actualización: 2026-06-29
> Estado: Fases 0–4 completas y probadas en navegador · Fase 5 (código listo, infra pendiente de deploy) · Fase 6 iniciada (features sin deploy hechas)
> Plan maestro: [`docs/launch-plan.md`](./launch-plan.md) · Estado de la BD: [`docs/supabase-status.md`](./supabase-status.md)

---

## 1. Qué se hizo por fase

### Fase 0 — Infraestructura ✅
- Verificación real de Supabase (tablas, RLS, RPCs, buckets, advisors) → `docs/supabase-status.md`.
- Creada RPC `delete_user_complete`; eliminada `mark_pet_in_process`; datos piloto cargados.
- Corregido el tipado `never` del cliente Supabase en `src/types/database.types.ts` (faltaban `Relationships`, `Views`, `Functions`).

### Fase 1 — Quick wins ✅
- **Favoritos** sin login en `localStorage` (`src/hooks/useFavorites.ts`), contador en header, página `/favoritos`.
- **Compartir mascota**: deep-link `/adoptar?pet={id}` abre el modal + Web Share / copiar enlace; `document.title` dinámico; meta OG y `lang="es"` en `index.html`.
- **Stats reales** en Home (12 / 2 / 10).
- Eliminada la llamada al RPC inseguro `mark_pet_in_process` del cliente.
- **Logout** funcional y **perfil real** del admin en el panel; bug de sesión al crear usuario mitigado con cliente Supabase aislado (`createIsolatedClient`).

### Fase 2 — Donaciones ✅
- `DonationModal`: registra la intención (`donation_reports`, estado `reported`) y redirige al canal oficial.
- Rankings de top donadores (`TopDonors` + RPC `top_donors`) en `/donar`.
- Sección admin **Donaciones** (`AdminDonations`): confirmar / rechazar + métricas.

### Fase 3 — Registro + reclamos ✅
- Registro de adoptantes (toggle en `LoginModal`) y **sesión en el header** (avatar + menú: perfil, favoritos, panel, logout).
- Reclamo de adopción **"¡Ya lo adopté!"** (`ClaimAdoptionModal`) con subida de fotos a Storage.
- Página `/perfil` (vitrina: adopciones + donaciones + stats).
- Sección admin **Reclamos** (`AdminClaims`): confirmar (→ trigger marca la mascota `adopted`) / rechazar.

### Fase 4 — Panel self-service de fundaciones ✅
- Ruta `/fundacion` protegida (rol `foundation`), hook `useMyFoundation`.
- `FoundationDashboard`: Resumen, **Mis Mascotas** (CRUD propio), **Reclamos**, **Donaciones**, **Mi Perfil** (editar sin poder auto-verificarse).
- Probado end-to-end con cuenta empresa real (ver §4).

### Fase 5 — Seguridad e infra 🟡 (código listo; infra pendiente de deploy)
- **Hecho en código**: `ErrorBoundary`, página **404**, **CI** (`.github/workflows/ci.yml`: lint + build), limpieza de lint a 0 errores.
- **Listo para ejecutar/deploy** (ver §3): Edge Function de Telegram, SQL de hardening de `is_verified` (ya aplicado).

### Fase 6 — Crecimiento 🟡 (continuo; hecho lo que no requiere deploy)
- **Galería múltiple** de fotos (`gallery_urls`) en `PetFormModal` (admin + fundación).
- **Badges / gamificación** en `/perfil` (Familia Paws, Donador, etc.).

---

## 2. Bugs encontrados y corregidos durante las pruebas
1. **Modal de reclamo inerte**: el `Dialog` de radix dejaba inerte el overlay del reclamo (focus-trap). Fix: el modal de mascota se cierra mientras se muestra el reclamo.
2. **`pets.main_photo_url` era `NOT NULL`**: crear mascota sin foto daba error 400. Fix: columna ahora nullable (coherente con los fallbacks de emoji en la UI).
3. **Tipado `never` del cliente Supabase**: corregido el shape de `database.types.ts`.

---

## 3. Acciones pendientes (requieren deploy / SQL / cuentas externas)

### SQL ya aplicado ✅
- `supabase/apply_fase0.sql`, `create_donation_reports_table.sql`, `create_adoption_claims_table.sql`, `harden_is_verified.sql`, y `ALTER ... main_photo_url DROP NOT NULL`.

### Por deployar / aplicar
- **Edge Function Telegram** (`supabase/functions/notify-telegram/index.ts`):
  ```
  supabase functions deploy notify-telegram --no-verify-jwt
  supabase secrets set TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=yyy
  ```
  Tras el deploy, reconectar el cliente (`src/lib/telegram.ts`) para dejar de exponer `VITE_TELEGRAM_BOT_TOKEN`.
- **Edge Function `admin-create-user`** (service role) para reemplazar el `signUp` aislado del admin (pendiente de escribir + deploy).
- **Storage RLS**: restringir escritura por carpeta/rol en el bucket `images`.
- **Rate limit / honeypot** en inserts públicos (`applications`, `donation_reports`).
- **Hosting**: deploy a Vercel/Netlify + variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) y secrets en GitHub Actions.

### Features de Fase 6 que faltan (continuas)
- Historias de adopción reales en Home (requiere RPC público de claims `confirmed`).
- OG dinámico por mascota (SSR/Edge), PWA/offline, Analytics, paginación server-side.

---

## 4. Cuenta de prueba creada
- **Empresa/fundación**: `refugio.huellitas@paws-demo.com` / `Huellitas2026` → fundación "Refugio Huellitas" (verificada).
- Datos de prueba dejados en BD durante las pruebas: una donación confirmada y un reclamo confirmado del admin (mascota "Luna" quedó `adopted`). Se pueden limpiar si se desea.

---

## 5. Checklist de pruebas manuales (QA)

### Público / adoptante
- [ ] Home: stats correctas; mascotas destacadas cargan; favorito ❤ persiste al recargar.
- [ ] `/adoptar`: catálogo real, filtros, abrir modal, **Compartir** (Web Share / copiar).
- [ ] Deep-link `/adoptar?pet={id}` abre el modal correcto.
- [ ] `/favoritos`: muestra lo guardado; quitar funciona.
- [ ] Registro de adoptante → sesión con avatar; `/perfil` muestra vitrina + badges.
- [ ] `/donar`: modal de donación → registra y redirige; rankings muestran confirmadas.
- [ ] Modal de mascota → "¡Ya lo adopté!" crea reclamo (con fotos).

### Admin (`/admin`)
- [ ] Login admin redirige al panel; logout funciona.
- [ ] Usuarios: crear (sin perder sesión), editar, eliminar.
- [ ] Donaciones: confirmar/rechazar (confirmar suma al ranking).
- [ ] Reclamos: confirmar (mascota pasa a `adopted`) / rechazar.
- [ ] Solicitudes, Fundaciones, Mascotas, Configuración.

### Fundación (`/fundacion`)
- [ ] Login fundación → "Mi panel"; acceso solo a lo suyo (RLS).
- [ ] Mis Mascotas: crear / editar / borrar (con foto principal + **galería**).
- [ ] Reclamos y Donaciones de su fundación: confirmar/rechazar.
- [ ] Mi Perfil: editar (no debe poder auto-verificarse).

### Robustez
- [ ] Ruta inexistente → página 404.
- [ ] Error de render → ErrorBoundary (no pantalla en blanco).

---

## 6. Notas de seguridad
- `.env*` y `.mcp.json` están en `.gitignore` (no se versionan).
- `is_verified` blindado a nivel BD (trigger): solo admin verifica.
- Pendiente para producción: sacar el token de Telegram del bundle (Edge Function), endurecer Storage RLS y rate-limit (Fase 5).
