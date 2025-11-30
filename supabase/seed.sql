-- =====================================================
-- HogarPeludo - Datos de Prueba (Seed)
-- =====================================================
-- Este script inserta datos de ejemplo para probar
-- todas las funcionalidades de la plataforma.
-- 
-- IMPORTANTE: Ejecutar DESPUÉS de schema.sql
-- =====================================================

-- =====================================================
-- 1. USUARIOS DE PRUEBA
-- =====================================================
-- Nota: En Supabase, primero debes crear usuarios en Auth.
-- Estos UUIDs son ejemplos. En producción, los UUIDs vendrán
-- de auth.users cuando los usuarios se registren.
-- 
-- Para pruebas, puedes crear usuarios manualmente en el
-- dashboard de Supabase Auth y luego usar sus UUIDs aquí.
-- =====================================================

-- UUIDs de ejemplo (reemplazar con UUIDs reales de auth.users)
-- Usuario Admin
DO $$
DECLARE
  -- UUIDs válidos (solo caracteres hexadecimales: 0-9, a-f)
  admin_id UUID := 'c7df08eb-7f59-4126-ae54-e5c636aedf3d';
  foundation1_id UUID := 'f05703f0-a142-4fb4-b7fa-91580d009245';
  foundation2_id UUID := '1d475296-8a2d-44fe-ae63-34b18e084686';
  foundation3_id UUID := 'beabee59-de23-43ef-b3b4-5865ba5e4d68';
  adopter1_id UUID := '9dc631bb-88b5-4968-b0a0-599f2c0da5d3';
  adopter2_id UUID := 'c5a485a7-67ea-49d3-acf5-d4605ff4b840';
  adopter3_id UUID := 'db9884af-053f-4897-be99-5ee7909282dd';
  
  -- Variables para fundaciones
  fund1_uuid UUID;
  fund2_uuid UUID;
  fund3_uuid UUID;
  
  -- Variables para mascotas
  pet1_uuid UUID;
  pet2_uuid UUID;
  pet3_uuid UUID;
  pet4_uuid UUID;
  pet5_uuid UUID;
  pet6_uuid UUID;
  pet7_uuid UUID;
  pet8_uuid UUID;
  pet9_uuid UUID;
  pet10_uuid UUID;
BEGIN

-- =====================================================
-- 2. PERFILES
-- =====================================================

