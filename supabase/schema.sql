-- =====================================================
-- Paws Pasto Adopciones - Schema de Base de Datos para Supabase
-- =====================================================
-- Este script crea todas las tablas, enums y relaciones
-- necesarias para la plataforma de adopción de animales.
-- 
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUM
-- =====================================================
-- Definimos los tipos personalizados antes de usarlos en las tablas

-- Roles de usuario en la plataforma
CREATE TYPE user_role AS ENUM ('adopter', 'foundation', 'admin');

-- Especies de mascotas (expandible en el futuro)
CREATE TYPE pet_species AS ENUM ('dog', 'cat');

-- Género de la mascota
CREATE TYPE pet_gender AS ENUM ('male', 'female');

-- Tamaño de la mascota
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');

-- Estado de disponibilidad de la mascota
CREATE TYPE pet_status AS ENUM ('available', 'in_process', 'adopted');

-- Estado de la solicitud de adopción
CREATE TYPE adoption_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');


-- =====================================================
-- 2. TABLA: profiles
-- =====================================================
-- Extiende la tabla auth.users de Supabase con datos públicos del usuario.
-- Se crea automáticamente cuando un usuario se registra mediante un trigger.

CREATE TABLE profiles (
  -- PK que referencia al usuario en auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información básica del perfil
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  
  -- Rol del usuario en la plataforma
  role user_role NOT NULL DEFAULT 'adopter',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por rol
CREATE INDEX idx_profiles_role ON profiles(role);

-- Comentario de la tabla
COMMENT ON TABLE profiles IS 'Perfiles públicos de usuarios, extiende auth.users de Supabase';
COMMENT ON COLUMN profiles.role IS 'Rol: adopter (adoptante), foundation (fundación), admin (administrador)';


-- =====================================================
-- 3. TABLA: foundations
-- =====================================================
-- Información adicional para usuarios con rol 'foundation'.
-- Contiene datos de contacto y verificación de la fundación.

CREATE TABLE foundations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con el perfil del usuario (1:1)
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Información de la fundación
  foundation_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  
  -- Ubicación (enfocados en Pasto, Nariño)
  location_city TEXT NOT NULL DEFAULT 'Pasto',
  location_address TEXT,
  
  -- Contacto directo - WhatsApp para el "contacto rápido" sin login
  whatsapp_number TEXT,
  email TEXT,
  website_url TEXT,
  
  -- Estado de verificación por admin
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Link para donaciones (Nequi, Daviplata, etc.)
  donation_link TEXT,
  
  -- Redes sociales
  instagram_url TEXT,
  facebook_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_foundations_verified ON foundations(is_verified);
CREATE INDEX idx_foundations_city ON foundations(location_city);

COMMENT ON TABLE foundations IS 'Datos adicionales de fundaciones/rescatistas de animales';
COMMENT ON COLUMN foundations.whatsapp_number IS 'Número para contacto directo vía WhatsApp (sin requerir login)';
COMMENT ON COLUMN foundations.is_verified IS 'Indica si la fundación ha sido verificada por un administrador';


-- =====================================================
-- 4. TABLA: pets
-- =====================================================
-- Los protagonistas de la plataforma: los animales en adopción.

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fundación que tiene al animal
  foundation_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  
  -- Información básica
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT, -- Raza (puede ser 'Mestizo' o vacío)
  
  -- Edad aproximada (ej: "2 años", "6 meses", "Cachorro")
  age_approx TEXT,
  
  -- Características físicas
  gender pet_gender NOT NULL,
  size pet_size NOT NULL,
  
  -- Historia y descripción para conectar emocionalmente
  description_story TEXT,
  
  -- Características especiales (para filtros futuros)
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_sterilized BOOLEAN DEFAULT FALSE,
  is_dewormed BOOLEAN DEFAULT FALSE,
  good_with_kids BOOLEAN,
  good_with_pets BOOLEAN,
  special_needs TEXT, -- Si tiene alguna condición especial
  
  -- Fotos
  main_photo_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}', -- Array de URLs de fotos adicionales
  
  -- Estado de adopción
  status pet_status NOT NULL DEFAULT 'available',
  
  -- Fecha en que fue adoptado (si aplica)
  adopted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas y filtros frecuentes
CREATE INDEX idx_pets_foundation ON pets(foundation_id);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_size ON pets(size);
CREATE INDEX idx_pets_created ON pets(created_at DESC);

-- Índice compuesto para el catálogo principal
CREATE INDEX idx_pets_catalog ON pets(status, species, size, created_at DESC);

COMMENT ON TABLE pets IS 'Mascotas disponibles para adopción';
COMMENT ON COLUMN pets.age_approx IS 'Edad aproximada en texto libre (ej: "2 años", "Cachorro")';
COMMENT ON COLUMN pets.description_story IS 'Historia de la mascota para conectar emocionalmente con adoptantes';
COMMENT ON COLUMN pets.gallery_urls IS 'Array de URLs de fotos adicionales de la mascota';


-- =====================================================
-- 5. TABLA: favorites
-- =====================================================
-- Lista de mascotas favoritas de cada usuario.
-- Implementa el "corazón" de las tarjetas de mascotas.

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario que marcó como favorito
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Mascota marcada
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Un usuario solo puede marcar una vez cada mascota
  UNIQUE(profile_id, pet_id)
);

-- Índices
CREATE INDEX idx_favorites_profile ON favorites(profile_id);
CREATE INDEX idx_favorites_pet ON favorites(pet_id);

