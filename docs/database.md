# 🗄️ Base de Datos (Supabase)

## Visión General

Paws usa **Supabase** como backend, que proporciona:
- PostgreSQL como base de datos relacional
- Autenticación integrada (auth.users)
- Row Level Security (RLS) para control de acceso
- Triggers y funciones para automatización

---

## Diagrama Entidad-Relación

```
┌─────────────────┐
│   auth.users    │  (Supabase Auth)
│─────────────────│
│ id (UUID) PK    │
│ email           │
│ ...             │
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │
│─────────────────│
│ id (UUID) PK FK │───────────────────────┐
│ full_name       │                       │
│ avatar_url      │                       │
│ phone           │                       │
│ role            │                       │
│ created_at      │                       │
│ updated_at      │                       │
└────────┬────────┘                       │
         │ 1:1 (if foundation)            │
         ▼                                │
┌─────────────────┐                       │
│  foundations    │                       │
│─────────────────│                       │
│ id (UUID) PK    │                       │
│ profile_id FK   │───────────────────────┤
│ foundation_name │                       │
│ description     │                       │
│ logo_url        │                       │
│ location_city   │                       │
│ whatsapp_number │                       │
│ is_verified     │                       │
│ donation_link   │                       │
│ instagram_url   │                       │
│ facebook_url    │                       │
│ ...             │                       │
└────────┬────────┘                       │
         │ 1:N                            │
         ▼                                │
┌─────────────────┐                       │
│      pets       │                       │
│─────────────────│                       │
│ id (UUID) PK    │◄──────────────────────┤
│ foundation_id FK│                       │
│ name            │                       │
│ species         │                       │
│ breed           │                       │
│ age_approx      │                       │
│ gender          │                       │
│ size            │                       │
│ description     │                       │
│ main_photo_url  │                       │
│ gallery_urls[]  │                       │
│ status          │                       │
│ is_vaccinated   │                       │
│ is_sterilized   │                       │
│ ...             │                       │
└────────┬────────┘                       │
         │                                │
    ┌────┴────┐                           │
    │         │                           │
    ▼         ▼                           │
┌────────┐ ┌──────────┐                   │
│favorites│ │adoptions │                   │
│────────│ │──────────│                   │
│id PK   │ │id PK     │                   │
│pet_id  │ │pet_id FK │                   │
│profile │ │adopter FK│───────────────────┘
│        │ │found. FK │
│        │ │status    │
│        │ │message   │
└────────┘ └──────────┘
```

---

## Enums (Tipos Personalizados)

```sql
-- Roles de usuario
CREATE TYPE user_role AS ENUM ('adopter', 'foundation', 'admin');

-- Especie de mascota
CREATE TYPE pet_species AS ENUM ('dog', 'cat');

-- Género de mascota
CREATE TYPE pet_gender AS ENUM ('male', 'female');

-- Tamaño de mascota
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');

-- Estado de mascota
CREATE TYPE pet_status AS ENUM ('available', 'in_process', 'adopted', 'paused');

-- Estado de solicitud de adopción
CREATE TYPE adoption_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
```

---

## Tablas

### profiles
Extiende `auth.users` con información adicional del perfil.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | - | FK a auth.users |
| full_name | TEXT | Sí | - | Nombre completo |
| avatar_url | TEXT | Sí | - | URL de foto de perfil |
| phone | VARCHAR(20) | Sí | - | Teléfono |
| role | user_role | No | 'adopter' | Rol del usuario |
| created_at | TIMESTAMPTZ | No | NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | No | NOW() | Última actualización |

**Trigger**: Se crea automáticamente al registrar un usuario en Auth.

---

### foundations
Información de fundaciones de rescate animal.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | PK |
| profile_id | UUID | No | - | FK a profiles |
| foundation_name | VARCHAR(200) | No | - | Nombre de la fundación |
| description | TEXT | Sí | - | Descripción |
| logo_url | TEXT | Sí | - | URL del logo |
| location_city | VARCHAR(100) | No | - | Ciudad |
| location_address | TEXT | Sí | - | Dirección física |
| whatsapp_number | VARCHAR(20) | Sí | - | WhatsApp (con código de país) |
| email | VARCHAR(255) | Sí | - | Email de contacto |
| is_verified | BOOLEAN | No | FALSE | ¿Está verificada? |
| verified_at | TIMESTAMPTZ | Sí | - | Fecha de verificación |
| donation_link | TEXT | Sí | - | Link para donaciones |
| instagram_url | TEXT | Sí | - | URL de Instagram |
| facebook_url | TEXT | Sí | - | URL de Facebook |
| website_url | TEXT | Sí | - | URL del sitio web |