-- Perfil Admin
INSERT INTO profiles (id, full_name, avatar_url, phone, role)
VALUES (
  admin_id,
  'Admin HogarPeludo',
  NULL,
  '3001234567',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Perfiles de Fundaciones
INSERT INTO profiles (id, full_name, avatar_url, phone, role)
VALUES 
  (foundation1_id, 'Patitas Felices Pasto', NULL, '3101234567', 'foundation'),
  (foundation2_id, 'Gatos de Pasto', NULL, '3201234567', 'foundation'),
  (foundation3_id, 'Rescate Animal Nariño', NULL, '3151234567', 'foundation')
ON CONFLICT (id) DO NOTHING;

-- Perfiles de Adoptantes
INSERT INTO profiles (id, full_name, avatar_url, phone, role)
VALUES 
  (adopter1_id, 'María García López', NULL, '3111111111', 'adopter'),
  (adopter2_id, 'Carlos Andrés Muñoz', NULL, '3112222222', 'adopter'),
  (adopter3_id, 'Andrea López Pérez', NULL, '3113333333', 'adopter')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. FUNDACIONES
-- =====================================================

-- Fundación 1: Patitas Felices
INSERT INTO foundations (
  id, profile_id, foundation_name, description, logo_url,
  location_city, location_address, whatsapp_number, email,
  is_verified, verified_at, donation_link, instagram_url, facebook_url
)
VALUES (
  gen_random_uuid(),
  foundation1_id,
  'Patitas Felices Pasto',
  'Somos una fundación dedicada al rescate, rehabilitación y adopción de perros y gatos en situación de calle en Pasto. Desde 2018 hemos encontrado hogar para más de 500 peluditos. Trabajamos con amor y dedicación para darles una segunda oportunidad.',
  NULL,
  'Pasto',
  'Barrio Lorenzo, Calle 18 #25-30',
  '573101234567',
  'patitasfelices@email.com',
  TRUE,
  NOW(),
  'https://nequi.com/patitasfelices',
  'https://instagram.com/patitasfelicespasto',
  'https://facebook.com/patitasfelicespasto'
)
RETURNING id INTO fund1_uuid;

-- Fundación 2: Gatos de Pasto
INSERT INTO foundations (
  id, profile_id, foundation_name, description, logo_url,
  location_city, location_address, whatsapp_number, email,
  is_verified, verified_at, donation_link, instagram_url
)
VALUES (
  gen_random_uuid(),
  foundation2_id,
  'Gatos de Pasto',
  'Nos especializamos en el rescate y cuidado de gatos abandonados en Pasto. Brindamos atención veterinaria, esterilización y encontramos hogares responsables. Cada gato merece amor y un hogar cálido.',
  NULL,
  'Pasto',
  'Centro, Carrera 27 #16-45',
  '573201234567',
  'gatosdepasto@email.com',
  TRUE,
  NOW(),
  'https://daviplata.com/gatosdepasto',
  'https://instagram.com/gatosdepasto'
)
RETURNING id INTO fund2_uuid;

-- Fundación 3: Rescate Animal Nariño
INSERT INTO foundations (
  id, profile_id, foundation_name, description, logo_url,
  location_city, location_address, whatsapp_number, email,
  is_verified, verified_at, donation_link
)
VALUES (
  gen_random_uuid(),
  foundation3_id,
  'Rescate Animal Nariño',
  'Rescatamos y rehabilitamos animales víctimas de maltrato y abandono en todo el departamento de Nariño. Nuestro refugio temporal les brinda un espacio seguro mientras encuentran su familia definitiva.',
  NULL,
  'Pasto',
  'Aranda, Calle 12 #8-15',
  '573151234567',
  'rescateanimalnarino@email.com',
  TRUE,
  NOW(),
  'https://nequi.com/rescateanimalnarino'
)
RETURNING id INTO fund3_uuid;

-- =====================================================
-- 4. MASCOTAS
-- =====================================================

-- Mascotas de Patitas Felices
INSERT INTO pets (
  id, foundation_id, name, species, breed, age_approx, gender, size,
  description_story, is_vaccinated, is_sterilized, is_dewormed,
  good_with_kids, good_with_pets, special_needs,
  main_photo_url, gallery_urls, status
)
VALUES 
-- Luna
(
  gen_random_uuid(), fund1_uuid,
  'Luna', 'dog', 'Mestiza', '2 años', 'female', 'medium',
  'Luna fue rescatada cuando era cachorra en las calles del centro de Pasto. Estaba asustada y desnutrida, pero con mucho amor y cuidado se convirtió en una perrita alegre y cariñosa. Le encanta jugar con pelotas, dar paseos largos y recibir caricias en la barriga. Es muy sociable con otros perros y con niños. Busca una familia activa que le dé mucho amor.',
  TRUE, TRUE, TRUE, TRUE, TRUE, NULL,
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
  ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'],
  'available'
)
RETURNING id INTO pet1_uuid;

INSERT INTO pets (foundation_id, name, species, breed, age_approx, gender, size, description_story, is_vaccinated, is_sterilized, is_dewormed, good_with_kids, good_with_pets, main_photo_url, status)
VALUES 
-- Rocky
(
  fund1_uuid,
  'Rocky', 'dog', 'Labrador mix', '3 años', 'male', 'large',
  'Rocky es un perro noble y protector. Fue abandonado cuando su anterior familia se mudó. Es muy inteligente, conoce comandos básicos y es excelente guardián. Necesita espacio para correr y jugar. Ideal para casas con patio.',
  TRUE, TRUE, TRUE, TRUE, TRUE,
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
  'available'
),
-- Toby
(
  fund1_uuid,
  'Toby', 'dog', 'Beagle mix', '1 año', 'male', 'medium',
  'Toby es un cachorro curioso y juguetón. Fue encontrado en una caja junto a sus hermanos. Tiene mucha energía y le encanta explorar. Perfecto para familias activas que disfruten de aventuras al aire libre.',
  TRUE, TRUE, TRUE, TRUE, TRUE,
  'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
  'in_process'
),
-- Canela
(
  fund1_uuid,
  'Canela', 'dog', 'Cocker mix', '5 años', 'female', 'medium',
  'Canela es una perrita dulce y tranquila. Fue rescatada de una situación de negligencia. Es perfecta para hogares tranquilos, le gusta dormir en cojines suaves y dar caminatas cortas. Muy cariñosa con sus humanos.',
  TRUE, TRUE, TRUE, TRUE, FALSE,
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
  'available'
);

-- Mascotas de Gatos de Pasto
INSERT INTO pets (foundation_id, name, species, breed, age_approx, gender, size, description_story, is_vaccinated, is_sterilized, is_dewormed, good_with_kids, good_with_pets, main_photo_url, status)
VALUES 
-- Michi
(
  fund2_uuid,
  'Michi', 'cat', 'Siamés mix', '1 año', 'male', 'small',
  'Michi es un gato elegante y cariñoso con hermosos ojos azules. Fue encontrado abandonado en un parque. Es muy vocal y le gusta "conversar" con sus humanos. Perfecto para apartamentos, es muy limpio y tranquilo.',
  TRUE, TRUE, TRUE, TRUE, TRUE,
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  'available'
),
-- Nala
(
  fund2_uuid,
  'Nala', 'cat', 'Mestiza', '6 meses', 'female', 'small',
  'Nala es una gatita bebé rescatada junto a su mamá. Es muy juguetona, curiosa y le encanta perseguir juguetes. Está aprendiendo a usar el arenero perfectamente. Busca una familia que la llene de amor y juegos.',
  TRUE, TRUE, TRUE, TRUE, TRUE,
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
  'available'
),
-- Cleo
(
  fund2_uuid,
  'Cleo', 'cat', 'Persa mix', '2 años', 'female', 'medium',
  'Cleo es una gata hermosa y sofisticada. Fue rescatada de una casa de acumuladores. Es tranquila, elegante y le gusta observar por la ventana. Perfecta para hogares sin niños pequeños donde pueda ser la reina.',
  TRUE, TRUE, TRUE, FALSE, FALSE,
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
  'available'
),
-- Mía
(
  fund2_uuid,
  'Mía', 'cat', 'Naranja tabby', '8 meses', 'female', 'small',
  'Mía es una gatita naranja llena de amor. Ronronea apenas la acaricias y busca constantemente afecto humano. Es muy sociable y se lleva bien con otros gatos. Le encanta dormir en lugares cálidos y soleados.',
  TRUE, TRUE, TRUE, TRUE, TRUE,
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
  'available'
);

-- Mascotas de Rescate Animal Nariño
INSERT INTO pets (foundation_id, name, species, breed, age_approx, gender, size, description_story, is_vaccinated, is_sterilized, is_dewormed, good_with_kids, good_with_pets, special_needs, main_photo_url, status)
VALUES 
-- Max
(
  fund3_uuid,
  'Max', 'dog', 'Pastor Alemán mix', '4 años', 'male', 'large',
  'Max es un perro inteligente y leal. Fue rescatado de una finca donde lo tenían encadenado. A pesar de su pasado difícil, es muy noble y cariñoso. Conoce comandos y es muy obediente. Necesita un humano experimentado.',
  TRUE, TRUE, TRUE, TRUE, FALSE, NULL,
  'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800',
  'available'
),
-- Pelusa
(
  fund3_uuid,
  'Pelusa', 'dog', 'Poodle mix', '7 años', 'female', 'small',
  'Pelusa es una perrita senior dulce y tranquila. Fue abandonada cuando su dueña falleció. Es muy adaptable y agradecida. Perfecta para personas mayores o familias que busquen una compañera tranquila y cariñosa.',
  TRUE, TRUE, TRUE, TRUE, TRUE, 'Requiere dieta especial para seniors',
  'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800',
  'available'
),
-- Simón
(
  fund3_uuid,
  'Simón', 'cat', 'Negro', '3 años', 'male', 'medium',
  'Simón es un gato negro hermoso y misterioso. Fue rescatado de la calle durante una noche de lluvia. Es independiente pero cariñoso cuando quiere. Le encanta explorar y cazar insectos. Rompe el mito de los gatos negros.',
  TRUE, TRUE, TRUE, TRUE, TRUE, NULL,
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  'available'
);

-- =====================================================
-- 5. FAVORITOS
-- =====================================================

-- María tiene favoritos
INSERT INTO favorites (profile_id, pet_id)
SELECT adopter1_id, id FROM pets WHERE name = 'Luna' LIMIT 1;

INSERT INTO favorites (profile_id, pet_id)
SELECT adopter1_id, id FROM pets WHERE name = 'Michi' LIMIT 1;

-- Carlos tiene favoritos
INSERT INTO favorites (profile_id, pet_id)
SELECT adopter2_id, id FROM pets WHERE name = 'Rocky' LIMIT 1;

-- Andrea tiene favoritos
INSERT INTO favorites (profile_id, pet_id)
SELECT adopter3_id, id FROM pets WHERE name = 'Nala' LIMIT 1;

INSERT INTO favorites (profile_id, pet_id)
SELECT adopter3_id, id FROM pets WHERE name = 'Mía' LIMIT 1;

-- =====================================================
-- 6. SOLICITUDES DE ADOPCIÓN
-- =====================================================

-- María solicitó adoptar a Luna
INSERT INTO adoptions (pet_id, adopter_id, foundation_id, status, adopter_message)
SELECT 
  p.id,
  adopter1_id,
  p.foundation_id,
  'pending',
  'Hola, me encantaría darle un hogar a Luna. Tengo experiencia con perros y un apartamento grande con terraza. Trabajo desde casa así que tendría mucho tiempo para ella.'
FROM pets p WHERE p.name = 'Luna' LIMIT 1;

-- Carlos solicitó adoptar a Toby (aprobada)
INSERT INTO adoptions (pet_id, adopter_id, foundation_id, status, adopter_message, foundation_notes, resolved_at)
SELECT 
  p.id,
  adopter2_id,
  p.foundation_id,
  'approved',
  'Busco un compañero para mi otro perro. Toby se ve muy juguetón y creo que harían buena pareja.',
  'El adoptante pasó todas las verificaciones. Tiene casa con patio y experiencia con perros.',
  NOW()
FROM pets p WHERE p.name = 'Toby' LIMIT 1;

-- Andrea solicitó adoptar a Cleo (rechazada)
INSERT INTO adoptions (pet_id, adopter_id, foundation_id, status, adopter_message, foundation_notes, rejection_reason, resolved_at)
SELECT 
  p.id,
  adopter3_id,
  p.foundation_id,
  'rejected',
  'Quiero adoptar a Cleo para mi apartamento.',
  'La adoptante tiene niños pequeños. Cleo no es compatible con niños.',
  'Cleo necesita un hogar sin niños pequeños para su bienestar. Te recomendamos ver otras mascotas más compatibles.',
  NOW()
FROM pets p WHERE p.name = 'Cleo' LIMIT 1;

-- Andrea solicitó adoptar a Nala (pendiente)
INSERT INTO adoptions (pet_id, adopter_id, foundation_id, status, adopter_message)
SELECT 
  p.id,
  adopter3_id,
  p.foundation_id,
  'pending',
  'Después de conocer más sobre Nala, creo que sería perfecta para nuestra familia. Mis hijos ya son más grandes (8 y 10 años) y les encantan los gatos.'
FROM pets p WHERE p.name = 'Nala' LIMIT 1;

RAISE NOTICE 'Datos de prueba insertados exitosamente! 🐾';

END $$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta estas consultas para verificar los datos

-- SELECT 'Perfiles' as tabla, COUNT(*) as total FROM profiles;
-- SELECT 'Fundaciones' as tabla, COUNT(*) as total FROM foundations;
-- SELECT 'Mascotas' as tabla, COUNT(*) as total FROM pets;
-- SELECT 'Favoritos' as tabla, COUNT(*) as total FROM favorites;
-- SELECT 'Adopciones' as tabla, COUNT(*) as total FROM adoptions;

-- Ver mascotas por fundación
-- SELECT f.foundation_name, COUNT(p.id) as mascotas
-- FROM foundations f
-- LEFT JOIN pets p ON p.foundation_id = f.id
-- GROUP BY f.foundation_name;

-- Ver adopciones por estado
-- SELECT status, COUNT(*) as total FROM adoptions GROUP BY status;

-- =====================================================
-- ¡Seed completado! 🐾
-- =====================================================