COMMENT ON TABLE favorites IS 'Mascotas guardadas como favoritas por los usuarios';


-- =====================================================
-- 6. TABLA: adoptions (Solicitudes de Adopción)
-- =====================================================
-- Registro de solicitudes de adopción formales.
-- Se crea cuando un usuario logueado inicia el proceso de adopción.

CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Mascota solicitada
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Usuario adoptante
  adopter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Fundación (desnormalizado para consultas más fáciles)
  foundation_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  
  -- Estado del proceso
  status adoption_status NOT NULL DEFAULT 'pending',
  
  -- Mensaje inicial del adoptante (motivación)
  adopter_message TEXT,
  
  -- Notas internas de la fundación
  foundation_notes TEXT,
  
  -- Razón de rechazo (si aplica)
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Fecha de resolución (aprobada o rechazada)
  resolved_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_adoptions_pet ON adoptions(pet_id);
CREATE INDEX idx_adoptions_adopter ON adoptions(adopter_id);
CREATE INDEX idx_adoptions_foundation ON adoptions(foundation_id);
CREATE INDEX idx_adoptions_status ON adoptions(status);

-- Evitar múltiples solicitudes activas del mismo usuario para la misma mascota
CREATE UNIQUE INDEX idx_adoptions_unique_active 
ON adoptions(pet_id, adopter_id) 
WHERE status = 'pending';

COMMENT ON TABLE adoptions IS 'Solicitudes de adopción formales realizadas a través de la plataforma';


-- =====================================================
-- 7. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at en cada tabla
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foundations_updated_at
  BEFORE UPDATE ON foundations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoptions_updated_at
  BEFORE UPDATE ON adoptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 8. FUNCIÓN: Crear perfil automáticamente al registrarse
-- =====================================================
-- Este trigger crea un perfil básico cuando un usuario se registra en Supabase Auth

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de insertar en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Habilitamos RLS en todas las tablas para seguridad

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foundations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;

-- ----- PROFILES -----
-- Todos pueden ver perfiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- Usuarios pueden editar su propio perfil
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- ----- FOUNDATIONS -----
-- Todos pueden ver fundaciones verificadas
CREATE POLICY "Verified foundations are viewable by everyone" 
ON foundations FOR SELECT USING (is_verified = true);

-- Fundaciones pueden ver y editar su propio registro
CREATE POLICY "Foundations can view own data" 
ON foundations FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Foundations can update own data" 
ON foundations FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can create foundation profile" 
ON foundations FOR INSERT WITH CHECK (profile_id = auth.uid());

-- ----- PETS -----
-- Todos pueden ver mascotas de fundaciones verificadas
CREATE POLICY "Pets from verified foundations are viewable" 
ON pets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM foundations 
    WHERE foundations.id = pets.foundation_id 
    AND foundations.is_verified = true
  )
);

-- Fundaciones pueden gestionar sus propias mascotas
CREATE POLICY "Foundations can manage own pets" 
ON pets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM foundations 
    WHERE foundations.id = pets.foundation_id 
    AND foundations.profile_id = auth.uid()
  )
);

-- ----- FAVORITES -----
-- Usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites" 
ON favorites FOR SELECT USING (profile_id = auth.uid());

-- Usuarios pueden agregar/eliminar sus propios favoritos
CREATE POLICY "Users can manage own favorites" 
ON favorites FOR ALL USING (profile_id = auth.uid());

-- ----- ADOPTIONS -----
-- Adoptantes pueden ver sus propias solicitudes
CREATE POLICY "Adopters can view own applications" 
ON adoptions FOR SELECT USING (adopter_id = auth.uid());

-- Fundaciones pueden ver solicitudes de sus mascotas
CREATE POLICY "Foundations can view applications for their pets" 
ON adoptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM foundations 
    WHERE foundations.id = adoptions.foundation_id 
    AND foundations.profile_id = auth.uid()
  )
);

-- Usuarios pueden crear solicitudes
CREATE POLICY "Users can create adoption applications" 
ON adoptions FOR INSERT WITH CHECK (adopter_id = auth.uid());

-- Fundaciones pueden actualizar estado de solicitudes
CREATE POLICY "Foundations can update application status" 
ON adoptions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM foundations 
    WHERE foundations.id = adoptions.foundation_id 
    AND foundations.profile_id = auth.uid()
  )
);


-- =====================================================
-- 10. DATOS INICIALES DE EJEMPLO (Opcional)
-- =====================================================
-- Descomenta estas líneas para insertar datos de prueba

/*
-- Insertar fundación de ejemplo (requiere un usuario existente)
INSERT INTO foundations (profile_id, foundation_name, description, whatsapp_number, is_verified)
VALUES (
  'uuid-del-usuario-fundacion', 
  'Patitas Felices Pasto', 
  'Rescatamos y rehabilitamos animales en situación de calle en Pasto y alrededores.',
  '573001234567',
  true
);

-- Insertar mascota de ejemplo
INSERT INTO pets (foundation_id, name, species, breed, age_approx, gender, size, description_story, main_photo_url, status)
VALUES (
  'uuid-de-la-fundacion',
  'Luna',
  'dog',
  'Mestiza',
  '2 años',
  'female',
  'medium',
  'Luna fue rescatada de las calles cuando era cachorra. Es muy cariñosa, juguetona y le encanta dar paseos. Busca una familia que le dé mucho amor.',
  'https://example.com/luna.jpg',
  'available'
);
*/


-- =====================================================
-- ¡Schema creado exitosamente! 🐾
-- =====================================================
