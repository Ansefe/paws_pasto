# 🔌 API y Backend (Supabase)

## Configuración del Cliente

**Archivo**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Variables de Entorno

```env
# .env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Importante**: 
- `VITE_` prefix es requerido para que Vite exponga las variables al cliente
- `anon key` es segura para exponer (RLS controla el acceso)
- `service_role key` NUNCA debe estar en el cliente

---

## Queries Comunes

### Obtener Mascotas

```typescript
// Todas las mascotas disponibles con info de fundación
const { data, error } = await supabase
  .from('pets')
  .select(`
    *,
    foundation:foundations!inner(
      id,
      foundation_name,
      location_city,
      whatsapp_number
    )
  `)
  .in('status', ['available', 'in_process'])
  .order('created_at', { ascending: false })
```

### Obtener Mascotas con Filtros

```typescript
let query = supabase
  .from('pets')
  .select(`*, foundation:foundations!inner(...)`)

// Aplicar filtros condicionalmente
if (species !== 'all') {
  query = query.eq('species', species)
}
if (size !== 'all') {
  query = query.eq('size', size)
}
if (search) {
  query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`)
}

const { data, error } = await query
```

### Obtener Una Mascota

```typescript
const { data, error } = await supabase
  .from('pets')
  .select(`*, foundation:foundations!inner(...)`)
  .eq('id', petId)
  .single()
```

### Obtener Fundaciones Verificadas

```typescript
const { data, error } = await supabase
  .from('foundations')
  .select('*')
  .eq('is_verified', true)
  .order('foundation_name', { ascending: true })
```

---

## Autenticación (TODO)

### Registro

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@email.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Nombre Completo',
    }
  }
})
```

### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'password123'
})
```

### Login con OAuth (Google)

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### Logout

```typescript
const { error } = await supabase.auth.signOut()
```

### Obtener Usuario Actual

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Listener de Cambios de Auth

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Usuario inició sesión
  }
  if (event === 'SIGNED_OUT') {
    // Usuario cerró sesión
  }
})
```

---

## Mutations (Escritura)

### Agregar a Favoritos

```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    profile_id: userId,
    pet_id: petId
  })
```

### Eliminar de Favoritos

```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .eq('profile_id', userId)
  .eq('pet_id', petId)
```

### Crear Solicitud de Adopción

```typescript
const { data, error } = await supabase
  .from('adoptions')
  .insert({
    pet_id: petId,
    adopter_id: userId,
    foundation_id: foundationId,
    adopter_message: message,
    status: 'pending'
  })
```

### Actualizar Estado de Mascota (Fundación)

```typescript
const { error } = await supabase
  .from('pets')
  .update({ status: 'in_process' })
  .eq('id', petId)
```

### Crear Mascota (Fundación)

```typescript
const { data, error } = await supabase
  .from('pets')
  .insert({
    foundation_id: foundationId,
    name: 'Luna',
    species: 'dog',
    gender: 'female',
    size: 'medium',
    description_story: '...',
    // ...
  })
  .select()
  .single()
```

---

## Storage (Imágenes)

### Subir Imagen

```typescript
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `pets/${fileName}`

const { error: uploadError } = await supabase.storage
  .from('images')
  .upload(filePath, file)

if (!uploadError) {
  // Obtener URL pública
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)
  
  const imageUrl = data.publicUrl
}
```

### Eliminar Imagen

```typescript
const { error } = await supabase.storage
  .from('images')
  .remove(['pets/imagen.jpg'])
```

---

## Row Level Security (RLS)

### Políticas de Lectura

```sql
-- Todos pueden ver mascotas
CREATE POLICY "Public pets viewable" ON pets
  FOR SELECT USING (true);

-- Todos pueden ver fundaciones verificadas
CREATE POLICY "Public verified foundations" ON foundations
  FOR SELECT USING (is_verified = true);

-- Usuarios pueden ver sus propios favoritos
CREATE POLICY "Users view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = profile_id);
```

### Políticas de Escritura

```sql
-- Usuarios pueden agregar favoritos propios
CREATE POLICY "Users insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Fundaciones pueden gestionar sus mascotas
CREATE POLICY "Foundations manage own pets" ON pets
  FOR ALL USING (
    foundation_id IN (
      SELECT id FROM foundations WHERE profile_id = auth.uid()
    )
  );
```

---

## Realtime (Futuro)

### Suscripción a Cambios

```typescript
const subscription = supabase
  .channel('pets-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'pets' },
    (payload) => {
      console.log('Cambio en pets:', payload)
      // Actualizar UI
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

---

## Manejo de Errores

### Patrón Común

```typescript
const { data, error } = await supabase
  .from('pets')
  .select('*')

if (error) {
  console.error('Error fetching pets:', error.message)
  throw new Error(error.message)
}

return data
```

### Errores Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `PGRST116` | No rows returned | Manejar caso vacío |
| `23503` | Foreign key violation | Verificar que el registro referenciado existe |
| `42501` | RLS policy violation | Verificar permisos del usuario |
| `23505` | Unique constraint | El registro ya existe |

---

## Tipado con TypeScript

### Tipos Generados

```typescript
// src/types/database.types.ts
export interface Database {
  public: {
    Tables: {
      pets: {
        Row: { /* tipo de lectura */ }
        Insert: { /* tipo de inserción */ }
        Update: { /* tipo de actualización */ }
      }
      // ... otras tablas
    }
    Enums: {
      pet_species: 'dog' | 'cat'
      // ... otros enums
    }
  }
}
```

### Uso con Cliente Tipado

```typescript
const supabase = createClient<Database>(url, key)

// Ahora las queries tienen autocompletado y validación de tipos
const { data } = await supabase
  .from('pets')  // ✅ Autocompletado de tablas
  .select('name, species')  // ✅ Autocompletado de columnas
```

---

## URLs y Endpoints

### Base URL
```
https://[PROJECT_ID].supabase.co
```

### Endpoints

| Servicio | Endpoint |
|----------|----------|
| **REST API** | `/rest/v1/` |
| **Auth** | `/auth/v1/` |
| **Storage** | `/storage/v1/` |
| **Realtime** | `/realtime/v1/` |

### Ejemplo de URL de Imagen

```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/images/pets/foto.jpg
```