---

### pets
Mascotas disponibles para adopción.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | PK |
| foundation_id | UUID | No | - | FK a foundations |
| name | VARCHAR(100) | No | - | Nombre |
| species | pet_species | No | - | Especie (dog/cat) |
| breed | VARCHAR(100) | Sí | - | Raza |
| age_approx | VARCHAR(50) | Sí | - | Edad aproximada (texto libre) |
| gender | pet_gender | No | - | Género |
| size | pet_size | No | - | Tamaño |
| description_story | TEXT | Sí | - | Historia/descripción |
| is_vaccinated | BOOLEAN | No | FALSE | ¿Vacunado? |
| is_sterilized | BOOLEAN | No | FALSE | ¿Esterilizado? |
| is_dewormed | BOOLEAN | No | FALSE | ¿Desparasitado? |
| good_with_kids | BOOLEAN | Sí | - | ¿Bueno con niños? |
| good_with_pets | BOOLEAN | Sí | - | ¿Bueno con otras mascotas? |
| special_needs | TEXT | Sí | - | Necesidades especiales |
| main_photo_url | TEXT | Sí | - | Foto principal |
| gallery_urls | TEXT[] | Sí | - | Array de fotos adicionales |
| status | pet_status | No | 'available' | Estado |

---

### favorites
Lista de favoritos de usuarios.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | PK |
| profile_id | UUID | No | - | FK a profiles |
| pet_id | UUID | No | - | FK a pets |
| created_at | TIMESTAMPTZ | No | NOW() | Fecha |

**Constraint**: UNIQUE(profile_id, pet_id) - No duplicados

---

### adoptions
Solicitudes de adopción.

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | PK |
| pet_id | UUID | No | - | FK a pets |
| adopter_id | UUID | No | - | FK a profiles |
| foundation_id | UUID | No | - | FK a foundations |
| status | adoption_status | No | 'pending' | Estado |
| adopter_message | TEXT | Sí | - | Mensaje del adoptante |
| foundation_notes | TEXT | Sí | - | Notas internas |
| rejection_reason | TEXT | Sí | - | Razón de rechazo |
| resolved_at | TIMESTAMPTZ | Sí | - | Fecha de resolución |

---

## Triggers y Funciones

### Auto-crear perfil al registrarse
```sql
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Auto-actualizar updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS)

### profiles
```sql
-- Todos pueden ver perfiles
CREATE POLICY "Public profiles viewable" ON profiles
  FOR SELECT USING (true);

-- Usuarios pueden editar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### pets
```sql
-- Todos pueden ver mascotas
CREATE POLICY "Public pets viewable" ON pets
  FOR SELECT USING (true);

-- Solo fundaciones pueden crear/editar sus mascotas
CREATE POLICY "Foundations manage own pets" ON pets
  FOR ALL USING (
    foundation_id IN (
      SELECT id FROM foundations WHERE profile_id = auth.uid()
    )
  );
```

---

## Índices

```sql
-- Búsqueda de mascotas por especie
CREATE INDEX idx_pets_species ON pets(species);

-- Búsqueda de mascotas por estado
CREATE INDEX idx_pets_status ON pets(status);

-- Mascotas por fundación
CREATE INDEX idx_pets_foundation ON pets(foundation_id);

-- Fundaciones verificadas
CREATE INDEX idx_foundations_verified ON foundations(is_verified);
```

---

## Queries Comunes

### Obtener mascotas con info de fundación
```sql
SELECT 
  p.*,
  f.foundation_name,
  f.location_city,
  f.whatsapp_number
FROM pets p
JOIN foundations f ON p.foundation_id = f.id
WHERE p.status IN ('available', 'in_process')
ORDER BY p.created_at DESC;
```

### Contar mascotas por fundación
```sql
SELECT 
  f.id,
  f.foundation_name,
  COUNT(p.id) as pet_count
FROM foundations f
LEFT JOIN pets p ON p.foundation_id = f.id
  AND p.status IN ('available', 'in_process')
GROUP BY f.id;
```

---

## Archivos SQL

| Archivo | Propósito |
|---------|-----------|
| `supabase/schema.sql` | DDL completo (tablas, enums, triggers, RLS) |
| `supabase/seed.sql` | Datos de prueba |
| `supabase/fix_auth_trigger.sql` | Corrección para trigger de auth |
