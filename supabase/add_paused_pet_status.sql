-- =====================================================
-- FIX: agregar el valor 'paused' al enum pet_status
-- =====================================================
-- El código (TypeScript y el panel admin) usa el estado 'paused' (Pausado),
-- pero el enum `pet_status` de la base de datos no lo tenía, lo que provocaba:
--   invalid input value for enum pet_status: "paused"
-- al editar una mascota a ese estado.
--
-- Valores esperados del enum: available | in_process | adopted | paused
--
-- Cómo aplicar: pega este script en el SQL Editor de Supabase y ejecútalo.
-- (ADD VALUE no se puede ejecutar dentro de una transacción; córrelo solo.)
-- =====================================================

ALTER TYPE public.pet_status ADD VALUE IF NOT EXISTS 'paused';

-- Verificación: lista los valores actuales del enum
-- SELECT unnest(enum_range(NULL::public.pet_status));
